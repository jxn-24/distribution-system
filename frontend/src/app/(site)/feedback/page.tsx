import FeedbackForm from "@/components/site/FeedbackForm";
import { PageHero } from "@/components/site/ui";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Share your experience",
  description:
    "Tell Luna Soft Essentials what you think of our products and service. Your feedback helps us serve you better.",
  path: "/feedback",
});

export default function FeedbackPage() {
  return (
    <>
      <PageHero
        title="Share your experience"
        lead="Have you used Luna Soft, or stocked it in your shop? Tell us what you think. It takes about a minute."
        glow="80% 45%"
      />

      <section aria-label="Feedback form" className="bg-white">
        <div className="mx-auto max-w-2xl px-5 py-16 md:py-20">
          <FeedbackForm />
        </div>
      </section>
    </>
  );
}
