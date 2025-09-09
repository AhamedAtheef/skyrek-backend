import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";   // if you use ES modules
import nodemailer from "nodemailer";
import OTP from "../models/otp.js";
dotenv.config()

export function createUser(req, res) {

    const passwordHash = bcrypt.hashSync(req.body.password, 10)

    const userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: passwordHash,
        role: req.body.role

    }
    if (User.findOne(userData.email)) {
        return res.json({
            message: "Email already exists"
        })
    }
    const user = new User(userData)
    user.save().then(() => {
        res.json({
            message: "Saved Success", userData
        })
    }).catch(() => {
        res.json({
            message: "Not Saved"
        })
    })
}

export async function getUser(req, res) {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 10;

    /*  User.find().then((users) => {
     res.json(users)
     console.log("Finding Success")
 
 }).catch(() => {
     res.json({
         message: "Can't find users"
     })
 }) */

    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: user not logged in" });
        }

        if (isAdmin(req)) {
            let countPage = await User.countDocuments();
            let totalPages = Math.ceil(countPage / limit);
            const users = await User.find().skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 });
            return res.json({ users, totalPages });
        } else {
            const user = await User.findOne({ email: req.user.email });
            return res.json(user);
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
}


export function loginUser(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email }).then((user) => {
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const isPasswordCorrect = bcrypt.compareSync(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Incorrect Password" });
        }
        if (user.isBlocked) {
            return res.status(401).json({ message: "User is blocked" });
        }

        const token = jwt.sign(
            {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            process.env.Jwt_Key
        );

        return res.json({
            message: "Login success",
            token: token,
            role: user.role,
        });
    }).catch((err) => {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    });
}


export async function adminValidate(req, res) {
    if (isAdmin(req)) {
        try {
            const user = await User.findOne({ email: req.user.email });
            return res.json(user);
        } catch {
            res.status(500).json({ message: "Failed to fetch users", error: error.message });
        }
    } else {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
}

export function isAdmin(req) {
    if (req.user == null) {
        return false;
    }

    if (req.user.role == "admin") {
        return true;
    } else {
        return false;
    }
}
// userController.js
export async function updateUser(req, res) {
    const { email, firstName, lastName, phone } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update fields
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.phone = phone || user.phone;

        await user.save();

        res.json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Failed to update user", error: error.message });
    }
}


export async function blockUser(req, res) {
    const email = req.params.email;
    const { isBlocked, isEmailVerified } = req.body;

    if (typeof isBlocked !== "boolean" && typeof isEmailVerified !== "boolean") {
        return res.status(400).json({ message: "Invalid value, must be boolean" });
    }

    try {
        const findUser = await User.findOne({ email });
        if (!findUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const updateFields = {};
        let message = "";

        if (typeof isBlocked === "boolean") {
            updateFields.isBlocked = isBlocked;
            message = `User ${isBlocked ? "blocked" : "unblocked"} successfully`;
        }

        if (typeof isEmailVerified === "boolean") {
            updateFields.isEmailVerified = isEmailVerified;
            message = `Email ${isEmailVerified ? "verified" : "unverified"} successfully`;
        }

        const updatedUser = await User.updateOne(
            { email },
            { $set: updateFields }
        );

        return res.json({ message, updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Failed to update user", error: error.message });
    }
}


export async function googlelogin(req, res) {
    const googletoken = req.body.token;
    try {
        /* get user info */
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${googletoken}`
            }
        });

        /* check if user exists in db */
        let user = await User.findOne({ email: response.data.email });

        /* if user exists */
        if (user != null) {
            const token = jwt.sign({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isBlocked: user.isBlocked
            }, process.env.Jwt_Key);

            return res.json({
                token: token,
                role: user.role,
                message: "Login Success"
            });

        } else {
            const newuser = new User({
                email: response.data.email,
                firstName: response.data.given_name || "Google",
                lastName: response.data.family_name || "User",
                role: "User",
                isBlocked: false,
                isEmailVerified: true,
                password: "123456"   // dummy password for Google users
            });

            await newuser.save();

            const token = jwt.sign({
                email: newuser.email,
                firstName: newuser.firstName,
                lastName: newuser.lastName,
                role: newuser.role,
                isBlocked: newuser.isBlocked
            }, process.env.Jwt_Key);

            return res.json({
                token: token,
                role: newuser.role,
                message: "Login Success"
            });
        }
    } catch (error) {
        console.log("Google login error:", error);
        res.status(500).json({
            message: "Failed to login",
            error: error.response?.data || error.message
        });
    }
}

// Create transporter
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "ahdatheef451@gmail.com",   // your Gmail
        pass: process.env.App_Password,   // your App Password from .env
    },
});

// Forget Password Controller
export async function forgetPassword(req, res) {
    const email = req.body.email;
    const otpnumber = Math.floor(100000 + Math.random() * 900000);

    try {
        // Check if user exists
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Remove old OTPs for this email
        await OTP.deleteMany({ email });

        // Save new OTP
        const newOtp = new OTP({ email, otp: otpnumber });
        await newOtp.save();

        // Mail options
        const mailOptions = {
            from: "ahdatheef451@gmail.com",
            to: email,
            subject: "Password Reset OTP (Don't share with anyone) its valid for 50 seconds",
            text: `Your OTP is ${otpnumber}`,
        };

        // Send mail
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Forget password error:", error);
        res.status(500).json({
            message: "Failed to reset password",
            error: error.message,
        });
    }
}

export async function verifyOTP(req, res) {
    const { email, otp } = req.body;

    try {
        // Check if OTP matches email + otp
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Remove OTP after verification
        await OTP.deleteOne({ email, otp });

        return res.status(200).json({ success: true, message: "OTP verified successfully" });
    } catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({
            message: "Failed to verify OTP",
            error: error.message,
        });
    }
}

export async function newPassword(req, res) {
    const { email, newpassword } = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(newpassword, 10);

        const result = await User.updateOne(
            { email },
            { $set: { password: hashedPassword } }
        );

        if (result.matchedCount > 0) {
            return res.json({ success: true, message: "Password reset successfully" });
        } else {
            return res.json({ success: false, message: "User not found" });
        }
    } catch {
        return res.json({ success: false, message: "Failed to reset password" });
    }
}
