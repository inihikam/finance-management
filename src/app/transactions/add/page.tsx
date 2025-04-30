"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { TransactionType, ExpenseCategory } from "@/types/finance";
import { addTransaction } from "@/services/transactionService";

export default function AddTransactionPage() {
  const searchParams = useSearchParams();
  const transactionType =
    (searchParams.get("type") as TransactionType) || "expense";

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [planCategory, setPlanCategory] = useState<ExpenseCategory>("needs");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { currentUser } = useAuth();

  // Category options based on transaction type
  const categories =
    transactionType === "income"
      ? ["Salary", "Freelance", "Investments", "Gifts", "Other Income"]
      : [
          "Housing",
          "Transportation",
          "Food",
          "Utilities",
          "Healthcare",
          "Entertainment",
          "Shopping",
          "Education",
          "Personal Care",
          "Other Expense",
        ];

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    }
  }, [currentUser, router]);

  // Set default plan category based on transaction category
  useEffect(() => {
    if (category) {
      const lowerCategory = category.toLowerCase();

      if (
        [
          "housing",
          "transportation",
          "food",
          "utilities",
          "healthcare",
          "education",
        ].includes(lowerCategory)
      ) {
        setPlanCategory("needs");
      } else if (
        ["entertainment", "shopping", "personal care"].includes(lowerCategory)
      ) {
        setPlanCategory("wants");
      } else if (["investments"].includes(lowerCategory)) {
        setPlanCategory("savings");
      }
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description) {
      setError("Please enter a description");
      return;
    }

    if (!category) {
      setError("Please select a category");
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (!currentUser) {
        throw new Error("You must be logged in to add a transaction");
      }

      await addTransaction({
        userId: currentUser.uid,
        description,
        category,
        amount: amountValue,
        type: transactionType,
        date: new Date(date),
        planCategory: transactionType === "expense" ? planCategory : undefined,
      });

      router.push("/transactions");
    } catch (err: Error | unknown) {
      setError("Failed to add transaction: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-[#DFD0B8] bg-opacity-30">
      <header className="bg-[#222831] shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-3xl font-bold text-[#DFD0B8]">
            {transactionType === "income"
              ? "Tambah Pemasukan"
              : "Tambah Pengeluaran"}
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="bg-white shadow rounded-lg p-6">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-[#222831]"
              >
                Deskripsi
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border border-[#948979] rounded-md shadow-sm py-2 px-3 text-[#222831] focus:outline-none focus:ring-[#222831] focus:border-[#222831] sm:text-sm"
                placeholder={`Masukkan deskripsi ${
                  transactionType === "income" ? "pemasukan" : "pengeluaran"
                }`}
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-[#222831]"
              >
                Kategori
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full border border-[#948979] rounded-md shadow-sm py-2 px-3 text-[#222831] focus:outline-none focus:ring-[#222831] focus:border-[#222831] sm:text-sm"
              >
                <option value="">Pilih kategori</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {transactionType === "expense" && (
              <div>
                <label
                  htmlFor="planCategory"
                  className="block text-sm font-medium text-[#222831]"
                >
                  Kategori Rencana Keuangan
                </label>
                <div className="mt-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        id="needs"
                        name="planCategory"
                        type="radio"
                        checked={planCategory === "needs"}
                        onChange={() => setPlanCategory("needs")}
                        className="h-4 w-4 text-[#222831] border-[#948979] focus:ring-[#222831]"
                      />
                      <label
                        htmlFor="needs"
                        className="ml-2 block text-sm text-[#393E46] font-medium"
                      >
                        Kebutuhan
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="wants"
                        name="planCategory"
                        type="radio"
                        checked={planCategory === "wants"}
                        onChange={() => setPlanCategory("wants")}
                        className="h-4 w-4 text-[#222831] border-[#948979] focus:ring-[#222831]"
                      />
                      <label
                        htmlFor="wants"
                        className="ml-2 block text-sm text-[#393E46] font-medium"
                      >
                        Keinginan
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="savings"
                        name="planCategory"
                        type="radio"
                        checked={planCategory === "savings"}
                        onChange={() => setPlanCategory("savings")}
                        className="h-4 w-4 text-[#222831] border-[#948979] focus:ring-[#222831]"
                      />
                      <label
                        htmlFor="savings"
                        className="ml-2 block text-sm text-[#393E46] font-medium"
                      >
                        Tabungan
                      </label>
                    </div>
                  </div>
                </div>
                <p className="mt-1 text-sm text-[#948979]">
                  Pilih kategori rencana keuangan untuk melacak pengeluaran
                  terhadap alokasi
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-[#222831]"
              >
                Jumlah (Rp)
              </label>
              <input
                type="number"
                id="amount"
                step="1000"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full border border-[#948979] rounded-md shadow-sm py-2 px-3 text-[#222831] focus:outline-none focus:ring-[#222831] focus:border-[#222831] sm:text-sm"
                placeholder="0"
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-[#222831]"
              >
                Tanggal
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full border border-[#948979] rounded-md shadow-sm py-2 px-3 text-[#222831] focus:outline-none focus:ring-[#222831] focus:border-[#222831] sm:text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-[#948979] rounded-md text-sm font-medium text-[#222831] hover:bg-[#DFD0B8]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#DFD0B8] bg-[#222831] hover:bg-[#393E46]"
              >
                {loading
                  ? "Menambahkan..."
                  : `Tambah ${
                      transactionType === "income" ? "Pemasukan" : "Pengeluaran"
                    }`}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
