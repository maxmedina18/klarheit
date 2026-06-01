const PLAN_STORAGE_KEY = "klarheit_monthly_plan_v1";

export type MonthlyPlan = {
  planName: string;
  plannedDebtPayoff: string;
  savingsTarget: string;
};

export function loadMonthlyPlan(): MonthlyPlan {
  if (typeof window === "undefined") {
    return {
      planName: "",
      plannedDebtPayoff: "",
      savingsTarget: "",
    };
  }

  const saved = window.localStorage.getItem(PLAN_STORAGE_KEY);

  if (!saved) {
    return {
      planName: "",
      plannedDebtPayoff: "",
      savingsTarget: "",
    };
  }

  try {
    return JSON.parse(saved) as MonthlyPlan;
  } catch {
    return {
      planName: "",
      plannedDebtPayoff: "",
      savingsTarget: "",
    };
  }
}

export function saveMonthlyPlan(plan: MonthlyPlan) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
}