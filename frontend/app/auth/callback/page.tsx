"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, checkAuth } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const error = searchParams.get("error");

    if (error) {
      router.replace("/signin?error=oauth_failed");
      return;
    }

    if (accessToken && refreshToken) {
      login(accessToken, refreshToken);
      checkAuth().then(() => {
        router.replace("/dashboard");
      });
    } else {
      router.replace("/signin");
    }
  }, [searchParams, login, checkAuth, router]);

  return (
    <div className="auth-bg flex items-center justify-center flex-col gap-4">
      <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      <p className="text-sm text-gray-400">Completing sign in...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-bg flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
