export type TimelineMonth = {
  monthIndex: number;
  label: string;
  startingDebt: number;
  payment: number;
  endingDebt: number;
  savingsAdded: number;
  cumulativeSavings: number;
  netRecoveryPosition: number;
};

export type RecoveryTimelineInput = {
  startingDebt: number;
  monthlyDebtPayment: number;
  monthlySavingsTarget: number;
  startingSavings: number;
  extraMonthlyPayment: number;
  startMonth: string;
  targetMonths: number;
};

export function addMonthsToMonthKey(monthKey: string, monthsToAdd: number) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1 + monthsToAdd, 1);

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function calculateRecoveryTimeline(input: RecoveryTimelineInput) {
  const startingDebt = Math.max(input.startingDebt, 0);
  const monthlyDebtPayment = Math.max(input.monthlyDebtPayment, 0);
  const monthlySavingsTarget = Math.max(input.monthlySavingsTarget, 0);
  const startingSavings = Math.max(input.startingSavings, 0);
  const extraMonthlyPayment = Math.max(input.extraMonthlyPayment, 0);
  const totalMonthlyPayment = monthlyDebtPayment + extraMonthlyPayment;
  const targetMonths = Math.max(input.targetMonths, 1);

  const timeline: TimelineMonth[] = [];

  let remainingDebt = startingDebt;
  let cumulativeSavings = startingSavings;

  for (let index = 0; index < targetMonths; index++) {
    const payment = Math.min(remainingDebt, totalMonthlyPayment);
    const startingDebtForMonth = remainingDebt;

    remainingDebt = Math.max(remainingDebt - payment, 0);
    cumulativeSavings += monthlySavingsTarget;

    timeline.push({
      monthIndex: index + 1,
      label: addMonthsToMonthKey(input.startMonth, index),
      startingDebt: startingDebtForMonth,
      payment,
      endingDebt: remainingDebt,
      savingsAdded: monthlySavingsTarget,
      cumulativeSavings,
      netRecoveryPosition: cumulativeSavings - remainingDebt,
    });

    if (remainingDebt <= 0) {
      break;
    }
  }

  const debtFreeMonth = timeline.find((month) => month.endingDebt <= 0);
  const totalPaid = timeline.reduce((sum, month) => sum + month.payment, 0);
  const totalSaved = timeline.reduce(
    (sum, month) => sum + month.savingsAdded,
    0
  );

  const requiredMonthlyPayment =
    targetMonths > 0 ? startingDebt / targetMonths : startingDebt;

  const isPlanEnough = remainingDebt <= 0;

  return {
    timeline,
    totalMonthlyPayment,
    debtFreeMonth,
    monthsToDebtFree: debtFreeMonth?.monthIndex ?? null,
    remainingDebt,
    totalPaid,
    totalSaved,
    requiredMonthlyPayment,
    isPlanEnough,
  };
}