import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ZodSchema } from 'zod';
import type { ApiResponse } from '@/types/api.types';

export const validate = (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const zodError = error as unknown as { issues: Array<{ path: (string | number)[]; message: string }> };
        const messages = zodError.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
        const response: ApiResponse<null> = {
          done: false,
          msg: `Validación fallida: ${messages}`,
          data: null,
        };
        res.status(400).json(response);
        return;
      }
      return next(error);
    }
  };