"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/layout/brand-logo";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Reset failed");
      return;
    }
    setDone(true);
  }

  if (!token || !email) {
    return (
      <p className="text-sm text-red-400">Invalid reset link.</p>
    );
  }

  if (done) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-emerald-400">Password updated successfully.</p>
        <Link href="/login">
          <Button className="w-full">Log in</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password (min 8 characters)"
        className="border-zinc-700 bg-zinc-950 text-white"
        minLength={8}
        required
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="relative w-full max-w-md">
        <BrandLogo />
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8">
          <h1 className="text-2xl font-semibold text-white">New password</h1>
          <Suspense fallback={<p className="mt-4 text-sm text-zinc-500">Loading…</p>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
