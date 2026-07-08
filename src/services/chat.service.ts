import { MessageRepository } from "../repositories/message.repository";

export class ChatService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async listMessages(roomId: string, limit = 20, beforeCursor?: string) {
    return this.messageRepository.listByRoom(roomId, limit, beforeCursor);
  }

  async createMessage(payload: Record<string, unknown>) {
    return this.messageRepository.create(payload);
  }
}
