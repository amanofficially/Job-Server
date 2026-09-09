import * as aiService from "../services/ai/index.js";
import Application from "../models/Application.js";

const analyzeJob = async (req, res, next) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ success: false, message: "Job description is required" });
    }

    const analysis = await aiService.analyzeJobDescription(jobDescription, req.user);

    res.json({ success: true, message: "Job analyzed", data: analysis });
  } catch (error) {
    next(error);
  }
};

const generateEmail = async (req, res, next) => {
  try {
    const { jobAnalysis, tone } = req.body;

    if (!jobAnalysis) {
      return res.status(400).json({ success: false, message: "Job analysis is required" });
    }

    const emailTone = tone || req.user.settings?.emailTone || "Professional";
    const email = await aiService.generateApplicationEmail(jobAnalysis, req.user, emailTone);

    res.json({ success: true, message: "Email generated", data: email });
  } catch (error) {
    next(error);
  }
};

const improveEmail = async (req, res, next) => {
  try {
    const { subject, body, instruction } = req.body;

    if (!body || !instruction) {
      return res.status(400).json({ success: false, message: "Email body and instruction are required" });
    }

    const email = await aiService.improveEmail(subject, body, instruction);

    res.json({ success: true, message: "Email updated", data: email });
  } catch (error) {
    next(error);
  }
};

const followUpEmail = async (req, res, next) => {
  try {
    const { applicationId } = req.body;

    const application = await Application.findOne({ _id: applicationId, userId: req.user.id });
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const email = await aiService.generateFollowUpEmail(application, req.user);

    res.json({ success: true, message: "Follow-up email generated", data: email });
  } catch (error) {
    next(error);
  }
};

export { analyzeJob, generateEmail, improveEmail, followUpEmail };
