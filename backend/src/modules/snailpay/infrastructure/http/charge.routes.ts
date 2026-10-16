import { Router } from 'express';
import { chargeController } from './charge.controller';
import { validate } from '@/middlewares/validate';
import { chargeSchema } from './charge.validation';

export const snailpayRoutes = Router();

snailpayRoutes.post('/charge', validate(chargeSchema), chargeController);