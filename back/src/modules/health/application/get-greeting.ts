import type { Greeting } from '@/modules/types/greeting.types';

export const getGreeting = (): Greeting => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
});