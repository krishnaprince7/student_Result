import { Router } from "express";
import { getTotalStudenet } from "../controler/dashbord.controlers.js";

const router = Router();

router.get("/countstudent", getTotalStudenet);


export default router;