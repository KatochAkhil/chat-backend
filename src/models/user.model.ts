import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    googleId: { type: String, required: true, unique: true },
    picture: { type: String, required: true },
    isPremium: { type: Boolean, default: false },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" }
  },
  { timestamps: true }
);

export const UserModel = model("User", userSchema);
