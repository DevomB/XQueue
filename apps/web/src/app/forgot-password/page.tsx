"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/layout/brand-logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Request failed");
      return;
    }
    setMessage(data.message);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="relative w-full max-w-md">
        <BrandLogo />
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8">
          <h1 className="text-2xl font-semibold text-white">Reset password</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Enter your email and we will send a reset link if an account exists.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="border-zinc-700 bg-zinc-950 text-white"
              required
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-emerald-400">{message}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-zinc-500">
            <Link href="/login" className="text-sky-400 hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
