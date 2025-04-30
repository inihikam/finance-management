"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { FinancialPlan } from "@/types/finance";
import {
  getUserLatestFinancialPlan,
  createDefaultFinancialPlan,
  updateFinancialPlan,
} from "@/services/financialPlanService";

export default function FinancialPlanPage() {
  const [financialPlan, setFinancialPlan] = useState<FinancialPlan | null>(
    null
  );
  const [needs, setNeeds] = useState<number>(70);
  const [wants, setWants] = useState<number>(20);
  const [savings, setSavings] = useState<number>(10);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!currentUser) {
      router.push("/login");
      return;
    }

    async function loadFinancialPlan() {
      try {
        // Load or create financial plan
        let plan = await getUserLatestFinancialPlan(currentUser.uid);
        if (!plan) {
          const newPlanId = await createDefaultFinancialPlan(currentUser.uid);
          plan = await getUserLatestFinancialPlan(currentUser.uid);
        }

        if (plan) {
          setFinancialPlan(plan);
          setNeeds(plan.needs);
          setWants(plan.wants);
          setSavings(plan.savings);
        }
      } catch (error) {
        console.error("Error loading financial plan:", error);
        setError("Failed to load financial plan");
      } finally {
        setLoading(false);
      }
    }

    loadFinancialPlan();
  }, [currentUser, router]);

  const handleNeedsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setNeeds(value);

    // Adjust other values to ensure total = 100
    const remaining = 100 - value;
    const wantsRatio = wants / (wants + savings);

    if (remaining > 0) {
      const newWants = Math.round(remaining * wantsRatio);
      const newSavings = remaining - newWants;
      setWants(newWants);
      setSavings(newSavings);
    } else {
      setWants(0);
      setSavings(0);
    }
  };

  const handleWantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setWants(value);

    // Adjust other values to ensure total = 100
    const remaining = 100 - value - needs;
    setSavings(Math.max(0, remaining));
  };

  const handleSavingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setSavings(value);

    // Adjust other values to ensure total = 100
    const remaining = 100 - value - needs;
    setWants(Math.max(0, remaining));
  };

  const applyPresetAllocation = (
    preset: "balanced" | "aggressive-saving" | "essentials-first"
  ) => {
    if (preset === "balanced") {
      // 50-30-20 rule: Needs, Wants, Savings
      setNeeds(50);
      setWants(30);
      setSavings(20);
    } else if (preset === "aggressive-saving") {
      // 60-20-20 rule: Needs, Wants, Savings
      setNeeds(60);
      setWants(20);
      setSavings(20);
    } else if (preset === "essentials-first") {
      // 70-20-10 rule: Needs, Wants, Savings
      setNeeds(70);
      setWants(20);
      setSavings(10);
    }
  };

  const handleSave = async () => {
    if (!financialPlan || !currentUser) return;

    // Validate that values add up to 100
    const total = needs + wants + savings;
    if (total !== 100) {
      setError("Percentages must add up to 100%");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      await updateFinancialPlan(financialPlan.id, {
        needs,
        wants,
        savings,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving financial plan:", error);
      setError("Failed to save financial plan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Financial Plan Settings
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              Customize Your Financial Allocation
            </h2>
            <p className="text-gray-600">
              Adjust how your income should be allocated across your needs,
              wants, and savings goals. The total must add up to 100%.
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Preset Allocations</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => applyPresetAllocation("balanced")}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
              >
                Balanced (50-30-20)
              </button>
              <button
                onClick={() => applyPresetAllocation("aggressive-saving")}
                className="px-4 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200"
              >
                Aggressive Saving (60-20-20)
              </button>
              <button
                onClick={() => applyPresetAllocation("essentials-first")}
                className="px-4 py-2 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200"
              >
                Essentials First (70-20-10)
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="needs"
                className="block text-sm font-medium text-gray-700"
              >
                Needs (Essential expenses like rent, bills, groceries)
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="range"
                  id="needs"
                  min="0"
                  max="100"
                  value={needs}
                  onChange={handleNeedsChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-3 w-12 text-gray-700">{needs}%</span>
              </div>
              <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${needs}%` }}
                ></div>
              </div>
            </div>

            <div>
              <label
                htmlFor="wants"
                className="block text-sm font-medium text-gray-700"
              >
                Wants (Non-essential expenses like entertainment, dining out)
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="range"
                  id="wants"
                  min="0"
                  max="100"
                  value={wants}
                  onChange={handleWantsChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-3 w-12 text-gray-700">{wants}%</span>
              </div>
              <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600"
                  style={{ width: `${wants}%` }}
                ></div>
              </div>
            </div>

            <div>
              <label
                htmlFor="savings"
                className="block text-sm font-medium text-gray-700"
              >
                Savings (Future goals, emergency funds, investments)
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="range"
                  id="savings"
                  min="0"
                  max="100"
                  value={savings}
                  onChange={handleSavingsChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-3 w-12 text-gray-700">{savings}%</span>
              </div>
              <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600"
                  style={{ width: `${savings}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Total: {needs + wants + savings}%
              </h3>
              <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${needs}%` }}
                ></div>
                <div
                  className="h-full bg-purple-600"
                  style={{ width: `${wants}%` }}
                ></div>
                <div
                  className="h-full bg-green-600"
                  style={{ width: `${savings}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {isSaving ? "Saving..." : "Save Plan"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
