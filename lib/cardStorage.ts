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

export function getCardUtilization(balance: number, limit: number) {
  if (limit <= 0) {
    return 0;
  }

  return (balance / limit) * 100;
}

export function getDaysUntilDue(dueDate: string) {
  if (!dueDate) {
    return null;
  }

  const today = new Date();
  const due = new Date(`${dueDate}T00:00:00`);

  today.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getCardPaymentGap(card: CreditCard) {
  return Math.max(card.statementBalance - card.plannedPayment, 0);
}

export function getCardPressureSummary(cards: CreditCard[]) {
  const totalCurrentBalance = cards.reduce(
    (sum, card) => sum + card.currentBalance,
    0
  );

  const totalStatementBalance = cards.reduce(
    (sum, card) => sum + card.statementBalance,
    0
  );

  const totalPlannedPayment = cards.reduce(
    (sum, card) => sum + card.plannedPayment,
    0
  );

  const totalCreditLimit = cards.reduce(
    (sum, card) => sum + card.creditLimit,
    0
  );

  const uncoveredGap = Math.max(totalStatementBalance - totalPlannedPayment, 0);

  const totalUtilization = getCardUtilization(
    totalCurrentBalance,
    totalCreditLimit
  );

  const highestRiskCard = [...cards]
    .sort((a, b) => {
      const aGap = getCardPaymentGap(a);
      const bGap = getCardPaymentGap(b);

      const aDue = getDaysUntilDue(a.dueDate);
      const bDue = getDaysUntilDue(b.dueDate);

      const aDueScore = aDue === null ? 999 : aDue;
      const bDueScore = bDue === null ? 999 : bDue;

      if (bGap !== aGap) {
        return bGap - aGap;
      }

      return aDueScore - bDueScore;
    })[0];

  return {
    totalCurrentBalance,
    totalStatementBalance,
    totalPlannedPayment,
    totalCreditLimit,
    uncoveredGap,
    totalUtilization,
    highestRiskCard,
  };
}