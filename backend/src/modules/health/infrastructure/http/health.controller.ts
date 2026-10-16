import type { Request, Response } from 'express';
import { getGreeting } from '@/modules/health/application/get-greeting';
import type { ApiResponse } from '@/types/api.types';

export const healthController = (_req: Request, res: Response): void => {
  const greeting = getGreeting();
  const response: ApiResponse<typeof greeting> = {
    done: true,
    msg: 'Hola mundo',
    data: greeting,
  };
  res.json(response);
};