import { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../types";
import { TokenService } from "../utils/token";

const tokenService = new TokenService();

export function authenticateUser(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const token = request.cookies._access_token;
  if (!token) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  request.user = tokenService.verify(token);
  return next();
}

export function optionalAuth(request: AuthenticatedRequest, _response: Response, next: NextFunction) {
  const token = request.cookies._access_token;
  if (token) {
    request.user = tokenService.verify(token);
  }
  next();
}

export function requirePremium(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  if (!request.user?.isPremium) {
    return response.status(403).json({ message: "Premium subscription required" });
  }
  return next();
}
