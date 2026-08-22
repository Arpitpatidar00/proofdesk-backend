import type { Response } from "express";
import type { ApiResponse, PaginationInfo } from "../types/api.js";

interface ResponseOptions<T> {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data: T;
  pagination?: PaginationInfo;
}

/**
 * Standardized response generator for API endpoints.
 */
export function sendResponse<T>(res: Response, options: ResponseOptions<T>) {
  const statusCode = options.statusCode || 200;
  
  const response: ApiResponse<T> = {
    success: options.success ?? true,
    data: options.data,
  };

  if (options.message) {
    response.message = options.message;
  }

  if (options.pagination) {
    response.pagination = options.pagination;
  }

  return res.status(statusCode).json(response);
}
