import express from "express"
import { createUser, forgetPassword, getUser, googlelogin, isUser, loginUser, newPassword, verifyOTP} from "../Controllers/userController.js"

const userRouter = express.Router()
userRouter.post("/",createUser)
userRouter.get("/",getUser)
userRouter.get("/isuser",isUser)
userRouter.post("/login",loginUser)
userRouter.post("/google-login",googlelogin)
userRouter.post("/forget-password",forgetPassword)
userRouter.post("/verify-otp",verifyOTP)
userRouter.post("/reset-password",newPassword)

export default userRouter;