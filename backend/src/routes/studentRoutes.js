import { Router } from "express";
import { createStudent, getAllStudents, getStudentById, updateStudentById } from "../controler/student.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

// Student create karna — ye route protected hona chahiye, isliye verifyToken lagayenge
router.post("/studentinfo", verifyToken, createStudent);

// Students ki list lene ke liye route — ye bhi protected hona chahiye
router.get("/studentinfo", verifyToken, getAllStudents);

// Specific student ki info lene ke liye (id ke basis pe) — protected
router.get("/studentinfo/:id", verifyToken, getStudentById);

// Student edit karne ke liye (id ke basis pe) — protected
router.put("/studentedit/:id", verifyToken, updateStudentById);

export default router;
