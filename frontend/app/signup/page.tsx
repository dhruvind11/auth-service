"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGoogleLogin } from "@react-oauth/google";
// import AppleLogin from "react-apple-login";
import { HiMail, HiLockClosed, HiUser } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { signupAPI, googleAuthAPI, appleAuthAPI } from "@/services/api/auth";
import AuthCard from "@/components/AuthCard";
import AuthInput from "@/components/AuthInput";
import AuthButton from "@/components/AuthButton";
import Toast from "@/components/Toast";

// const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "";
// const APPLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || "https://localhost:3000";

export default function SignUpPage() {
  const router = useRouter();
  const { login, checkAuth } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required.";
    else if (name.trim().length < 2) errs.name = "Name must be at least 2 characters.";
    if (!email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Please enter a valid email.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      errs.password = "Must include uppercase, lowercase, and a number.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await signupAPI(name.trim(), email.trim(), password);
      login(data.data.accessToken, data.data.refreshToken);
      setToast({ message: "Account created successfully!", type: "success" });
      await checkAuth();
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setToast({
        message: error.response?.data?.message || "Something went wrong.",
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
        // Get id_token by calling Google userinfo with access_token,
        // then use the credential flow instead
        const { data } = await googleAuthAPI(tokenResponse.access_token);
        login(data.data.accessToken, data.data.refreshToken);
        setToast({ message: "Signed in with Google!", type: "success" });
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
      setToast({ message: "Signed in with Apple!", type: "success" });
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
        <AuthCard title="Create an account" subtitle="Start your journey with us">
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
            <span>or sign up with email</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              icon={<HiUser size={18} />}
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: "" }));
              }}
              error={errors.name}
              autoComplete="name"
            />
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
            <AuthInput
              icon={<HiLockClosed size={18} />}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: "" }));
              }}
              error={errors.password}
              autoComplete="new-password"
            />
            <AuthButton type="submit" loading={loading}>
              Create Account
            </AuthButton>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              Sign in
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
