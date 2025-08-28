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

    /*  User.find().then((users) => {
         res.json(users)
         console.log("Finding Success")
 
     }).catch(() => {
         res.json({
             message: "Can't find users"
         })
     }) */

    try {
        if (isAdmin(req)) {
            const user = await User.find()
            res.json(user)
        } else {
            const user = await User.findOne({ email: req.user.email })
            res.json(user)
        }
    } catch (error) {
        res.status(500).json({
            message: "failed to fetch users",
            error: error.message
        })
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
            return res.status(401).json({ message: "Incorrect Password" }); // 👈 send proper 401
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


export function isUser(req) {
    if (req.user == null) {
        res.status(401).json({ message: "user not found" })
    } else {
        res.json(req.user)
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

export async function googlelogin(req, res) {
    const googletoken = req.body.token;
    try {
        /* get user info */
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${googletoken}`
                }
            }
        )

        /* check if user exists in db */
        const user = await User.findOne({ email: response.data.email })

        /* if user exists */
        if (user != null) {
            const token = jwt.sign({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isBlocked: user.isBlocked
            }, process.env.Jwt_Key)
            return res.json({
                token: token,
                role: user.role,
                message: "Login Success"
            })

            /* if user doesn't exist */
        } else {
            const newuser = new User({
                email: response.data.email,
                firstName: response.data.given_name,
                lastName: response.data.family_name,
                role: "user",
                isBlocked: false,
                isEmailVerified: true,
                password: "123456"
            });
            await newuser.save();
            const token = jwt.sign({
                email: newuser.email,
                firstName: newuser.firstName,
                lastName: newuser.lastName,
                role: newuser.role,
                isBlocked: newuser.isBlocked
            }, process.env.Jwt_Key)
            return res.json({
                token: token,
                role: newuser.role,
                message: "Login Success"
            })
        }
    } catch (error) {
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

export async function newPassword(req,res) {
    const { email, newpassword } = req.body;
    try{
        const hashedPassword = bcrypt.hashSync(newpassword, 10);
        await User.updateOne({ email }, {$set:{ password: hashedPassword }});
        return res.status(200).json({ success: true, message: "Password reset successfully" });
    }catch{
        res.status(500).json({
            message: "Failed to reset password"
        });
    }
    
}
