"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconAlert } from "@/components/admin/Icons";
import { Spinner } from "@/components/ui/Spinner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Invalid login credentials");
      }

      // Successful login - redirect to intended destination
      router.push(from);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          <IconAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
          Email Address
        </label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@mayadesignandbuild.com"
          className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white placeholder-neutral-500 focus:outline-hidden focus:border-[#C5A869] focus:ring-1 focus:ring-[#C5A869] transition"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-[11px] text-[#C5A869] hover:underline"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <input
          type={showPassword ? "text" : "password"}
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white placeholder-neutral-500 focus:outline-hidden focus:border-[#C5A869] focus:ring-1 focus:ring-[#C5A869] transition font-mono"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        className="w-full mt-2 py-3 px-4 rounded-lg bg-[#C5A869] hover:bg-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? (
          <>
            <Spinner size="xs" />
            <span>Verifying Credentials...</span>
          </>
        ) : (
          "Sign In to Console"
        )}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#0D0F12] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Architectural Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C5A869]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 rounded bg-[#C5A869]/10 border border-[#C5A869]/20 text-[#C5A869] text-xs font-semibold tracking-widest uppercase mb-3">
            Secure Administrator Portal
          </div>
          <h1 className="text-3xl font-black tracking-widest text-[#C5A869]">
            MAYA
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Design & Build Management Console
          </p>
        </div>

        <div className="rounded-xl border border-[#2B313D] bg-[#14171C] p-6 sm:p-8 shadow-2xl">
          <Suspense fallback={<div className="text-center text-sm text-neutral-400">Loading form...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-neutral-500 mt-6">
          Authorized personnel only. All access is logged and audited.
        </p>
      </div>
    </div>
  );
}
