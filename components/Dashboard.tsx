"use client";

import { useEffect, useMemo, useState } from "react";
import { Transaction } from "../lib/types";
import {
  filterTransactionsByMonth,
  getCurrentMonthKey,
  getDailyAllowance,
  getDebtPaid,
  getProgressPercent,
  getRemainingTarget,
  getSafeRemainingSpend,
  getSavingsAdded,
} from "../lib/calculations";
import { loadTransactions, saveTransactions } from "../lib/storage";
import { loadMonthlyPlan, saveMonthlyPlan } from "../lib/planStorage";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import SummaryCards from "./SummaryCards";
import SpendingCharts from "./SpendingCharts";
import PayoffProjection from "./PayoffProjection";
import SafeSpending from "./SafeSpending";
import BudgetLimits from "./BudgetLimits";
import MonthSelector from "./MonthSelector";
import Navigation, { AppView } from "./Navigation";
import RecoveryProgress from "./RecoveryProgress";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [activeView, setActiveView] = useState<AppView>("dashboard");

  const [planName, setPlanName] = useState("");
  const [plannedDebtPayoff, setPlannedDebtPayoff] = useState("");
  const [savingsTarget, setSavingsTarget] = useState("");

  const monthlyTransactions = useMemo(() => {
    return filterTransactionsByMonth(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  useEffect(() => {
    setTransactions(loadTransactions());
  }, []);

  useEffect(() => {
    const savedPlan = loadMonthlyPlan();

    setPlanName(savedPlan.planName);
    setPlannedDebtPayoff(savedPlan.plannedDebtPayoff);
    setSavingsTarget(savedPlan.savingsTarget);
  }, []);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  function addTransaction(transaction: Transaction) {
    setTransactions((current) => [transaction, ...current]);
  }

  function updateTransaction(updatedTransaction: Transaction) {
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === updatedTransaction.id ? updatedTransaction : transaction
      )
    );

    setEditingTransaction(null);
  }

  function startEditingTransaction(transaction: Transaction) {
    setEditingTransaction(transaction);
    setActiveView("transactions");
  }

  function cancelEditingTransaction() {
    setEditingTransaction(null);
  }

  function deleteTransaction(id: string) {
    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== id)
    );

    if (editingTransaction?.id === id) {
      setEditingTransaction(null);
    }
  }

  function saveRecoveryPlan() {
    saveMonthlyPlan({
      planName,
      plannedDebtPayoff,
      savingsTarget,
    });
  }

  function applyPlanAdjustment(newDebtTarget: number, newSavingsTarget: number) {
    const cleanDebtTarget = newDebtTarget.toFixed(2);
    const cleanSavingsTarget = newSavingsTarget.toFixed(2);

    setPlannedDebtPayoff(cleanDebtTarget);
    setSavingsTarget(cleanSavingsTarget);

    saveMonthlyPlan({
      planName,
      plannedDebtPayoff: cleanDebtTarget,
      savingsTarget: cleanSavingsTarget,
    });
  }

  return (
    <main className="min-h-screen bg-[#000000] pb-28 text-[#F5F5F7] md:pb-0">
      <Navigation activeView={activeView} onViewChange={setActiveView} />

      <div className="ios-safe-top mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-5 sm:px-6 md:gap-6 md:py-8">
        <header className="border-b border-[rgba(250,243,224,0.18)] pb-5">
          <p className="text-xs uppercase tracking-[0.35em] text-[#FAF3E0]">
            Klarheit v1
          </p>

          <h1 className="mt-3 max-w-3xl text-[40px] font-semibold leading-[0.95] tracking-[-0.055em] text-[#F5F5F7] sm:text-5xl md:text-6xl">
            Personal Finance Cockpit
          </h1>

          <p className="mt-4 max-w-2xl text-[15px] leading-6 text-[#8E8E93] md:text-base">
            Track income, expenses, card usage, spending ratios, savings rate,
            budgets, and recovery decisions with ruthless clarity.
          </p>
        </header>

        <MonthSelector
          selectedMonth={selectedMonth}
          onSelectedMonthChange={setSelectedMonth}
        />

        {activeView === "dashboard" && (
          <div className="flex flex-col gap-6">
            <SummaryCards transactions={monthlyTransactions} />

            <ActionDashboard
              transactions={monthlyTransactions}
              planName={planName}
              plannedDebtPayoff={plannedDebtPayoff}
              savingsTarget={savingsTarget}
              onGoRecovery={() => setActiveView("recovery")}
              onGoTransactions={() => setActiveView("transactions")}
              onApplyPlanAdjustment={applyPlanAdjustment}
            />
          </div>
        )}

        {activeView === "transactions" && (
          <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <TransactionForm
              onAddTransaction={addTransaction}
              onUpdateTransaction={updateTransaction}
              editingTransaction={editingTransaction}
              onCancelEdit={cancelEditingTransaction}
            />

            <TransactionList
              transactions={monthlyTransactions}
              onDeleteTransaction={deleteTransaction}
              onEditTransaction={startEditingTransaction}
            />
          </div>
        )}

        {activeView === "budgets" && (
          <BudgetLimits transactions={monthlyTransactions} />
        )}

        {activeView === "recovery" && (
          <div className="flex flex-col gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <SafeSpending
                transactions={monthlyTransactions}
                planName={planName}
                plannedDebtPayoff={plannedDebtPayoff}
                savingsTarget={savingsTarget}
                onPlanNameChange={setPlanName}
                onPlannedDebtPayoffChange={setPlannedDebtPayoff}
                onSavingsTargetChange={setSavingsTarget}
                onSavePlan={saveRecoveryPlan}
              />

              <PayoffProjection />
            </div>

            <RecoveryProgress
              transactions={monthlyTransactions}
              plannedDebtPayoff={plannedDebtPayoff}
              savingsTarget={savingsTarget}
            />
          </div>
        )}

        {activeView === "analysis" && (
          <div className="flex flex-col gap-6">
            <SummaryCards transactions={monthlyTransactions} />
            <SpendingCharts transactions={monthlyTransactions} />
          </div>
        )}
      </div>
    </main>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function ActionDashboard({
  transactions,
  planName,
  plannedDebtPayoff,
  savingsTarget,
  onGoRecovery,
  onGoTransactions,
  onApplyPlanAdjustment,
}: {
  transactions: Transaction[];
  planName: string;
  plannedDebtPayoff: string;
  savingsTarget: string;
  onGoRecovery: () => void;
  onGoTransactions: () => void;
  onApplyPlanAdjustment: (
    newDebtTarget: number,
    newSavingsTarget: number
  ) => void;
}) {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const netCashflow = totalIncome - totalExpenses;

  const discretionary = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense" && transaction.necessary === false
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const cleanDebtPayoff = Number(plannedDebtPayoff) || 0;
  const cleanSavingsTarget = Number(savingsTarget) || 0;

  const safeRemainingSpend = getSafeRemainingSpend(
    transactions,
    cleanDebtPayoff,
    cleanSavingsTarget
  );

  const dailyAllowance = getDailyAllowance(
    transactions,
    cleanDebtPayoff,
    cleanSavingsTarget
  );

  const debtPaid = getDebtPaid(transactions);
  const savingsAdded = getSavingsAdded(transactions);

  const debtProgress = getProgressPercent(debtPaid, cleanDebtPayoff);
  const savingsProgress = getProgressPercent(savingsAdded, cleanSavingsTarget);

  const debtRemaining = getRemainingTarget(debtPaid, cleanDebtPayoff);
  const savingsRemaining = getRemainingTarget(savingsAdded, cleanSavingsTarget);

  const planShortfall = Math.abs(Math.min(safeRemainingSpend, 0));

  const affordableDebtTarget = Math.max(
    totalIncome - totalExpenses - cleanSavingsTarget,
    0
  );

  const affordableSavingsTarget = Math.max(
    totalIncome - totalExpenses - cleanDebtPayoff,
    0
  );

  const incomeNeeded = planShortfall;
  const safePlanActive = cleanDebtPayoff > 0 || cleanSavingsTarget > 0;

  const actionItems: {
    title: string;
    description: string;
    action?: string;
  }[] = [];

  if (totalIncome === 0) {
    actionItems.push({
      title: "Log income",
      description:
        "No income recorded for this month. Add your paycheck or expected income first.",
    });
  }

  if (!safePlanActive) {
    actionItems.push({
      title: "Set recovery plan",
      description:
        "No debt payoff or savings target is active. Set these in Recovery so the dashboard can judge your real cashflow.",
      action: "Open Recovery",
    });
  }

  if (safeRemainingSpend < 0 && totalIncome > 0) {
    actionItems.push({
      title: "Recovery plan exceeds cashflow",
      description: `Your plan is short by ${formatMoney(
        planShortfall
      )}. Reduce spending, lower the target, increase income, or extend the payoff timeline.`,
      action: "Open Recovery",
    });
  }

  if (dailyAllowance >= 0 && dailyAllowance < 20 && totalIncome > 0) {
    actionItems.push({
      title: "Tight daily allowance",
      description: `Your safe daily spending is only ${formatMoney(
        dailyAllowance
      )}. Treat discretionary spending as locked unless necessary.`,
    });
  }

  if (netCashflow < 0) {
    actionItems.push({
      title: "Stop the bleed",
      description:
        "Your actual monthly cashflow is negative. Pause discretionary spending until income or payoff plan is logged.",
    });
  }

  if (discretionary > totalExpenses * 0.35 && totalExpenses > 0) {
    actionItems.push({
      title: "Cut discretionary leakage",
      description:
        "Discretionary spending is taking a large share of expenses. Review food, clothing, and fun categories.",
    });
  }

  if (actionItems.length === 0) {
    actionItems.push({
      title: "Maintain course",
      description:
        "Your actual spending and recovery plan are aligned. Keep logging transactions and follow the operating plan.",
    });
  }

  return (
    <section className="rounded-3xl border border-[rgba(250,243,224,0.18)] bg-[rgba(248,248,248,0.045)] p-5 shadow-2xl shadow-black/40">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.25em] text-[#FAF3E0]">
          Handlung
        </p>

        <h2 className="mt-2 text-2xl font-semibold">Action Takers</h2>

        <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">
          These are the immediate financial moves based on this month&apos;s
          data and your active recovery plan.
        </p>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[#A3A3A3]">
            Active Plan
          </p>

          <p className="mt-3 text-2xl font-semibold text-[#F8F8F8]">
            {planName.trim() || "No Plan"}
          </p>
        </div>

        <div className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[#A3A3A3]">
            Debt Target
          </p>

          <p className="mt-3 text-2xl font-semibold text-[#F8F8F8]">
            {formatMoney(cleanDebtPayoff)}
          </p>
        </div>

        <div className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[#A3A3A3]">
            Savings Target
          </p>

          <p className="mt-3 text-2xl font-semibold text-[#F8F8F8]">
            {formatMoney(cleanSavingsTarget)}
          </p>
        </div>

        <div className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[#A3A3A3]">
            Safe Remaining
          </p>

          <p className="mt-3 text-2xl font-semibold text-[#FAF3E0]">
            {formatMoney(safeRemainingSpend)}
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] p-4">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#FAF3E0]">
              Fortschritt
            </p>

            <h3 className="mt-2 text-xl font-semibold text-[#F8F8F8]">
              Mission Progress
            </h3>
          </div>

          <button
            onClick={onGoRecovery}
            className="rounded-full border border-[rgba(250,243,224,0.18)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#FAF3E0] transition hover:border-[#FAF3E0]"
          >
            Open Recovery
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[rgba(250,243,224,0.18)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#A3A3A3]">
                  Debt Paid
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#F8F8F8]">
                  {formatMoney(debtPaid)} / {formatMoney(cleanDebtPayoff)}
                </p>
              </div>

              <p className="rounded-full border border-[rgba(250,243,224,0.18)] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#FAF3E0]">
                {debtProgress.toFixed(1)}%
              </p>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(250,243,224,0.10)]">
              <div
                className="h-full rounded-full bg-[#FAF3E0]"
                style={{ width: `${debtProgress}%` }}
              />
            </div>

            <p className="mt-3 text-sm text-[#A3A3A3]">
              Remaining debt mission: {formatMoney(debtRemaining)}
            </p>
          </div>

          <div className="rounded-2xl border border-[rgba(250,243,224,0.18)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#A3A3A3]">
                  Savings Added
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#F8F8F8]">
                  {formatMoney(savingsAdded)} /{" "}
                  {formatMoney(cleanSavingsTarget)}
                </p>
              </div>

              <p className="rounded-full border border-[rgba(250,243,224,0.18)] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#FAF3E0]">
                {savingsProgress.toFixed(1)}%
              </p>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(250,243,224,0.10)]">
              <div
                className="h-full rounded-full bg-[#FAF3E0]"
                style={{ width: `${savingsProgress}%` }}
              />
            </div>

            <p className="mt-3 text-sm text-[#A3A3A3]">
              Remaining savings mission: {formatMoney(savingsRemaining)}
            </p>
          </div>
        </div>
      </div>

      {safeRemainingSpend < 0 && totalIncome > 0 && (
        <div className="mb-5 rounded-2xl border border-[#FAF3E0]/40 bg-[#FAF3E0]/10 p-4">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[#FAF3E0]">
              Vorschlag
            </p>

            <h3 className="mt-2 text-xl font-semibold text-[#F8F8F8]">
              Plan Adjustment Suggestions
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">
              Your current recovery plan exceeds available cashflow by{" "}
              {formatMoney(planShortfall)}. These are possible adjustment paths.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] p-4">
              <p className="text-sm font-semibold text-[#F8F8F8]">
                Option A · Fit the debt target
              </p>

              <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">
                Keep savings at {formatMoney(cleanSavingsTarget)}{" "}
                and reduce this month&apos;s debt payoff target to{" "}
                {formatMoney(affordableDebtTarget)}.
              </p>

              <button
                onClick={() =>
                  onApplyPlanAdjustment(
                    affordableDebtTarget,
                    cleanSavingsTarget
                  )
                }
                className="mt-4 rounded-full border border-[#FAF3E0] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#FAF3E0] transition hover:bg-[#FAF3E0] hover:text-[#000000]"
              >
                Apply Option A
              </button>
            </div>

            <div className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] p-4">
              <p className="text-sm font-semibold text-[#F8F8F8]">
                Option B · Fit the savings target
              </p>

              <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">
                Keep debt payoff at {formatMoney(cleanDebtPayoff)}{" "}
                and reduce this month&apos;s savings target to{" "}
                {formatMoney(affordableSavingsTarget)}.
              </p>

              <button
                onClick={() =>
                  onApplyPlanAdjustment(
                    cleanDebtPayoff,
                    affordableSavingsTarget
                  )
                }
                className="mt-4 rounded-full border border-[#FAF3E0] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#FAF3E0] transition hover:bg-[#FAF3E0] hover:text-[#000000]"
              >
                Apply Option B
              </button>
            </div>

            <div className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] p-4">
              <p className="text-sm font-semibold text-[#F8F8F8]">
                Option C · Increase income
              </p>

              <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">
                Keep the plan unchanged and find an additional{" "}
                {formatMoney(incomeNeeded)} this month.
              </p>

              <button
                onClick={onGoTransactions}
                className="mt-4 rounded-full border border-[#FAF3E0] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#FAF3E0] transition hover:bg-[#FAF3E0] hover:text-[#000000]"
              >
                Add Income
              </button>
            </div>

            <div className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] p-4">
              <p className="text-sm font-semibold text-[#F8F8F8]">
                Option D · Extend the timeline
              </p>

              <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">
                Keep the same total goal, but split the shortfall across another
                month instead of forcing an unrealistic current-month target.
              </p>

              <button
                onClick={onGoRecovery}
                className="mt-4 rounded-full border border-[#FAF3E0] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#FAF3E0] transition hover:bg-[#FAF3E0] hover:text-[#000000]"
              >
                Review Timeline
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {actionItems.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-[rgba(250,243,224,0.18)] bg-[#000000] p-4"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#F8F8F8]">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">
                  {item.description}
                </p>
              </div>

              {item.action && (
                <button
                  onClick={onGoRecovery}
                  className="rounded-full border border-[#FAF3E0] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#FAF3E0] transition hover:bg-[#FAF3E0] hover:text-[#000000]"
                >
                  {item.action}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}