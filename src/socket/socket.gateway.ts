import { Server, Socket } from "socket.io";
import { ChatService } from "../services/chat.service";
import { TokenService } from "../utils/token";
import { UserRepository } from "../repositories/user.repository";
import { getCacheClient } from "../config/cache";

interface OutboundMessagePayload {
  roomId: string;
  content: string;
  messageType?: "text" | "code" | "markdown" | "system" | "ai";
}

interface RoomUser {
  id: string;
  name: string;
  picture: string;
  isPremium: boolean;
}

export class SocketGateway {
  private readonly tokenService = new TokenService();
  private readonly roomUsers = new Map<string, Map<string, RoomUser>>();
  private readonly roomTypingUsers = new Map<string, Map<string, string>>();

  constructor(
    private readonly io: Server,
    private readonly chatService: ChatService,
    private readonly userRepository: UserRepository
  ) { }

  register() {
    this.io.use((socket, next) => {
      const token = socket.handshake.headers.cookie
        ?.split(";")
        .find((value) => value.trim().startsWith("_access_token="))
        ?.split("=")[1];

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      try {
        socket.data.user = this.tokenService.verify(token);
        return next();
      } catch (error) {
        return next(error as Error);
      }
    });

    this.io.on("connection", (socket) => {
      this.registerConnection(socket);
    });
  }

  emitPremiumActivated(userId: string, user: unknown) {
    this.io.to(this.getUserRoom(userId)).emit("payment:premium-activated", {
      user
    });
  }

  private registerConnection(socket: Socket) {
    const userId = String(socket.data.user.sub);
    socket.join(this.getUserRoom(userId));

    socket.on("chat:join", async (roomId: string) => {
      socket.join(roomId);
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return;
      }

      if (!this.roomUsers.has(roomId)) {
        this.roomUsers.set(roomId, new Map());
      }

      this.roomUsers.get(roomId)?.set(socket.id, {
        id: user.id,
        name: user.name,
        picture: user.picture,
        isPremium: user.isPremium
      });

      this.emitPresence(roomId);
    });

    socket.on("chat:message:send", async (payload: OutboundMessagePayload) => {
      const user = await this.userRepository.findById(userId);
      if (!user || !payload.content.trim()) {
        return;
      }

      const savedMessage = await this.chatService.createMessage({
        roomId: payload.roomId,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.picture,
        content: payload.content,
        messageType: payload.messageType ?? "text",
        isAI: false
      });

      this.io.to(payload.roomId).emit("chat:message", {
        _id: savedMessage.id,
        roomId: savedMessage.roomId,
        senderId: savedMessage.senderId,
        senderName: savedMessage.senderName,
        senderAvatar: savedMessage.senderAvatar,
        content: savedMessage.content,
        messageType: savedMessage.messageType,
        createdAt: savedMessage.createdAt,
        isAI: savedMessage.isAI,
        isCurrentUser: false,
        status: "sent"
      });

      this.clearTypingState(payload.roomId, socket.id);
    });

    socket.on("chat:typing", (payload: { roomId: string; isTyping: boolean; name?: string }) => {
      if (!this.roomTypingUsers.has(payload.roomId)) {
        this.roomTypingUsers.set(payload.roomId, new Map());
      }

      if (payload.isTyping) {
        const roomUser = this.roomUsers.get(payload.roomId)?.get(socket.id);
        const name = roomUser?.name || payload.name || "Someone";
        this.roomTypingUsers.get(payload.roomId)?.set(socket.id, name);
      } else {
        this.roomTypingUsers.get(payload.roomId)?.delete(socket.id);
      }

      this.emitTypingUsers(payload.roomId);
    });

    socket.on("disconnect", () => {
      for (const [roomId, users] of this.roomUsers.entries()) {
        if (users.delete(socket.id)) {
          this.emitPresence(roomId);
        }
      }

      for (const roomId of this.roomTypingUsers.keys()) {
        this.clearTypingState(roomId, socket.id);
      }
    });
  }

  private getUserRoom(userId: string) {
    return `user:${userId}`;
  }

  private async emitPresence(roomId: string) {
    const users = Array.from(this.roomUsers.get(roomId)?.values() ?? []);

    // Cache active user presence list in memory (TTL: 1 hour)
    try {
      const cache = getCacheClient();
      await cache.set(`presence:${roomId}`, JSON.stringify(users), { EX: 3600 });
    } catch (err) {
      console.warn("Failed to cache room presence list:", err);
    }

    this.io.to(roomId).emit("chat:presence", {
      roomId,
      users
    });
  }

  private emitTypingUsers(roomId: string) {
    const users = Array.from(this.roomTypingUsers.get(roomId)?.values() ?? []);
    this.io.to(roomId).emit("chat:typing", {
      roomId,
      users
    });
  }

  private clearTypingState(roomId: string, socketId: string) {
    this.roomTypingUsers.get(roomId)?.delete(socketId);
    this.emitTypingUsers(roomId);
  }
}
