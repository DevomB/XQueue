"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, acceptedTerms }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Signup failed");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Account created but login failed. Try logging in.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="text-xl font-bold">
          XQueue
        </Link>
        <h1 className="mt-8 text-2xl font-bold">Create your account</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-950"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              className="w-full rounded-lg border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-950"
              required
            />
            <p className="mt-1 text-xs text-zinc-500">At least 8 characters</p>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1"
              required
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="underline" target="_blank">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline" target="_blank">
                Privacy Policy
              </Link>
            </span>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !acceptedTerms}
          >
            {loading ? "Creating account..." : "Start free"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="text-zinc-900 underline dark:text-white">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
