import type { Metadata } from "next";
import StaffLogin from "./staff-login";

// Staff sign-in. Not linked from the public site, kept out of search engines,
// and deliberately absent from any sitemap.
export const metadata: Metadata = {
  title: "Staff sign in · Luna Soft Essentials",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function StaffPage() {
  return <StaffLogin />;
}
