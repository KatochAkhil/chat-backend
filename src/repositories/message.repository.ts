import { MessageModel } from "../models/message.model";

export class MessageRepository {
  create(payload: Record<string, unknown>) {
    return MessageModel.create(payload);
  }

  async listByRoom(roomId: string, limit = 20, beforeCursor?: string) {
    const query: Record<string, any> = { roomId };
    if (beforeCursor) {
      query.createdAt = { $lt: new Date(beforeCursor) };
    }

    const messages = await MessageModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = messages.length > limit;
    const results = hasMore ? messages.slice(0, limit) : messages;

    // Reverse to return in chronological order (oldest first)
    results.reverse();

    const nextCursor = hasMore && results.length > 0 ? results[0].createdAt.toISOString() : null;

    return {
      messages: results,
      nextCursor
    };
  }
}
