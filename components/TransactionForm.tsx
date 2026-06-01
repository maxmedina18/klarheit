"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ExpenseCategory,
  IncomeCategory,
  PaymentAccount,
  Transaction,
  TransactionCategory,
  TransactionType,
} from "../lib/types";

type Props = {
  onAddTransaction: (transaction: Transaction) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  editingTransaction: Transaction | null;
  onCancelEdit: () => void;
};

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

export default function TransactionForm({
  onAddTransaction,
  onUpdateTransaction,
  editingTransaction,
  onCancelEdit,
}: Props) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("Food");
  const [account, setAccount] = useState<PaymentAccount>("Amex Gold");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [necessary, setNecessary] = useState(true);

  const activeCategories =
    type === "expense" ? expenseCategories : incomeCategories;

  const activeAccounts = type === "expense" ? expenseAccounts : incomeAccounts;

  const isEditing = editingTransaction !== null;

  useEffect(() => {
    if (!editingTransaction) {
      return;
    }

    setType(editingTransaction.type);
    setAmount(String(editingTransaction.amount));
    setDescription(editingTransaction.description);
    setCategory(editingTransaction.category);
    setAccount(editingTransaction.account);
    setDate(editingTransaction.date);
    setNecessary(editingTransaction.necessary);
  }, [editingTransaction]);

  function resetForm() {
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));

    if (type === "expense") {
      setCategory("Food");
      setAccount("Amex Gold");
      setNecessary(true);
    } else {
      setCategory("Internship");
      setAccount("Checking");
      setNecessary(true);
    }
  }

  function handleTypeChange(nextType: TransactionType) {
    setType(nextType);

    if (nextType === "expense") {
      setCategory("Food");
      setAccount("Amex Gold");
      setNecessary(true);
    } else {
      setCategory("Internship");
      setAccount("Checking");
      setNecessary(true);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount);

    if (!description.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    const transaction: Transaction = {
      id: editingTransaction?.id ?? crypto.randomUUID(),
      type,
      amount: parsedAmount,
      description: description.trim(),
      category,
      account,
      date,
      necessary: type === "income" ? true : necessary,
    };

    if (isEditing) {
      onUpdateTransaction(transaction);
    } else {
      onAddTransaction(transaction);
    }

    resetForm();
  }

  function handleCancelEdit() {
    onCancelEdit();
    resetForm();
  }

  return (
    <section className="rounded-3xl border border-[rgba(250,243,224,0.18)] bg-[rgba(248,248,248,0.045)] p-5 shadow-2xl shadow-black/40">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#FAF3E0]">
            Buchung
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {isEditing ? "Edit Transaction" : "Add Transaction"}
          </h2>
        </div>

        {isEditing && (
          <span className="rounded-full border border-[#FAF3E0]/40 bg-[#FAF3E0]/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#FAF3E0]">
            Editing
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTypeChange("expense")}
            className={`rounded-2xl border px-4 py-3 text-sm transition ${
              type === "expense"
                ? "border-[#FAF3E0] bg-[#FAF3E0] text-[#000000]"
                : "border-[rgba(250,243,224,0.18)] bg-[#000000] text-[#F8F8F8]"
            }`}
          >
            Expense
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange("income")}
            className={`rounded-2xl border px-4 py-3 text-sm transition ${
              type === "income"
                ? "border-[#FAF3E0] bg-[#FAF3E0] text-[#000000]"
                : "border-[rgba(250,243,224,0.18)] bg-[#000000] text-[#F8F8F8]"
            }`}
          >
            Income
          </button>
        </div>

        <label className="flex flex-col gap-2 text-sm text-[#A3A3A3]">
          Description
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={
              type === "expense"
                ? "Chipotle, gas, subscription, etc."
                : "Internship paycheck, tutoring, refund, etc."
            }
            className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] px-4 py-3 text-[#F8F8F8] outline-none transition focus:border-[#FAF3E0]"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-[#A3A3A3]">
          Amount
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] px-4 py-3 text-[#F8F8F8] outline-none transition focus:border-[#FAF3E0]"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-[#A3A3A3]">
          {type === "expense" ? "Expense Category" : "Income Source"}
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as TransactionCategory)
            }
            className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] px-4 py-3 text-[#F8F8F8] outline-none transition focus:border-[#FAF3E0]"
          >
            {activeCategories.map((categoryOption) => (
              <option key={categoryOption} value={categoryOption}>
                {categoryOption}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-[#A3A3A3]">
          {type === "expense" ? "Card / Account Charged" : "Deposit Account"}
          <select
            value={account}
            onChange={(event) =>
              setAccount(event.target.value as PaymentAccount)
            }
            className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] px-4 py-3 text-[#F8F8F8] outline-none transition focus:border-[#FAF3E0]"
          >
            {activeAccounts.map((accountOption) => (
              <option key={accountOption} value={accountOption}>
                {accountOption}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-[#A3A3A3]">
          Date
          <input
            value={date}
            onChange={(event) => setDate(event.target.value)}
            type="date"
            className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] px-4 py-3 text-[#F8F8F8] outline-none transition focus:border-[#FAF3E0]"
          />
        </label>

        {type === "expense" && (
          <label className="flex items-center gap-3 text-sm text-[#A3A3A3]">
            <input
              checked={necessary}
              onChange={(event) => setNecessary(event.target.checked)}
              type="checkbox"
            />
            Necessary expense
          </label>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            className="rounded-2xl bg-[#FAF3E0] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#000000] transition hover:opacity-90"
          >
            {isEditing ? "Save Changes" : "Commit Entry"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#FAF3E0] transition hover:border-[#FAF3E0]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}