'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Link2, Gift, Heart, Wallet, BookOpen, User, StepBackIcon } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

const AffiliateLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUserStore();
  
  // State check auth
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Nếu store chưa load xong hoặc user null, cần xử lý cẩn thận
      // Tuy nhiên với logic đơn giản:
      if (!user) {
        const returnUrl = encodeURIComponent(pathname);
        router.push(`/login?callbackUrl=${returnUrl}`);
        return;
      }
      setIsChecking(false);
    };
    checkAuth();
  }, [user, router, pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Đang kiểm tra thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="text-2xl font-bold text-primary-600">Logo</Link>
          <span className="text-xs font-semibold text-gray-500 block mt-1">AFFILIATE PROGRAM</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* SỬA TẠI ĐÂY: Truyền đường dẫn đầy đủ (Absolute Path) */}
          <NavItem href="/affiliate/dashboard" icon={<LayoutDashboard size={20} />} label="Tổng quan" />
          <NavItem href="/affiliate/links" icon={<Link2 size={20} />} label="Quản lý Link" />
          <NavItem href="/affiliate/campaigns" icon={<Gift size={20} />} label="Chiến dịch" />
          <NavItem href="/affiliate/charity" icon={<Heart size={20} />} label="Quỹ từ thiện" />
          <NavItem href="/affiliate/wallet" icon={<Wallet size={20} />} label="Thu nhập" />
          <NavItem href="/affiliate/guide" icon={<BookOpen size={20} />} label="Hướng dẫn" />
          <NavItem href="/affiliate/profile" icon={<User size={20} />} label="Hồ sơ" />
          
          <Link href={`/`} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors group">
            <span className="group-hover:text-primary-600 text-gray-400">{<StepBackIcon size={20} />}</span>
            <span className="font-medium">Trở lại website</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
               {user?.avatar ? (
                 <img src={user.avatar} alt="User" className="w-full h-full object-cover"/>
               ) : (
                 <span className="font-bold text-gray-500">{user?.name?.charAt(0) || 'U'}</span>
               )}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium truncate">{user?.name || 'Thành viên'}</p>
               <p className="text-xs text-gray-500 truncate">{user?.email}</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <header className="md:hidden flex justify-between items-center mb-6">
           <Link href="/affiliate/dashboard" className="font-bold text-lg">Affiliate Dashboard</Link>
        </header>
        
        {children}
      </main>
    </div>
  );
};

// Component NavItem đã được sửa logic
const NavItem = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => {
  const pathname = usePathname();
  
  // Logic kiểm tra Active chuẩn xác hơn
  // Kiểm tra nếu pathname hiện tại bắt đầu bằng href của item
  // Ví dụ: pathname là "/affiliate/links/create" vẫn sẽ active tab "/affiliate/links"
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link 
      href={href} 
      // Không cộng chuỗi thủ công ở đây nữa, dùng trực tiếp href chuẩn từ cha truyền xuống
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${
        isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
      }`}
    >
      <span className={isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'}>{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export default AffiliateLayout;