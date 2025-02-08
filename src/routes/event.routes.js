import { Router } from "express";
import { createEvent,getEventsByUserId ,getAllEvents ,updateEvent, 
    deleteEvent } from "../controllers/event.controller.js";
    
import upload from "../utils/multer.js";
import { validateRequestBody } from "../middlewares/validation.middleware.js";

const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";

//Admin Related
// router.route("/signup").post(upload.single("profile"), registerUser);
router.route("/createevent").post(verifyJWT,createEvent);
router.route("/getlist/:userId").get(getEventsByUserId);
router.route("/getalllist").get( getAllEvents);
router.route("/update/:id").put(verifyJWT,updateEvent);       
router.route("/delete/:id").delete(verifyJWT, deleteEvent); 
export default router;
