"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getRecurringSummary,
  loadRecurringItems,
  RecurringItem,
} from "../lib/recurringStorage";

type Props = {
  onGoRecurring: () => void;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function getRecurringStatus(summary: {
  monthlyIncome: number;
  monthlyExpenses: number;
  necessaryExpenses: number;
  discretionaryExpenses: number;
  netRecurringCashflow: number;
}) {
  if (summary.monthlyIncome === 0 && summary.monthlyExpenses === 0) {
    return {
      label: "NO DATA",
      description: "No recurring income or expenses are being tracked yet.",
      className: "border-[rgba(245,245,247,0.14)] text-[#8E8E93]",
    };
  }

  if (summary.discretionaryExpenses >= 150) {
    return {
      label: "LEAKAGE",
      description: "Recurring discretionary spending is creating monthly drag.",
      className: "border-yellow-300/50 bg-yellow-300/10 text-yellow-200",
    };
  }

  if (summary.netRecurringCashflow < 0) {
    return {
      label: "PRESSURE",
      description: "Recurring expenses exceed recurring income.",
      className: "border-red-400/50 bg-red-400/10 text-red-300",
    };
  }

  return {
    label: "CONTROLLED",
    description: "Recurring obligations are visible and controlled.",
    className: "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
  };
}

export default function RecurringPressure({ onGoRecurring }: Props) {
  const [items, setItems] = useState<RecurringItem[]>(() =>
  loadRecurringItems()
);

  useEffect(() => {
    setItems(loadRecurringItems());
  }, []);

  const summary = useMemo(() => getRecurringSummary(items), [items]);
  const status = useMemo(() => getRecurringStatus(summary), [summary]);

  const activeCount = items.filter((item) => item.active).length;
  const inactiveCount = items.length - activeCount;

  return (
    <section className="rounded-[28px] border border-[rgba(245,245,247,0.12)] bg-[#050505] p-5 shadow-2xl shadow-black/40">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#F5EFE1]">
            Zyklusdruck
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            Recurring Pressure
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#8E8E93]">
            Shows predictable monthly income, obligations, and subscription
            leakage before the money disappears.
          </p>
        </div>

        <div
          className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] ${status.className}`}
        >
          {status.label}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <RecurringMetric
          label="Recurring Income"
          value={formatMoney(summary.monthlyIncome)}
        />

        <RecurringMetric
          label="Recurring Expenses"
          value={formatMoney(summary.monthlyExpenses)}
          danger={summary.monthlyExpenses > summary.monthlyIncome}
        />

        <RecurringMetric
          label="Necessary"
          value={formatMoney(summary.necessaryExpenses)}
        />

        <RecurringMetric
          label="Discretionary"
          value={formatMoney(summary.discretionaryExpenses)}
          warning={summary.discretionaryExpenses > 0}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">
              Net Recurring Cashflow
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#F5EFE1]">
              {formatMoney(summary.netRecurringCashflow)}
            </p>

            <p className="mt-2 text-sm leading-6 text-[#8E8E93]">
              {status.description} Active items: {activeCount}. Inactive items:{" "}
              {inactiveCount}.
            </p>
          </div>

          <button
            onClick={onGoRecurring}
            className="rounded-full border border-[#F5EFE1] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#F5EFE1] transition hover:bg-[#F5EFE1] hover:text-[#000000]"
          >
            Open Repeat
          </button>
        </div>
      </div>
    </section>
  );
}

function RecurringMetric({
  label,
  value,
  warning = false,
  danger = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-semibold tracking-[-0.045em] ${
          danger
            ? "text-red-300"
            : warning
              ? "text-yellow-200"
              : "text-[#F5F5F7]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}