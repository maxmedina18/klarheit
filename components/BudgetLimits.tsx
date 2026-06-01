"use client";

import { useEffect, useMemo, useState } from "react";
import { ExpenseCategory, Transaction } from "../lib/types";
import {
  getBudgetStatus,
  getExpenseTotalForCategory,
} from "../lib/calculations";
import {
  BudgetConfig,
  defaultBudgets,
  loadBudgets,
  resetBudgets,
  saveBudgets,
} from "../lib/budgetStorage";

type Props = {
  transactions: Transaction[];
};

const categories = Object.keys(defaultBudgets) as ExpenseCategory[];

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

  if (status === "SCHWARZ") {
    return "border-[#FAF3E0]/50 text-[#FAF3E0] bg-[#FAF3E0]/10";
  }

  return "border-[rgba(250,243,224,0.18)] text-[#A3A3A3] bg-[#000000]";
}

export default function BudgetLimits({ transactions }: Props) {
  const [budgets, setBudgets] = useState<BudgetConfig>(defaultBudgets);
  const [savedNotice, setSavedNotice] = useState("");

  useEffect(() => {
    setBudgets(loadBudgets());
  }, []);

  const rows = useMemo(() => {
    return categories.map((category) => {
      const spent = getExpenseTotalForCategory(transactions, category);
      const limit = Number(budgets[category]);
      const cleanLimit = Number.isNaN(limit) ? 0 : limit;
      const status = getBudgetStatus(spent, cleanLimit);

      return {
        category,
        spent,
        limit: cleanLimit,
        status,
      };
    });
  }, [transactions, budgets]);

  function updateBudget(category: ExpenseCategory, value: string) {
    setBudgets((current) => ({
      ...current,
      [category]: value,
    }));
  }

  function handleSaveBudgets() {
    saveBudgets(budgets);
    setSavedNotice("Rahmen gespeichert – Grenzen gesetzt.");

    window.setTimeout(() => {
      setSavedNotice("");
    }, 2200);
  }

  function handleResetBudgets() {
    resetBudgets();
    setBudgets(defaultBudgets);
    setSavedNotice("Rahmen zurückgesetzt.");

    window.setTimeout(() => {
      setSavedNotice("");
    }, 2200);
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[rgba(250,243,224,0.18)] bg-[rgba(248,248,248,0.045)] p-5 shadow-2xl shadow-black/40">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <div className="absolute left-0 top-0 h-px w-full bg-[#FAF3E0]" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-[#FAF3E0]" />
        <div className="absolute left-8 top-0 h-full w-px bg-[#FAF3E0]" />
        <div className="absolute right-8 top-0 h-full w-px bg-[#FAF3E0]" />
      </div>

      <div className="relative mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#FAF3E0]">
            Ausgabenrahmen
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Category Budget Limits
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">
            Set monthly limits for each spending category. These limits are
            saved locally and used to expose leaks.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={handleSaveBudgets}
            className="rounded-full border border-[#FAF3E0] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#FAF3E0] transition hover:bg-[#FAF3E0] hover:text-[#000000]"
          >
            Save Limits
          </button>

          <button
            onClick={handleResetBudgets}
            className="rounded-full border border-[rgba(250,243,224,0.18)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#A3A3A3] transition hover:border-[#FAF3E0] hover:text-[#FAF3E0]"
          >
            Reset
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="relative mb-5 rounded-2xl border border-[#FAF3E0]/40 bg-[#FAF3E0]/10 p-4">
          <p className="text-sm uppercase tracking-[0.18em] text-[#FAF3E0]">
            {savedNotice}
          </p>
        </div>
      )}

      <div className="relative grid gap-3">
        {rows.map((row) => {
          const percentUsed = Math.min(row.status.percentUsed, 999);
          const barWidth = Math.min(row.status.percentUsed, 100);
          const statusClasses = getStatusClasses(row.status.label);

          return (
            <div
              key={row.category}
              className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-[#F8F8F8]">
                      {row.category}
                    </h3>

                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${statusClasses}`}
                    >
                      {row.status.label}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-[#A3A3A3]">
                    {formatMoney(row.spent)} spent of {formatMoney(row.limit)} ·{" "}
                    {percentUsed.toFixed(1)}% used
                  </p>
                </div>

                <label className="flex min-w-[180px] flex-col gap-1 text-xs uppercase tracking-[0.16em] text-[#A3A3A3]">
                  Limit
                  <input
                    value={budgets[row.category]}
                    onChange={(event) =>
                      updateBudget(row.category, event.target.value)
                    }
                    type="number"
                    min="0"
                    step="0.01"
                    className="rounded-xl border border-[rgba(250,243,224,0.18)] bg-[#000000] px-3 py-2 text-sm tracking-normal text-[#F8F8F8] outline-none transition focus:border-[#FAF3E0]"
                  />
                </label>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(250,243,224,0.10)]">
                <div
                  className="h-full rounded-full bg-[#FAF3E0]"
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              <p className="mt-3 text-xs leading-5 text-[#A3A3A3]">
                {row.status.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}