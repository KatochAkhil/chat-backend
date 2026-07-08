import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authenticateUser } from "../middlewares/authenticate-user";

export function createPaymentRoutes(paymentController: PaymentController) {
  const router = Router();
  /**
   * @swagger
   * /api/payments/webhook:
   *   post:
   *     summary: Receive Razorpay webhook events
   *     responses:
   *       200:
   *         description: Webhook acknowledged
   */
  router.post("/webhook", paymentController.handleWebhook);
  /**
   * @swagger
   * /api/payments/create-order:
   *   post:
   *     security:
   *       - cookieAuth: []
   *     summary: Create Razorpay order for premium upgrade
   *     responses:
   *       201:
   *         description: Order created
   */
  router.post("/create-order", authenticateUser, paymentController.createOrder);
  /**
   * @swagger
   * /api/payments/verify:
   *   post:
   *     security:
   *       - cookieAuth: []
   *     summary: Verify Razorpay payment and unlock premium
   *     responses:
   *       200:
   *         description: Premium unlocked
   */
  router.post("/verify", authenticateUser, paymentController.verifyPayment);
  return router;
}
