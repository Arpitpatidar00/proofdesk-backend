import type { Request, Response, NextFunction } from "express";
import { ForbiddenError, AppError } from "../../lib/errors.js";

export const USER_ROLES = {
  REVIEWER: "REVIEWER",
  VIEWER: "VIEWER",
} as const;

export type UserRole = keyof typeof USER_ROLES;

export interface AuthUser {
  email: string;
  role: UserRole;
}

const FIXED_USERS: Record<string, AuthUser> = {
  REVIEWER: {
    email: "reviewer@proofdesk.local",
    role: "REVIEWER",
  },
  VIEWER: {
    email: "viewer@proofdesk.local",
    role: "VIEWER",
  },
};

/**
 * Parses the x-user-role header and attaches user to request.
 * Defaults to VIEWER if no header is provided.
 */
export function parseUser(req: Request, _res: Response, next: NextFunction): void {
  const roleHeader = (req.headers["x-user-role"] as string)?.toUpperCase();
  const user = FIXED_USERS[roleHeader as keyof typeof FIXED_USERS];

  if (roleHeader && !user) {
    next(new AppError("INVALID_ROLE", "Invalid user role", 401));
    return;
  }

  req.user = user || FIXED_USERS.VIEWER;
  next();
}

/**
 * Middleware factory to require a specific role.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("UNAUTHORIZED", "Authentication required", 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError());
      return;
    }

    next();
  };
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
