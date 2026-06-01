import { Transaction } from "./types";

const STORAGE_KEY = "klarheit_transactions_v1";

export function loadTransactions(): Transaction[] {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved) as Transaction[];
  } catch {
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}