"use client";

import { useEffect, useState } from "react";
import { HiCheckCircle, HiXCircle, HiX } from "react-icons/hi";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 5000,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`
        fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3
        shadow-lg backdrop-blur-xl border max-w-sm
        transition-all duration-300 ease-out
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        ${
          type === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }
      `}
    >
      {type === "success" ? (
        <HiCheckCircle size={20} className="shrink-0" />
      ) : (
        <HiXCircle size={20} className="shrink-0" />
      )}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="text-gray-400 hover:text-white transition-colors shrink-0 cursor-pointer"
      >
        <HiX size={16} />
      </button>
    </div>
  );
}
