// backend/server.js
import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;


app.get("/", (req, res) => res.send("✅ Backend is running"));

app.post("/api/explain", async (req, res) => {
  try {
    const { text, type, language } = req.body;

    if (!text || !language || !type) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    
    const prompt =
      type === "hint"
        ? `Provide 1-3 short, simple hints to fix this ${language} error. Keep it easy to understand:\n${text}`
        : `Explain this ${language} error in 2-3 simple sentences, easy to understand for beginners:\n${text}`;

    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          { parts: [{ text: prompt }] }
        ],
      },
      { timeout: 10000 }
    );

    const explanation =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No explanation received from Gemini.";

    res.json({ explanation });
  } catch (err) {
    console.error("❌ Gemini API Error:", err.response?.data || err.message);

    let message = "❌ Failed to fetch AI explanation.";
    if (err.code === "ECONNABORTED") message = "❌ Request timed out.";
    else if (err.response?.status === 429) message = "❌ Rate limit exceeded.";
    else if (err.response?.status >= 500) message = "❌ Gemini server error.";

    res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => console.log(`🚀 Backend running at http://localhost:${PORT}`));
