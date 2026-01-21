import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { clearConversation, getConversation, sendMessage } from "../controllers/chat.controller.js";
import { validateMessage } from "../middlewares/validate.middleware.js";

const router = Router();

router.get("/history", requireAuth, getConversation);
router.post("/send", requireAuth, validateMessage, sendMessage);
router.delete("/clear", requireAuth, clearConversation);

export default router;
