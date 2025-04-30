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
    } catch (err: any) {
      setError("Failed to add transaction: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {transactionType === "income"
              ? "Tambah Pemasukan"
              : "Tambah Pengeluaran"}
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                className="block text-sm font-medium text-gray-700"
              >
                Deskripsi
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder={`Masukkan deskripsi ${
                  transactionType === "income" ? "pemasukan" : "pengeluaran"
                }`}
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Kategori
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                  className="block text-sm font-medium text-gray-700"
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
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="needs"
                        className="ml-2 block text-sm text-gray-700"
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
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="wants"
                        className="ml-2 block text-sm text-gray-700"
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
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="savings"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Tabungan
                      </label>
                    </div>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Pilih kategori rencana keuangan untuk melacak pengeluaran
                  terhadap alokasi
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="0"
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700"
              >
                Tanggal
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  transactionType === "income"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
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
