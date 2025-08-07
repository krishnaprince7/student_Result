import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    originalPassword: {
      type: String,
      select: false, // won't return in queries unless explicitly selected
    },
    refreshToken: {
      type: String,
    },
    // ✅ Role field added
    role: {
      type: String,
      enum: ["teacher", "student"],
      default: "student",
    },

  },
  {
    timestamps: true,
  }
);

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // ✅ Save the real password before hashing
  this.originalPassword = this.password;

  // 🔐 Then hash the password
  this.password = await bcrypt.hash(this.password, 10);

  next();
});




// ✅ Compare password method
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// 🔑 Access Token Generator
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET, 
    { 
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '30m' 
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
      role: this.role,
    },
    process.env.REFRESH_TOKEN_SECRET, 
    { 
       expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d'  // 
    }
  );
};



export const User = mongoose.model("User", userSchema);
