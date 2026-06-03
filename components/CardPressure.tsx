"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  getCardPaymentGap,
  getCardPressureSummary,
  getDaysUntilDue,
  loadCards,
} from "../lib/cardStorage";

type Props = {
  onGoCards: () => void;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function getPressureStatus(cards: CreditCard[]) {
  const summary = getCardPressureSummary(cards);

  if (cards.length === 0) {
    return {
      label: "NO DATA",
      description: "No cards are being tracked yet.",
      className: "border-[rgba(245,245,247,0.14)] text-[#8E8E93]",
    };
  }

  if (summary.uncoveredGap > 0) {
    return {
      label: "UNCOVERED",
      description: "Some statement balances are not fully covered.",
      className: "border-yellow-300/50 bg-yellow-300/10 text-yellow-200",
    };
  }

  if (summary.totalUtilization >= 60) {
    return {
      label: "HIGH UTIL",
      description: "Total card utilization is elevated.",
      className: "border-red-400/50 bg-red-400/10 text-red-300",
    };
  }

  return {
    label: "COVERED",
    description: "Statement obligations are covered by planned payments.",
    className: "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
  };
}

export default function CardPressure({ onGoCards }: Props) {
  const [cards, setCards] = useState<CreditCard[]>([]);

  useEffect(() => {
    setCards(loadCards());
  }, []);

  const summary = useMemo(() => getCardPressureSummary(cards), [cards]);
  const pressureStatus = useMemo(() => getPressureStatus(cards), [cards]);

  const highestRiskGap = summary.highestRiskCard
    ? getCardPaymentGap(summary.highestRiskCard)
    : 0;

  const highestRiskDue = summary.highestRiskCard
    ? getDaysUntilDue(summary.highestRiskCard.dueDate)
    : null;

  return (
    <section className="rounded-[28px] border border-[rgba(245,245,247,0.12)] bg-[#050505] p-5 shadow-2xl shadow-black/40">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#F5EFE1]">
            Kartendruck
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            Card Pressure
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#8E8E93]">
            Tracks credit card obligations, payment coverage, utilization, and
            risk before spending decisions are made.
          </p>
        </div>

        <div
          className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] ${pressureStatus.className}`}
        >
          {pressureStatus.label}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <PressureMetric
          label="Card Balance"
          value={formatMoney(summary.totalCurrentBalance)}
        />

        <PressureMetric
          label="Statement"
          value={formatMoney(summary.totalStatementBalance)}
        />

        <PressureMetric
          label="Planned"
          value={formatMoney(summary.totalPlannedPayment)}
          highlight
        />

        <PressureMetric
          label="Uncovered"
          value={formatMoney(summary.uncoveredGap)}
          danger={summary.uncoveredGap > 0}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">
              Highest Risk Card
            </p>

            <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#F5F5F7]">
              {summary.highestRiskCard?.name ?? "No cards tracked"}
            </p>

            <p className="mt-2 text-sm leading-6 text-[#8E8E93]">
              {summary.highestRiskCard
                ? `Gap: ${formatMoney(highestRiskGap)}${
                    highestRiskDue !== null ? ` · Due in ${highestRiskDue} days` : ""
                  }`
                : "Add cards to begin tracking payment pressure."}
            </p>
          </div>

          <button
            onClick={onGoCards}
            className="rounded-full border border-[#F5EFE1] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#F5EFE1] transition hover:bg-[#F5EFE1] hover:text-[#000000]"
          >
            Open Cards
          </button>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(245,245,247,0.10)]">
        <div
          className="h-full rounded-full bg-[#F5EFE1]"
          style={{ width: `${Math.min(summary.totalUtilization, 100)}%` }}
        />
      </div>

      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[#8E8E93]">
        Total utilization: {summary.totalUtilization.toFixed(1)}%
      </p>
    </section>
  );
}

function PressureMetric({
  label,
  value,
  highlight = false,
  danger = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
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
            ? "text-yellow-200"
            : highlight
              ? "text-[#F5EFE1]"
              : "text-[#F5F5F7]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}