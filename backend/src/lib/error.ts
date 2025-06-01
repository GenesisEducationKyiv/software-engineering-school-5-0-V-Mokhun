import { Request, Response } from "express";
import { HTTP_STATUS_CODE } from "../constants";

export class HttpException extends Error {
  status: number;
  errors: unknown;

  constructor(status: number, message: string, errors?: unknown) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export class ServerErrorException extends HttpException {
  constructor(message = "Internal server error") {
    super(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, message);
  }
}
export class BadRequestException extends HttpException {
  constructor(message: string, errors?: unknown) {
    super(HTTP_STATUS_CODE.BAD_REQUEST, message, errors);
  }
}

export class NotFoundException extends HttpException {
  constructor(message = "Not found", errors?: unknown) {
    super(HTTP_STATUS_CODE.NOT_FOUND, message, errors);
  }
}

export class ConflictException extends HttpException {
  constructor(message = "Resource already exists", errors?: unknown) {
    super(HTTP_STATUS_CODE.CONFLICT, message, errors);
  }
}

export function logError(request: Request, error: HttpException) {
  const loggedError = {
    method: request.method,
    url: request.url,
  };
  console.error(
    `Error: ${error.message}, Status: ${
      error.status
    }, Request: ${JSON.stringify(loggedError)}
Error stack: ${error.stack}`
  );
}

export function errorResponse(
  error: HttpException,
  _request: Request,
  response: Response
) {
  response.status(error.status);
  response.json({
    message: error.message,
    errors: error.errors,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
}

export function serverErrorResponse(
  request: Request,
  response: Response,
  message?: string
) {
  const error = new ServerErrorException(message);
  errorResponse(error, request, response);
}

export function badRequestResponse(
  request: Request,
  response: Response,
  message: string,
  errors?: unknown
) {
  errorResponse(new BadRequestException(message, errors), request, response);
}

export function notFoundResponse(
  request: Request,
  response: Response,
  message?: string
) {
  errorResponse(new NotFoundException(message), request, response);
}

export function conflictResponse(
  request: Request,
  response: Response,
  message?: string
) {
  errorResponse(new ConflictException(message), request, response);
}
