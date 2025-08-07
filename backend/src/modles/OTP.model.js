import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true, // Faster queries on email
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: () => Date.now() + 5 * 60 * 1000, // 5 minutes from now
    },
  },
  {
    timestamps: true,
  }
);

// TTL Index (automatically deletes expired OTPs)
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model("OTP", OTPSchema);

export default OTP;
