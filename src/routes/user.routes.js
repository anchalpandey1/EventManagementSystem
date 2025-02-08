import { Router } from "express";
import {
    registerUser,
    loginUser,
    getCurrentUser
   
} from "../controllers/user.controller.js";
import upload from "../utils/multer.js";
import { validateRequestBody } from "../middlewares/validation.middleware.js";

const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";

//Admin Related
// router.route("/signup").post(upload.single("profile"), registerUser);
router.route("/signup").post( registerUser);
router.route("/signin").post(loginUser);
router.route("/current").get(getCurrentUser);
export default router;
