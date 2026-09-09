const callGroq = async (systemPrompt, userPrompt) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error(
        `Groq request failed (401 Unauthorized): ${errorText}. Check that GROQ_API_KEY in .env is set to a key from console.groq.com.`
      );
    }
    if (response.status === 429) {
      throw new Error(
        `Groq request failed (429 Rate limited): ${errorText}. The free tier caps requests per minute/day — wait a moment and retry.`
      );
    }
    throw new Error(`Groq request failed: ${errorText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Groq returned an empty response.");
  }
  return text;
};

export default callGroq;
