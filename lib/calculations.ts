import { Transaction } from "./types";

export function getTotalIncome(transactions: Transaction[]) {
  return transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

export function getTotalExpenses(transactions: Transaction[]) {
  return transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

export function getNetCashflow(transactions: Transaction[]) {
  return getTotalIncome(transactions) - getTotalExpenses(transactions);
}

export function getSavingsRate(transactions: Transaction[]) {
  const income = getTotalIncome(transactions);
  const net = getNetCashflow(transactions);

  if (income <= 0) {
    return 0;
  }

  return (net / income) * 100;
}

export function getExpenseRatio(transactions: Transaction[]) {
  const income = getTotalIncome(transactions);
  const expenses = getTotalExpenses(transactions);

  if (income <= 0) {
    return 0;
  }

  return (expenses / income) * 100;
}

export function groupExpensesByCategory(transactions: Transaction[]) {
  const grouped: Record<string, number> = {};

  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      grouped[transaction.category] =
        (grouped[transaction.category] || 0) + transaction.amount;
    });

  return Object.entries(grouped).map(([name, value]) => ({
    name,
    value,
  }));
}

export function groupExpensesByAccount(transactions: Transaction[]) {
  const grouped: Record<string, number> = {};

  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      grouped[transaction.account] =
        (grouped[transaction.account] || 0) + transaction.amount;
    });

  return Object.entries(grouped).map(([name, value]) => ({
    name,
    value,
  }));
}

export function getDiscretionarySpending(transactions: Transaction[]) {
  return transactions
    .filter(
      (transaction) =>
        transaction.type === "expense" && transaction.necessary === false
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

export function getDiscretionaryRatio(transactions: Transaction[]) {
  const totalExpenses = getTotalExpenses(transactions);
  const discretionary = getDiscretionarySpending(transactions);

  if (totalExpenses <= 0) {
    return 0;
  }

  return (discretionary / totalExpenses) * 100;
}

export function getDaysLeftInMonth() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = today.getDate();

  return Math.max(lastDayOfMonth - currentDay + 1, 1);
}

export function getSafeRemainingSpend(
  transactions: Transaction[],
  plannedDebtPayoff: number,
  savingsTarget: number
) {
  const income = getTotalIncome(transactions);
  const expenses = getTotalExpenses(transactions);

  return income - expenses - plannedDebtPayoff - savingsTarget;
}

export function getDailyAllowance(
  transactions: Transaction[],
  plannedDebtPayoff: number,
  savingsTarget: number
) {
  const safeRemainingSpend = getSafeRemainingSpend(
    transactions,
    plannedDebtPayoff,
    savingsTarget
  );

  const daysLeft = getDaysLeftInMonth();

  return safeRemainingSpend / daysLeft;
}

export function getFinancialStatus(dailyAllowance: number) {
  if (dailyAllowance >= 50) {
    return {
      label: "GRÜN",
      description: "Healthy operating range.",
    };
  }

  if (dailyAllowance >= 20) {
    return {
      label: "GELB",
      description: "Controlled, but stay sharp.",
    };
  }

  if (dailyAllowance >= 0) {
    return {
      label: "ROT",
      description: "Minimal room. Reduce spending.",
    };
  }

  return {
    label: "SCHWARZ",
    description: "Lockdown mode. Spending exceeds plan.",
  };
}

export function getExpenseTotalForCategory(
  transactions: Transaction[],
  category: string
) {
  return transactions
    .filter(
      (transaction) =>
        transaction.type === "expense" && transaction.category === category
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

export function getBudgetStatus(spent: number, limit: number) {
  if (limit <= 0) {
    return {
      label: "UNSET",
      description: "No budget configured.",
      percentUsed: 0,
    };
  }

  const percentUsed = (spent / limit) * 100;

  if (percentUsed < 60) {
    return {
      label: "GRÜN",
      description: "Healthy category spending.",
      percentUsed,
    };
  }

  if (percentUsed < 85) {
    return {
      label: "GELB",
      description: "Approaching budget limit.",
      percentUsed,
    };
  }

  if (percentUsed <= 100) {
    return {
      label: "ROT",
      description: "Near limit. Tighten spending.",
      percentUsed,
    };
  }

  return {
    label: "SCHWARZ",
    description: "Over budget. Lock this category.",
    percentUsed,
  };
}

export function getCurrentMonthKey() {
  const today = new Date();
  return today.toISOString().slice(0, 7);
}

export function filterTransactionsByMonth(
  transactions: Transaction[],
  monthKey: string
) {
  return transactions.filter((transaction) =>
    transaction.date.startsWith(monthKey)
  );
}

export function getDebtPaid(transactions: Transaction[]) {
  return transactions
    .filter(
      (transaction) =>
        transaction.type === "expense" && transaction.category === "Debt Payment"
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

export function getSavingsAdded(transactions: Transaction[]) {
  return transactions
    .filter(
      (transaction) =>
        transaction.type === "expense" && transaction.category === "Savings"
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

export function getProgressPercent(current: number, target: number) {
  if (target <= 0) {
    return 0;
  }

  return Math.min((current / target) * 100, 100);
}

export function getRemainingTarget(current: number, target: number) {
  return Math.max(target - current, 0);
}