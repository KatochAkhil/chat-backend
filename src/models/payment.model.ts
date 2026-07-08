import { Schema, model } from "mongoose";

const paymentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String },
    razorpayEventId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["created", "authorized", "captured", "failed"], default: "created" },
    paidAt: { type: Date },
    webhookPayload: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const PaymentModel = model("Payment", paymentSchema);
