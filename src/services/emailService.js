import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sendApplicationEmail = async ({ to, cc, subject, body, resumePath, resumeFileName }) => {
  if (!isValidEmail(to)) {
    throw new Error("Recruiter email address is invalid");
  }
  if (!subject || !subject.trim()) {
    throw new Error("Email subject is required");
  }
  if (!body || !body.trim()) {
    throw new Error("Email body is required");
  }
  if (!resumePath) {
    throw new Error("Please upload your resume before sending the application");
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    cc: cc || undefined,
    subject,
    text: body,
    attachments: [{ filename: resumeFileName || "resume.pdf", path: resumePath }],
  });

  return { messageId: info.messageId };
};

const sendFollowUpEmail = async ({ to, subject, body }) => {
  if (!isValidEmail(to)) {
    throw new Error("Recruiter email address is invalid");
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text: body,
  });

  return { messageId: info.messageId };
};

export { sendApplicationEmail, sendFollowUpEmail, isValidEmail };
