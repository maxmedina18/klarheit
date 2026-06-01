"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Transaction } from "../lib/types";

type Props = {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function TransactionList({
  transactions,
  onDeleteTransaction,
  onEditTransaction,
}: Props) {
  return (
    <section className="rounded-3xl border border-[rgba(250,243,224,0.18)] bg-[rgba(248,248,248,0.045)] p-5 shadow-2xl shadow-black/40">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.25em] text-[#FAF3E0]">
          Hauptbuch
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Recent Transactions</h2>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[rgba(250,243,224,0.18)] p-8 text-center text-sm text-[#A3A3A3]">
          No transactions yet. Add your first income or expense.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] p-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-[#F8F8F8]">
                    {transaction.description}
                  </p>

                  <span
                    className={`rounded-full px-2 py-1 text-xs uppercase tracking-[0.14em] ${
                      transaction.type === "income"
                        ? "bg-[#FAF3E0] text-[#000000]"
                        : "border border-[rgba(250,243,224,0.18)] text-[#A3A3A3]"
                    }`}
                  >
                    {transaction.type}
                  </span>
                </div>

                <p className="mt-1 text-xs text-[#A3A3A3]">
                  {transaction.date} · {transaction.category} ·{" "}
                  {transaction.account}
                  {transaction.type === "expense"
                    ? ` · ${
                        transaction.necessary ? "Necessary" : "Discretionary"
                      }`
                    : ""}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <p
                  className={`text-right text-lg font-semibold ${
                    transaction.type === "income"
                      ? "text-[#FAF3E0]"
                      : "text-[#F8F8F8]"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatMoney(transaction.amount)}
                </p>

                <button
                  onClick={() => onEditTransaction(transaction)}
                  className="rounded-full border border-[rgba(250,243,224,0.18)] p-2 text-[#A3A3A3] transition hover:border-[#FAF3E0] hover:text-[#FAF3E0]"
                  aria-label="Edit transaction"
                >
                  <Pencil size={16} />
                </button>

                <button
                  onClick={() => onDeleteTransaction(transaction.id)}
                  className="rounded-full border border-[rgba(250,243,224,0.18)] p-2 text-[#A3A3A3] transition hover:border-[#FAF3E0] hover:text-[#FAF3E0]"
                  aria-label="Delete transaction"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}