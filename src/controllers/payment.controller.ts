import { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../types";
import { PaymentService } from "../services/payment.service";
import { SocketGateway } from "../socket/socket.gateway";
import { TokenService } from "../utils/token";
import { clientOrigins } from "../config/env";

export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly socketGateway: SocketGateway,
    private readonly tokenService: TokenService
  ) { }

  private getCookieOptions() {
    const isProduction = process.env.NODE_ENV === "production";
    const isLocalDevelopment = clientOrigins.some((origin) => origin.includes("localhost"));
    const isCrossSite = isProduction && !isLocalDevelopment;

    return {
      httpOnly: true,
      sameSite: (isCrossSite ? "none" : "lax") as "none" | "lax",
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000
    };
  }

  createOrder = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    try {
      const userId = request.user?.sub;
      if (!userId) {
        return response.status(401).json({ message: "Unauthorized" });
      }

      const order = await this.paymentService.createOrder(userId);
      return response.status(201).json({ order });
    } catch (error) {
      console.log(error)
      return next(error);
    }
  };

  verifyPayment = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    try {
      const userId = request.user?.sub;
      if (!userId) {
        return response.status(401).json({ message: "Unauthorized" });
      }

      const user = await this.paymentService.verifyPayment({
        userId,
        orderId: request.body.orderId,
        paymentId: request.body.paymentId,
        signature: request.body.signature
      });

      const refreshedToken = this.tokenService.sign({
        sub: user.id,
        role: user.role,
        isPremium: user.isPremium
      });

      this.socketGateway.emitPremiumActivated(userId, user);
      return response
        .cookie("nexus_access_token", refreshedToken, this.getCookieOptions())
        .json({ user });
    } catch (error) {
      return next(error);
    }
  };

  handleWebhook = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const signature = request.headers["x-razorpay-signature"];
      const normalizedSignature = Array.isArray(signature) ? signature[0] : signature;
      const result = await this.paymentService.handleWebhook(request.body as Buffer, normalizedSignature);

      if (result.user) {
        this.socketGateway.emitPremiumActivated(result.user.id, result.user);
      }

      return response.status(200).json({ received: true });
    } catch (error) {
      return next(error);
    }
  };
}
