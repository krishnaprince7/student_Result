import { Router } from "express";
import registerUser from "../controler/user.controler.js";
import { loginUser, logoutUser, getUserName, changeCurrentPassword} from "../controler/user.controler.js";
import { verifyToken } from "../middlewares/verifyToken.js";


const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);
router.get('/username', verifyToken, getUserName);
router.post('/changepassword', verifyToken, changeCurrentPassword);


export default router;
