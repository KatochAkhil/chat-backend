import { Request } from "express";

export type Role = "USER" | "ADMIN";

export interface JwtPayload {
  sub: string;
  role: Role;
  isPremium: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
