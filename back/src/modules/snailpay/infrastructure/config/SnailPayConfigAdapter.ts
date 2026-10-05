import type { SnailPayConfigPort } from '@/modules/snailpay/domain/ports/SnailPayConfigPort';
import { getSnailPayConfig } from '@/config/snailpay';

export class SnailPayConfigAdapter implements SnailPayConfigPort {
  getConfig() {
    return getSnailPayConfig();
  }
}