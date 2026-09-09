import callOpenAI from "./providers/openaiProvider.js";
import callGemini from "./providers/geminiProvider.js";
import callGroq from "./providers/groqProvider.js";
import parseAIJson from "../../utils/parseAIJson.js";

const callAI = async (systemPrompt, userPrompt) => {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();

  if (provider === "gemini") {
    return callGemini(systemPrompt, userPrompt);
  }
  if (provider === "groq") {
    return callGroq(systemPrompt, userPrompt);
  }
  return callOpenAI(systemPrompt, userPrompt);
};

const buildProfileSummary = (profile) => `
Name: ${profile.name}
Headline: ${profile.profile?.headline || "N/A"}
Location: ${profile.profile?.location || "N/A"}
Skills: ${(profile.profile?.skills || []).join(", ") || "N/A"}
Experience: ${profile.profile?.experience || "N/A"}
Education: ${profile.profile?.education || "N/A"}
Portfolio: ${profile.profile?.portfolio || "N/A"}
GitHub: ${profile.profile?.github || "N/A"}
LinkedIn: ${profile.profile?.linkedin || "N/A"}
`;

const EMAIL_REGEX = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+/g;

const extractEmailsFromText = (text) => {
  const matches = text.match(EMAIL_REGEX) || [];
  const seen = new Set();
  const cleaned = [];
  for (const raw of matches) {
    const email = raw.replace(/[.,;:)]+$/, "").toLowerCase();
    if (!seen.has(email)) {
      seen.add(email);
      cleaned.push(email);
    }
  }
  return cleaned;
};

const analyzeJobDescription = async (jobDescription, userProfile) => {
  const systemPrompt = `You are an expert technical recruiter. You always reply with ONLY valid JSON, no extra text, no markdown fences.`;

  const userPrompt = `
Analyze this job description and compare it against the candidate's profile below.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE PROFILE:
${buildProfileSummary(userProfile)}

This job posting may advertise a single role, or it may list several open roles/positions
in the same posting (e.g. "We are hiring for: Frontend Developer, Backend Developer, QA
Engineer"). Detect this.

Reply with ONLY a JSON object in exactly this shape:
{
  "jobTitle": "",
  "company": "",
  "recruiterEmail": "",
  "experienceRequired": "",
  "location": "",
  "employmentType": "",
  "requiredSkills": [],
  "preferredSkills": [],
  "responsibilities": [],
  "qualifications": [],
  "matchScore": 0,
  "matchingSkills": [],
  "missingSkills": [],
  "experienceMatch": true,
  "educationMatch": true,
  "recommendation": "",
  "detectedRoles": []
}

Rules for the fields:
- "jobTitle", "company", "location": your best single extraction, used as the default. Leave as "" if genuinely not stated anywhere in the text.
- "recruiterEmail": only an email address if one is literally written in the text, else "".
- "detectedRoles": if (and only if) the posting lists MULTIPLE distinct open roles, include one entry per role in the shape { "jobTitle": "", "location": "", "experienceRequired": "" }. If there is only one role, return an empty array [].
- matchScore must be a number from 0-100, scored against the primary/default role above. recommendation should be one short phrase like "Strong Match", "Good Match", "Partial Match" or "Weak Match".
`;

  const raw = await callAI(systemPrompt, userPrompt);
  const analysis = parseAIJson(raw);

  const emailsInText = extractEmailsFromText(jobDescription);
  if (emailsInText.length > 0) {
    analysis.recruiterEmail = emailsInText[0];
  } else if (!analysis.recruiterEmail) {
    analysis.recruiterEmail = "";
  }

  if (!Array.isArray(analysis.detectedRoles)) {
    analysis.detectedRoles = [];
  }

  return analysis;
};

