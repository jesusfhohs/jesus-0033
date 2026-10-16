import { Router } from 'express';
import { healthRoutes } from '@/modules/health/infrastructure/http/health.routes';
import { snailpayRoutes } from '@/modules/snailpay/infrastructure/http';

export const routes = Router();

routes.use('/api/v1', healthRoutes);
routes.use('/api/v1/snailpay', snailpayRoutes);