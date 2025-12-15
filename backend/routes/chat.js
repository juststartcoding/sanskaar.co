const express = require("express");
const ChatLog = require("../models/ChatLog");
// TEMP: const auth = require('../middleware/auth');

const router = express.Router();

router.post("/query", async (req, res) => {
  const chatLog = await ChatLog.findOne({ userId: req.user.id });
  if (!chatLog) {
    const newLog = new ChatLog({
      userId: req.user.id,
      conversation: [{ role: "user", message: req.body.query }],
    });
    await newLog.save();
    newLog.conversation.push({ role: "bot", message: "Sample response" });
    await newLog.save();
    res.json(newLog);
  } else {
    chatLog.conversation.push({ role: "user", message: req.body.query });
    chatLog.conversation.push({ role: "bot", message: "Sample response" });
    await chatLog.save();
    res.json(chatLog);
  }
});

router.get("/logs", async (req, res) => {
  const log = await ChatLog.findOne({ userId: req.user.id });
  res.json(log);
});

module.exports = router;
