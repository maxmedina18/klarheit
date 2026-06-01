"use client";

import { useMemo, useState } from "react";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function PayoffProjection() {
  const [balance, setBalance] = useState("2000");
  const [weeklyPayment, setWeeklyPayment] = useState("300");

  const projection = useMemo(() => {
    const parsedBalance = Number(balance);
    const parsedWeeklyPayment = Number(weeklyPayment);

    if (
      Number.isNaN(parsedBalance) ||
      Number.isNaN(parsedWeeklyPayment) ||
      parsedBalance <= 0 ||
      parsedWeeklyPayment <= 0
    ) {
      return null;
    }

    const weeks = Math.ceil(parsedBalance / parsedWeeklyPayment);
    const days = weeks * 7;

    return {
      weeks,
      days,
      totalPaid: parsedWeeklyPayment * weeks,
    };
  }, [balance, weeklyPayment]);

  return (
    <section className="rounded-3xl border border-[rgba(250,243,224,0.18)] bg-[rgba(248,248,248,0.045)] p-5">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.25em] text-[#FAF3E0]">
          Recovery Mode
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Debt Payoff Projection</h2>
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm text-[#A3A3A3]">
          Current Balance
          <input
            value={balance}
            onChange={(event) => setBalance(event.target.value)}
            type="number"
            min="0"
            step="0.01"
            className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] px-4 py-3 text-[#F8F8F8] outline-none"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-[#A3A3A3]">
          Weekly Payment
          <input
            value={weeklyPayment}
            onChange={(event) => setWeeklyPayment(event.target.value)}
            type="number"
            min="0"
            step="0.01"
            className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] px-4 py-3 text-[#F8F8F8] outline-none"
          />
        </label>

        <div className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] p-4">
          {projection ? (
            <div>
              <p className="text-sm text-[#A3A3A3]">Estimated payoff time</p>
              <p className="mt-2 text-3xl font-semibold text-[#FAF3E0]">
                {projection.weeks} weeks
              </p>
              <p className="mt-2 text-sm text-[#A3A3A3]">
                Around {projection.days} days. Total paid:{" "}
                {formatMoney(projection.totalPaid)}.
              </p>
            </div>
          ) : (
            <p className="text-sm text-[#A3A3A3]">
              Enter a balance and weekly payment to calculate payoff time.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}