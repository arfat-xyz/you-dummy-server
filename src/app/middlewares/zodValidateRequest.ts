// src/app/middlewares/zodValidateRequest.ts
import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

const zodValidateRequest =
  (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        ...req.body,
        ...req.query,
        ...req.params,
        ...req.cookies,
      });
      return next();
    } catch (error) {
      next(error); // Optional: custom Zod error formatting middleware
    }
  };

export default zodValidateRequest;
