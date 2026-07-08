import { Router } from "express";
import { AiController } from "../controllers/ai.controller";
import { authenticateUser, requirePremium } from "../middlewares/authenticate-user";

export function createAiRoutes(aiController: AiController) {
  const router = Router();
  /**
   * @swagger
   * /api/ai/sidebar:
   *   post:
   *     security:
   *       - cookieAuth: []
   *     summary: Generate suggested replies and a chat summary
   *     responses:
   *       200:
   *         description: Sidebar AI content
   */
  router.post("/sidebar", authenticateUser, requirePremium, aiController.generateSidebarContent);
  return router;
}
