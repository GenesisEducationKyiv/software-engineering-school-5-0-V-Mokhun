import { ZodObject, ZodRawShape, ZodError, ZodEffects } from "zod";
import { Request, Response, NextFunction } from "express";
import { BadRequestException } from "../lib";

export function bodyValidator<T extends ZodRawShape>(schema: ZodObject<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      let message = "Validation Failed";
      let errors: unknown = {};

      if (err instanceof ZodError) {
        message = `Validation failed: ${err.issues.length} errors detected in body`;
        errors = err.issues;
      }

      const badReqError = new BadRequestException(message, errors);

      next(badReqError);
    }
  };
}

export function queryValidator<T extends ZodRawShape>(
  schema: ZodObject<T> | ZodEffects<ZodObject<T>>
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      (req as any).parsedQuery = schema.parse(req.query);
      next();
    } catch (err) {
      let message = "Query Format Error";
      let errors: unknown = {};

      if (err instanceof ZodError) {
        message = `Validation failed: ${err.issues.length} errors detected in query params`;
        errors = err.issues;
      }

      const badReqError = new BadRequestException(message, errors);

      next(badReqError);
    }
  };
}

export function paramValidator<T extends ZodRawShape>(schema: ZodObject<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (err) {
      let message = "Query Format Error";
      let errors: unknown = {};

      if (err instanceof ZodError) {
        message = `Validation failed: ${err.issues.length} errors detected in url params`;
        errors = err.issues;
      }

      const badReqError = new BadRequestException(message, errors);

      next(badReqError);
    }
  };
}
