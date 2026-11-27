import Link from "next/link";
import SocialIcon from "@/components/SocialIcon";
import { site, telHref } from "@/lib/site";
import { ArrowIcon, PhoneIcon } from "./icons";

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400";
export const newTab = { target: "_blank", rel: "noopener noreferrer" } as const;

const buttonBase = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold transition-colors ${focusRing}`;

/** Gold fill, for night bands. */
export const buttonGold = `${buttonBase} bg-amber-400 text-neutral-950 hover:bg-amber-300`;
/** Hairline gold outline, for night bands. */
export const buttonGhost = `${buttonBase} text-amber-200 ring-1 ring-inset ring-amber-300/50 hover:bg-amber-300/10 hover:text-amber-100`;
/** Black fill with gold text, for white sections. */
export const buttonInk = `${buttonBase} bg-neutral-950 text-amber-300 hover:bg-neutral-800`;
/** Black outline, for white sections. */
export const buttonOutline = `${buttonBase} text-neutral-950 ring-1 ring-inset ring-neutral-300 hover:ring-neutral-950`;

/** Dark page opening shared by the inner pages. */
export function PageHero({
  title,
  lead,
  glow = "78% 30%",
  children,
}: {
  title: string;
  lead: string;
  glow?: string;
  children?: React.ReactNode;
}) {
  const [x, y] = glow.split(" ");
  return (
    <section
      className="site-night"
      style={{ "--glow-x": x, "--glow-y": y } as React.CSSProperties}
    >
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pb-20 sm:pt-20">
        <h1 className="max-w-3xl text-balance font-display text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-6xl">
          {title}
        </h1>
        <span aria-hidden="true" className="mt-6 block h-px w-16 bg-amber-300/70" />
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-neutral-300">{lead}</p>
        {children}
      </div>
    </section>
  );
}

/** Section heading on a white editorial band: black heading over a thin brass rule. */
export function EditorialHeading({
  id,
  title,
  lead,
}: {
  id?: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="max-w-2xl">
      <h2 id={id} className="text-balance font-display text-3xl font-semibold tracking-[-0.015em] text-neutral-950 sm:text-4xl">
        {title}
      </h2>
      <span aria-hidden="true" className="mt-5 block h-px w-12 bg-amber-600" />
      {lead && <p className="mt-5 text-pretty text-[17px] leading-relaxed text-neutral-700">{lead}</p>}
    </div>
  );
}

/** WhatsApp + phone, the two fastest ways to the sales team. */
export function SalesButtons({ tone = "night" }: { tone?: "night" | "paper" }) {
  return (
    <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
      <a
        href={site.social.whatsapp}
        {...newTab}
        aria-label="Chat with our sales team on WhatsApp (opens in a new tab)"
        className={tone === "night" ? buttonGold : buttonInk}
      >
        <SocialIcon network="whatsapp" className="h-5 w-5" />
        WhatsApp us
      </a>
      <a href={telHref} className={tone === "night" ? buttonGhost : buttonOutline}>
        <PhoneIcon className="h-5 w-5" />
        Call {site.phone.display}
      </a>
    </div>
  );
}

/** Quiet text link with an arrow. */
export function ArrowLink({
  href,
  children,
  tone = "paper",
}: {
  href: string;
  children: React.ReactNode;
  tone?: "night" | "paper";
}) {
  const colour =
    tone === "night"
      ? "text-amber-300 decoration-amber-300/40 hover:decoration-amber-300"
      : "text-neutral-950 decoration-amber-600/50 hover:decoration-amber-600";
  return (
    <Link
      href={href}
      className={`group inline-flex min-h-11 items-center gap-2 rounded-md font-semibold underline underline-offset-[6px] ${colour} ${focusRing}`}
    >
      {children}
      <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
