'use client';
// Wiki 0063: admin dashboard search box — trước decorative, giờ submit →
// redirect tới /admin/orders?search=<q> (page đó đã có debounced search).
// Audit Admin #2.
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch } from 'react-icons/fi';

export default function AdminSearchBox() {
  const router = useRouter();
  const [q, setQ] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    // Mặc định search trong đơn hàng (use case phổ biến nhất).
    router.push(`/admin/orders?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form
      onSubmit={submit}
      className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-200 transition-all"
    >
      <FiSearch className="text-gray-400 mr-2" />
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm đơn hàng, email, mã..."
        className="bg-transparent border-none outline-none text-sm w-full text-gray-600 placeholder-gray-400"
      />
    </form>
  );
}
