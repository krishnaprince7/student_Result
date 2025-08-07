import { Student } from "../modles/Student.modles.js";
import { Counter } from "../modles/Counter.model.js";
import { User } from "../modles/users.models.js";

export const createStudent = async (req, res) => {
  try {
    const {
      name,
      class: studentClass,
      fatherName,
      aadharNo,
      contactNo,
      parentContactNo,
      permanentAddress,
      RollNumber,
      email,
    } = req.body;

    const errors = {};

    if (!name) errors.name = "Name is required";
    if (!studentClass) errors.class = "Student Class is required";
    if (!fatherName) errors.fatherName = "Father's name is required";

    if (!aadharNo || !/^\d{12}$/.test(aadharNo)) {
      errors.aadharNo = "Aadhar number must be exactly 12 digits";
    }

    if (!contactNo || !/^\d{10}$/.test(contactNo)) {
      errors.contactNo = "Contact number must be exactly 10 digits";
    }

    if (!RollNumber) errors.RollNumber = "Roll number is required";

   if (!email) {
  errors.email = "Email is required";
} else {
  // Check if this email exists in User collection
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      errors: { email: "Provided email does not exist in system" },
    });
  }

  // Attach this user's _id to the student
  req.targetUserId = user._id;
}


    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const [existingAadhar, existingRoll, existingEmail] = await Promise.all([
      Student.findOne({ aadharNo }),
      Student.findOne({ RollNumber }),
      Student.findOne({ email }),
    ]);

    if (existingAadhar)
      return res.status(400).json({ errors: { aadharNo: "Aadhar already exists" } });
    if (existingRoll)
      return res.status(400).json({ errors: { RollNumber: "Roll number already exists" } });
    if (existingEmail)
      return res.status(400).json({ errors: { email: "Email already exists" } });

    const counter = await Counter.findOneAndUpdate(
      { id: "student" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const newStudent = await Student.create({
      sNo: counter.seq,
      name,
      class: studentClass,
      fatherName,
      RollNumber,
      aadharNo,
      contactNo,
      email,
      parentContactNo,
      permanentAddress,
      userId: req.targetUserId,
    });

    res.status(201).json({ message: "Student created", student: newStudent });
  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Get all students (teacher sees all, student sees own)
export const getAllStudents = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;

    let students;
    if (role === "teacher") {
      students = await Student.find().sort({ sNo: 1 });
    } else if (role === "student") {
      students = await Student.find({ userId });
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(students);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get single student by sNo
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    const student = await Student.findOne({ sNo: Number(id) });
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (role === "student" && student.userId.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Single Fetch Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update student by sNo
export const updateStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: currentUserId } = req.user;

    const student = await Student.findOne({ sNo: Number(id) });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Restrict student role from editing other students
    if (role === "student" && student.userId.toString() !== currentUserId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const {
      name,
      class: studentClass,
      fatherName,
      RollNumber,
      aadharNo,
      contactNo,
      parentContactNo,
      permanentAddress,
      email,
    } = req.body;

    const errors = {};

    if (!name) errors.name = "Name is required";
    if (!studentClass) errors.class = "Student Class is required";
    if (!fatherName) errors.fatherName = "Father's name is required";
    if (!RollNumber) errors.RollNumber = "Roll number is required";
    if (!aadharNo || !/^\d{12}$/.test(aadharNo)) errors.aadharNo = "Valid Aadhar is required";
    if (!contactNo || !/^\d{10}$/.test(contactNo)) errors.contactNo = "Valid Contact is required";

    if (!email) {
      errors.email = "Email is required";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    if (RollNumber !== student.RollNumber) {
      const existing = await Student.findOne({ RollNumber });
      if (existing) {
        return res.status(400).json({ errors: { RollNumber: "Roll number already exists" } });
      }
    }

    // Check if email is being changed
    if (email !== student.email) {
      // Check if new email already exists in User collection
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ errors: { email: "Email already in use by another user" } });
      }

      // Update the user's email in User collection
      const updatedUser = await User.findByIdAndUpdate(
        student.userId,
        { email },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "Associated user not found" });
      }
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { sNo: Number(id) },
      {
        name,
        class: studentClass,
        fatherName,
        RollNumber,
        aadharNo,
        contactNo,
        email,
        parentContactNo,
        permanentAddress,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};