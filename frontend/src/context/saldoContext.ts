import { createContext } from 'react';
import type { SaldoContextValue } from '@/interfaces/context';

export const SaldoContext = createContext<SaldoContextValue | undefined>(undefined);
