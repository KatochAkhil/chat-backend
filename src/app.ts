import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { clientOrigins, env } from "./config/env";
import { AiController } from "./controllers/ai.controller";
import { AuthController } from "./controllers/auth.controller";
import { ChatController } from "./controllers/chat.controller";
import { PaymentController } from "./controllers/payment.controller";
import { UserController } from "./controllers/user.controller";
import { errorHandler } from "./middlewares/error-handler";
import { MessageRepository } from "./repositories/message.repository";
import { PaymentRepository } from "./repositories/payment.repository";
import { UserRepository } from "./repositories/user.repository";
import { createAiRoutes } from "./routes/ai.routes";
import { createAuthRoutes } from "./routes/auth.routes";
import { createChatRoutes } from "./routes/chat.routes";
import { createPaymentRoutes } from "./routes/payment.routes";
import { createUserRoutes } from "./routes/user.routes";
import { AuthService } from "./services/auth.service";
import { ChatService } from "./services/chat.service";
import { GeminiService } from "./services/gemini.service";
import { PaymentService } from "./services/payment.service";
import { SocketGateway } from "./socket/socket.gateway";
import { TokenService } from "./utils/token";

export function createApp() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: clientOrigins,
      credentials: true
    }
  });

  const userRepository = new UserRepository();
  const messageRepository = new MessageRepository();
  const paymentRepository = new PaymentRepository();

  const authController = new AuthController(new AuthService(userRepository, new TokenService()));
  const chatService = new ChatService(messageRepository);
  const chatController = new ChatController(chatService);
  const aiController = new AiController(new GeminiService());
  const socketGateway = new SocketGateway(io, chatService, userRepository);
  const paymentController = new PaymentController(
    new PaymentService(paymentRepository, userRepository),
    socketGateway,
    new TokenService()
  );
  const userController = new UserController(userRepository);
  const swaggerSpec = swaggerJsdoc({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Ai Chat API",
        version: "1.0.0",
        description: "Authentication, chat, AI, payment, and realtime API for Ai Chat."
      },
      servers: [
        {
          url: env.SWAGGER_SERVER_URL
        }
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "_access_token"
          }
        }
      }
    },
    apis: ["./src/routes/*.ts"]
  });

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || clientOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Origin not allowed by CORS"));
      },
      credentials: true
    })
  );
  app.use(cookieParser());
  app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
  app.use(express.json());

  app.get("/health", (_request, response) => response.json({ ok: true }));
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api/docs.json", (_request, response) => response.json(swaggerSpec));
  app.use("/api/auth", createAuthRoutes(authController));
  app.use("/api/me", createUserRoutes(userController));
  app.use("/api/messages", createChatRoutes(chatController));
  app.use("/api/ai", createAiRoutes(aiController));
  app.use("/api/payments", createPaymentRoutes(paymentController));
  app.use(errorHandler);

  socketGateway.register();

  return { app, server, io };
}
