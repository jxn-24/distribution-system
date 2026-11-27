import type { Testimonial } from "@/lib/public-api";

function Stars({ rating }: { rating: number }) {
  return (
    <p className="flex items-center gap-0.5 text-amber-600">
      <span className="sr-only">Rated {rating} out of 5</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="h-4 w-4" fill={star <= rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
          <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
        </svg>
      ))}
    </p>
  );
}

// Approved, consented customer words only. Rendered by Home when the list is non-empty.
export default function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <ul className="grid gap-x-12 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <li key={`${item.display_name}-${index}`} className="border-t border-amber-600/40 py-7">
          <figure className="flex h-full flex-col">
            {item.rating !== null && item.rating >= 1 && item.rating <= 5 && <Stars rating={item.rating} />}
            <blockquote className="mt-4 flex-1 whitespace-pre-line text-pretty text-[17px] leading-relaxed text-neutral-800">
              “{item.message}”
            </blockquote>
            <figcaption className="mt-5 text-[15px]">
              <span className="font-display font-semibold text-neutral-950">{item.display_name}</span>
              {item.source !== "Website" && <span className="text-neutral-500"> · via {item.source}</span>}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
