// Single source of truth for the application lifecycle statuses used by the
// Application model's enum validation and anywhere else on the backend that
// needs the full list (e.g. seed scripts, admin tooling).
const STATUS_OPTIONS = [
  "Draft",
  "Applied",
  "Email Sent",
  "HR Contacted",
  "Screening",
  "Interview",
  "Technical Round",
  "Final Round",
  "Offer",
  "Selected",
  "Rejected",
  "Withdrawn",
];

export default STATUS_OPTIONS;
