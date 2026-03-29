"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  error?: string;
  label?: string;
}

export default function AuthInput({
  icon,
  error,
  label,
  type,
  className = "",
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-400 transition-colors duration-200">
            {icon}
          </span>
        )}
        <input
          type={isPassword && showPassword ? "text" : type}
          className={`
            w-full rounded-xl border border-white/10 bg-white/5
            px-4 py-3 text-sm text-white placeholder-gray-500
            outline-none backdrop-blur-sm
            transition-all duration-200
            focus:border-violet-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-violet-500/20
            hover:border-white/20
            ${icon ? "pl-11" : ""}
            ${isPassword ? "pr-11" : ""}
            ${error ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20" : ""}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
            tabIndex={-1}
          >
            {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
          {error}
        </p>
      )}
    </div>
  );
}
