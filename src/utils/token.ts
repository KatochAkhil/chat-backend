import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import type { JwtPayload } from "../types";

export class TokenService {
  sign(payload: JwtPayload) {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
    });
  }

  verify(token: string) {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  }
}
