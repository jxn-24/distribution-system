"use client";

import { useEffect, useState } from "react";
import type { Faq } from "@/lib/faqs";
import { PlusIcon } from "./icons";
import { focusRing } from "./ui";

// Accessible accordion (WAI-ARIA pattern): each question is a heading holding a button
// with aria-expanded, and the answer is a labelled region. Opening /faqs#id opens that answer.
export default function FaqAccordion({
  faqs,
  headingLevel = 3,
  idPrefix = "",
}: {
  faqs: Faq[];
  headingLevel?: 2 | 3;
  /** Keeps ids unique if the list appears twice on one site page. */
  idPrefix?: string;
}) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const Heading = headingLevel === 2 ? "h2" : "h3";

  useEffect(() => {
    function openFromHash() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const match = faqs.find((faq) => `${idPrefix}${faq.id}` === id);
      if (match) setOpen((current) => new Set(current).add(match.id));
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [faqs, idPrefix]);

  function toggle(id: string) {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="border-t border-amber-600/40">
      {faqs.map((faq, index) => {
        const isOpen = open.has(faq.id);
        const anchor = `${idPrefix}${faq.id}`;
        return (
          <div key={faq.id} id={anchor} className="border-b border-amber-600/40">
            <Heading className="m-0">
              <button
                type="button"
                id={`${anchor}-q`}
                aria-expanded={isOpen}
                aria-controls={`${anchor}-a`}
                onClick={() => toggle(faq.id)}
                className={`group flex w-full items-start gap-4 py-5 text-left ${focusRing}`}
              >
                <span aria-hidden="true" className="w-7 shrink-0 pt-0.5 font-display text-sm font-semibold tabular-nums text-amber-700">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 font-display text-lg font-medium leading-snug text-neutral-950 group-hover:text-amber-800 sm:text-xl">
                  {faq.question}
                </span>
                <span className="faq-sign mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-amber-700 ring-1 ring-inset ring-amber-600/40">
                  <PlusIcon className="h-4 w-4" />
                </span>
              </button>
            </Heading>
            <div
              id={`${anchor}-a`}
              role="region"
              aria-labelledby={`${anchor}-q`}
              hidden={!isOpen}
              className="pb-6 pl-11 pr-11"
            >
              {faq.answer.map((paragraph) => (
                <p key={paragraph} className="mt-2 max-w-[65ch] text-[16px] leading-relaxed text-neutral-700 first:mt-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
