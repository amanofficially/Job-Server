import express from "express";
import { analyzeJob, generateEmail, improveEmail, followUpEmail } from "../controllers/aiController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.post("/analyze-job", protect, analyzeJob);
router.post("/generate-email", protect, generateEmail);
router.post("/improve-email", protect, improveEmail);
router.post("/follow-up-email", protect, followUpEmail);

export default router;
