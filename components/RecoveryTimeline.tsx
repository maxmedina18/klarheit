"use client";

import { useMemo, useState } from "react";
import { getCurrentMonthKey } from "../lib/calculations";
import { calculateRecoveryTimeline } from "../lib/timelineCalculations";

type Props = {
  plannedDebtPayoff: string;
  savingsTarget: string;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function getStatus(planEnough: boolean, remainingDebt: number) {
  if (planEnough) {
    return {
      label: "ON TRACK",
      className: "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
      description: "This timeline fully clears the starting debt.",
    };
  }

  if (remainingDebt > 0) {
    return {
      label: "SHORT",
      className: "border-yellow-300/50 bg-yellow-300/10 text-yellow-200",
      description:
        "This timeline does not clear the debt. Increase payment or extend the timeline.",
    };
  }

  return {
    label: "NO DATA",
    className: "border-[rgba(245,245,247,0.14)] text-[#8E8E93]",
    description: "Enter a starting debt and timeline to calculate recovery.",
  };
}

export default function RecoveryTimeline({
  plannedDebtPayoff,
  savingsTarget,
}: Props) {
  const [startingDebt, setStartingDebt] = useState("2000");
  const [startingSavings, setStartingSavings] = useState("0");
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState("0");
  const [startMonth, setStartMonth] = useState(getCurrentMonthKey());
  const [targetMonths, setTargetMonths] = useState("6");

  const monthlyDebtPayment = Number(plannedDebtPayoff) || 0;
  const monthlySavingsTarget = Number(savingsTarget) || 0;

  const result = useMemo(() => {
    return calculateRecoveryTimeline({
      startingDebt: Number(startingDebt) || 0,
      monthlyDebtPayment,
      monthlySavingsTarget,
      startingSavings: Number(startingSavings) || 0,
      extraMonthlyPayment: Number(extraMonthlyPayment) || 0,
      startMonth,
      targetMonths: Number(targetMonths) || 1,
    });
  }, [
    startingDebt,
    monthlyDebtPayment,
    monthlySavingsTarget,
    startingSavings,
    extraMonthlyPayment,
    startMonth,
    targetMonths,
  ]);

  const status = getStatus(result.isPlanEnough, result.remainingDebt);

  return (
    <section className="rounded-[28px] border border-[rgba(245,245,247,0.12)] bg-[#050505] p-5 shadow-2xl shadow-black/40">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#F5EFE1]">
            Zeitlinie
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            Recovery Timeline
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8E8E93]">
            Projects your debt recovery month by month using the active recovery
            plan, extra payments, and savings target.
          </p>
        </div>

        <div
          className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] ${status.className}`}
        >
          {status.label}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <div className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-4">
          <div className="grid gap-4">
            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Starting Debt
              <input
                value={startingDebt}
                onChange={(event) => setStartingDebt(event.target.value)}
                type="number"
                min="0"
                step="0.01"
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#050505] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Starting Savings
              <input
                value={startingSavings}
                onChange={(event) => setStartingSavings(event.target.value)}
                type="number"
                min="0"
                step="0.01"
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#050505] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Extra Monthly Payment
              <input
                value={extraMonthlyPayment}
                onChange={(event) =>
                  setExtraMonthlyPayment(event.target.value)
                }
                type="number"
                min="0"
                step="0.01"
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#050505] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Start Month
              <input
                value={startMonth}
                onChange={(event) => setStartMonth(event.target.value)}
                type="month"
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#050505] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Target Timeline Months
              <input
                value={targetMonths}
                onChange={(event) => setTargetMonths(event.target.value)}
                type="number"
                min="1"
                step="1"
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#050505] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid gap-3 md:grid-cols-4">
            <TimelineMetric
              label="Monthly Debt Pay"
              value={formatMoney(result.totalMonthlyPayment)}
            />

            <TimelineMetric
              label="Required"
              value={formatMoney(result.requiredMonthlyPayment)}
              warning={result.requiredMonthlyPayment > result.totalMonthlyPayment}
            />

            <TimelineMetric
              label="Months Left"
              value={
                result.monthsToDebtFree
                  ? `${result.monthsToDebtFree}`
                  : "Beyond Target"
              }
              warning={!result.monthsToDebtFree}
            />

            <TimelineMetric
              label="Debt-Free Month"
              value={result.debtFreeMonth?.label ?? "Not Reached"}
              warning={!result.debtFreeMonth}
            />
          </div>

          <div className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">
              Timeline Status
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#F5EFE1]">
              {status.description}
            </p>

            <p className="mt-2 text-sm leading-6 text-[#8E8E93]">
              Total paid in timeline: {formatMoney(result.totalPaid)}. Total
              saved in timeline: {formatMoney(result.totalSaved)}. Remaining
              debt after target period: {formatMoney(result.remainingDebt)}.
            </p>
          </div>

          <div className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">
                  Month-by-Month
                </p>

                <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em]">
                  Recovery Path
                </h3>
              </div>
            </div>

            {result.timeline.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[rgba(245,245,247,0.14)] p-8 text-center text-sm text-[#8E8E93]">
                Enter debt and payment values to generate a timeline.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {result.timeline.map((month) => {
                  const progress =
                    Number(startingDebt) > 0
                      ? ((Number(startingDebt) - month.endingDebt) /
                          Number(startingDebt)) *
                        100
                      : 0;

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
                            Ending Debt
                          </p>

                          <p className="text-xl font-semibold tracking-[-0.04em] text-[#F5F5F7]">
                            {formatMoney(month.endingDebt)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-4">
                        <SmallMetric
                          label="Start"
                          value={formatMoney(month.startingDebt)}
                        />

                        <SmallMetric
                          label="Paid"
                          value={formatMoney(month.payment)}
                        />

                        <SmallMetric
                          label="Savings"
                          value={formatMoney(month.cumulativeSavings)}
                        />

                        <SmallMetric
                          label="Position"
                          value={formatMoney(month.netRecoveryPosition)}
                          highlight={month.netRecoveryPosition >= 0}
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineMetric({
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