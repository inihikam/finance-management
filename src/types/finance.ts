export type TransactionType = "income" | "expense";
export type ExpenseCategory = "needs" | "wants" | "savings" | "uncategorized";

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string | Date;
  createdAt: string | Date;
  planCategory?: ExpenseCategory; // Which part of the financial plan this belongs to
}

export interface FinancialPlan {
  id: string;
  userId: string;
  needs: number; // Percentage for needs (e.g., 70 in 70-20-10)
  wants: number; // Percentage for wants (e.g., 20 in 70-20-10)
  savings: number; // Percentage for savings (e.g., 10 in 70-20-10)
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface UserFinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  needsAllocation: number;
  wantsAllocation: number;
  savingsAllocation: number;
  needsSpent: number;
  wantsSpent: number;
  savingsSpent: number;
  needsRemaining: number;
  wantsRemaining: number;
  savingsRemaining: number;
  period: "daily" | "weekly" | "monthly" | "yearly" | "all-time";
}
