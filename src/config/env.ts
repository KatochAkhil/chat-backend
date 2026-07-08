import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  BACKEND_PORT: z.coerce.number().default(4000),
  BACKEND_CLIENT_URL: z.string().default("http://localhost:3000,http://localhost:3001"),
  SWAGGER_SERVER_URL: z.string().default("http://localhost:4000"),
  AI_RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(15),
  AI_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(2),
  MONGODB_URI: z.string(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  GOOGLE_CLIENT_ID: z.string(),
  GEMINI_API_KEY: z.string(),
  RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),
  RAZORPAY_WEBHOOK_SECRET: z.string()
});

export const env = envSchema.parse(process.env);

export const clientOrigins = env.BACKEND_CLIENT_URL.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
