"use client";

import { Transaction } from "../lib/types";
import {
  getDebtPaid,
  getProgressPercent,
  getRemainingTarget,
  getSavingsAdded,
} from "../lib/calculations";

type Props = {
  transactions: Transaction[];
  plannedDebtPayoff: string;
  savingsTarget: string;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function ProgressRow({
  label,
  germanLabel,
  current,
  target,
}: {
  label: string;
  germanLabel: string;
  current: number;
  target: number;
}) {
  const percent = getProgressPercent(current, target);
  const remaining = getRemainingTarget(current, target);

  return (
    <div className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#FAF3E0]">
            {germanLabel}
          </p>

          <h3 className="mt-2 text-2xl font-semibold text-[#F8F8F8]">
            {label}
          </h3>

          <p className="mt-2 text-sm text-[#A3A3A3]">
            {formatMoney(current)} completed of {formatMoney(target)} target
          </p>
        </div>

        <div className="rounded-full border border-[rgba(250,243,224,0.18)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#FAF3E0]">
          {percent.toFixed(1)}%
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(250,243,224,0.10)]">
        <div
          className="h-full rounded-full bg-[#FAF3E0]"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-[rgba(250,243,224,0.18)] p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[#A3A3A3]">
            Remaining
          </p>
          <p className="mt-2 text-xl font-semibold text-[#F8F8F8]">
            {formatMoney(remaining)}
          </p>
        </div>

        <div className="rounded-xl border border-[rgba(250,243,224,0.18)] p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[#A3A3A3]">
            Status
          </p>
          <p className="mt-2 text-xl font-semibold text-[#F8F8F8]">
            {remaining === 0 ? "Complete" : "In Progress"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RecoveryProgress({
  transactions,
  plannedDebtPayoff,
  savingsTarget,
}: Props) {
  const debtTarget = Number(plannedDebtPayoff) || 0;
  const savingsGoal = Number(savingsTarget) || 0;

  const debtPaid = getDebtPaid(transactions);
  const savingsAdded = getSavingsAdded(transactions);

  return (
    <section className="rounded-3xl border border-[rgba(250,243,224,0.18)] bg-[rgba(248,248,248,0.045)] p-5 shadow-2xl shadow-black/40">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.25em] text-[#FAF3E0]">
          Fortschritt
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Recovery Progress</h2>
        <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">
          Tracks actual execution against your saved recovery plan.
        </p>
      </div>

      <div className="grid gap-4">
        <ProgressRow
          label="Debt Paid"
          germanLabel="Tilgung"
          current={debtPaid}
          target={debtTarget}
        />

        <ProgressRow
          label="Savings Added"
          germanLabel="Rücklage"
          current={savingsAdded}
          target={savingsGoal}
        />
      </div>
    </section>
  );
}