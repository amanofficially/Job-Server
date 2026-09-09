import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, default: "" },

    profile: {
      headline: { type: String, default: "" },
      location: { type: String, default: "" },
      skills: { type: [String], default: [] },
      experience: { type: String, default: "" },
      education: { type: String, default: "" },
      portfolio: { type: String, default: "" },
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },

    resume: {
      fileName: { type: String, default: "" },
      fileUrl: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },

    settings: {
      emailTone: { type: String, default: "Professional" },
      signature: { type: String, default: "" },
      notifyFollowUps: { type: Boolean, default: true },
      notifySent: { type: Boolean, default: true },
      notifyInterviews: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
