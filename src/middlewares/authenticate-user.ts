import { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../types";
import { TokenService } from "../utils/token";

const tokenService = new TokenService();

export function authenticateUser(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  let token = request.cookies._access_token;

  if (!token) {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  try {
    request.user = tokenService.verify(token);
    return next();
  } catch (error) {
    return response.status(401).json({ message: "Unauthorized" });
  }
}

export function optionalAuth(request: AuthenticatedRequest, _response: Response, next: NextFunction) {
  let token = request.cookies._access_token;

  if (!token) {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (token) {
    try {
      request.user = tokenService.verify(token);
    } catch {
      // Ignore verification errors for optional auth
    }
  }
  next();
}

export function requirePremium(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  if (!request.user?.isPremium) {
    return response.status(403).json({ message: "Premium subscription required" });
  }
  return next();
}
