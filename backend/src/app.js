import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import taskRoutes from "./routes/taskRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const allowed = env.CORS_ORIGIN.split(",").map((x) => x.trim()).filter(Boolean);
app.use(cors({ origin: (origin, cb) => {
  if (!origin || allowed.includes(origin)) return cb(null, true);
  return cb(new Error("CORS origin not allowed"));
}}));
app.use(express.json({ limit: "100kb" }));
app.get("/api/health", (req, res) => res.json({ success: true, message: "Samayamundu backend is running." }));
app.use("/api/tasks", taskRoutes);
app.use("/api", aiRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
