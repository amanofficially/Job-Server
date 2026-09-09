import mongoose from "mongoose";
import STATUS_OPTIONS from "../constants/applicationStatus.js";

const timelineEventSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    companyName: { type: String, required: true, index: true },
    jobTitle: { type: String, required: true, index: true },
    recruiterEmail: { type: String, required: true },
    jobDescription: { type: String, default: "" },

    companyWebsite: { type: String, default: "" },
    jobUrl: { type: String, default: "" },
    salary: { type: String, default: "" },
    jobType: { type: String, default: "" },
    location: { type: String, default: "" },
    source: { type: String, default: "" },

    matchScore: { type: Number, default: 0 },
    matchingSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    recommendation: { type: String, default: "" },

    status: { type: String, enum: STATUS_OPTIONS, default: "Draft", index: true },
    applicationDate: { type: Date, default: Date.now, index: true },

    email: {
      subject: { type: String, default: "" },
      body: { type: String, default: "" },
      sentAt: { type: Date },
    },

    notes: { type: String, default: "" },
    followUpDate: { type: Date },
    timeline: { type: [timelineEventSchema], default: [] },
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, companyName: 1, jobTitle: 1, recruiterEmail: 1 });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
export { STATUS_OPTIONS };

