const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("CatGPT.AI backend is running!");
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a message.",
      });
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              ["user", "assistant"].includes(item.role) &&
              typeof item.content === "string"
          )
          .slice(-20)
          .map((item) => ({
            role: item.role,
            content: item.content,
          }))
      : [];

    const result = await client.responses.create({
      model: "gpt-4.1-mini",
      instructions: `
You are CatGPT.AI, a friendly cat expert.
Help with cat care, behavior, feeding, grooming, breeds,
training, and health.
Reply in the same language as the user whenever possible.
Be clear, kind, and practical.
For serious symptoms or emergencies, recommend contacting
a veterinarian promptly. Never claim to diagnose a cat.
For unrelated questions, politely explain that you specialize
in helping with cats.
      `,
      input: [
        ...safeHistory,
        { role: "user", content: message.trim() },
      ],
    });

    res.json({
      response:
        result.output_text ||
        "Sorry, I couldn't create an answer. Please try again.",
    });
  } catch (error) {
    console.error("CatGPT error:", error.message);

    res.status(500).json({
      error: "CatGPT.AI encountered a problem. Please try again.",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CatGPT.AI backend running on port ${PORT}`);
});
