import streamifier from "streamifier";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import extractResumeText from "../utils/extractResumeText.js";
import { extractProfileFromResume } from "../services/ai/index.js";

const uploadBufferToCloudinary = (buffer, folder, publicId) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", folder, public_id: publicId, overwrite: true },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

const getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, message: "", data: req.user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profile } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    if (profile) {
      user.profile = {
        ...user.profile.toObject(),
        ...profile,
      };
    }

    await user.save();

    res.json({ success: true, message: "Profile updated", data: user });
  } catch (error) {
    next(error);
  }
};

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);
    const publicId = `resume_${user._id}`;

    const result = await uploadBufferToCloudinary(req.file.buffer, "jobpilot-ai/resumes", publicId);

    if (user.resume?.publicId && user.resume.publicId !== result.public_id) {
      cloudinary.uploader.destroy(user.resume.publicId, { resource_type: "raw" }).catch(() => {});
    }

    user.resume = {
      fileName: req.file.originalname,
      fileUrl: result.secure_url,
      publicId: result.public_id,
    };
    await user.save();

    let extractedProfile = null;
    try {
      const resumeText = await extractResumeText(req.file.buffer, req.file.originalname);
      if (resumeText) {
        extractedProfile = await extractProfileFromResume(resumeText);
      }
    } catch (extractError) {
      console.error("Resume auto-fill failed:", extractError.message);
    }

    res.json({
      success: true,
      message: "Resume uploaded",
      data: { resume: user.resume, extractedProfile },
    });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.settings = { ...user.settings.toObject(), ...req.body };
    await user.save();

    res.json({ success: true, message: "Settings updated", data: user.settings });
  } catch (error) {
    next(error);
  }
};

export { getProfile, updateProfile, uploadResume, updateSettings };
