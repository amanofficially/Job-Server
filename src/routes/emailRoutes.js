import express from "express";
import { sendApplication, sendFollowUp } from "../controllers/emailController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.post("/send-application", protect, sendApplication);
router.post("/send-follow-up", protect, sendFollowUp);

export default router;
