import { Router } from "express";
import authRoutes from "./authRoutes.js";
import profileRoutes from "./profileRoutes.js";
import aiRoutes from "./aiRoutes.js";
import applicationRoutes from "./applicationRoutes.js";
import emailRoutes from "./emailRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";

const router = Router();

router.get("/health", (req, res) => res.json({ success: true, message: "JobPilot AI API is running" }));

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/ai", aiRoutes);
router.use("/applications", applicationRoutes);
router.use("/email", emailRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
