"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  getNetWorthSummary,
  loadNetWorthItems,
  NetWorthItem,
  NetWorthItemType,
  saveNetWorthItems,
} from "../lib/netWorthStorage";

const assetCategories = [
  "Checking",
  "Savings",
  "Cash",
  "Investments",
  "Vehicle",
  "Property",
  "Other Asset",
];

const liabilityCategories = [
  "Credit Card",
  "Auto Loan",
  "Student Loan",
  "Personal Loan",
  "Medical Debt",
  "Other Debt",
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function getNetWorthStatus(netWorth: number) {
  if (netWorth < 0) {
    return {
      label: "REBUILD",
      description:
        "Net worth is negative. Priority is reducing liabilities and building cash reserves.",
      className: "border-yellow-300/50 bg-yellow-300/10 text-yellow-200",
    };
  }

  if (netWorth < 1000) {
    return {
      label: "BASELINE",
      description:
        "Net worth is positive but thin. Keep building cash and reducing debt.",
      className: "border-[#F5EFE1]/50 bg-[#F5EFE1]/10 text-[#F5EFE1]",
    };
  }

  return {
    label: "COMPOUNDING",
    description:
      "Net worth is positive. Protect the base and keep compounding.",
      className: "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
    };
  }

export default function NetWorthTracker() {
  const [items, setItems] = useState<NetWorthItem[]>([]);
  const hasLoadedItems = useRef(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<NetWorthItemType>("asset");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Checking");
  const [value, setValue] = useState("");

  useEffect(() => {
    const savedItems = loadNetWorthItems();
    setItems(savedItems);
    hasLoadedItems.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoadedItems.current) {
      return;
    }

    saveNetWorthItems(items);
  }, [items]);

  const summary = useMemo(() => getNetWorthSummary(items), [items]);
  const status = getNetWorthStatus(summary.netWorth);

  const activeCategories =
    type === "asset" ? assetCategories : liabilityCategories;

  function resetForm() {
    setEditingId(null);
    setType("asset");
    setName("");
    setCategory("Checking");
    setValue("");
  }

  function handleTypeChange(nextType: NetWorthItemType) {
    setType(nextType);

    if (nextType === "asset") {
      setCategory("Checking");
    } else {
      setCategory("Credit Card");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValue = Number(value);

    if (!name.trim() || Number.isNaN(parsedValue) || parsedValue < 0) {
      return;
    }

    const item: NetWorthItem = {
      id: editingId ?? crypto.randomUUID(),
      name: name.trim(),
      type,
      category,
      value: parsedValue,
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

  function editItem(item: NetWorthItem) {
    setEditingId(item.id);
    setType(item.type);
    setName(item.name);
    setCategory(item.category);
    setValue(String(item.value));
  }

  function deleteItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));

    if (editingId === id) {
      resetForm();
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="rounded-[28px] border border-[rgba(245,245,247,0.12)] bg-[#050505] p-5 shadow-2xl shadow-black/40">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#F5EFE1]">
              Vermögen
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#F5F5F7]">
              Net Worth Tracker
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8E8E93]">
              Track assets and liabilities to see the real long-term financial
              position.
            </p>
          </div>

          <div
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] ${status.className}`}
          >
            {status.label}
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[#8E8E93]">
            Net Worth
          </p>

          <p
            className={`mt-3 text-5xl font-semibold tracking-[-0.065em] ${
              summary.netWorth < 0 ? "text-yellow-200" : "text-[#F5EFE1]"
            }`}
          >
            {formatMoney(summary.netWorth)}
          </p>

          <p className="mt-3 text-sm leading-6 text-[#8E8E93]">
            {status.description}
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Metric label="Assets" value={formatMoney(summary.totalAssets)} />
          <Metric
            label="Liabilities"
            value={formatMoney(summary.totalLiabilities)}
            warning={summary.totalLiabilities > 0}
          />
          <Metric
            label="Largest Asset"
            value={summary.largestAsset?.name ?? "None"}
          />
          <Metric
            label="Largest Debt"
            value={summary.largestLiability?.name ?? "None"}
            warning={Boolean(summary.largestLiability)}
          />
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
                Eintrag
              </p>

              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                {editingId ? "Edit Item" : "Add Net Worth Item"}
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
                onClick={() => handleTypeChange("asset")}
                className={`rounded-2xl border px-4 py-3 text-sm transition ${
                  type === "asset"
                    ? "border-[#F5EFE1] bg-[#F5EFE1] text-[#000000]"
                    : "border-[rgba(245,245,247,0.12)] bg-[#000000] text-[#F5F5F7]"
                }`}
              >
                Asset
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange("liability")}
                className={`rounded-2xl border px-4 py-3 text-sm transition ${
                  type === "liability"
                    ? "border-[#F5EFE1] bg-[#F5EFE1] text-[#000000]"
                    : "border-[rgba(245,245,247,0.12)] bg-[#000000] text-[#F5F5F7]"
                }`}
              >
                Liability
              </button>
            </div>

            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Checking, Amex balance, auto loan, savings..."
                className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#F5EFE1]"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#8E8E93]">
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
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
              Value
              <input
                value={value}
                onChange={(event) => setValue(event.target.value)}
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
              Assets & Liabilities
            </h3>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[rgba(245,245,247,0.14)] p-8 text-center text-sm text-[#8E8E93]">
              No net worth items yet. Add assets and liabilities to establish a
              baseline.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[rgba(245,245,247,0.12)] bg-[#000000] p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xl font-semibold tracking-[-0.04em] text-[#F5F5F7]">
                          {item.name}
                        </h4>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${
                            item.type === "asset"
                              ? "bg-[#F5EFE1] text-[#000000]"
                              : "border border-yellow-300/40 text-yellow-200"
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-[#8E8E93]">
                        {item.category}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
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

                  <p
                    className={`mt-4 text-2xl font-semibold tracking-[-0.045em] ${
                      item.type === "asset" ? "text-[#F5EFE1]" : "text-yellow-200"
                    }`}
                  >
                    {formatMoney(item.value)}
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
        className={`mt-3 text-xl font-semibold tracking-[-0.045em] ${
          warning ? "text-yellow-200" : "text-[#F5F5F7]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}