import crypto from "node:crypto";
import Razorpay from "razorpay";
import { env } from "../config/env";
import { PaymentRepository } from "../repositories/payment.repository";
import { UserRepository } from "../repositories/user.repository";

export class PaymentService {
  private readonly razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET
  });

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly userRepository: UserRepository
  ) {}

  async createOrder(userId: string) {
    const compactUserId = userId.slice(-8);
    const compactTimestamp = Date.now().toString(36);
    const receipt = `premium_${compactUserId}_${compactTimestamp}`.slice(0, 40);

    const order = await this.razorpay.orders.create({
      amount: 29900,
      currency: "INR",
      receipt
    });

    await this.paymentRepository.create({
      userId,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: "created"
    });

    return order;
  }

  async verifyPayment(payload: { userId: string; orderId: string; paymentId: string; signature: string }) {
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${payload.orderId}|${payload.paymentId}`)
      .digest("hex");

    if (expectedSignature !== payload.signature) {
      throw new Error("Invalid payment signature");
    }

    await this.paymentRepository.markCaptured(payload.orderId, payload.paymentId);
    const user = await this.userRepository.markPremium(payload.userId);
    if (!user) {
      throw new Error("User not found after successful payment verification");
    }
    return user;
  }

  async handleWebhook(payload: Buffer, signature: string | undefined) {
    if (!signature) {
      throw new Error("Missing Razorpay webhook signature");
    }

    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new Error("Invalid Razorpay webhook signature");
    }

    const event = JSON.parse(payload.toString("utf8")) as {
      event: string;
      payload?: {
        payment?: {
          entity?: {
            id?: string;
            order_id?: string;
            status?: string;
          };
        };
      };
      created_at?: number;
      account_id?: string;
    };

    const paymentEntity = event.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    if (!orderId) {
      return { acknowledged: true, payment: null, user: null };
    }

    if (event.event === "payment.authorized") {
      const payment = await this.paymentRepository.markAuthorized(orderId, paymentId ?? "", paymentId, event);
      return { acknowledged: true, payment, user: null };
    }

    if (event.event === "payment.failed") {
      const payment = await this.paymentRepository.markFailed(orderId, paymentId, paymentId, event);
      return { acknowledged: true, payment, user: null };
    }

    if (event.event === "payment.captured") {
      const payment = await this.paymentRepository.markCapturedFromWebhook(orderId, paymentId ?? "", paymentId, event);
      if (!payment) {
        return { acknowledged: true, payment: null, user: null };
      }

      const user = await this.userRepository.markPremium(String(payment.userId));
      return { acknowledged: true, payment, user };
    }

    return { acknowledged: true, payment: null, user: null };
  }
}
