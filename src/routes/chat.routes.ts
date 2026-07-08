import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { authenticateUser } from "../middlewares/authenticate-user";

export function createChatRoutes(chatController: ChatController) {
  const router = Router();
  /**
   * @swagger
   * /api/messages:
   *   get:
   *     security:
   *       - cookieAuth: []
   *     summary: Get message history for a room
   *     parameters:
   *       - in: query
   *         name: roomId
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Room messages
   */
  router.get("/", authenticateUser, chatController.listMessages);
  /**
   * @swagger
   * /api/messages:
   *   post:
   *     security:
   *       - cookieAuth: []
   *     summary: Persist a message through REST
   *     responses:
   *       201:
   *         description: Created message
   */
  router.post("/", authenticateUser, chatController.createMessage);
  return router;
}
