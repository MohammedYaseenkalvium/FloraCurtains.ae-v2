"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FloraLogo } from "@/components/public/FloraLogo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) setError("Invalid credentials");
      else router.push("/dashboard");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-flora-background flex items-center justify-center px-5">
      <div className="bg-white rounded-2xl shadow-flora-md border border-flora-border p-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-start">
          <FloraLogo
            width={176}
            height={44}
            priority
            className="h-11 w-auto object-contain"
          />
          <div className="mt-3 text-[10px] text-flora-muted tracking-[0.18em] uppercase">
            Interior Operations
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="text-xs uppercase tracking-widest text-flora-muted block mb-1"
            >
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-flora-border rounded-lg px-3 py-2 text-sm outline-none focus:border-flora-primary bg-flora-surface"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="text-xs uppercase tracking-widest text-flora-muted block mb-1"
            >
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-flora-border rounded-lg px-3 py-2 text-sm outline-none focus:border-flora-primary bg-flora-surface"
            />
          </div>

          {error && (
            <p role="alert" className="text-flora-danger text-xs">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-flora-primary text-white rounded-lg py-2.5 text-sm font-medium hover:bg-flora-primary-hover transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
