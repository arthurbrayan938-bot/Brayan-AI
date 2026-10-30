
const express = require("express");
const OpenAI = require("openai");
const path = require("path");

const app = express();

app.use(express.json({ limit: "30kb" }));

app.use(express.static(path.join(__dirname, "public")));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/health", (req, res) => {
  res.json({ status: "Brayan AI online!" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const messages = req.body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Envie uma mensagem."
      });
    }

    const history = messages.slice(-20).filter(msg =>
      msg &&
      ["user", "assistant"].includes(msg.role) &&
      typeof msg.content === "string"
    );

    if (!history.length || history[history.length - 1].role !== "user") {
      return res.status(400).json({
        error: "Mensagem inválida."
      });
    }

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6-astra",
      instructions:
        "Você é a Brayan AI. Responda em português brasileiro, seja inteligente, educada e converse naturalmente.",
      input: history
    });

    res.json({
      reply: response.output_text
    });

  } catch (error) {
    console.error("Erro na IA:", error.message);

    res.status(500).json({
      error: "Não consegui gerar uma resposta. Verifique o servidor."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Brayan AI online na porta " + PORT);
});
