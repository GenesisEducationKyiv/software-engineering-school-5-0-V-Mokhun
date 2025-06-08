import { NextFunction, Request, Response } from "express";
import { HttpException, errorResponse, serverErrorResponse } from "../lib";

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
    errorResponse(error, request, response);
    return;
  }

  if (hasStatus(error)) {
    errorResponse(
      new HttpException(
        error.status,
        hasMessage(error) ? error.message : `Error with status ${error.status}`
      ),
      request,
      response
    );
    return;
  }

  serverErrorResponse(request, response);
}
