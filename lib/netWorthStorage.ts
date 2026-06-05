export type NetWorthItemType = "asset" | "liability";

export type NetWorthItem = {
  id: string;
  name: string;
  type: NetWorthItemType;
  category: string;
  value: number;
};

const NET_WORTH_STORAGE_KEY = "klarheit_net_worth_items_v1";

export function loadNetWorthItems(): NetWorthItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = window.localStorage.getItem(NET_WORTH_STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved) as NetWorthItem[];
  } catch {
    return [];
  }
}

export function saveNetWorthItems(items: NetWorthItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(NET_WORTH_STORAGE_KEY, JSON.stringify(items));
}

export function getNetWorthSummary(items: NetWorthItem[]) {
  const totalAssets = items
    .filter((item) => item.type === "asset")
    .reduce((sum, item) => sum + item.value, 0);

  const totalLiabilities = items
    .filter((item) => item.type === "liability")
    .reduce((sum, item) => sum + item.value, 0);

  const netWorth = totalAssets - totalLiabilities;

  const assetItems = items.filter((item) => item.type === "asset");
  const liabilityItems = items.filter((item) => item.type === "liability");

  const largestAsset = [...assetItems].sort((a, b) => b.value - a.value)[0];
  const largestLiability = [...liabilityItems].sort(
    (a, b) => b.value - a.value
  )[0];

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    largestAsset,
    largestLiability,
  };
}