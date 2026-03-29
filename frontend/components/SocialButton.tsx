"use client";

import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

interface SocialButtonProps {
  provider: "google" | "apple";
  label?: string;
  onClick?: () => void;
}

export default function SocialButton({
  provider,
  label,
  onClick,
}: SocialButtonProps) {
  const config = {
    google: {
      icon: <FcGoogle size={20} />,
      text: label || "Continue with Google",
      className:
        "bg-white text-gray-800 hover:bg-gray-100 border border-gray-200 shadow-sm",
    },
    apple: {
      icon: <FaApple size={20} className="text-white" />,
      text: label || "Continue with Apple",
      className:
        "bg-black text-white hover:bg-gray-900 border border-gray-700",
    },
  };

  const { icon, text, className } = config[provider];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium cursor-pointer transition-all duration-200 active:scale-[0.98] ${className}`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}
