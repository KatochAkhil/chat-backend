import { Response } from "express";
import type { AuthenticatedRequest } from "../types";
import { ChatService } from "../services/chat.service";

export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  listMessages = async (request: AuthenticatedRequest, response: Response) => {
    const roomId = String(request.query.roomId ?? "product-design-sync");
    const limit = request.query.limit ? Number(request.query.limit) : 20;
    const beforeCursor = request.query.before ? String(request.query.before) : undefined;
    
    const result = await this.chatService.listMessages(roomId, limit, beforeCursor);
    response.json(result);
  };

  createMessage = async (request: AuthenticatedRequest, response: Response) => {
    const userId = request.user?.sub;
    if (!userId) {
      return response.status(401).json({ message: "Unauthorized" });
    }

    const message = await this.chatService.createMessage({
      ...request.body,
      senderId: userId
    });

    return response.status(201).json({ message });
  };
}
