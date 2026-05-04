import express from "express"
import * as  authController  from "../controllers/auth.js"

const router = express.Router()

router.post("/login", authController.postLogin)
router.post("/login-request", authController.postLoginRequest)
router.post("/login-verify", authController.postLoginVerify)
router.post("/login-resend", authController.postLoginResend)
router.post("/forgot-password-request", authController.postForgotPasswordRequest)
router.post("/forgot-password-reset", authController.postForgotPasswordReset)
router.post("/signup", authController.postSignUp)

export default router;



