"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      name,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setLoading(false);

    if (result?.error) {
      setError("Could not sign in. Check your email and try again.");
      return;
    }

    router.push(result?.url ?? "/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-2xl border border-[var(--cal-border)] bg-[var(--bg-surface)] p-8 shadow-2xl"
      >
        <div className="text-center">
          <h1 className="font-heading text-4xl font-bold text-[var(--text-primary)]">Calendo</h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            From content chaos to calendar clarity
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-[var(--bg-elevated)]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="bg-[var(--bg-elevated)]"
            />
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-[var(--accent-brand)] hover:bg-[var(--accent-brand)]/90"
            size="lg"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Continue"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
          Sign in with your work email to access your content calendar.
        </p>
      </motion.div>
    </div>
  );
}
