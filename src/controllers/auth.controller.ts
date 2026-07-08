import { Response } from "express";
import type { AuthenticatedRequest } from "../types";
import { AuthService } from "../services/auth.service";
import { clientOrigins } from "../config/env";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  loginWithGoogle = async (request: AuthenticatedRequest, response: Response) => {
    const { credential, accessToken } = request.body as { credential?: string; accessToken?: string };
    const result = await this.authService.loginWithGoogle({ credential, accessToken });

    response
      .cookie("nexus_access_token", result.token, this.getCookieOptions())
      .json({ user: result.user });
  };

  logout = async (_request: AuthenticatedRequest, response: Response) => {
    response.clearCookie("nexus_access_token", this.getCookieOptions()).json({ success: true });
  };
}
