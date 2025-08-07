// controllers/studentController.js or similar
import { Student } from "../modles/Student.modles.js";
import Result from "../modles/Marks.modles.js"; //  import Result model

export const getTotalStudenet = async (req, res) => {
  try {
    //  Count how many students exist with an sNo
    const totalSerials = await Student.countDocuments({ sNo: { $exists: true } });

    //  Count how many result entries exist
    const totalResults = await Result.countDocuments();

    //  Send both in response
    res.status(200).json({
      totalStudent: totalSerials,
      totalResults: totalResults,
    });
  } catch (error) {
    console.error("Error counting sNo or results:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
