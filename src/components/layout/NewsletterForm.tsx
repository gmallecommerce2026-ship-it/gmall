"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { NewsletterService } from "@/services/newsletter.service";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface NewsletterFormProps {
  sourceTag?: string;
}

const NewsletterForm = ({ sourceTag = "footer" }: NewsletterFormProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      toast.error("Email không hợp lệ");
      return;
    }
    setLoading(true);
    try {
      const res = await NewsletterService.subscribe(trimmed, sourceTag);
      if (res?.alreadySubscribed) {
        toast("Email đã được đăng ký từ trước", { icon: "ℹ️" });
      } else {
        toast.success("Đăng ký thành công! Cảm ơn bạn.");
      }
      setEmail("");
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(typeof msg === "string" ? msg : "Đăng ký thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full md:w-1/2 flex gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="Nhập email của bạn..."
        className="flex-1 px-4 py-3 rounded border border-gray-200 text-sm focus:outline-none focus:border-brand-orange transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-gray-900 text-white px-6 py-3 rounded text-sm font-bold hover:bg-brand-orange transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Đang gửi..." : "Đăng ký"}
      </button>
    </form>
  );
};

export default NewsletterForm;
