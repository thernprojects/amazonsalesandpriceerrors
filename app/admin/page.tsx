"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setSubmitting(false);

    if (res.ok) {
      router.push("/admin/new-deal");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-tag border border-line bg-inkRaised p-6"
      >
        <h1 className="font-display text-xl text-cream">Admin sign in</h1>
        <p className="mt-1 mb-5 font-body text-sm text-slate">
          Silky&apos;s Deals and Steals — admin only.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full rounded-tag border border-line bg-ink px-3 py-2 font-body text-cream outline-none focus:border-coral"
        />

        {error ? <p className="mt-2 font-body text-sm text-coral">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 w-full rounded-tag bg-coral py-2 font-body text-sm font-semibold text-ink transition disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
