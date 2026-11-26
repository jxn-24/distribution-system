import type { SocialNetwork } from "@/lib/site";

// Small inline brand glyphs, drawn in currentColor so they follow the link's text colour.
// Decorative only: every link that uses one also carries a visible word and a label.
export default function SocialIcon({ network, className = "h-5 w-5" }: { network: SocialNetwork; className?: string }) {
  const common = { "aria-hidden": true, focusable: false, viewBox: "0 0 24 24", className } as const;

  switch (network) {
    case "instagram":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common} fill="currentColor">
          <path d="M14 8.5V6.9c0-.8.5-1.4 1.4-1.4H17V2.2c-.3 0-1.4-.2-2.7-.2-2.7 0-4.3 1.6-4.3 4.5v2H7.2V12H10v10h4V12h2.8l.5-3.5H14z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common} fill="currentColor">
          <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.6 2.6 0 0 1-2.6-2.6 2.6 2.6 0 0 1 3.4-2.47V9.67a5.7 5.7 0 0 0-.8-.06 5.73 5.73 0 0 0-5.72 5.73A5.73 5.73 0 0 0 9.86 21a5.73 5.73 0 0 0 5.73-5.73V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.29-1.48z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.5 20.5l1.3-4.1A8.5 8.5 0 1 1 8 19.4z" />
          <path
            d="M9.1 7.9c.3-.3.7-.3.9 0l.9 1.6c.1.3.1.6-.1.8l-.5.6c.5 1.1 1.4 2 2.5 2.5l.6-.5c.2-.2.5-.2.8-.1l1.6.9c.3.2.3.6 0 .9l-.6.7c-.5.5-1.2.6-1.9.4-2.2-.8-3.9-2.5-4.7-4.7-.2-.7-.1-1.4.4-1.9z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );
  }
}
