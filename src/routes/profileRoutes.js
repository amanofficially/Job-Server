import express from "express";
import { getProfile, updateProfile, uploadResume, updateSettings } from "../controllers/profileController.js";
import protect from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);
router.post("/resume", protect, upload.single("resume"), uploadResume);
router.put("/settings", protect, updateSettings);

export default router;
