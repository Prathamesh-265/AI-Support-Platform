import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import documentRoutes from "./routes/document.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export const createApp = () => {
  const app = express();

  const allowedOrigins = [
    process.env.CLIENT_URL, // example: https://your-frontend.vercel.app
    "http://localhost:5173",
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, cb) => {
        // allow non-browser calls (postman, curl)
        if (!origin) return cb(null, true);

        if (allowedOrigins.includes(origin)) return cb(null, true);

        return cb(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true, limit: "5mb" }));

  app.get("/health", (req, res) =>
    res.status(200).json({ ok: true, service: "AI Support API" })
  );

  app.get("/", (req, res) => res.json({ ok: true, name: "AI Support API" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/documents", documentRoutes);

  app.use(errorMiddleware);

  return app;
};
