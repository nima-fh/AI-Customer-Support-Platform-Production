"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AgentAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    // Authentication check completed.
    // Use a microtask so React doesn't complain about
    // synchronous state updates directly inside the effect.
    queueMicrotask(() => {
      setChecking(false);
    });
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090b] text-gray-400">
        <div className="text-sm">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
