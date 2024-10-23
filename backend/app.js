const express = require("express");
const { message } = require("prompt");
const cors = require("cors");
const PORT = 5000;
const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());


// Make sure to include these imports:
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
let conversations = [];
app.post("/ask", async (req, res) => {
  const { prompt } = req.body;
  try {
    const chat = model.startChat({
      history: conversations,
    });
    let result = await chat.sendMessage(`${prompt}`);
    conversations.push({ role: "user",  parts: [{ text: prompt }]});
    conversations.push({
      role: "assistant",
      parts: [{ text: result.response.text() }],
    });
    console.log(result.response.text());
    res.json({ message: result.response.text() });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
