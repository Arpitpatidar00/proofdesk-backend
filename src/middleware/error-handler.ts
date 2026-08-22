import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors.js";
import { ZodError } from "zod";
import { config } from "../config/index.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: err.flatten().fieldErrors,
      },
    });
    return;
  }

  // Known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
    return;
  }

  // Unknown errors — log with context
  console.error(`[Unhandled Error] ${req.method} ${req.path}`, err);

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message:
        config.nodeEnv === "development"
          ? err.message
          : "An unexpected error occurred",
    },
  });
}
