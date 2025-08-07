import { Student } from "../modles/Student.modles.js";
import Result from "../modles/Marks.modles.js";
import { Counter } from "../modles/Counter.model.js";

// CREATE RESULT (Teacher only)
export const createResult = async (req, res) => {
  try {
    const { name, class: studentClass, RollNumber, marks } = req.body;

    const student = await Student.findOne({ name, class: studentClass, RollNumber });
    if (!student) {
      return res.status(404).json({
        message: "No student found with matching name, class, and roll number",
      });
    }

    const existingResult = await Result.findOne({ student: student._id });
    if (existingResult) {
      return res.status(400).json({ message: "Result already exists for this student" });
    }

    const counter = await Counter.findOneAndUpdate(
      { id: "result" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const result = await Result.create({
      sNo: counter.seq,
      student: student._id,
      name: student.name,
      RollNumber: student.RollNumber,
      class: student.class,
      marks,
      userId: req.user._id,
    });

    res.status(201).json({
      message: "Result saved successfully",
      result,
    });

  } catch (error) {
    console.error("Error saving result:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET ALL RESULTS (Teacher gets all, Student gets their own)
export const getResult = async (req, res) => {
  try {
    const { role, _id: currentUserId } = req.user;

    // In your backend controller
if (role === "teacher") {
  const results = await Result.find({}, "sNo name class RollNumber").sort({ sNo: 1 });
  return res.status(200).json({
    message: "All results fetched successfully",
    result: results, // Keep consistent key name
  });
}

    if (role === "student") {
      const student = await Student.findOne({ userId: currentUserId });
      if (!student) {
        return res.status(404).json({ message: "Student record not found for current user" });
      }

      const result = await Result.findOne({ student: student._id }, "sNo name class RollNumber marks");
      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }

      return res.status(200).json({
        message: "Result fetched successfully",
        result,
      });
    }

    return res.status(403).json({ message: "Access denied" });

  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET SINGLE RESULT BY sNo (restricted)
export const getResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: currentUserId } = req.user;

    const result = await Result.findOne({ sNo: id }).populate("student");
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    if (role === "student" && result.student.userId.toString() !== currentUserId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({
      message: "Result fetched successfully",
      result: {
        sNo: result.sNo,
        name: result.name,
        class: result.class,
        RollNumber: result.RollNumber,
        marks: result.marks,
      },
    });

  } catch (error) {
    console.error("Error fetching result by sNo:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE RESULT BY sNo (Teacher can update any, Student only their own)
export const updateResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, class: studentClass, RollNumber, marks } = req.body;
    const { role, _id: currentUserId } = req.user;

    const result = await Result.findOne({ sNo: id }).populate("student");
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    if (role === "student" && result.student.userId.toString() !== currentUserId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const errors = {};
    if (!name) errors.name = "Name is required";
    if (!studentClass) errors.class = "Class is required";
    if (!RollNumber) errors.RollNumber = "Roll Number is required";

    const requiredSubjects = ["maths", "physics", "chemistry", "english", "computer"];
    for (const subject of requiredSubjects) {
      const value = marks?.[subject];
      if (value === undefined || value === null) {
        errors[subject] = `${subject} mark is required`;
      } else if (typeof value !== "number" || value < 0 || value > 100) {
        errors[subject] = `${subject} must be a number between 0 and 100`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const updatedResult = await Result.findOneAndUpdate(
      { sNo: id },
      { name, class: studentClass, RollNumber, marks },
      { new: true }
    );

    res.status(200).json({
      message: "Result updated successfully",
      result: updatedResult,
    });

  } catch (error) {
    console.error("Error updating result:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
