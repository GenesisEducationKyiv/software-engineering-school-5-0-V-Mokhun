declare namespace Express {
  interface Request {
    parsedQuery: Record<string, any>;
  }
}
