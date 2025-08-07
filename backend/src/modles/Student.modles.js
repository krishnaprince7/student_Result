import mongoose, { Schema } from "mongoose";

const studentSchema = new Schema(
  {
    sNo: {
      type: Number,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    class: {
      type: String,
      required: true,
    },
    RollNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    fatherName: {
      type: String,
      required: true,
      trim: true,
    },
    aadharNo: {
      type: String,
      unique: true,
      required: true,
      length: 12,
      match: /^[0-9]{12}$/,
    },
    contactNo: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

export const Student = mongoose.model("Student", studentSchema);
