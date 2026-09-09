import express from "express";
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  updateStatus,
  addTimelineEvent,
} from "../controllers/applicationController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createApplication);
router.get("/", protect, getApplications);
router.get("/:id", protect, getApplicationById);
router.put("/:id", protect, updateApplication);
router.delete("/:id", protect, deleteApplication);
router.patch("/:id/status", protect, updateStatus);
router.post("/:id/timeline", protect, addTimelineEvent);

export default router;
