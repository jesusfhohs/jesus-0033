import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_ORIGIN = 'http://localhost:5173';

const normalizeOrigins = (value: string): string[] => {
  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => (/^https?:\/\//i.test(origin) ? origin : `https://${origin}`));

  return origins.length > 0 ? origins : [DEFAULT_ORIGIN];
};

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z
    .string()
    .default(DEFAULT_ORIGIN)
    .transform(normalizeOrigins)
    .refine(
      (origins) => origins.every((origin) => URL.canParse(origin)),
      'CORS_ORIGIN debe ser una URL válida (ej: https://mi-front.up.railway.app)'
    ),
});

export const env = envSchema.parse(process.env);