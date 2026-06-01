"use client";

import { useMemo, useState } from "react";
import { Transaction } from "../lib/types";
import {
  getDailyAllowance,
  getDaysLeftInMonth,
  getFinancialStatus,
  getSafeRemainingSpend,
} from "../lib/calculations";

type Props = {
  transactions: Transaction[];
  planName: string;
  plannedDebtPayoff: string;
  savingsTarget: string;
  onPlanNameChange: (value: string) => void;
  onPlannedDebtPayoffChange: (value: string) => void;
  onSavingsTargetChange: (value: string) => void;
  onSavePlan: () => void;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function getStatusClasses(status: string) {
  if (status === "GRÜN") {
    return "border-emerald-400/50 text-emerald-300 bg-emerald-400/10";
  }

  if (status === "GELB") {
    return "border-yellow-300/50 text-yellow-200 bg-yellow-300/10";
  }

  if (status === "ROT") {
    return "border-red-400/50 text-red-300 bg-red-400/10";
  }

  return "border-[#FAF3E0]/50 text-[#FAF3E0] bg-[#FAF3E0]/10";
}

export default function SafeSpending({
  transactions,
  planName,
  plannedDebtPayoff,
  savingsTarget,
  onPlanNameChange,
  onPlannedDebtPayoffChange,
  onSavingsTargetChange,
  onSavePlan,
}: Props) {
  const [savedNotice, setSavedNotice] = useState("");

  const result = useMemo(() => {
    const debtPayoff = Number(plannedDebtPayoff);
    const savings = Number(savingsTarget);

    const cleanDebtPayoff = Number.isNaN(debtPayoff) ? 0 : debtPayoff;
    const cleanSavings = Number.isNaN(savings) ? 0 : savings;

    const safeRemainingSpend = getSafeRemainingSpend(
      transactions,
      cleanDebtPayoff,
      cleanSavings
    );

    const dailyAllowance = getDailyAllowance(
      transactions,
      cleanDebtPayoff,
      cleanSavings
    );

    const daysLeft = getDaysLeftInMonth();
    const status = getFinancialStatus(dailyAllowance);

    return {
      safeRemainingSpend,
      dailyAllowance,
      daysLeft,
      status,
    };
  }, [transactions, plannedDebtPayoff, savingsTarget]);

  const statusClasses = getStatusClasses(result.status.label);

  function handleSavePlan() {
    onSavePlan();
    setSavedNotice("Plan gespeichert – System ausführen");
    window.setTimeout(() => setSavedNotice(""), 2200);
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[rgba(250,243,224,0.18)] bg-[rgba(248,248,248,0.045)] p-5 shadow-2xl shadow-black/40">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <div className="absolute left-0 top-0 h-px w-full bg-[#FAF3E0]" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-[#FAF3E0]" />
        <div className="absolute left-8 top-0 h-full w-px bg-[#FAF3E0]" />
        <div className="absolute right-8 top-0 h-full w-px bg-[#FAF3E0]" />
      </div>

      <div className="relative mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#FAF3E0]">
            Monatsplan
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Recovery Plan</h2>
          <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">
            Set your debt payoff and savings targets as mandatory monthly
            allocations. Zentrale will judge your real cashflow against this
            plan.
          </p>
        </div>

        <div
          className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] ${statusClasses}`}
        >
          Status: {result.status.label}
        </div>
      </div>

      <div className="relative grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm text-[#A3A3A3]">
          Plan Name
          <input
            value={planName}
            onChange={(event) => onPlanNameChange(event.target.value)}
            placeholder="Example: June Debt Strike"
            className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] px-4 py-3 text-[#F8F8F8] outline-none transition focus:border-[#FAF3E0]"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-[#A3A3A3]">
          Debt Payoff Target
          <input
            value={plannedDebtPayoff}
            onChange={(event) =>
              onPlannedDebtPayoffChange(event.target.value)
            }
            type="number"
            min="0"
            step="0.01"
            placeholder="Example: 800"
            className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] px-4 py-3 text-[#F8F8F8] outline-none transition focus:border-[#FAF3E0]"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-[#A3A3A3]">
          Savings Target
          <input
            value={savingsTarget}
            onChange={(event) => onSavingsTargetChange(event.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="Example: 200"
            className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] px-4 py-3 text-[#F8F8F8] outline-none transition focus:border-[#FAF3E0]"
          />
        </label>
      </div>

      <div className="relative mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[#A3A3A3]">
            Safe Remaining
          </p>
          <p className="mt-3 text-3xl font-semibold text-[#F8F8F8]">
            {formatMoney(result.safeRemainingSpend)}
          </p>
        </div>

        <div className={`rounded-2xl border p-4 ${statusClasses}`}>
          <p className="text-xs uppercase tracking-[0.22em] opacity-80">
            Daily Allowance
          </p>
          <p className="mt-3 text-3xl font-semibold">
            {formatMoney(result.dailyAllowance)}
          </p>
        </div>

        <div className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[#A3A3A3]">
            Days Left
          </p>
          <p className="mt-3 text-3xl font-semibold text-[#F8F8F8]">
            {result.daysLeft}
          </p>
        </div>
      </div>

      <div className={`relative mt-5 rounded-2xl border p-4 ${statusClasses}`}>
        <p className="text-sm leading-6">{result.status.description}</p>
      </div>

      <div className="relative mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={handleSavePlan}
          className="rounded-2xl bg-[#FAF3E0] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#000000] transition hover:opacity-90"
        >
          Save Recovery Plan
        </button>

        {savedNotice && (
          <p className="text-sm uppercase tracking-[0.18em] text-[#FAF3E0]">
            {savedNotice}
          </p>
        )}
      </div>
    </section>
  );
}