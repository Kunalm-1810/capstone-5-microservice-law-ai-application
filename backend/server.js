import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a legal assistant that explains Indian laws in very simple language.\n\n${userMessage}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    res.json({ reply: data.candidates[0].content.parts[0].text });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/review", async (req, res) => {
  const contract = req.body.contract;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a legal expert specializing in Indian law. Review the following contract and:
1. Identify any risky or unfair clauses
2. Explain each clause in simple language
3. Suggest what to watch out for

Contract:
${contract}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    res.json({ review: data.candidates[0].content.parts[0].text });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Serve React build
app.use(express.static(path.join(__dirname, "../build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

app.listen(5000, () => console.log("Server running on port 5000"));
