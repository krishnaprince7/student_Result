//otp Rotes.jsimport express from "express";
import { Router } from "express";
import {sendPasswordResetOTP, verifyOTPAndResetPassword} from "../controler/Otp.controler.js";

const router = Router();

// Route to send OTP to user's registered email
router.post("/send-otp", sendPasswordResetOTP);

// Route to verify OTP and reset password
router.post("/verify-password", verifyOTPAndResetPassword);

export default router;