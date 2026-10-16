import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configSchema = z.object({
  snailpay_enabled: z.boolean(),
  test_cards: z.array(
    z.object({
      number: z.string().length(16),
      expiration: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/),
      cvv: z.string().length(3),
      amount: z.string(),
      unavailable: z.boolean().optional(),
    })
  ),
});

export type SnailPayConfig = z.infer<typeof configSchema>;

let cachedConfig: SnailPayConfig | null = null;

export function loadSnailPayConfig(): SnailPayConfig {
  if (cachedConfig) return cachedConfig;

  const configPath = path.resolve(__dirname, 'snailpay.config.json');
  const raw = fs.readFileSync(configPath, 'utf-8');
  const parsed = JSON.parse(raw);
  cachedConfig = configSchema.parse(parsed);
  return cachedConfig;
}

export function getSnailPayConfig(): SnailPayConfig {
  if (!cachedConfig) return loadSnailPayConfig();
  return cachedConfig;
}