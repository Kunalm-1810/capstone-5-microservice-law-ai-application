import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, Chat, Review } from "./db.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "10kb" }));

connectDB();

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are a legal assistant that explains Indian laws in very simple language.\n\n${userMessage}` }] }],
        }),
      }
    );
    const data = await response.json();
    const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!botReply) return res.status(502).json({ error: "No response from AI" });
    await Chat.create({ userMessage, botReply });
    res.json({ reply: botReply });
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
${contract}`,
                },
              ],
            },
          ],
        }),
      }
    );
    const data = await response.json();
    const reviewResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reviewResult) return res.status(502).json({ error: "No response from AI" });
    await Review.create({ contractText: contract, reviewResult });
    res.json({ review: reviewResult });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/history/chats", async (req, res) => {
  const chats = await Chat.find().sort({ createdAt: -1 }).limit(20);
  res.json(chats);
});

app.get("/history/reviews", async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 }).limit(20);
  res.json(reviews);
});

app.listen(5000, () => console.log("Server running on port 5000"));
