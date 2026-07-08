import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    roomId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderAvatar: { type: String },
    content: { type: String, required: true },
    messageType: { type: String, enum: ["text", "code", "markdown", "system", "ai"], default: "text" },
    isAI: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const MessageModel = model("Message", messageSchema);
