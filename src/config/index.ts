import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/proofdesk"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  process.exit(1);
}

export const config = {
  port: parseInt(_env.data.PORT, 10),
  mongodbUri: _env.data.MONGODB_URI,
  nodeEnv: _env.data.NODE_ENV,
  corsOrigin: _env.data.CORS_ORIGIN,
} as const;
