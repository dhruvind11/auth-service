"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
  children: ReactNode;
}

export default function AuthButton({
  loading = false,
  variant = "primary",
  icon,
  children,
  className = "",
  disabled,
  ...props
}: AuthButtonProps) {
  const baseClasses =
    "w-full flex items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 cursor-pointer disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-60 disabled:shadow-none disabled:hover:from-violet-600 disabled:hover:to-indigo-600",
    secondary:
      "bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] disabled:opacity-60",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Please wait...</span>
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}
