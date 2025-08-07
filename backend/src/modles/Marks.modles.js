// models/Result.js
import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  sNo: {
    type: Number,
    unique: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  name: String,
  RollNumber: String,
  class: String,

  marks: {
    maths: { type: Number, required: true },
    physics: { type: Number, required: true },
    chemistry: { type: Number, required: true },
    english: { type: Number, required: true },
    computer: { type: Number, required: true },
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, { timestamps: true });


export default mongoose.model("Result", resultSchema);
