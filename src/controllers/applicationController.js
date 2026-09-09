import Application from "../models/Application.js";

const createApplication = async (req, res, next) => {
  try {
    const { companyName, jobTitle, recruiterEmail } = req.body;

    if (!companyName || !jobTitle || !recruiterEmail) {
      return res.status(400).json({ success: false, message: "Company, job title and recruiter email are required" });
    }

    if (!req.body.allowDuplicate) {
      const existing = await Application.findOne({
        userId: req.user.id,
        companyName,
        jobTitle,
        recruiterEmail,
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Application already exists",
          data: { existingId: existing._id },
        });
      }
    }

    const application = await Application.create({
      ...req.body,
      userId: req.user.id,
      timeline: [{ label: "Created", date: new Date() }],
    });

    res.status(201).json({ success: true, message: "Application created", data: application });
  } catch (error) {
    next(error);
  }
};

const getApplications = async (req, res, next) => {
  try {
    const { search, status, location, source, sortBy, order, page = 1, limit = 10 } = req.query;

    const filter = { userId: req.user.id };

    if (status) filter.status = status;
    if (location) filter.location = new RegExp(location, "i");
    if (source) filter.source = new RegExp(source, "i");

    if (search) {
      filter.$or = [
        { companyName: new RegExp(search, "i") },
        { jobTitle: new RegExp(search, "i") },
        { recruiterEmail: new RegExp(search, "i") },
      ];
    }

    const sortField = sortBy || "applicationDate";
    const sortOrder = order === "asc" ? 1 : -1;

    const pageNumber = Math.max(parseInt(page), 1);
    const pageSize = Math.max(parseInt(limit), 1);

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      Application.countDocuments(filter),
    ]);

    res.json({
      success: true,
      message: "",
      data: {
        applications,
        pagination: { total, page: pageNumber, pages: Math.ceil(total / pageSize) },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, userId: req.user.id });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.json({ success: true, message: "", data: application });
  } catch (error) {
    next(error);
  }
};

const updateApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.json({ success: true, message: "Application updated", data: application });
  } catch (error) {
    next(error);
  }
};

const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.json({ success: true, message: "Application deleted", data: {} });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const application = await Application.findOne({ _id: req.params.id, userId: req.user.id });
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    application.status = status;
    application.timeline.push({ label: status, date: new Date(), note: note || "" });
    await application.save();

    res.json({ success: true, message: "Status updated", data: application });
  } catch (error) {
    next(error);
  }
};

const addTimelineEvent = async (req, res, next) => {
  try {
    const { label, note, date } = req.body;

    const application = await Application.findOne({ _id: req.params.id, userId: req.user.id });
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    application.timeline.push({ label, note: note || "", date: date || new Date() });
    await application.save();

    res.json({ success: true, message: "Timeline updated", data: application });
  } catch (error) {
    next(error);
  }
};

export {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  updateStatus,
  addTimelineEvent,
};