const generateApplicationEmail = async (jobAnalysis, userProfile, tone = "Professional") => {
  const systemPrompt = `You are an expert career coach who writes concise, specific, personalized job application emails. You always reply with ONLY valid JSON, no extra text.`;

  const userPrompt = `
Write a ${tone.toLowerCase()} job application email for this candidate applying to this role.

JOB ANALYSIS:
${JSON.stringify(jobAnalysis)}

CANDIDATE PROFILE:
${buildProfileSummary(userProfile)}

Rules:
- Mention the exact job title and company name.
- Reference 2-3 real matching skills from the candidate's profile, not generic filler.
- Mention that the resume is attached.
- Mention portfolio/GitHub/LinkedIn only if they exist in the profile.
- Keep the body under 200 words.
- Sign off with the candidate's name.

Reply with ONLY a JSON object in exactly this shape:
{ "subject": "", "body": "" }
`;

  const raw = await callAI(systemPrompt, userPrompt);
  return parseAIJson(raw);
};

const improveEmail = async (currentSubject, currentBody, instruction) => {
  const systemPrompt = `You are an expert editor for job application emails. You always reply with ONLY valid JSON, no extra text.`;

  const userPrompt = `
Here is the current email:
Subject: ${currentSubject}
Body: ${currentBody}

Instruction: ${instruction}

Rewrite the email following that instruction. Keep it personalized and professional.

Reply with ONLY a JSON object in exactly this shape:
{ "subject": "", "body": "" }
`;

  const raw = await callAI(systemPrompt, userPrompt);
  return parseAIJson(raw);
};

const generateFollowUpEmail = async (application, userProfile) => {
  const systemPrompt = `You are an expert career coach who writes short, polite follow-up emails. You always reply with ONLY valid JSON, no extra text.`;

  const userPrompt = `
The candidate applied for this role and wants to send a polite follow-up.

Company: ${application.companyName}
Job Title: ${application.jobTitle}
Original application date: ${application.applicationDate}

CANDIDATE:
${buildProfileSummary(userProfile)}

Write a short, professional follow-up email (under 100 words) that references the original application and re-states interest.

Reply with ONLY a JSON object in exactly this shape:
{ "subject": "", "body": "" }
`;

  const raw = await callAI(systemPrompt, userPrompt);
  return parseAIJson(raw);
};

const extractProfileFromResume = async (resumeText) => {
  const systemPrompt = `You are an expert resume parser. You always reply with ONLY valid JSON, no extra text, no markdown fences.`;

  const userPrompt = `
Extract the candidate's details from this resume text.

RESUME TEXT:
${resumeText.slice(0, 12000)}

Reply with ONLY a JSON object in exactly this shape:
{
  "name": "",
  "phone": "",
  "headline": "",
  "location": "",
  "skills": [],
  "experience": "",
  "education": "",
  "portfolio": "",
  "github": "",
  "linkedin": ""
}

Rules:
- "headline" is a short professional title (e.g. "Full Stack Developer"), inferred from the most recent role or objective if not stated outright.
- "skills" is an array of individual skill strings, deduplicated, most relevant first.
- "experience" is a concise 2-4 sentence summary of work experience (roles, companies, durations), not a verbatim copy of the resume.
- "education" is a concise 1-2 sentence summary (degree, institution, year).
- "portfolio", "github", "linkedin" are full URLs only if present in the text, else "".
- Leave any field "" (or [] for skills) if it genuinely isn't in the text. Never invent information.
`;

  const raw = await callAI(systemPrompt, userPrompt);
  const parsed = parseAIJson(raw);

  return {
    name: parsed.name || "",
    phone: parsed.phone || "",
    headline: parsed.headline || "",
    location: parsed.location || "",
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    experience: parsed.experience || "",
    education: parsed.education || "",
    portfolio: parsed.portfolio || "",
    github: parsed.github || "",
    linkedin: parsed.linkedin || "",
  };
};

export {
  analyzeJobDescription,
  generateApplicationEmail,
  improveEmail,
  generateFollowUpEmail,
  extractProfileFromResume,
};
