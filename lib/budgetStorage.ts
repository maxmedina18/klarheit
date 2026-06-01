import { ExpenseCategory } from "./types";

const BUDGET_STORAGE_KEY = "klarheit_category_budgets_v1";

export type BudgetConfig = Record<ExpenseCategory, string>;

export const defaultBudgets: BudgetConfig = {
  Food: "250",
  Transportation: "180",
  School: "100",
  Fitness: "100",
  Clothing: "250",
  Subscriptions: "80",
  "Debt Payment": "2500",
  Savings: "500",
  Investing: "100",
  Fun: "120",
  Other: "100",
};

export function loadBudgets(): BudgetConfig {
  if (typeof window === "undefined") {
    return defaultBudgets;
  }

  const saved = window.localStorage.getItem(BUDGET_STORAGE_KEY);

  if (!saved) {
    return defaultBudgets;
  }

  try {
    return {
      ...defaultBudgets,
      ...(JSON.parse(saved) as Partial<BudgetConfig>),
    };
  } catch {
    return defaultBudgets;
  }
}

export function saveBudgets(budgets: BudgetConfig) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets));
}

export function resetBudgets() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(BUDGET_STORAGE_KEY);
}