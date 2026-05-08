"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { X, Gift } from "lucide-react";

const STORAGE_KEY = "gmall:welcome-seen";

/**
 * #34 — popup chào mừng lần đầu vào website.
 *
 * Flag lưu localStorage ("gmall:welcome-seen") thay vì cookie/sessionStorage:
 *   - localStorage: persist qua close-tab → user thấy 1 lần duy nhất.
 *   - cookie: tốn bandwidth + trùng với accessToken concerns.
 *   - sessionStorage: hiện lại mỗi tab mới — quá phiền.
 *
 * Delay 1s sau mount để tránh chặn LCP / interaction first-load.
 */
const WelcomePopup: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let seen = false;
    try {
      seen = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // localStorage có thể bị block (incognito Safari, storage quota...)
      // → coi như đã thấy để không loop popup mỗi lần load.
      seen = true;
    }
    if (seen) return;
    const t = setTimeout(() => setOpen(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-popup-title"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500 p-8 text-white text-center relative">
          <button
            onClick={dismiss}
            aria-label="Đóng"
            className="absolute top-3 right-3 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X size={18} />
          </button>
          <Gift className="w-14 h-14 mx-auto mb-3" />
          <h2 id="welcome-popup-title" className="text-2xl font-bold">
            Chào mừng đến với GMall!
          </h2>
          <p className="mt-2 text-white/90 text-sm leading-relaxed">
            Nền tảng quà tặng online — nhập mã{" "}
            <span className="font-mono font-bold bg-white text-orange-600 px-2 py-0.5 rounded">
              NEWUSER
            </span>{" "}
            để giảm 10% cho đơn đầu tiên.
          </p>
        </div>
        <div className="p-6 space-y-3">
          <Link
            href="/register"
            onClick={dismiss}
            className="block w-full text-center px-4 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Đăng ký nhận ưu đãi
          </Link>
          <button
            onClick={dismiss}
            className="block w-full text-center px-4 py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Để sau, cảm ơn
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
