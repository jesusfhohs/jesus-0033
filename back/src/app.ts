import express from 'express';
import cors from 'cors';
import { env } from '@/config/env';
import { routes } from '@/routes';
import { SnailPayConfigAdapter } from '@/modules/snailpay/infrastructure/config/SnailPayConfigAdapter';
import { ProcessChargeUseCase } from '@/modules/snailpay/application/process-charge';

export const createApp = (): express.Express => {
  const app = express();

  const corsOptions = {
    origin: env.NODE_ENV === 'development' ? true : env.CORS_ORIGIN,
    credentials: true,
  };
  app.use(cors(corsOptions));
  app.use(express.json());

  // Dependency injection
  const configAdapter = new SnailPayConfigAdapter();
  const snailpayUseCase = new ProcessChargeUseCase(configAdapter);
  app.locals.snailpayUseCase = snailpayUseCase;

  app.use(routes);

  return app;
};