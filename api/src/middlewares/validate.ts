// src/middlewares/validate.ts
import { ZodTypeAny } from "zod";
import { Request, Response, NextFunction } from "express";

const validate =
  (schema: ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json({
        message: "Erro de validação",
        errors: error.errors,
      });
    }
  };

export default validate;
