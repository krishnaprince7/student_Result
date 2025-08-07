import { Router } from "express";
import { createResult } from "../controler/Marks.controler.js";
import { getResult } from "../controler/Marks.controler.js";
import {getResultById} from "../controler/Marks.controler.js"
import {updateResultById} from "../controler/Marks.controler.js"
import { verifyToken } from "../middlewares/verifyToken.js";


const router = Router();

router. post("/result", verifyToken, createResult);
router. get("/getresult", verifyToken, getResult);
router.get("/getresult/:id", verifyToken, getResultById);
router.put("/getresult-edit/:id", verifyToken, updateResultById);

export default router;