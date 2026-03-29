"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { HiLogout, HiMail, HiUser, HiShieldCheck } from "react-icons/hi";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/signin");
  };

  if (loading) {
    return (
      <div className="auth-bg flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="auth-bg flex items-center justify-center px-4 py-12">
      <div className="relative z-10 w-full max-w-lg animate-fade-in-up">
        {/* Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gray-900/80 backdrop-blur-xl shadow-2xl shadow-black/20">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

          <div className="px-8 pt-8 pb-8">
            {/* Success badge */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center animate-pulse-glow">
                <HiShieldCheck size={32} className="text-emerald-400" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Welcome back!
            </h1>
            <p className="text-sm text-gray-400 text-center mb-8">
              You are successfully authenticated.
            </p>

            {/* User info */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <HiUser size={18} className="text-violet-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm text-white font-medium truncate">
                    {user.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <HiMail size={18} className="text-violet-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-white font-medium truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <HiShieldCheck size={18} className="text-violet-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Auth Provider</p>
                  <p className="text-sm text-white font-medium capitalize">
                    {user.provider}
                  </p>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold cursor-pointer bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all duration-200 active:scale-[0.98]"
            >
              <HiLogout size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
