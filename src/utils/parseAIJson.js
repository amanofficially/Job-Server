const parseAIJson = (text) => {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/```json/gi, "").replace(/```/g, "").trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.slice(start, end + 1);
  }

  return JSON.parse(cleaned);
};

export default parseAIJson;
