import type { SnailPayConfig } from '@/config/snailpay';

export interface SnailPayConfigPort {
  getConfig(): SnailPayConfig;
}