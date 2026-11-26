"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

type LoginError = { kind: "error" | "wait"; message: string };

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400";

function formatWait(seconds: number) {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

// Turns a failed login response into what the page shows. The server answers 429 both
// when the per-IP rate limit trips and when the account is locked; those become a
// distinct "wait" notice. Everything else keeps the message the server sent.
function describeLoginError(err: unknown): LoginError {
  const response = axios.isAxiosError<{ detail?: string; non_field_errors?: string[] }>(err) ? err.response : undefined;
  const detail = response?.data?.detail;

  if (response?.status === 429) {
    // The account-lock message already says how long to wait, so show it as it is.
    if (detail && /try again in/i.test(detail)) return { kind: "wait", message: detail };

    // The rate-limit message ("Expected available in N seconds") is technical, so it is
    // reworded. Retry-After is only readable if the API exposes it to the browser.
    const header = Number(response.headers?.["retry-after"]);
    const fromText = detail?.match(/(\d+)\s*second/i);
    const seconds = Number.isFinite(header) && header > 0 ? header : fromText ? Number(fromText[1]) : 0;
    return {
      kind: "wait",
      message: seconds
        ? `Too many sign-in attempts. Please wait ${formatWait(seconds)} before trying again.`
        : "Too many sign-in attempts. Please wait a few minutes before trying again.",
    };
  }

  if (!response) {
    return { kind: "error", message: "Can’t reach the server. Check your connection and try again." };
  }

  return {
    kind: "error",
    message: response.data?.non_field_errors?.[0] || detail || "Invalid username or password",
  };
}

export default function StaffLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  // Correct way to redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(describeLoginError(err));
    } finally {
      setLoading(false);
    }
  };

  // Show nothing while checking auth or redirecting
  if (isLoading || user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-950">
        <p className="text-neutral-300" role="status">Loading…</p>
      </div>
    );
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-neutral-500 bg-black/50 px-4 text-base text-white placeholder:text-neutral-500 transition-colors focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40";

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-neutral-950 px-4 py-10 text-white">
      {/* Soft gold glow behind the card. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] max-w-[140vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/15 blur-3xl"
      />

      <div className="relative w-full max-w-sm">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] px-6 py-8 shadow-[0_24px_64px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:px-8">
          <div className="flex justify-center">
            <BrandLogo height={56} alt="Luna Soft Essentials" preload />
          </div>

          <h1 className="mt-6 text-center font-display text-2xl font-semibold">Staff sign in</h1>
          <p className="mt-1 text-center text-sm text-neutral-300">For Luna Soft team members only.</p>

          <div className="mt-6 empty:hidden">
            {error?.kind === "wait" && (
              <div role="alert" className="flex gap-3 rounded-xl border border-amber-400/50 bg-amber-400/10 p-3 text-sm text-amber-100">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                <div>
                  <p className="font-semibold text-amber-200">Sign-in paused</p>
                  <p className="mt-0.5">{error.message}</p>
                </div>
              </div>
            )}
            {error?.kind === "error" && (
              <p role="alert" className="rounded-xl border border-red-400/50 bg-red-500/10 p-3 text-sm text-red-200">
                {error.message}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-neutral-100">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-100">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-20`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-controls="password"
                  aria-pressed={showPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className={`absolute inset-y-1 right-1 rounded-lg px-3 text-sm font-medium text-amber-300 hover:bg-white/10 ${focusRing}`}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 text-base font-semibold text-neutral-950 transition-colors hover:bg-amber-300 disabled:cursor-wait disabled:opacity-80 ${focusRing}`}
            >
              {loading && (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 animate-spin motion-reduce:animate-none" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-400">
            Forgot your password? Ask an administrator to reset it.
          </p>
        </div>

        <p className="mt-6 text-center">
          <Link href="/" className={`inline-flex min-h-11 items-center rounded-md px-2 text-sm text-neutral-300 underline-offset-4 hover:text-amber-300 hover:underline ${focusRing}`}>
            ← Back to website
          </Link>
        </p>
      </div>
    </main>
  );
}
