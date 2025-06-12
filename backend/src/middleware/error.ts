import { NextFunction, Request, Response } from "express";
import { HttpException, ServerErrorException } from "@/shared";

function hasStatus(error: unknown): error is { status: number } {
  return Boolean(
    error &&
      typeof error === "object" &&
      "status" in error &&
      typeof error.status === "number"
  );
}

function hasMessage(error: unknown): error is { message: string } {
  return Boolean(
    error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
  );
}

function logError(request: Request, error: HttpException) {
  console.error(
    `Error: ${error.message}, Status: ${
      error.status
    }, Request: ${JSON.stringify({
      method: request.method,
      url: request.url,
    })}, Stack: ${error.stack}`
  );
}

function formatErrorResponse(error: HttpException, response: Response) {
  response.status(error.status).json({
    message: error.message,
    errors: error.errors,
    stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
  });
}

export function errorMiddleware(
  error: unknown,
  request: Request,
  response: Response,
  next: NextFunction
) {
  if (response.headersSent) {
    return next(error);
  }

  if (error instanceof HttpException) {
    logError(request, error);
    formatErrorResponse(error, response);
    return;
  }

  if (hasStatus(error)) {
    const exception = new HttpException(
      error.status,
      hasMessage(error) ? error.message : `Error with status ${error.status}`
    );
    logError(request, exception);
    formatErrorResponse(exception, response);
    return;
  }

  const serverError = new ServerErrorException(
    hasMessage(error) ? error.message : "An unexpected error occurred."
  );
  logError(request, serverError);
  formatErrorResponse(serverError, response);
}
