// src/app/middlewares/zodValidateRequest.ts
import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
const zodValidateRequest =
  (schema: AnyZodObject) =>
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
      next(error);
    }
  };

export default zodValidateRequest;
