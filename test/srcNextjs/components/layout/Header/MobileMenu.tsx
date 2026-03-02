// src/components/layout/Header/MobileMenu.tsx
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useUserStore } from "@/store/useUserStore";
import { useCartStore } from "@/store/useCartStore";
import { HeaderIcons as Icons } from "./HeaderIcons";
import { CloseIcon } from "@/icons";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { user, logout } = useUserStore();
  const totalItems = useCartStore((state) => state.totalItems);

  // Chặn scroll body khi menu mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay: Click ra ngoài để đóng */}
      <div
        className={`fixed inset-0 bg-black/50 z-[1000] transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-[80%] max-w-[320px] bg-white z-[1001] shadow-xl transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 1. Header của Sidebar: Thông tin User */}
        <div className="bg-gradient-to-r from-brand-orange to-orange-400 p-4 text-white">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold border border-white/50">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{user.name}</p>
                <p className="text-xs opacity-90 truncate">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/auth/login"
                className="flex-1 bg-white text-brand-orange py-2 rounded font-bold text-center text-sm shadow-sm"
                onClick={onClose}
              >
                Đăng nhập
              </Link>
              <Link
                href="/auth/register"
                className="flex-1 bg-brand-orange-dark border border-white/30 text-white py-2 rounded font-bold text-center text-sm"
                onClick={onClose}
              >
                Đăng ký
              </Link>
            </div>
          )}
          
          {/* Nút đóng */}
          <button onClick={onClose} className="absolute top-2 right-2 p-1 text-white/80 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 2. Quick Actions: Giỏ hàng & Thông báo (Đã ẩn khỏi Header mobile và đưa vào đây) */}
        <div className="grid grid-cols-2 border-b border-gray-100">
          <Link href="/cart" onClick={onClose} className="flex flex-col items-center justify-center p-4 border-r border-gray-100 hover:bg-gray-50 active:bg-gray-100 relative">
            <div className="relative">
                <Icons.Cart className="w-6 h-6 text-gray-600" />
                {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
                        {totalItems}
                    </span>
                )}
            </div>
            <span className="text-xs text-gray-600 mt-1 font-medium">Giỏ hàng</span>
          </Link>

          <Link href="/user/notifications" onClick={onClose} className="flex flex-col items-center justify-center p-4 hover:bg-gray-50 active:bg-gray-100 relative">
             <div className="relative">
                <Icons.Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-2 -right-1 bg-brand-orange text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
                    3
                </span>
             </div>
            <span className="text-xs text-gray-600 mt-1 font-medium">Thông báo</span>
          </Link>
        </div>

        {/* 3. Menu Links */}
        <div className="overflow-y-auto h-[calc(100%-180px)] p-4 space-y-1">
          <div className="text-xs font-bold text-gray-400 uppercase mb-2">Danh mục</div>
          {["Trang chủ", "Sản phẩm", "Blog", "Về chúng tôi", "Liên hệ"].map((item, idx) => (
             <Link 
                key={idx} 
                href={item === "Trang chủ" ? "/" : `/${item.toLowerCase().replace(/ /g, '-')}`}
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
             >
                {item}
                <Icons.ChevronRight />
             </Link>
          ))}

          <div className="my-4 border-t border-gray-100"></div>
          
          <div className="text-xs font-bold text-gray-400 uppercase mb-2">Tài khoản</div>
          <Link href="/user/profile" onClick={onClose} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
             <Icons.User className="w-5 h-5 text-gray-400" />
             Quản lý tài khoản
          </Link>
          <Link href="/user/orders" onClick={onClose} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
             <Icons.Order className="w-5 h-5 text-gray-400" />
             Đơn mua
          </Link>

          {user && (
            <button 
                onClick={() => { logout(); onClose(); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-500 mt-2"
            >
                <Icons.LogOut className="w-5 h-5" />
                Đăng xuất
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileMenu;