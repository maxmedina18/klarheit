"use client";

import { Transaction } from "../lib/types";
import {
  groupExpensesByAccount,
  groupExpensesByCategory,
} from "../lib/calculations";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  transactions: Transaction[];
};

export default function SpendingCharts({ transactions }: Props) {
  const categoryData = groupExpensesByCategory(transactions);
  const accountData = groupExpensesByAccount(transactions);

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <ChartCard title="Spending by Category" data={categoryData} />
      <ChartCard title="Spending by Account" data={accountData} />
    </section>
  );
}

function ChartCard({
  title,
  data,
}: {
  title: string;
  data: { name: string; value: number }[];
}) {
  return (
    <div className="rounded-3xl border border-[rgba(250,243,224,0.18)] bg-[rgba(248,248,248,0.045)] p-5 shadow-2xl shadow-black/40">
      <p className="text-xs uppercase tracking-[0.25em] text-[#FAF3E0]">
        Analyse
      </p>
      <h2 className="mt-2 text-2xl font-semibold">{title}</h2>

      <div className="mt-5 h-72">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-[rgba(250,243,224,0.18)] text-sm text-[#A3A3A3]">
            No expense data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" tick={{ fill: "#A3A3A3", fontSize: 12 }} />
              <YAxis tick={{ fill: "#A3A3A3", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#000000",
                  border: "1px solid rgba(250,243,224,0.18)",
                  borderRadius: "16px",
                  color: "#F8F8F8",
                }}
              />
              <Bar dataKey="value" fill="#FAF3E0" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}