"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignUpDisabledPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <p className="text-sm text-white/70">Redirecting...</p>
    </div>
  );
}