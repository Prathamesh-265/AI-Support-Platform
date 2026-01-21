import { Conversation } from "../models/Conversation.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAIReply } from "../services/ai.service.js";
import { getKnowledgeContext } from "./document.controller.js";
import { VALIDATION_LIMITS, ERROR_MESSAGES } from "../constants/index.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res
      .status(400)
      .json(new ApiResponse(false, ERROR_MESSAGES.INVALID_INPUT));
  }

  let conv = await Conversation.findOne({ userId: req.user.id });
  if (!conv) {
    conv = await Conversation.create({ userId: req.user.id, messages: [] });
  }

  conv.messages.push({ sender: "user", text: message.trim() });

  const MAX_DB_MESSAGES = 500;
  if (conv.messages.length > MAX_DB_MESSAGES) {
    conv.messages = conv.messages.slice(-MAX_DB_MESSAGES);
  }

  conv.lastUpdated = new Date();
  await conv.save();
  const history = conv.messages.slice(-VALIDATION_LIMITS.HISTORY_LIMIT);

  let knowledge = "";
  try {
    knowledge = await getKnowledgeContext();
  } catch (err) {
    console.error("Knowledge base error:", err?.message || err);
    knowledge = "";
  }

  let reply = "";
  try {
    reply = await generateAIReply({ userMessage: message, history, knowledge });
  } catch (err) {
    console.error("AI error:", err?.message || err);
    reply = ERROR_MESSAGES.AI_SERVICE_BUSY;
  }

  conv.messages.push({ sender: "ai", text: reply });

  if (conv.messages.length > MAX_DB_MESSAGES) {
    conv.messages = conv.messages.slice(-MAX_DB_MESSAGES);
  }

  conv.lastUpdated = new Date();
  await conv.save();

  return res
    .status(200)
    .json(new ApiResponse(true, "Reply generated", { reply }));
});

export const getConversation = asyncHandler(async (req, res) => {
  const conv = await Conversation.findOne({ userId: req.user.id });

  return res
    .status(200)
    .json(new ApiResponse(true, "Conversation", conv || { messages: [] }));
});

export const clearConversation = asyncHandler(async (req, res) => {
  await Conversation.findOneAndUpdate(
    { userId: req.user.id },
    { $set: { messages: [], lastUpdated: new Date() } },
    { upsert: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(true, "Conversation cleared"));
});
