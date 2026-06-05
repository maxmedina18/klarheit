"use client";

import { useMemo, useState } from "react";
import {
  getNetWorthSummary,
  loadNetWorthItems,
} from "../lib/netWorthStorage";

type Props = {
  plannedDebtPayoff: string;
  savingsTarget: string;
};

type ProjectionMonth = {
  monthIndex: number;
  label: string;
  projectedNetWorth: number;
  debtReduction: number;
  savingsIncrease: number;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function getMonthLabel(monthsFromNow: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsFromNow);

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function getTrajectoryStatus(projectedNetWorth: number, currentNetWorth: number) {
  if (projectedNetWorth <= currentNetWorth) {
    return {
      label: "STALLED",
      className: "border-yellow-300/50 bg-yellow-300/10 text-yellow-200",
      description:
        "Trajectory is flat. Increase savings, debt payoff, or reduce leakage.",
    };
  }

  if (currentNetWorth < 0 && projectedNetWorth >= 0) {
    return {
      label: "BREAKOUT",
      className: "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
      description:
        "Projection crosses into positive net worth within this timeline.",
    };
  }

  return {
    label: "IMPROVING",
    className: "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
    description:
      "Net worth is improving month by month under the current plan.",
  };
}

export default function NetWorthTrajectory({
  plannedDebtPayoff,
  savingsTarget,
}: Props) {
  const [projectionMonths, setProjectionMonths] = useState("12");
  const [extraMonthlyImprovement, setExtraMonthlyImprovement] = useState("0");

  const netWorthSummary = useMemo(() => {
    return getNetWorthSummary(loadNetWorthItems());
  }, []);

  const currentNetWorth = netWorthSummary.netWorth;
  const monthlyDebtPayoff = Number(plannedDebtPayoff) || 0;
  const monthlySavings = Number(savingsTarget) || 0;
  const extraImprovement = Number(extraMonthlyImprovement) || 0;
  const cleanProjectionMonths = Math.max(Number(projectionMonths) || 1, 1);

  const monthlyImprovement =
    monthlyDebtPayoff + monthlySavings + extraImprovement;

  const projection = useMemo<ProjectionMonth[]>(() => {
    return Array.from({ length: cleanProjectionMonths }, (_, index) => {
      const monthIndex = index + 1;
      const debtReduction = monthlyDebtPayoff * monthIndex;
      const savingsIncrease = monthlySavings * monthIndex;
      const extra = extraImprovement * monthIndex;

      return {
        monthIndex,
        label: getMonthLabel(monthIndex),
        debtReduction,
        savingsIncrease,
        projectedNetWorth:
          currentNetWorth + debtReduction + savingsIncrease + extra,
      };
    });
  }, [
    cleanProjectionMonths,
    currentNetWorth,
    monthlyDebtPayoff,
    monthlySavings,
    extraImprovement,
  ]);

  const finalProjection = projection[projection.length - 1];
  const positiveMonth = projection.find(
    (month) => month.projectedNetWorth >= 0
  );

  const status = getTrajectoryStatus(
    finalProjection?.projectedNetWorth ?? currentNetWorth,
    currentNetWorth
  );

  return (
    <section className="rounded-[28px] border border-[rgba(245,245,247,0.12)] bg-[#050505] p-5 shadow-2xl shadow-black/40">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#F5EFE1]">
            Flugbahn
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            Net Worth Trajectory
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8E8E93]">
            Projects how your net worth improves using your active debt payoff,
            savings target, and extra monthly improvement.
          </p>
        </div>

        <div
          className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] ${status.className}`}
        >
          {status.label}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-4">
          <div className="grid gap-4">
            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Projection Months
              <input
                value={projectionMonths}
                onChange={(event) => setProjectionMonths(event.target.value)}
                type="number"
                min="1"
                step="1"
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#050505] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Extra Monthly Improvement
              <input
                value={extraMonthlyImprovement}
                onChange={(event) =>
                  setExtraMonthlyImprovement(event.target.value)
                }
                type="number"
                min="0"
                step="0.01"
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#050505] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              />
            </label>

            <div className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#050505] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">
                Monthly Improvement
              </p>

              <p className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#F5EFE1]">
                {formatMoney(monthlyImprovement)}
              </p>

              <p className="mt-2 text-sm leading-6 text-[#8E8E93]">
                Debt payoff + savings + extra improvement.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid gap-3 md:grid-cols-4">
            <TrajectoryMetric
              label="Current Worth"
              value={formatMoney(currentNetWorth)}
              warning={currentNetWorth < 0}
            />

            <TrajectoryMetric
              label="Projected Worth"
              value={formatMoney(finalProjection?.projectedNetWorth ?? currentNetWorth)}
            />

            <TrajectoryMetric
              label="Positive Month"
              value={positiveMonth?.label ?? "Not Reached"}
              warning={!positiveMonth}
            />

            <TrajectoryMetric
              label="Total Improvement"
              value={formatMoney(
                (finalProjection?.projectedNetWorth ?? currentNetWorth) -
                  currentNetWorth
              )}
            />
          </div>

          <div className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">
              Coach Readout
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#F5EFE1]">
              {status.description}
            </p>

            <p className="mt-2 text-sm leading-6 text-[#8E8E93]">
              At the current pace, your projected net worth after{" "}
              {cleanProjectionMonths} months is{" "}
              {formatMoney(finalProjection?.projectedNetWorth ?? currentNetWorth)}.
            </p>
          </div>

          <div className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-4">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">
                Month-by-Month
              </p>

              <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em]">
                Trajectory Path
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {projection.map((month) => {
                const maxProjected = Math.max(
                  ...projection.map((item) => item.projectedNetWorth),
                  Math.abs(currentNetWorth),
                  1
                );

                const progress =
                  maxProjected > 0
                    ? Math.max((month.projectedNetWorth / maxProjected) * 100, 4)
                    : 4;

                return (
                  <div
                    key={month.monthIndex}
                    className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#050505] p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">
                          Month {month.monthIndex}
                        </p>

                        <h4 className="mt-1 text-lg font-semibold tracking-[-0.035em]">
                          {month.label}
                        </h4>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-sm text-[#8E8E93]">
                          Projected Net Worth
                        </p>

                        <p
                          className={`text-xl font-semibold tracking-[-0.04em] ${
                            month.projectedNetWorth < 0
                              ? "text-yellow-200"
                              : "text-[#F5EFE1]"
                          }`}
                        >
                          {formatMoney(month.projectedNetWorth)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <SmallMetric
                        label="Debt Reduced"
                        value={formatMoney(month.debtReduction)}
                      />

                      <SmallMetric
                        label="Savings Added"
                        value={formatMoney(month.savingsIncrease)}
                      />

                      <SmallMetric
                        label="Improvement"
                        value={formatMoney(month.projectedNetWorth - currentNetWorth)}
                        highlight
                      />
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(245,245,247,0.10)]">
                      <div
                        className="h-full rounded-full bg-[#F5EFE1]"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrajectoryMetric({
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
        className={`mt-3 text-xl font-semibold tracking-[-0.045em] ${
          warning ? "text-yellow-200" : "text-[#F5F5F7]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SmallMetric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[rgba(245,245,247,0.12)] p-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#8E8E93]">
        {label}
      </p>

      <p
        className={`mt-2 text-sm font-semibold ${
          highlight ? "text-[#F5EFE1]" : "text-[#F5F5F7]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}