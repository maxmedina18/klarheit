"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ExpenseCategory,
  IncomeCategory,
  PaymentAccount,
  TransactionCategory,
  TransactionType,
} from "../lib/types";
import {
  loadRecurringItems,
  RecurringFrequency,
  RecurringItem,
  saveRecurringItems,
  getMonthlyRecurringAmount,
  getRecurringSummary,
} from "../lib/recurringStorage";

const expenseCategories: ExpenseCategory[] = [
  "Food",
  "Transportation",
  "School",
  "Fitness",
  "Clothing",
  "Subscriptions",
  "Debt Payment",
  "Savings",
  "Investing",
  "Fun",
  "Other",
];

const incomeCategories: IncomeCategory[] = [
  "Internship",
  "Tutoring",
  "Coffee Shop",
  "Paycheck",
  "Gift",
  "Refund",
  "Side Hustle",
  "Other",
];

const expenseAccounts: PaymentAccount[] = [
  "Amex Gold",
  "Amex Blue Cash Everyday",
  "Discover It",
  "Debit",
  "Checking",
  "Cash",
  "Other",
];

const incomeAccounts: PaymentAccount[] = [
  "Checking",
  "Savings Account",
  "Debit",
  "Cash",
  "Other",
];

const frequencies: RecurringFrequency[] = ["weekly", "biweekly", "monthly"];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function RecurringTracker() {
  const [items, setItems] = useState<RecurringItem[]>(() =>
    loadRecurringItems()
  );

  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] =
    useState<TransactionCategory>("Subscriptions");
  const [account, setAccount] = useState<PaymentAccount>("Amex Gold");
  const [frequency, setFrequency] =
    useState<RecurringFrequency>("monthly");
  const [nextDueDate, setNextDueDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [necessary, setNecessary] = useState(true);
  const [active, setActive] = useState(true);

  const activeCategories =
    type === "expense" ? expenseCategories : incomeCategories;

  const activeAccounts = type === "expense" ? expenseAccounts : incomeAccounts;

  const summary = useMemo(() => getRecurringSummary(items), [items]);

  useEffect(() => {
    saveRecurringItems(items);
  }, [items]);

  function resetForm() {
    setEditingId(null);
    setName("");
    setAmount("");
    setType("expense");
    setCategory("Subscriptions");
    setAccount("Amex Gold");
    setFrequency("monthly");
    setNextDueDate(new Date().toISOString().slice(0, 10));
    setNecessary(true);
    setActive(true);
  }

  function handleTypeChange(nextType: TransactionType) {
    setType(nextType);

    if (nextType === "expense") {
      setCategory("Subscriptions");
      setAccount("Amex Gold");
      setNecessary(true);
    } else {
      setCategory("Paycheck");
      setAccount("Checking");
      setNecessary(true);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount);

    if (!name.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    const item: RecurringItem = {
      id: editingId ?? crypto.randomUUID(),
      name: name.trim(),
      amount: parsedAmount,
      type,
      category,
      account,
      frequency,
      nextDueDate,
      necessary: type === "income" ? true : necessary,
      active,
    };

    if (editingId) {
      setItems((current) =>
        current.map((existingItem) =>
          existingItem.id === editingId ? item : existingItem
        )
      );
    } else {
      setItems((current) => [item, ...current]);
    }

    resetForm();
  }

  function editItem(item: RecurringItem) {
    setEditingId(item.id);
    setName(item.name);
    setAmount(String(item.amount));
    setType(item.type);
    setCategory(item.category);
    setAccount(item.account);
    setFrequency(item.frequency);
    setNextDueDate(item.nextDueDate);
    setNecessary(item.necessary);
    setActive(item.active);
  }

  function deleteItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));

    if (editingId === id) {
      resetForm();
    }
  }

  function toggleItem(id: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    );
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="rounded-[28px] border border-[rgba(245,245,247,0.12)] bg-[#050505] p-5 shadow-2xl shadow-black/40">
        <p className="text-xs uppercase tracking-[0.24em] text-[#F5EFE1]">
          Wiederkehrend
        </p>

        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#F5F5F7]">
          Recurring Transactions
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8E8E93]">
          Track predictable income and expenses before they hit. This is the
          anti-leakage layer.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Metric
            label="Recurring Income"
            value={formatMoney(summary.monthlyIncome)}
          />

          <Metric
            label="Recurring Expenses"
            value={formatMoney(summary.monthlyExpenses)}
          />

          <Metric
            label="Necessary"
            value={formatMoney(summary.necessaryExpenses)}
          />

          <Metric
            label="Discretionary"
            value={formatMoney(summary.discretionaryExpenses)}
            warning={summary.discretionaryExpenses > 0}
          />
        </div>

        <div className="mt-4 rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">
            Net Recurring Cashflow
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#F5EFE1]">
            {formatMoney(summary.netRecurringCashflow)}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-[rgba(245,245,247,0.12)] bg-[#050505] p-5 shadow-2xl shadow-black/40"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#F5EFE1]">
                Planposten
              </p>

              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                {editingId ? "Edit Recurring Item" : "Add Recurring Item"}
              </h3>
            </div>

            {editingId && (
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
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange("expense")}
                className={`rounded-2xl border px-4 py-3 text-sm transition ${
                  type === "expense"
                    ? "border-[#F5EFE1] bg-[#F5EFE1] text-[#000000]"
                    : "border-[rgba(245,245,247,0.12)] bg-[#000000] text-[#F5F5F7]"
                }`}
              >
                Expense
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange("income")}
                className={`rounded-2xl border px-4 py-3 text-sm transition ${
                  type === "income"
                    ? "border-[#F5EFE1] bg-[#F5EFE1] text-[#000000]"
                    : "border-[rgba(245,245,247,0.12)] bg-[#000000] text-[#F5F5F7]"
                }`}
              >
                Income
              </button>
            </div>

            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Spotify, gym, paycheck, insurance, etc."
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Amount
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Category
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as TransactionCategory)
                }
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              >
                {activeCategories.map((categoryOption) => (
                  <option key={categoryOption} value={categoryOption}>
                    {categoryOption}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Account
              <select
                value={account}
                onChange={(event) =>
                  setAccount(event.target.value as PaymentAccount)
                }
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              >
                {activeAccounts.map((accountOption) => (
                  <option key={accountOption} value={accountOption}>
                    {accountOption}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Frequency
              <select
                value={frequency}
                onChange={(event) =>
                  setFrequency(event.target.value as RecurringFrequency)
                }
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              >
                {frequencies.map((frequencyOption) => (
                  <option key={frequencyOption} value={frequencyOption}>
                    {frequencyOption}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Next Due Date
              <input
                value={nextDueDate}
                onChange={(event) => setNextDueDate(event.target.value)}
                type="date"
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              />
            </label>

            {type === "expense" && (
              <label className="flex items-center gap-3 text-sm text-[#8E8E93]">
                <input
                  checked={necessary}
                  onChange={(event) => setNecessary(event.target.checked)}
                  type="checkbox"
                />
                Necessary recurring expense
              </label>
            )}

            <label className="flex items-center gap-3 text-sm text-[#8E8E93]">
              <input
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
                type="checkbox"
              />
              Active
            </label>

            <button
              type="submit"
              className="rounded-2xl bg-[#F5EFE1] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#000000] transition hover:opacity-90"
            >
              {editingId ? "Save Item" : "Add Item"}
            </button>
          </div>
        </form>

        <div className="rounded-[28px] border border-[rgba(245,245,247,0.12)] bg-[#050505] p-5 shadow-2xl shadow-black/40">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#F5EFE1]">
              Bestand
            </p>

            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              Recurring Items
            </h3>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[rgba(245,245,247,0.14)] p-8 text-center text-sm text-[#8E8E93]">
              No recurring items yet. Add subscriptions, bills, paychecks, or
              planned transfers.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border bg-[#000000] p-4 ${
                    item.active
                      ? "border-[rgba(245,245,247,0.12)]"
                      : "border-[rgba(245,245,247,0.06)] opacity-55"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xl font-semibold tracking-[-0.04em] text-[#F5F5F7]">
                          {item.name}
                        </h4>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${
                            item.type === "income"
                              ? "bg-[#F5EFE1] text-[#000000]"
                              : "border border-[rgba(245,245,247,0.14)] text-[#8E8E93]"
                          }`}
                        >
                          {item.type}
                        </span>

                        {!item.active && (
                          <span className="rounded-full border border-[rgba(245,245,247,0.14)] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#8E8E93]">
                            inactive
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-[#8E8E93]">
                        {item.category} · {item.account} · {item.frequency} ·
                        next due{" "}
                        {new Date(
                          `${item.nextDueDate}T00:00:00`
                        ).toLocaleDateString()}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#8E8E93]">
                        Monthly impact:{" "}
                        <span className="text-[#F5EFE1]">
                          {formatMoney(getMonthlyRecurringAmount(item))}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="rounded-full border border-[rgba(245,245,247,0.14)] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#F5EFE1] transition hover:border-[#F5EFE1]"
                      >
                        {item.active ? "Pause" : "Resume"}
                      </button>

                      <button
                        onClick={() => editItem(item)}
                        className="rounded-full border border-[rgba(245,245,247,0.14)] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#F5EFE1] transition hover:border-[#F5EFE1]"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteItem(item.id)}
                        className="rounded-full border border-[rgba(245,245,247,0.14)] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#8E8E93] transition hover:border-red-400/50 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="mt-4 text-2xl font-semibold tracking-[-0.045em] text-[#F5F5F7]">
                    {formatMoney(item.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Metric({
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