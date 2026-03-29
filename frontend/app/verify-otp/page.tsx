"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { HiArrowLeft, HiMail } from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
import { verifyOtpAPI, resendOtpAPI } from "@/services/api/auth";
import AuthCard from "@/components/AuthCard";
import AuthButton from "@/components/AuthButton";
import OtpInput from "@/components/OtpInput";
import Toast from "@/components/Toast";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, checkAuth } = useAuth();

  const email = searchParams.get("email") || "";
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.replace("/signin");
    }
  }, [email, router]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleComplete = useCallback(
    async (otp: string) => {
      setLoading(true);
      setOtpError(false);

      try {
        const { data } = await verifyOtpAPI(email, otp);
        login(data.data.accessToken, data.data.refreshToken);
        setToast({ message: "Verified successfully!", type: "success" });
        await checkAuth();
        setTimeout(() => router.push("/dashboard"), 500);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setOtpError(true);
        setToast({
          message: error.response?.data?.message || "Invalid OTP.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [email, login, checkAuth, router]
  );

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setResending(true);
    try {
      await resendOtpAPI(email);
      setCountdown(300);
      setResendCooldown(30); // 30-second resend cooldown
      setOtpError(false);
      setToast({ message: "New OTP sent to your email!", type: "success" });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setToast({
        message: error.response?.data?.message || "Failed to resend OTP.",
        type: "error",
      });
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="auth-bg flex items-center justify-center px-4 py-12">
      <div className="relative z-10 w-full animate-fade-in-up">
        <AuthCard title="Verify your email" subtitle="Enter the 6-digit code we sent to your email">
          {/* Email display */}
          <div className="flex items-center justify-center gap-2 mb-8 px-4 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <HiMail size={16} className="text-violet-400" />
            <span className="text-sm text-violet-300 font-medium truncate">
              {email}
            </span>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <OtpInput
              onComplete={handleComplete}
              disabled={loading || countdown === 0}
              error={otpError}
            />
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            {countdown > 0 ? (
              <p className="text-sm text-gray-400">
                Code expires in{" "}
                <span className="text-violet-400 font-mono font-semibold">
                  {formatTime(countdown)}
                </span>
              </p>
            ) : (
              <p className="text-sm text-red-400">
                Code has expired. Please request a new one.
              </p>
            )}
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="animate-spin h-4 w-4 border-2 border-violet-500 border-t-transparent rounded-full" />
              <span className="text-sm text-gray-400">Verifying...</span>
            </div>
          )}

          {/* Resend button */}
          <AuthButton
            variant="secondary"
            onClick={handleResend}
            loading={resending}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend Code"}
          </AuthButton>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              href="/signin"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <HiArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        </AuthCard>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-bg flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
