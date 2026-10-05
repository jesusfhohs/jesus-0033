import type { TransactionRecord } from '@/interfaces/snailpay';

export type { TransactionRecord };

const STORAGE_KEY = 'caracoles_transactions';

export function getTransactions(): TransactionRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTransaction(tx: TransactionRecord): void {
  const transactions = getTransactions();
  transactions.unshift(tx); // Más reciente primero
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}