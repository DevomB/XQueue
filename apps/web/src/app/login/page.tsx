"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/layout/brand-logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const rl = await fetch("/api/auth/login-rate-limit", { method: "POST" });
    if (!rl.ok) {
      const data = await rl.json();
      setError(data.error ?? "Too many login attempts");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="grid-bg absolute inset-0 opacity-40" />
      <div className="glow-orb absolute left-1/2 top-0 h-96 w-[600px] -translate-x-1/2" />
      <div className="relative w-full max-w-md">
        <BrandLogo />
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 backdrop-blur-sm">
          <h1 className="font-display text-2xl font-semibold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Log in to manage your scheduled posts.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Email
              </label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-zinc-700 bg-zinc-950 text-white"
                required
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="login-password" className="text-sm font-medium text-zinc-300">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-sky-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-zinc-700 bg-zinc-950 text-white"
                required
              />
            </div>
            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-zinc-500">
          No account?{" "}
          <Link href="/signup" className="text-sky-400 hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
