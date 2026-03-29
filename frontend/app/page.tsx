"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/signin");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="auth-bg flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
    </div>
  );
}
