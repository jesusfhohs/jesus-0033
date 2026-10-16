import { Router } from 'express';
import { chargeController } from './charge.controller.js';
import { validate } from '@/middlewares/validate';
import { chargeSchema } from './charge.validation.js';

export const snailpayRoutes = Router();

snailpayRoutes.post('/charge', validate(chargeSchema), chargeController);