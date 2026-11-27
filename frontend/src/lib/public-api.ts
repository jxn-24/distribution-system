// Calls to the backend's public (no-login) endpoints. Kept apart from lib/api.ts,
// which attaches staff tokens.

const browserBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

/** On the server, API_URL may point at a private address; the browser always uses the public one. */
export function apiBase() {
  if (typeof window === "undefined") return (process.env.API_URL || browserBase).replace(/\/$/, "");
  return browserBase.replace(/\/$/, "");
}

export type Testimonial = {
  display_name: string;
  message: string;
  rating: number | null;
  source: string;
};

/**
 * Approved, consented testimonials. The backend filters; this only shapes the result.
 * Any failure (backend down, bad response) returns an empty list, so the site shows
 * the invitation instead of testimonials — never placeholder quotes.
 */
export async function getTestimonials(revalidateSeconds: number): Promise<Testimonial[]> {
  try {
    const response = await fetch(`${apiBase()}/public/testimonials/`, {
      next: { revalidate: revalidateSeconds },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    if (!Array.isArray(data)) return [];
    return data.filter(
      (item): item is Testimonial =>
        typeof item?.display_name === "string" &&
        typeof item?.message === "string" &&
        item.message.trim() !== "" &&
        typeof item?.source === "string" &&
        (item.rating === null || typeof item.rating === "number"),
    );
  } catch {
    return [];
  }
}

export type FeedbackInput = {
  name: string;
  business_name: string;
  contact: string;
  message: string;
  rating: number | null;
  consent_to_publish: boolean;
  /** Honeypot: always empty for people. */
  website: string;
};

export type FeedbackResult =
  | { ok: true }
  | { ok: false; kind: "invalid"; fieldErrors: Record<string, string> }
  | { ok: false; kind: "throttled" | "network" | "server" };

export async function submitFeedback(input: FeedbackInput): Promise<FeedbackResult> {
  let response: Response;
  try {
    response = await fetch(`${apiBase()}/public/feedback/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    return { ok: false, kind: "network" };
  }
  if (response.ok) return { ok: true };
  if (response.status === 429) return { ok: false, kind: "throttled" };
  if (response.status === 400) {
    const fieldErrors: Record<string, string> = {};
    try {
      const body = (await response.json()) as Record<string, unknown>;
      for (const [field, value] of Object.entries(body)) {
        const first = Array.isArray(value) ? value[0] : value;
        if (typeof first === "string") fieldErrors[field] = first;
      }
    } catch {
      // Fall through with no field detail.
    }
    return { ok: false, kind: "invalid", fieldErrors };
  }
  return { ok: false, kind: "server" };
}
