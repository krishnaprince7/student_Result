import OTP from "../modles/OTP.model.js";
import { User } from "../modles/users.models.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import asynchandler from "../utils/asynchandler.js";
import ApiError from "../utils/Aperror.js";
import bcrypt from "bcryptjs";
import ApiResponse from "../utils/ApiResponce.js";

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate random 6 digit OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Send OTP to email for password reset
const sendPasswordResetOTP = asynchandler(async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email }).select("email");
  if (!user) {
    throw new ApiError(404, "No user found with this email");
  }
  const otp = generateOTP();
  await OTP.deleteMany({ email: user.email });
  await OTP.create({ email: user.email, otp });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Password Reset OTP",
    html: `<p>Your OTP for password reset is: <b>${otp}</b></p>`,
  };

  await transporter.sendMail(mailOptions);

  return res.status(200).json(
    new ApiResponse(200, { email: user.email }, "OTP sent successfully")
  );
});

// Verify OTP and reset password
const verifyOTPAndResetPassword = asynchandler(async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  // Validation
  const errors = {};
  if (!email?.trim()) errors.email = "Email is required";
  if (!otp?.trim()) errors.otp = "OTP is required";
  if (!newPassword?.trim()) {
    errors.newPassword = "Password is required";
  } else if (newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters";
  }
  if (newPassword !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(new ApiResponse(400, { errors }, "Validation failed"));
  }

  // Verify OTP
  const otpRecord = await OTP.findOne({ email, otp });
  if (!otpRecord) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  // Update password - Bypassing pre-save hooks
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findOneAndUpdate(
    { email },
    {
      password: hashedPassword,
      originalPassword: newPassword, // Storing plain text as requested
      $inc: { tokenVersion: 1 }
    },
    { new: true }
  );

  // deleat otp
  await OTP.deleteOne({ _id: otpRecord._id });

  return res.status(200).json(
    new ApiResponse(200, null, "Password updated successfully")
  );
});

export { sendPasswordResetOTP, verifyOTPAndResetPassword };