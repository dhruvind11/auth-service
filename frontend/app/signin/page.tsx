"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGoogleLogin } from "@react-oauth/google";
// import AppleLogin from "react-apple-login";
import { HiMail, HiLockClosed } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import {
  signinAPI,
  sendOtpAPI,
  googleAuthAPI,
  appleAuthAPI,
} from "@/services/api/auth";
import AuthCard from "@/components/AuthCard";
import AuthInput from "@/components/AuthInput";
import AuthButton from "@/components/AuthButton";
import Toast from "@/components/Toast";

// const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "";
// const APPLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || "https://localhost:3000";

type Mode = "password" | "otp";

export default function SignInPage() {
  const router = useRouter();
  const { login, checkAuth } = useAuth();

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Please enter a valid email.";
    if (mode === "password") {
      if (!password) errs.password = "Password is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePasswordSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await signinAPI(email.trim(), password, rememberMe);
      login(data.data.accessToken, data.data.refreshToken);
      setToast({ message: "Welcome back!", type: "success" });
      await checkAuth();
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setToast({
        message: error.response?.data?.message || "Invalid credentials.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await sendOtpAPI(email.trim());
      setToast({ message: "OTP sent to your email!", type: "success" });
      setTimeout(
        () => router.push(`/verify-otp?email=${encodeURIComponent(email.trim())}`),
        500
      );
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setToast({
        message: error.response?.data?.message || "Failed to send OTP.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Google popup login
  const googleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      setSocialLoading("google");
      try {
        const { data } = await googleAuthAPI(tokenResponse.access_token);
        login(data.data.accessToken, data.data.refreshToken);
        setToast({ message: "Welcome back!", type: "success" });
        await checkAuth();
        setTimeout(() => router.push("/dashboard"), 500);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setToast({
          message: error.response?.data?.message || "Google sign-in failed.",
          type: "error",
        });
      } finally {
        setSocialLoading(null);
      }
    },
    onError: () => {
      setToast({ message: "Google sign-in was cancelled.", type: "error" });
    },
  });

  // Apple login callback
  const handleAppleResponse = async (response: { authorization?: { id_token?: string }; user?: { name?: { firstName?: string; lastName?: string } } }) => {
    if (!response.authorization?.id_token) {
      setToast({ message: "Apple sign-in failed.", type: "error" });
      return;
    }
    setSocialLoading("apple");
    try {
      const { data } = await appleAuthAPI(
        response.authorization.id_token,
        response.user
      );
      login(data.data.accessToken, data.data.refreshToken);
      setToast({ message: "Welcome back!", type: "success" });
      await checkAuth();
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setToast({
        message: error.response?.data?.message || "Apple sign-in failed.",
        type: "error",
      });
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="auth-bg flex items-center justify-center px-4 py-12">
      <div className="relative z-10 w-full animate-fade-in-up">
        <AuthCard title="Welcome back" subtitle="Sign in to your account">
          {/* Social buttons */}
          <div className="space-y-3 mb-6">
            {/* Google */}
            <button
              type="button"
              onClick={() => googleLogin()}
              disabled={socialLoading !== null}
              className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium cursor-pointer transition-all duration-200 active:scale-[0.98] bg-white text-gray-800 hover:bg-gray-100 border border-gray-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {socialLoading === "google" ? (
                <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <FcGoogle size={20} />
              )}
              <span>Continue with Google</span>
            </button>

            {/* Apple */}
            {/* <AppleLogin
              clientId={APPLE_CLIENT_ID}
              redirectURI={APPLE_REDIRECT_URI}
              usePopup
              callback={handleAppleResponse}
              scope="name email"
              responseMode="form_post"
              render={(renderProps: { onClick: () => void; disabled?: boolean }) => (
                <button
                  type="button"
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled || socialLoading !== null}
                  className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium cursor-pointer transition-all duration-200 active:scale-[0.98] bg-black text-white hover:bg-gray-900 border border-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {socialLoading === "apple" ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <FaApple size={20} />
                  )}
                  <span>Continue with Apple</span>
                </button>
              )}
            /> */}
          </div>

          {/* Divider */}
          <div className="auth-divider mb-6">
            <span>or continue with email</span>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-xl bg-white/5 border border-white/10 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("password")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                mode === "password"
                  ? "bg-violet-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setMode("otp")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                mode === "otp"
                  ? "bg-violet-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Email OTP
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={mode === "password" ? handlePasswordSignIn : handleOtpSend}
            className="space-y-4"
          >
            <AuthInput
              icon={<HiMail size={18} />}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: "" }));
              }}
              error={errors.email}
              autoComplete="email"
            />

            {mode === "password" && (
              <>
                <AuthInput
                  icon={<HiLockClosed size={18} />}
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((p) => ({ ...p, password: "" }));
                  }}
                  error={errors.password}
                  autoComplete="current-password"
                />

                {/* Remember me */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/20 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-sm text-gray-400">Remember me</span>
                </label>
              </>
            )}

            <AuthButton type="submit" loading={loading}>
              {mode === "password" ? "Sign In" : "Send OTP"}
            </AuthButton>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
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
