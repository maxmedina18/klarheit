import {
  PaymentAccount,
  TransactionCategory,
  TransactionType,
} from "./types";

export type RecurringFrequency = "weekly" | "biweekly" | "monthly";

export type RecurringItem = {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  account: PaymentAccount;
  frequency: RecurringFrequency;
  nextDueDate: string;
  necessary: boolean;
  active: boolean;
};

const RECURRING_STORAGE_KEY = "klarheit_recurring_items_v1";

export function loadRecurringItems(): RecurringItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = window.localStorage.getItem(RECURRING_STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved) as RecurringItem[];
  } catch {
    return [];
  }
}

export function saveRecurringItems(items: RecurringItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(RECURRING_STORAGE_KEY, JSON.stringify(items));
}

export function getMonthlyRecurringAmount(item: RecurringItem) {
  if (!item.active) {
    return 0;
  }

  if (item.frequency === "weekly") {
    return item.amount * 4.33;
  }

  if (item.frequency === "biweekly") {
    return item.amount * 2.17;
  }

  return item.amount;
}

export function getRecurringSummary(items: RecurringItem[]) {
  const activeItems = items.filter((item) => item.active);

  const monthlyIncome = activeItems
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + getMonthlyRecurringAmount(item), 0);

  const monthlyExpenses = activeItems
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + getMonthlyRecurringAmount(item), 0);

  const necessaryExpenses = activeItems
    .filter((item) => item.type === "expense" && item.necessary)
    .reduce((sum, item) => sum + getMonthlyRecurringAmount(item), 0);

  const discretionaryExpenses = activeItems
    .filter((item) => item.type === "expense" && !item.necessary)
    .reduce((sum, item) => sum + getMonthlyRecurringAmount(item), 0);

  return {
    monthlyIncome,
    monthlyExpenses,
    necessaryExpenses,
    discretionaryExpenses,
    netRecurringCashflow: monthlyIncome - monthlyExpenses,
  };
}