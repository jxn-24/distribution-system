"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
    } catch (err: unknown) {
      const data = axios.isAxiosError(err) ? err.response?.data : undefined;
      setError(data?.non_field_errors?.[0] || data?.detail || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || user) {
    return (
      <div className="lg-page flex items-center justify-center">
        <p className="lg-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="lg-page flex items-center justify-center px-4 py-10">
      <div className="lg-rise w-full max-w-md">
        <Link href="/" className="lg-focus mb-6 flex items-center justify-center gap-3 rounded-full">
          <Image
            src="/images/Luna_Soft_Essentials_logo.jpeg"
            alt="Luna Soft Essentials"
            width={64}
            height={64}
            className="h-14 w-14 rounded-2xl object-cover ring-1 ring-gold/50"
          />
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold tracking-wide">LUNA SOFT</span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-gold">Essentials Ltd.</span>
          </span>
        </Link>

        <div className="glass-strong rounded-[2rem] p-8">
          <h1 className="text-center font-display text-2xl font-semibold">Welcome back</h1>
          <p className="lg-muted mb-6 mt-1 text-center text-sm">Sign in to your account</p>

          {error && (
            <div role="alert" className="mb-4 rounded-xl border border-red-400/40 bg-red-500/15 p-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium">
              Username
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="lg-input mt-1.5"
                required
              />
            </label>

            <label className="block text-sm font-medium">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="lg-input mt-1.5"
                required
              />
            </label>

            <button type="submit" disabled={loading} className="btn-gold w-full">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="lg-muted mt-6 text-center text-xs leading-relaxed">
            Accounts are created by Luna Soft staff. Need access? Contact our sales team.
          </p>
        </div>

        <p className="mt-5 text-center text-sm">
          <Link href="/" className="lg-muted hover:text-gold-light">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
