import { sendApplicationEmail, sendFollowUpEmail } from "../services/emailService.js";
import Application from "../models/Application.js";

// Resumes are always stored on Cloudinary (see profileController.uploadResume),
// so fileUrl is always a secure, publicly fetchable https URL.
const sendApplication = async (req, res, next) => {
  try {
    const { to, cc, subject, body, applicationData } = req.body;

    if (!req.user.resume?.fileUrl) {
      return res.status(400).json({
        success: false,
        message: "Please upload your resume before sending the application",
      });
    }

    await sendApplicationEmail({
      to,
      cc,
      subject,
      body,
      resumePath: req.user.resume.fileUrl,
      resumeFileName: req.user.resume.fileName,
    });

    const existing = await Application.findOne({
      userId: req.user.id,
      companyName: applicationData.companyName,
      jobTitle: applicationData.jobTitle,
      recruiterEmail: to,
    });

    let application;
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 6);

    if (existing) {
      existing.status = "Email Sent";
      existing.email = { subject, body, sentAt: new Date() };
      existing.followUpDate = existing.followUpDate || followUpDate;
      existing.timeline.push({ label: "Email Sent", date: new Date() });
      application = await existing.save();
    } else {
      application = await Application.create({
        ...applicationData,
        userId: req.user.id,
        recruiterEmail: to,
        status: "Email Sent",
        email: { subject, body, sentAt: new Date() },
        followUpDate,
        timeline: [
          { label: "Created", date: new Date() },
          { label: "Email Generated", date: new Date() },
          { label: "Email Sent", date: new Date() },
        ],
      });
    }

    res.json({ success: true, message: "Application sent successfully", data: application });
  } catch (error) {
    next(error);
  }
};

const sendFollowUp = async (req, res, next) => {
  try {
    const { applicationId, subject, body } = req.body;

    const application = await Application.findOne({ _id: applicationId, userId: req.user.id });
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    await sendFollowUpEmail({ to: application.recruiterEmail, subject, body });

    application.timeline.push({ label: "Follow-up Sent", date: new Date() });
    application.followUpDate = undefined;
    await application.save();

    res.json({ success: true, message: "Follow-up sent", data: application });
  } catch (error) {
    next(error);
  }
};

export { sendApplication, sendFollowUp };
