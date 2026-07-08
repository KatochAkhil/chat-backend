import { PaymentModel } from "../models/payment.model";

export class PaymentRepository {
  create(payload: Record<string, unknown>) {
    return PaymentModel.create(payload);
  }

  findByOrderId(orderId: string) {
    return PaymentModel.findOne({ razorpayOrderId: orderId });
  }

  markCaptured(orderId: string, paymentId: string) {
    return PaymentModel.findOneAndUpdate(
      { razorpayOrderId: orderId },
      { status: "captured", razorpayPaymentId: paymentId, paidAt: new Date() },
      { new: true }
    );
  }

  markAuthorized(orderId: string, paymentId: string, eventId?: string, webhookPayload?: unknown) {
    return PaymentModel.findOneAndUpdate(
      { razorpayOrderId: orderId },
      {
        status: "authorized",
        razorpayPaymentId: paymentId,
        razorpayEventId: eventId,
        webhookPayload
      },
      { new: true }
    );
  }

  markCapturedFromWebhook(orderId: string, paymentId: string, eventId?: string, webhookPayload?: unknown) {
    return PaymentModel.findOneAndUpdate(
      { razorpayOrderId: orderId },
      {
        status: "captured",
        razorpayPaymentId: paymentId,
        razorpayEventId: eventId,
        webhookPayload,
        paidAt: new Date()
      },
      { new: true }
    );
  }

  markFailed(orderId: string, paymentId: string | undefined, eventId?: string, webhookPayload?: unknown) {
    return PaymentModel.findOneAndUpdate(
      { razorpayOrderId: orderId },
      {
        status: "failed",
        razorpayPaymentId: paymentId,
        razorpayEventId: eventId,
        webhookPayload
      },
      { new: true }
    );
  }
}
