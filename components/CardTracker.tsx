"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CreditCard, loadCards, saveCards } from "../lib/cardStorage";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function getUtilization(balance: number, limit: number) {
  if (limit <= 0) {
    return 0;
  }

  return (balance / limit) * 100;
}

function getDaysUntilDue(dueDate: string) {
  if (!dueDate) {
    return null;
  }

  const today = new Date();
  const due = new Date(`${dueDate}T00:00:00`);

  today.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getCardStatus(card: CreditCard) {
  const utilization = getUtilization(card.currentBalance, card.creditLimit);
  const daysUntilDue = getDaysUntilDue(card.dueDate);
  const paymentGap = Math.max(card.statementBalance - card.plannedPayment, 0);

  if (daysUntilDue !== null && daysUntilDue < 0 && paymentGap > 0) {
    return {
      label: "OVERDUE",
      description: "Payment is past due and not fully covered.",
      className: "border-red-400/50 bg-red-400/10 text-red-300",
    };
  }

  if (paymentGap <= 0 && card.statementBalance > 0) {
    return {
      label: "COVERED",
      description: "Statement balance is covered by planned payment.",
      className: "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
    };
  }

  if (utilization >= 60) {
    return {
      label: "HIGH UTIL",
      description: "Utilization is high. Prioritize lowering this balance.",
      className: "border-red-400/50 bg-red-400/10 text-red-300",
    };
  }

  if (daysUntilDue !== null && daysUntilDue <= 5 && paymentGap > 0) {
    return {
      label: "DUE SOON",
      description: "Due date is close and payment is not fully planned.",
      className: "border-yellow-300/50 bg-yellow-300/10 text-yellow-200",
    };
  }

  if (paymentGap > 0) {
    return {
      label: "UNCOVERED",
      description: "Statement balance is not fully covered yet.",
      className: "border-yellow-300/50 bg-yellow-300/10 text-yellow-200",
    };
  }

  return {
    label: "STABLE",
    description: "No immediate card pressure detected.",
    className: "border-[rgba(245,245,247,0.18)] bg-[#000000] text-[#8E8E93]",
  };
}

export default function CardTracker() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const [name, setName] = useState("Amex Gold");
  const [currentBalance, setCurrentBalance] = useState("");
  const [statementBalance, setStatementBalance] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [minimumPayment, setMinimumPayment] = useState("");
  const [plannedPayment, setPlannedPayment] = useState("");

  useEffect(() => {
    setCards(loadCards());
  }, []);

  useEffect(() => {
    saveCards(cards);
  }, [cards]);

  const totals = useMemo(() => {
    const totalCurrentBalance = cards.reduce(
      (sum, card) => sum + card.currentBalance,
      0
    );

    const totalStatementBalance = cards.reduce(
      (sum, card) => sum + card.statementBalance,
      0
    );

    const totalPlannedPayment = cards.reduce(
      (sum, card) => sum + card.plannedPayment,
      0
    );

    const totalCreditLimit = cards.reduce(
      (sum, card) => sum + card.creditLimit,
      0
    );

    const totalUtilization = getUtilization(
      totalCurrentBalance,
      totalCreditLimit
    );

    const uncoveredStatement = Math.max(
      totalStatementBalance - totalPlannedPayment,
      0
    );

    return {
      totalCurrentBalance,
      totalStatementBalance,
      totalPlannedPayment,
      totalCreditLimit,
      totalUtilization,
      uncoveredStatement,
    };
  }, [cards]);

  function resetForm() {
    setEditingCardId(null);
    setName("Amex Gold");
    setCurrentBalance("");
    setStatementBalance("");
    setCreditLimit("");
    setDueDate(new Date().toISOString().slice(0, 10));
    setMinimumPayment("");
    setPlannedPayment("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const card: CreditCard = {
      id: editingCardId ?? crypto.randomUUID(),
      name: name.trim() || "Unnamed Card",
      currentBalance: Number(currentBalance) || 0,
      statementBalance: Number(statementBalance) || 0,
      creditLimit: Number(creditLimit) || 0,
      dueDate,
      minimumPayment: Number(minimumPayment) || 0,
      plannedPayment: Number(plannedPayment) || 0,
    };

    if (editingCardId) {
      setCards((current) =>
        current.map((existingCard) =>
          existingCard.id === editingCardId ? card : existingCard
        )
      );
    } else {
      setCards((current) => [card, ...current]);
    }

    resetForm();
  }

  function editCard(card: CreditCard) {
    setEditingCardId(card.id);
    setName(card.name);
    setCurrentBalance(String(card.currentBalance));
    setStatementBalance(String(card.statementBalance));
    setCreditLimit(String(card.creditLimit));
    setDueDate(card.dueDate);
    setMinimumPayment(String(card.minimumPayment));
    setPlannedPayment(String(card.plannedPayment));
  }

  function deleteCard(id: string) {
    setCards((current) => current.filter((card) => card.id !== id));

    if (editingCardId === id) {
      resetForm();
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="rounded-[28px] border border-[rgba(245,245,247,0.12)] bg-[#050505] p-5 shadow-2xl shadow-black/40">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#F5EFE1]">
            Karten
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#F5F5F7]">
            Credit Card Control
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8E8E93]">
            Track balances, statement obligations, due dates, planned payments,
            and utilization pressure.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">
              Current Balance
            </p>
            <p className="mt-3 text-2xl font-semibold text-[#F5F5F7]">
              {formatMoney(totals.totalCurrentBalance)}
            </p>
          </div>

          <div className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">
              Statement Balance
            </p>
            <p className="mt-3 text-2xl font-semibold text-[#F5F5F7]">
              {formatMoney(totals.totalStatementBalance)}
            </p>
          </div>

          <div className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">
              Planned Payment
            </p>
            <p className="mt-3 text-2xl font-semibold text-[#F5EFE1]">
              {formatMoney(totals.totalPlannedPayment)}
            </p>
          </div>

          <div className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">
              Utilization
            </p>
            <p className="mt-3 text-2xl font-semibold text-[#F5F5F7]">
              {totals.totalUtilization.toFixed(1)}%
            </p>
          </div>
        </div>

        {totals.uncoveredStatement > 0 && (
          <div className="mt-4 rounded-2xl border border-yellow-300/40 bg-yellow-300/10 p-4">
            <p className="text-sm leading-6 text-yellow-200">
              Uncovered statement balance:{" "}
              {formatMoney(totals.uncoveredStatement)}. This amount is not yet
              covered by planned payments.
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-[rgba(245,245,247,0.12)] bg-[#050505] p-5 shadow-2xl shadow-black/40"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#F5EFE1]">
                Eintrag
              </p>

              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                {editingCardId ? "Edit Card" : "Add Card"}
              </h3>
            </div>

            {editingCardId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-[rgba(245,245,247,0.14)] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#8E8E93] transition hover:border-[#F5EFE1] hover:text-[#F5EFE1]"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Card Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Current Balance
              <input
                value={currentBalance}
                onChange={(event) => setCurrentBalance(event.target.value)}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Statement Balance
              <input
                value={statementBalance}
                onChange={(event) => setStatementBalance(event.target.value)}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Credit Limit
              <input
                value={creditLimit}
                onChange={(event) => setCreditLimit(event.target.value)}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Due Date
              <input
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                type="date"
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Minimum Payment
              <input
                value={minimumPayment}
                onChange={(event) => setMinimumPayment(event.target.value)}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Planned Payment
              <input
                value={plannedPayment}
                onChange={(event) => setPlannedPayment(event.target.value)}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              />
            </label>

            <button
              type="submit"
              className="rounded-2xl bg-[#F5EFE1] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#000000] transition hover:opacity-90"
            >
              {editingCardId ? "Save Card" : "Add Card"}
            </button>
          </div>
        </form>

        <div className="rounded-[28px] border border-[rgba(245,245,247,0.12)] bg-[#050505] p-5 shadow-2xl shadow-black/40">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#F5EFE1]">
              Bestand
            </p>

            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              Cards
            </h3>
          </div>

          {cards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[rgba(245,245,247,0.14)] p-8 text-center text-sm text-[#8E8E93]">
              No cards yet. Add your first card or account.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {cards.map((card) => {
                const utilization = getUtilization(
                  card.currentBalance,
                  card.creditLimit
                );
                const daysUntilDue = getDaysUntilDue(card.dueDate);
                const status = getCardStatus(card);
                const statementGap = Math.max(
                  card.statementBalance - card.plannedPayment,
                  0
                );

                return (
                  <div
                    key={card.id}
                    className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xl font-semibold tracking-[-0.04em] text-[#F5F5F7]">
                            {card.name}
                          </h4>

                          <span
                            className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-[#8E8E93]">
                          Due{" "}
                          {card.dueDate
                            ? new Date(
                                `${card.dueDate}T00:00:00`
                              ).toLocaleDateString()
                            : "unset"}
                          {daysUntilDue !== null
                            ? ` · ${daysUntilDue} days`
                            : ""}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-[#8E8E93]">
                          {status.description}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => editCard(card)}
                          className="rounded-full border border-[rgba(245,245,247,0.14)] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#F5EFE1] transition hover:border-[#F5EFE1]"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteCard(card.id)}
                          className="rounded-full border border-[rgba(245,245,247,0.14)] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#8E8E93] transition hover:border-red-400/50 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-4">
                      <Metric label="Current" value={formatMoney(card.currentBalance)} />
                      <Metric
                        label="Statement"
                        value={formatMoney(card.statementBalance)}
                      />
                      <Metric
                        label="Planned"
                        value={formatMoney(card.plannedPayment)}
                      />
                      <Metric label="Gap" value={formatMoney(statementGap)} />
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-[#8E8E93]">
                        <span>Utilization</span>
                        <span>{utilization.toFixed(1)}%</span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[rgba(245,245,247,0.10)]">
                        <div
                          className="h-full rounded-full bg-[#F5EFE1]"
                          style={{
                            width: `${Math.min(utilization, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[rgba(245,245,247,0.12)] p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-[#8E8E93]">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-[#F5F5F7]">{value}</p>
    </div>
  );
}