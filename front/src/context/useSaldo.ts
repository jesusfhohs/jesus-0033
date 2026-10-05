import { useContext } from 'react';
import { SaldoContext } from './saldoContext';
import type { SaldoContextValue } from '@/interfaces/context';

export function useSaldo(): SaldoContextValue {
	const context = useContext(SaldoContext);
	if (!context) {
		throw new Error('Error en useSaldo');
	}
	return context;
}
