"use client";

type Props = {
  selectedMonth: string;
  onSelectedMonthChange: (month: string) => void;
};

export default function MonthSelector({
  selectedMonth,
  onSelectedMonthChange,
}: Props) {
  return (
    <section className="rounded-3xl border border-[rgba(250,243,224,0.18)] bg-[rgba(248,248,248,0.045)] p-5 shadow-2xl shadow-black/40">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#FAF3E0]">
            Zeitraum
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Monthly Operating Cycle</h2>
          <p className="mt-2 text-sm text-[#A3A3A3]">
            Analyze income, spending, budgets, and recovery inside one monthly period.
          </p>
        </div>

        <label className="flex min-w-[220px] flex-col gap-2 text-xs uppercase tracking-[0.18em] text-[#A3A3A3]">
          Selected Month
          <input
            value={selectedMonth}
            onChange={(event) => onSelectedMonthChange(event.target.value)}
            type="month"
            className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] px-4 py-3 text-base tracking-normal text-[#F8F8F8] outline-none transition focus:border-[#FAF3E0]"
          />
        </label>
      </div>
    </section>
  );
}