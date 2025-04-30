"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Transaction, TransactionType } from "@/types/finance";
import {
  getTransactionsByUser,
  deleteTransaction,
} from "@/services/transactionService";

// Helper function to format currency in Indonesian Rupiah
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!currentUser) {
      router.push("/login");
      return;
    }

    async function loadTransactions() {
      try {
        const userTransactions = await getTransactionsByUser(currentUser.uid);
        setTransactions(userTransactions);
      } catch (error) {
        console.error("Error loading transactions:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, [currentUser, router]);

  const filteredTransactions =
    filterType === "all"
      ? transactions
      : transactions.filter((t) => t.type === filterType);

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus transaksi ini?")) {
      try {
        await deleteTransaction(id);
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      } catch (error) {
        console.error("Error deleting transaction:", error);
        alert("Gagal menghapus transaksi");
      }
    }
  };

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
            Transaksi
          </h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-3 py-2 border border-transparent rounded-md text-sm font-medium text-[#222831] bg-[#DFD0B8] hover:bg-[#948979]"
          >
            Kembali
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <h2 className="text-lg sm:text-xl font-semibold text-[#222831]">
                Semua Transaksi
              </h2>
              <div className="inline-flex rounded-md shadow-sm w-full sm:w-auto">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-l-md ${
                    filterType === "all"
                      ? "bg-[#222831] text-[#DFD0B8]"
                      : "bg-white text-[#222831] hover:bg-[#DFD0B8] hover:bg-opacity-50"
                  } border flex-1 sm:flex-none`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilterType("income")}
                  className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium ${
                    filterType === "income"
                      ? "bg-[#222831] text-[#DFD0B8]"
                      : "bg-white text-[#222831] hover:bg-[#DFD0B8] hover:bg-opacity-50"
                  } border-t border-b border-l flex-1 sm:flex-none`}
                >
                  Pemasukan
                </button>
                <button
                  onClick={() => setFilterType("expense")}
                  className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-r-md ${
                    filterType === "expense"
                      ? "bg-[#222831] text-[#DFD0B8]"
                      : "bg-white text-[#222831] hover:bg-[#DFD0B8] hover:bg-opacity-50"
                  } border flex-1 sm:flex-none`}
                >
                  Pengeluaran
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={() => router.push("/transactions/add?type=income")}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#DFD0B8] bg-[#222831] hover:bg-[#393E46] w-full sm:w-auto"
              >
                + Pemasukan
              </button>
              <button
                onClick={() => router.push("/transactions/add?type=expense")}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#DFD0B8] bg-[#222831] hover:bg-[#393E46] w-full sm:w-auto"
              >
                + Pengeluaran
              </button>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="py-6 sm:py-8 text-center text-[#393E46] text-sm sm:text-base">
              {filterType === "all"
                ? "Belum ada transaksi. Mulai dengan menambahkan pemasukan atau pengeluaran."
                : `Tidak ada transaksi ${
                    filterType === "income" ? "pemasukan" : "pengeluaran"
                  } ditemukan. Tambahkan menggunakan tombol di atas.`}
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
                      <th
                        scope="col"
                        className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-[#222831] uppercase tracking-wider"
                      >
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#DFD0B8]">
                    {filteredTransactions.map((transaction) => (
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
                          {transaction.planCategory && (
                            <span className="ml-1 text-xs text-[#948979]">
                              (
                              {transaction.planCategory === "needs"
                                ? "Kebutuhan"
                                : transaction.planCategory === "wants"
                                ? "Keinginan"
                                : transaction.planCategory === "savings"
                                ? "Tabungan"
                                : ""}
                              )
                            </span>
                          )}
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
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-[#393E46] hover:text-[#222831]"
                            aria-label="Hapus transaksi"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
