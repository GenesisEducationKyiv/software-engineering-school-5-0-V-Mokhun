import { StatusCodes } from "http-status-codes";

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
    super(StatusCodes.INTERNAL_SERVER_ERROR, message);
  }
}
export class BadRequestException extends HttpException {
  constructor(message: string, errors?: unknown) {
    super(StatusCodes.BAD_REQUEST, message, errors);
  }
}

export class NotFoundException extends HttpException {
  constructor(message = "Not found", errors?: unknown) {
    super(StatusCodes.NOT_FOUND, message, errors);
  }
}

export class ConflictException extends HttpException {
  constructor(message = "Resource already exists", errors?: unknown) {
    super(StatusCodes.CONFLICT, message, errors);
  }
}
