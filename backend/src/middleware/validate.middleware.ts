import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

type ValidationTarget = "body" | "query" | "params";

export function validate(schema: ZodTypeAny, target: ValidationTarget = "body") {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req[target]);
      if (target === "query") {
        Object.defineProperty(req, "query", {
          value: parsed,
          writable: true,
          configurable: true,
        });
      } else if (target === "params") {
        Object.defineProperty(req, "params", {
          value: parsed,
          writable: true,
          configurable: true,
        });
      } else {
        req.body = parsed;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
