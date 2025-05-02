"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Transaction,
  FinancialPlan,
  UserFinancialSummary,
  ExpenseCategory,
} from "@/types/finance";
import { getTransactionsByUser } from "@/services/transactionService";
import {
  getUserLatestFinancialPlan,
  createDefaultFinancialPlan,
} from "@/services/financialPlanService";

// Helper function to format currency in Indonesian Rupiah
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financialPlan, setFinancialPlan] = useState<FinancialPlan | null>(
    null
  );
  const [summary, setSummary] = useState<UserFinancialSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    needsAllocation: 0,
    wantsAllocation: 0,
    savingsAllocation: 0,
    needsSpent: 0,
    wantsSpent: 0,
    savingsSpent: 0,
    needsRemaining: 0,
    wantsRemaining: 0,
    savingsRemaining: 0,
    period: "monthly",
  });
  const [loading, setLoading] = useState(true);
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!currentUser) {
      router.push("/login");
      return;
    }

    async function loadUserData() {
      try {
        // Load user's transactions
        const userTransactions = await getTransactionsByUser(currentUser!.uid);
        setTransactions(userTransactions);

        // Load or create financial plan
        let plan = await getUserLatestFinancialPlan(currentUser!.uid);
        if (!plan) {
          await createDefaultFinancialPlan(currentUser!.uid);
          plan = await getUserLatestFinancialPlan(currentUser!.uid);
        }
        setFinancialPlan(plan);

        // Calculate financial summary
        calculateFinancialSummary(userTransactions, plan);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [currentUser, router]);

  // Calculate financial summary based on transactions and financial plan
  const calculateFinancialSummary = (
    userTransactions: Transaction[],
    plan: FinancialPlan | null
  ) => {
    const totalIncome = userTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = userTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    // Calculate allocations based on financial plan percentages
    const needsAllocation = plan ? (totalIncome * plan.needs) / 100 : 0;
    const wantsAllocation = plan ? (totalIncome * plan.wants) / 100 : 0;
    const savingsAllocation = plan ? (totalIncome * plan.savings) / 100 : 0;

    // Categorize expenses based on transaction categories
    const expenseTransactions = userTransactions.filter(
      (t) => t.type === "expense"
    );

    // Map transactions to financial plan categories
    const categorizedTransactions = expenseTransactions.map((transaction) => {
      // Use planCategory if it's already set (prioritize stored value)
      if (transaction.planCategory) {
        return { ...transaction };
      }

      // If planCategory is not available, determine it based on transaction category
      const category = transaction.category.toLowerCase();
      let planCategory: ExpenseCategory = "uncategorized";

      // Basic categorization based on common expense categories
      if (
        [
          "rent",
          "utilities",
          "groceries",
          "transportation",
          "education",
          "healthcare",
          "insurance",
          "housing",
          "food",
        ].some((c) => category.includes(c))
      ) {
        planCategory = "needs";
      } else if (
        [
          "entertainment",
          "dining",
          "shopping",
          "travel",
          "hobby",
          "subscription",
          "personal care",
        ].some((c) => category.includes(c))
      ) {
        planCategory = "wants";
      } else if (
        ["investment", "savings", "emergency fund", "retirement"].some((c) =>
          category.includes(c)
        )
      ) {
        planCategory = "savings";
      }

      return { ...transaction, planCategory };
    });

    // Calculate spending in each category
    const needsSpent = categorizedTransactions
      .filter((t) => t.planCategory === "needs")
      .reduce((sum, t) => sum + t.amount, 0);

    const wantsSpent = categorizedTransactions
      .filter((t) => t.planCategory === "wants")
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsSpent = categorizedTransactions
      .filter((t) => t.planCategory === "savings")
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate remaining budget in each category
    const needsRemaining = Math.max(0, needsAllocation - needsSpent);
    const wantsRemaining = Math.max(0, wantsAllocation - wantsSpent);
    const savingsRemaining = Math.max(0, savingsAllocation - savingsSpent);

    setSummary({
      totalIncome,
      totalExpense,
      balance,
      needsAllocation,
      wantsAllocation,
      savingsAllocation,
      needsSpent,
      wantsSpent,
      savingsSpent,
      needsRemaining,
      wantsRemaining,
      savingsRemaining,
      period: "monthly",
    });
  };

  async function handleLogout() {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DFD0B8] bg-opacity-30">
      <header className="bg-[#222831] shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-3xl font-bold text-[#DFD0B8]">
            Dasbor Keuangan
          </h1>
          <button
            onClick={handleLogout}
            className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#222831] bg-[#DFD0B8] hover:bg-[#948979]"
          >
            Keluar
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Financial Summary Section */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-[#222831]">
            Ringkasan Keuangan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-[#DFD0B8] bg-opacity-50 p-3 sm:p-4 rounded-md border border-[#948979]">
              <div className="text-xs sm:text-sm text-[#222831] font-medium">
                Total Pemasukan
              </div>
              <div className="text-lg sm:text-2xl font-bold text-[#222831]">
                {formatRupiah(summary.totalIncome)}
              </div>
            </div>
            <div className="bg-[#DFD0B8] bg-opacity-50 p-3 sm:p-4 rounded-md border border-[#948979]">
              <div className="text-xs sm:text-sm text-[#222831] font-medium">
                Total Pengeluaran
              </div>
              <div className="text-lg sm:text-2xl font-bold text-[#222831]">
                {formatRupiah(summary.totalExpense)}
              </div>
            </div>
            <div className="bg-[#DFD0B8] bg-opacity-50 p-3 sm:p-4 rounded-md border border-[#948979]">
              <div className="text-xs sm:text-sm text-[#222831] font-medium">
                Saldo
              </div>
              <div className="text-lg sm:text-2xl font-bold text-[#222831]">
                {formatRupiah(summary.balance)}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Plan Section */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-[#222831]">
              Rencana Keuangan
            </h2>
            <button
              className="px-2 py-1 sm:px-3 sm:py-1 border border-[#948979] rounded-md text-xs sm:text-sm text-[#222831] hover:bg-[#DFD0B8]"
              onClick={() => router.push("/financial-plan")}
            >
              Ubah
            </button>
          </div>
          {financialPlan && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 border border-[#948979] rounded-md">
                <div className="text-xs sm:text-sm text-[#393E46] font-medium">
                  Kebutuhan ({financialPlan.needs}%)
                </div>
                <div className="text-base sm:text-xl font-bold text-[#222831]">
                  {formatRupiah(summary.needsAllocation)}
                </div>

                {/* Progress bar for needs */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#393E46]">
                      Terpakai: {formatRupiah(summary.needsSpent || 0)}
                    </span>
                    <span className="text-[#393E46]">
                      Sisa: {formatRupiah(summary.needsRemaining || 0)}
                    </span>
                  </div>
                  <div className="mt-1 h-2 bg-[#DFD0B8] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        summary.needsSpent > summary.needsAllocation
                          ? "bg-red-500"
                          : "bg-[#393E46]"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          summary.needsSpent && summary.needsAllocation
                            ? (summary.needsSpent / summary.needsAllocation) *
                                100
                            : 0
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 border border-[#948979] rounded-md">
                <div className="text-xs sm:text-sm text-[#393E46] font-medium">
                  Keinginan ({financialPlan.wants}%)
                </div>
                <div className="text-base sm:text-xl font-bold text-[#222831]">
                  {formatRupiah(summary.wantsAllocation)}
                </div>

                {/* Progress bar for wants */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#393E46]">
                      Terpakai: {formatRupiah(summary.wantsSpent || 0)}
                    </span>
                    <span className="text-[#393E46]">
                      Sisa: {formatRupiah(summary.wantsRemaining || 0)}
                    </span>
                  </div>
                  <div className="mt-1 h-2 bg-[#DFD0B8] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        summary.wantsSpent > summary.wantsAllocation
                          ? "bg-red-500"
                          : "bg-[#393E46]"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          summary.wantsSpent && summary.wantsAllocation
                            ? (summary.wantsSpent / summary.wantsAllocation) *
                                100
                            : 0
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 border border-[#948979] rounded-md">
                <div className="text-xs sm:text-sm text-[#393E46] font-medium">
                  Tabungan ({financialPlan.savings}%)
                </div>
                <div className="text-base sm:text-xl font-bold text-[#222831]">
                  {formatRupiah(summary.savingsAllocation)}
                </div>

                {/* Progress bar for savings */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#393E46]">
                      Terpakai: {formatRupiah(summary.savingsSpent || 0)}
                    </span>
                    <span className="text-[#393E46]">
                      Sisa: {formatRupiah(summary.savingsRemaining || 0)}
                    </span>
                  </div>
                  <div className="mt-1 h-2 bg-[#DFD0B8] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        summary.savingsSpent > summary.savingsAllocation
                          ? "bg-red-500"
                          : "bg-[#393E46]"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          summary.savingsSpent && summary.savingsAllocation
                            ? (summary.savingsSpent /
                                summary.savingsAllocation) *
                                100
                            : 0
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Transactions Section */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-[#222831]">
              Transaksi Terbaru
            </h2>
            <button
              className="px-2 py-1 sm:px-3 sm:py-1 border border-[#948979] rounded-md text-xs sm:text-sm text-[#222831] hover:bg-[#DFD0B8]"
              onClick={() => router.push("/transactions")}
            >
              Lihat Semua
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="py-6 sm:py-8 text-center text-[#393E46] text-sm sm:text-base">
              Belum ada transaksi. Mulai tambahkan pemasukan dan pengeluaran
              Anda.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-[#DFD0B8]">
                  <thead className="bg-[#DFD0B8] bg-opacity-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-[#222831] uppercase tracking-wider"
                      >
                        Tanggal
                      </th>
                      <th
                        scope="col"
                        className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-[#222831] uppercase tracking-wider"
                      >
                        Deskripsi
                      </th>
                      <th
                        scope="col"
                        className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-[#222831] uppercase tracking-wider"
                      >
                        Kategori
                      </th>
                      <th
                        scope="col"
                        className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-[#222831] uppercase tracking-wider"
                      >
                        Tipe
                      </th>
                      <th
                        scope="col"
                        className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-[#222831] uppercase tracking-wider"
                      >
                        Jumlah
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#DFD0B8]">
                    {transactions.slice(0, 5).map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-[#DFD0B8] hover:bg-opacity-20"
                      >
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-[#393E46]">
                          {new Date(transaction.date).toLocaleDateString(
                            "id-ID"
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-[#222831] font-medium">
                          {transaction.description}
                        </td>
                        <td className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-[#393E46]">
                          {transaction.category}
                        </td>
                        <td className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.type === "income"
                                ? "bg-[#DFD0B8] text-[#222831]"
                                : "bg-[#393E46] text-[#DFD0B8]"
                            }`}
                          >
                            {transaction.type === "income"
                              ? "Pemasukan"
                              : "Pengeluaran"}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-right font-medium">
                          <span
                            className={
                              transaction.type === "income"
                                ? "text-[#222831]"
                                : "text-[#393E46]"
                            }
                          >
                            {formatRupiah(transaction.amount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => router.push("/transactions/add?type=income")}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#DFD0B8] bg-[#222831] hover:bg-[#393E46] w-full sm:w-auto"
            >
              + Tambah Pemasukan
            </button>
            <button
              onClick={() => router.push("/transactions/add?type=expense")}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#DFD0B8] bg-[#222831] hover:bg-[#393E46] w-full sm:w-auto"
            >
              + Tambah Pengeluaran
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
