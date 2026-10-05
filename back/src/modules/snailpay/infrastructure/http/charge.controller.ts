import type { Request, Response } from 'express';
import { ProcessChargeUseCase } from '@/modules/snailpay/application/process-charge';
import type { ProcessChargeInput } from '@/modules/snailpay/application/process-charge';
import type { ApiResponse } from '@/types/api.types';

export const chargeController = async (req: Request, res: Response): Promise<void> => {
  const useCase = req.app.locals.snailpayUseCase as ProcessChargeUseCase;
  const input = req.body as ProcessChargeInput;

  console.log('Received input:', JSON.stringify(input, null, 2));

  try {
    const result = await useCase.execute(input);

    const response: ApiResponse<typeof result> = {
      done: result.status === 'approved',
      msg: result.status_detail,
      data: result,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      done: false,
      msg: error instanceof Error ? error.message : 'Error interno',
      data: null,
    };
    res.status(500).json(response);
  }
};