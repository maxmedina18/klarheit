"use client";

export type AppView =
  | "dashboard"
  | "transactions"
  | "budgets"
  | "cards"
  | "recurring"
  | "recovery"
  | "analysis";

type Props = {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
};

const views: { id: AppView; label: string; german: string }[] = [
  {
    id: "dashboard",
    label: "Home",
    german: "Zentrale",
  },
  {
    id: "transactions",
    label: "Log",
    german: "Buchung",
  },
  {
    id: "budgets",
    label: "Limits",
    german: "Rahmen",
  },
  {
    id: "cards",
    label: "Cards",
    german: "Karten",
  },
  {
    id: "recurring",
    label: "Repeat",
    german: "Zyklus",
  },
  {
    id: "recovery",
    label: "Plan",
    german: "Tilgung",
  },
  {
    id: "analysis",
    label: "Data",
    german: "Analyse",
  },
];

export default function Navigation({ activeView, onViewChange }: Props) {
  return (
    <>
      <nav className="hidden border-b border-[rgba(245,245,247,0.12)] bg-[#000000]/88 px-4 py-3 backdrop-blur-2xl md:block">
        <div className="mx-auto flex max-w-6xl gap-2">
          {views.map((view) => {
            const isActive = activeView === view.id;

            return (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className={`rounded-2xl border px-5 py-3 text-left transition ${
                  isActive
                    ? "border-[#F5EFE1] bg-[#F5EFE1] text-[#000000]"
                    : "border-[rgba(245,245,247,0.14)] bg-[#050505] text-[#F5F5F7] hover:border-[rgba(245,239,225,0.55)]"
                }`}
              >
                <span className="block text-sm font-semibold tracking-[-0.02em]">
                  {view.label}
                </span>

                <span
                  className={`mt-1 block text-[10px] uppercase tracking-[0.22em] ${
                    isActive ? "text-[#000000]/60" : "text-[#8E8E93]"
                  }`}
                >
                  {view.german}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[rgba(245,245,247,0.12)] bg-[#000000]/88 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 backdrop-blur-2xl md:hidden">
        <div className="no-scrollbar mx-auto flex max-w-md gap-1 overflow-x-auto rounded-[26px] border border-[rgba(245,245,247,0.10)] bg-[#050505] p-1">
          {views.map((view) => {
            const isActive = activeView === view.id;

            return (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className={`min-w-[58px] rounded-[20px] px-2 py-2 text-center transition ${
                  isActive
                    ? "bg-[#F5EFE1] text-[#000000]"
                    : "text-[#8E8E93] hover:text-[#F5F5F7]"
                }`}
              >
                <span className="block text-[11px] font-semibold leading-tight tracking-[-0.02em]">
                  {view.label}
                </span>

                <span
                  className={`mt-0.5 block text-[7px] uppercase tracking-[0.14em] ${
                    isActive ? "text-[#000000]/55" : "text-[#6E6E73]"
                  }`}
                >
                  {view.german}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}