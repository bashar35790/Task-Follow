import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

type ValidationTarget = "body" | "query" | "params";

export function validate(schema: ZodTypeAny, target: ValidationTarget = "body") {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req[target]);
      req[target] = parsed;
      next();
    } catch (error) {
      next(error);
    }
  };
}
