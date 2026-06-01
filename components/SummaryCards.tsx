import { Transaction } from "../lib/types";
import {
  getDiscretionaryRatio,
  getExpenseRatio,
  getNetCashflow,
  getSavingsRate,
  getTotalExpenses,
  getTotalIncome,
} from "../lib/calculations";

type Props = {
  transactions: Transaction[];
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function SummaryCards({ transactions }: Props) {
  const income = getTotalIncome(transactions);
  const expenses = getTotalExpenses(transactions);
  const net = getNetCashflow(transactions);
  const savingsRate = getSavingsRate(transactions);
  const expenseRatio = getExpenseRatio(transactions);
  const discretionaryRatio = getDiscretionaryRatio(transactions);

  const cards = [
    {
      label: "Income",
      value: formatMoney(income),
    },
    {
      label: "Expenses",
      value: formatMoney(expenses),
    },
    {
      label: "Net Cashflow",
      value: formatMoney(net),
    },
    {
      label: "Savings Rate",
      value: formatPercent(savingsRate),
    },
    {
      label: "Expense Ratio",
      value: formatPercent(expenseRatio),
    },
    {
      label: "Discretionary Ratio",
      value: formatPercent(discretionaryRatio),
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-3xl border border-[rgba(250,243,224,0.18)] bg-[rgba(248,248,248,0.045)] p-4"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-[#A3A3A3]">
            {card.label}
          </p>
          <p className="mt-3 text-2xl font-semibold text-[#F8F8F8]">
            {card.value}
          </p>
        </div>
      ))}
    </section>
  );
}