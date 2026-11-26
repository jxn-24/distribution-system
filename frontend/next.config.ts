import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The staff sign-in page must never be indexed. The page sets robots metadata too;
  // the header also covers crawlers that do not read the HTML.
  headers() {
    return [
      {
        source: "/staff",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
