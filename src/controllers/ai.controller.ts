import { Response } from "express";
import crypto from "crypto";
import type { AuthenticatedRequest } from "../types";
import { GeminiService } from "../services/gemini.service";
import { getRedisClient } from "../config/redis";

export class AiController {
  constructor(private readonly geminiService: GeminiService) {}

  generateSidebarContent = async (request: AuthenticatedRequest, response: Response) => {
    const { context } = request.body as { context: string };

    const hash = crypto.createHash("md5").update(context || "").digest("hex");
    const cacheKey = `ai:sidebar:${hash}`;
    const redis = getRedisClient();

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return response.json(JSON.parse(cached));
      }
    } catch (err) {
      console.warn("Failed to retrieve AI sidebar cache:", err);
    }

    const [replies, summary] = await Promise.all([
      this.geminiService.generateSuggestedReplies(context),
      this.geminiService.summarizeChat(context)
    ]);

    const result = { replies, summary };

    try {
      await redis.set(cacheKey, JSON.stringify(result), { EX: 300 }); // Cache for 5 minutes
    } catch (err) {
      console.warn("Failed to set AI sidebar cache:", err);
    }

    response.json(result);
  };
}
