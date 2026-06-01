"use client";

export type AppView =
  | "dashboard"
  | "transactions"
  | "budgets"
  | "recovery"
  | "analysis";

type Props = {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
};

const views: { id: AppView; label: string; german: string }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    german: "Zentrale",
  },
  {
    id: "transactions",
    label: "Transactions",
    german: "Buchung",
  },
  {
    id: "budgets",
    label: "Budgets",
    german: "Rahmen",
  },
  {
    id: "recovery",
    label: "Recovery",
    german: "Tilgung",
  },
  {
    id: "analysis",
    label: "Analysis",
    german: "Analyse",
  },
];

export default function Navigation({ activeView, onViewChange }: Props) {
  return (
    <nav className="sticky top-0 z-30 -mx-4 border-b border-[rgba(250,243,224,0.18)] bg-[#000000]/85 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto">
        {views.map((view) => {
          const isActive = activeView === view.id;

          return (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`min-w-fit rounded-full border px-4 py-3 text-left transition ${
                isActive
                  ? "border-[#FAF3E0] bg-[#FAF3E0] text-[#000000]"
                  : "border-[rgba(250,243,224,0.18)] bg-[#000000] text-[#F8F8F8] hover:border-[#FAF3E0]"
              }`}
            >
              <span className="block text-sm font-semibold">{view.label}</span>
              <span
                className={`mt-1 block text-[10px] uppercase tracking-[0.22em] ${
                  isActive ? "text-[#000000]/70" : "text-[#A3A3A3]"
                }`}
              >
                {view.german}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}