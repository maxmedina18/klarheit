"use client";

import { useEffect, useMemo, useState } from "react";
import { Transaction } from "../lib/types";
import {
  CreditCard,
  getCardPressureSummary,
  loadCards,
} from "../lib/cardStorage";
import {
  getRecurringSummary,
  loadRecurringItems,
  RecurringItem,
} from "../lib/recurringStorage";

type Props = {
  transactions: Transaction[];
  plannedDebtPayoff: string;
  savingsTarget: string;
  onGoCards: () => void;
  onGoRecurring: () => void;
  onGoRecovery: () => void;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function getRealityStatus(trueAvailableCash: number) {
  if (trueAvailableCash < 0) {
    return {
      label: "LOCKDOWN",
      description:
        "Your real available cash is negative after obligations. No discretionary spending until the plan changes.",
      className: "border-red-400/50 bg-red-400/10 text-red-300",
    };
  }

  if (trueAvailableCash < 150) {
    return {
      label: "TIGHT",
      description:
        "Your real available cash is thin. Spend only on necessary items.",
      className: "border-yellow-300/50 bg-yellow-300/10 text-yellow-200",
    };
  }

  return {
    label: "CLEAR",
    description:
      "Your obligations are covered with remaining room. Stay disciplined and keep logging.",
    className: "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
  };
}

export default function OperatingReality({
  transactions,
  plannedDebtPayoff,
  savingsTarget,
  onGoCards,
  onGoRecurring,
  onGoRecovery,
}: Props) {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [recurringItems, setRecurringItems] = useState<RecurringItem[]>([]);

  useEffect(() => {
    setCards(loadCards());
    setRecurringItems(loadRecurringItems());
  }, []);

  const totalIncome = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  const cardSummary = useMemo(() => getCardPressureSummary(cards), [cards]);
  const recurringSummary = useMemo(
    () => getRecurringSummary(recurringItems),
    [recurringItems]
  );

  const cleanDebtPayoff = Number(plannedDebtPayoff) || 0;
  const cleanSavingsTarget = Number(savingsTarget) || 0;

  const actualCashflow = totalIncome - totalExpenses;

  const trueAvailableCash =
    totalIncome -
    totalExpenses -
    cleanDebtPayoff -
    cleanSavingsTarget -
    cardSummary.uncoveredGap -
    recurringSummary.monthlyExpenses;

  const totalObligations =
    cleanDebtPayoff +
    cleanSavingsTarget +
    cardSummary.uncoveredGap +
    recurringSummary.monthlyExpenses;

  const status = getRealityStatus(trueAvailableCash);

  return (
    <section className="rounded-[28px] border border-[rgba(245,245,247,0.12)] bg-[#050505] p-5 shadow-2xl shadow-black/40">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#F5EFE1]">
            Realität
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            Operating Reality
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#8E8E93]">
            The real available cash after actual spending, recovery targets,
            card gaps, and recurring obligations.
          </p>
        </div>

        <div
          className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] ${status.className}`}
        >
          {status.label}
        </div>
      </div>

      <div className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-[#8E8E93]">
          True Available Cash
        </p>

        <p
          className={`mt-3 text-4xl font-semibold tracking-[-0.06em] ${
            trueAvailableCash < 0
              ? "text-red-300"
              : trueAvailableCash < 150
                ? "text-yellow-200"
                : "text-[#F5EFE1]"
          }`}
        >
          {formatMoney(trueAvailableCash)}
        </p>

        <p className="mt-3 text-sm leading-6 text-[#8E8E93]">
          {status.description}
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <RealityMetric label="Actual Cashflow" value={formatMoney(actualCashflow)} />

        <RealityMetric
          label="Recovery Targets"
          value={formatMoney(cleanDebtPayoff + cleanSavingsTarget)}
        />

        <RealityMetric
          label="Card Gap"
          value={formatMoney(cardSummary.uncoveredGap)}
          warning={cardSummary.uncoveredGap > 0}
        />

        <RealityMetric
          label="Recurring Drag"
          value={formatMoney(recurringSummary.monthlyExpenses)}
          warning={recurringSummary.monthlyExpenses > 0}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">
              Total Obligations
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#F5F5F7]">
              {formatMoney(totalObligations)}
            </p>

            <p className="mt-2 text-sm leading-6 text-[#8E8E93]">
              Includes recovery targets, uncovered card statement gaps, and
              recurring monthly expenses.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onGoRecovery}
              className="rounded-full border border-[#F5EFE1] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#F5EFE1] transition hover:bg-[#F5EFE1] hover:text-[#000000]"
            >
              Recovery
            </button>

            <button
              onClick={onGoCards}
              className="rounded-full border border-[rgba(245,245,247,0.18)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#F5EFE1] transition hover:border-[#F5EFE1]"
            >
              Cards
            </button>

            <button
              onClick={onGoRecurring}
              className="rounded-full border border-[rgba(245,245,247,0.18)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#F5EFE1] transition hover:border-[#F5EFE1]"
            >
              Repeat
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function RealityMetric({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-semibold tracking-[-0.045em] ${
          warning ? "text-yellow-200" : "text-[#F5F5F7]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}