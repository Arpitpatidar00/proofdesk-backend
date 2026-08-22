import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { config } from "./config/index.js";
import { parseUser } from "./modules/auth/auth.middleware.js";
import { errorHandler } from "./middleware/error-handler.js";
import submissionRoutes from "./modules/submissions/submission.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";

const app = express();

// ─── Global Middleware ─────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(morgan(config.nodeEnv === "development" ? "dev" : "combined"));

// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    success: false, 
    error: { code: "TOO_MANY_REQUESTS", message: "Too many requests from this IP, please try again later." }
  }
});
app.use("/api", apiLimiter);

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

// Parse user role from header on every request
app.use(parseUser);

// ─── Health Check ──────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date() } });
});

// ─── Routes ────────────────────────────────────────────
app.use("/api", submissionRoutes);
app.use("/api", notificationRoutes);

// ─── Error Handler (must be last) ─────────────────────
app.use(errorHandler);

export default app;
