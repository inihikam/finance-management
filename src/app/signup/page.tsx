"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setLoading(true);
      await signup(email, password);
      router.push("/dashboard");
    } catch (err: Error | unknown) {
      setError(
        "Failed to create an account: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#DFD0B8] bg-opacity-30 px-4">
      <div className="w-full max-w-md space-y-6 p-6 sm:p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#222831]">
            Buat Akun Baru
          </h2>
          <p className="mt-2 text-sm text-[#393E46]">
            Kelola keuangan Anda dalam Rupiah
          </p>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-[#222831] mb-1"
              >
                Alamat Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-3 border border-[#948979] rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#222831] focus:border-[#222831] text-sm"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#222831] mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-3 border border-[#948979] rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#222831] focus:border-[#222831] text-sm"
                placeholder="Min. 6 karakter"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-[#222831] mb-1"
              >
                Konfirmasi Password
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-3 border border-[#948979] rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#222831] focus:border-[#222831] text-sm"
                placeholder="Ulangi password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-[#DFD0B8] bg-[#222831] hover:bg-[#393E46] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#222831] shadow-sm"
            >
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </div>

          <div className="text-sm text-center text-[#393E46]">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-medium text-[#222831] hover:text-[#393E46]"
            >
              Masuk
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
