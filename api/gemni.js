// /api/gemini.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  try {
    const { message } = req.body;

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: message }]}]
        }),
      }
    );

    const data = await geminiResponse.json();
    console.log("🔵 Gemini raw response:", data);

    if (!data.candidates) {
      return res.status(500).json({ error: "Gemini returned no candidates", raw: data });
    }

    const text = data.candidates[0].content.parts[0].text;
    res.status(200).json({ output: text });

  } catch (err) {
    console.error("❌ Backend error:", err);
    res.status(500).json({ error: "Error generating report" });
  }
}
