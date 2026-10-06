"use client";

import dynamic from "next/dynamic";

const ScanClient = dynamic(() => import("./scan-client"), { ssr: false });

export default function ScanLoader() {
  return <ScanClient />;
}