import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Centralized error handler middleware.
 */
export const errorMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  console.error(`[Error] ${req.method} ${req.path} - ${message}`);
  if (!(err instanceof AppError)) {
    console.error(err.stack);
  }

  res.status(statusCode).json(ApiResponse.error(message));
};
