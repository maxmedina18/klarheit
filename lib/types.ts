export type TransactionType = "income" | "expense";

export type ExpenseCategory =
  | "Food"
  | "Transportation"
  | "School"
  | "Fitness"
  | "Clothing"
  | "Subscriptions"
  | "Debt Payment"
  | "Savings"
  | "Investing"
  | "Fun"
  | "Other";

export type IncomeCategory =
  | "Internship"
  | "Tutoring"
  | "Coffee Shop"
  | "Paycheck"
  | "Gift"
  | "Refund"
  | "Side Hustle"
  | "Other";

export type TransactionCategory = ExpenseCategory | IncomeCategory;

export type PaymentAccount =
  | "Amex Gold"
  | "Amex Blue Cash Everyday"
  | "Discover It"
  | "Checking"
  | "Savings Account"
  | "Debit"
  | "Cash"
  | "Other";

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: TransactionCategory;
  account: PaymentAccount;
  date: string;
  necessary: boolean;
};