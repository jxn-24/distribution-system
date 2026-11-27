"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { submitFeedback } from "@/lib/public-api";
import { site } from "@/lib/site";
import { buttonInk, focusRing, newTab } from "./ui";

const MESSAGE_MAX = 1000;

type Status = "idle" | "sending" | "sent";

const fieldBase =
  "mt-2 block w-full rounded-lg border bg-white px-4 text-base text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-2 focus:ring-amber-400/60";

function StarIcon({ filled, className = "h-7 w-7" }: { filled: boolean; className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
    </svg>
  );
}

export default function FeedbackForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [rating, setRating] = useState<number | null>(null);
  const [messageLength, setMessageLength] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const thanksRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "sent") thanksRef.current?.focus();
  }, [status]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();

    const errors: Record<string, string> = {};
    if (!value("name")) errors.name = "Please enter your name.";
    if (!value("message")) errors.message = "Please write your message.";
    else if (value("message").length < 2) errors.message = "Please write a little more.";
    setFieldErrors(errors);
    setFormError("");
    if (Object.keys(errors).length) {
      (form.elements.namedItem(Object.keys(errors)[0]) as HTMLElement | null)?.focus();
      return;
    }

    setStatus("sending");
    const result = await submitFeedback({
      name: value("name"),
      business_name: value("business_name"),
      contact: value("contact"),
      message: value("message"),
      rating,
      consent_to_publish: data.get("consent_to_publish") === "on",
      website: String(data.get("website") ?? ""),
    });

    if (result.ok) {
      form.reset();
      setRating(null);
      setMessageLength(0);
      setStatus("sent");
      return;
    }

    setStatus("idle");
    if (result.kind === "invalid" && Object.keys(result.fieldErrors).length) {
      setFieldErrors(result.fieldErrors);
      const first = Object.keys(result.fieldErrors)[0];
      (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      setFormError("Please check the highlighted fields.");
      return;
    }
    setFormError(
      result.kind === "throttled"
        ? "You have sent feedback several times in the last hour. Please try again later, or message us on WhatsApp."
        : result.kind === "network"
          ? "We could not send your feedback. Check your internet connection and try again."
          : "Something went wrong on our side. Please try again in a few minutes, or message us on WhatsApp.",
    );
    requestAnimationFrame(() => errorRef.current?.focus());
  }

  if (status === "sent") {
    return (
      <div ref={thanksRef} tabIndex={-1} role="status" className="rounded-2xl border border-amber-600/40 p-7 focus:outline-none sm:p-10">
        <h2 className="font-display text-3xl font-semibold tracking-[-0.015em]">Thank you</h2>
        <span aria-hidden="true" className="mt-5 block h-px w-12 bg-amber-600" />
        <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-neutral-700">
          We have received your feedback. If you left a phone number or email, our team may get back to you.
        </p>
        <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row">
          <Link href="/" className={buttonInk}>Back to home</Link>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 text-[15px] font-semibold text-neutral-950 ring-1 ring-inset ring-neutral-300 hover:ring-neutral-950 ${focusRing}`}
          >
            Send more feedback
          </button>
        </div>
      </div>
    );
  }

  const errorFor = (field: string) =>
    fieldErrors[field] ? (
      <p id={`${field}-error`} className="mt-2 text-sm font-medium text-red-700">{fieldErrors[field]}</p>
    ) : null;
  const describedBy = (field: string, hint?: string) =>
    [hint, fieldErrors[field] ? `${field}-error` : undefined].filter(Boolean).join(" ") || undefined;
  const border = (field: string) => (fieldErrors[field] ? "border-red-600" : "border-neutral-300");

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-7">
      {formError && (
        <div ref={errorRef} tabIndex={-1} role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-800 focus:outline-none">
          {formError}{" "}
          {formError.includes("WhatsApp") && (
            <a href={site.social.whatsapp} {...newTab} className="font-semibold underline underline-offset-4">
              Open WhatsApp
            </a>
          )}
        </div>
      )}

      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="font-medium text-neutral-950">Your name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            aria-invalid={Boolean(fieldErrors.name) || undefined}
            aria-describedby={describedBy("name")}
            className={`${fieldBase} h-12 ${border("name")}`}
          />
          {errorFor("name")}
        </div>
        <div>
          <label htmlFor="business_name" className="font-medium text-neutral-950">
            Business name <span className="font-normal text-neutral-500">(optional)</span>
          </label>
          <input
            id="business_name"
            name="business_name"
            type="text"
            autoComplete="organization"
            maxLength={150}
            aria-invalid={Boolean(fieldErrors.business_name) || undefined}
            aria-describedby={describedBy("business_name")}
            className={`${fieldBase} h-12 ${border("business_name")}`}
          />
          {errorFor("business_name")}
        </div>
      </div>

      <div>
        <label htmlFor="contact" className="font-medium text-neutral-950">
          Phone or email <span className="font-normal text-neutral-500">(optional)</span>
        </label>
        <p id="contact-hint" className="mt-1 text-sm text-neutral-600">Only if you would like us to reply. Never shown on the website.</p>
        <input
          id="contact"
          name="contact"
          type="text"
          autoComplete="email"
          maxLength={150}
          aria-invalid={Boolean(fieldErrors.contact) || undefined}
          aria-describedby={describedBy("contact", "contact-hint")}
          className={`${fieldBase} h-12 sm:max-w-md ${border("contact")}`}
        />
        {errorFor("contact")}
      </div>

      <fieldset>
        <legend className="font-medium text-neutral-950">
          Your rating <span className="font-normal text-neutral-500">(optional)</span>
        </legend>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <label key={star} className="cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  value={star}
                  checked={rating === star}
                  onChange={() => setRating(star)}
                  className="peer sr-only"
                />
                <span className="flex h-11 w-11 items-center justify-center rounded-md text-amber-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-amber-600 hover:text-amber-700">
                  <StarIcon filled={rating !== null && star <= rating} />
                </span>
                <span className="sr-only">{star} out of 5</span>
              </label>
            ))}
          </div>
          {rating !== null && (
            <button
              type="button"
              onClick={() => setRating(null)}
              className={`min-h-11 rounded-md px-2 text-sm text-neutral-600 underline underline-offset-4 hover:text-neutral-950 ${focusRing}`}
            >
              Clear rating
            </button>
          )}
        </div>
        {errorFor("rating")}
      </fieldset>

      <div>
        <label htmlFor="message" className="font-medium text-neutral-950">Your message</label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={MESSAGE_MAX}
          onChange={(event) => setMessageLength(event.target.value.length)}
          aria-invalid={Boolean(fieldErrors.message) || undefined}
          aria-describedby={describedBy("message", "message-count")}
          className={`${fieldBase} py-3 leading-relaxed ${border("message")}`}
        />
        <p id="message-count" className="mt-1.5 text-right text-sm tabular-nums text-neutral-500">
          {messageLength} / {MESSAGE_MAX}
        </p>
        {errorFor("message")}
      </div>

      {/* Honeypot: hidden from people and screen readers; bots that fill it are ignored. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="border-t border-amber-600/40 pt-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="consent_to_publish"
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-neutral-950"
          />
          <span className="text-[16px] leading-relaxed text-neutral-950">
            You may show my name and message on the Luna Soft website
          </span>
        </label>
        <p className="mt-4 text-sm leading-relaxed text-neutral-600">
          We only use your details to respond to you. Tick the box above only if you agree to your message being
          shown publicly.{" "}
          <Link href="/privacy" className={`rounded-sm font-medium text-neutral-950 underline underline-offset-4 ${focusRing}`}>
            Privacy notice
          </Link>
        </p>
      </div>

      <button type="submit" disabled={status === "sending"} className={`${buttonInk} w-full disabled:cursor-wait disabled:opacity-70 sm:w-auto`}>
        {status === "sending" ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}
