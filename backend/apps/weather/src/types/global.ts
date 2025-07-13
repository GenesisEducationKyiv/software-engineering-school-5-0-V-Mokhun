import { Request } from "express";
import * as core from "express-serve-static-core";

export type ParsedRequest<
  P = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = core.Query,
  Locals extends Record<string, any> = Record<string, any>
> = Omit<Request<P, ResBody, ReqBody, ReqQuery, Locals>, "query"> & {
  parsedQuery: ReqQuery;
  query: Record<string, any>;
};
