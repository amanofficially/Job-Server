// Newer "AQ." Gemini keys reject the old ?key= query-param auth (401), so the key is sent via the x-goog-api-key header instead.
const callGemini = async (systemPrompt, userPrompt) => {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error(
        `Gemini request failed (401 Unauthorized): ${errorText}. This usually means GEMINI_API_KEY is invalid, revoked, or ` +
          `an "AQ." auth key that Google's REST endpoint isn't accepting yet — try regenerating the key in Google AI Studio, ` +
          `or switch AI_PROVIDER=openai in .env as a working alternative.`
      );
    }
    throw new Error(`Gemini request failed: ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const blockReason = data?.promptFeedback?.blockReason;
    throw new Error(
      blockReason
        ? `Gemini blocked this request (${blockReason}).`
        : "Gemini returned an empty response."
    );
  }
  return text;
};

export default callGemini;
