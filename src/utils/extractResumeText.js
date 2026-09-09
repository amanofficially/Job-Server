import pdfParse from "pdf-parse";

const extractResumeText = async (fileBuffer, originalName) => {
  const ext = (originalName.split(".").pop() || "").toLowerCase();

  if (ext !== "pdf") {
    return null;
  }

  try {
    const data = await pdfParse(fileBuffer);
    const text = (data.text || "").trim();
    return text.length > 0 ? text : null;
  } catch (error) {
    console.error("Resume text extraction failed:", error.message);
    return null;
  }
};

export default extractResumeText;
