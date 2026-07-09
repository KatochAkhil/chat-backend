import { NextFunction, Request, Response } from "express";

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    const candidateMessage = "message" in error && typeof error.message === "string" ? error.message : null;
    if (candidateMessage) {
      return candidateMessage;
    }
  }

  return "Internal server error";
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  console.error("Express Error Handler:", error);
  response.status(500).json({
    message: getErrorMessage(error)
  });
}
