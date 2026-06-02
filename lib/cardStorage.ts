export type CreditCard = {
  id: string;
  name: string;
  currentBalance: number;
  statementBalance: number;
  creditLimit: number;
  dueDate: string;
  minimumPayment: number;
  plannedPayment: number;
};

const CARD_STORAGE_KEY = "klarheit_credit_cards_v1";

export function loadCards(): CreditCard[] {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = window.localStorage.getItem(CARD_STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved) as CreditCard[];
  } catch {
    return [];
  }
}

export function saveCards(cards: CreditCard[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(cards));
}