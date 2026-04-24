// src/layout/seller/SellerSidebar.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react'; // [1] Import Suspense
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { 
  FiHome, FiBox, FiShoppingBag, 
  FiChevronDown, FiLogOut, FiTruck, FiClipboard, 
  FiGift
} from 'react-icons/fi';
import { HelpCircle, Settings } from 'lucide-react';
import classNames from 'classnames';
import { SellerAuthService } from '@/services/SellerAuthService';
import { useUserStore } from '@/store/useUserStore';

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

const SELLER_MENU: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Tổng quan',
    icon: <FiHome size={20} />,
    path: '/seller-dashboard',
  },
  {
    id: 'orders',
    label: 'Quản lý đơn hàng',
    icon: <FiShoppingBag size={20} />,
    children: [
      { id: 'all_orders', label: 'Tất cả đơn hàng', path: '/seller-dashboard/orders?tab=all' },
      { id: 'bulk_delivery', label: 'Giao hàng loạt', path: '/seller-dashboard/orders?tab=bulk-delivery' },
      { id: 'handover', label: 'Bàn giao vận chuyển', path: '/seller-dashboard/orders?tab=handover' },
      { id: 'return_orders', label: 'Trả hàng / Hoàn tiền', path: '/seller-dashboard/orders?tab=return' },
    ]
  },
  {
    id: 'shipping_settings',
    label: 'Cài đặt vận chuyển',
    icon: <FiTruck size={20} />,
    path: '/seller-dashboard/shipping/settings',
  },
  {
    id: 'products',
    label: 'Quản lý sản phẩm',
    icon: <FiBox size={20} />,
    children: [
      { id: 'all_products', label: 'Tất cả sản phẩm', path: '/seller-dashboard/products/all' },
      { id: 'add_product', label: 'Thêm sản phẩm mới', path: '/seller-dashboard/products/add' },
      { id: 'crawler', label: "Crawl Shopee (Beta)", path: "/seller-dashboard/products/crawler" },
      { id: 'shop_categories', label: 'Danh mục của Shop', path: '/seller-dashboard/categories' },
    ]
  },
  {
    id: 'marketing',
    label: 'Kênh Marketing',
    icon: <FiGift size={20} />,
    children: [
      { id: 'seller-flash-sale', label: 'Flash Sale', path: '/seller-dashboard/promotions/flash-sale' },
      { id: 'promotion_list', label: 'Quản lý mã giảm giá', path: '/seller-dashboard/promotions' },
      { id: 'promotion_create', label: 'Tạo mã giảm giá', path: '/seller-dashboard/promotions/create' },
      // { id: 'using_voucher_history', label: 'Lịch sử dùng vouchers của khách hàng', path: '/seller-dashboard/promotions/create' },
    ]
  },
  {
    id: 'profile',
    label: "Hồ sơ & trang trí Shop",
    icon: <Settings size={20} />, 
    children: [
      { id: 'shop_profile', label: 'Hồ sơ Shop', path: '/seller-dashboard/settings/profile' },
      { id: 'shop_custom', label: 'Trang trí shop', path: '/seller-dashboard/decoration' },
    ]
  },
  {
    id: 'help',
    label: "Trợ giúp",
    icon: <HelpCircle size={20} />, 
    children: [
      { id: 'reports', label: 'Khiếu nại', path: '/seller-dashboard/help/reports' },
      { id: 'technical_support', label: 'Hỗ trợ kĩ thuật', path: '/seller-dashboard/help/technical-support' }, 
      { id: 'policies_privacy', label: 'Điều khoản & chính sách', path: '/seller-dashboard/help/policies' },
    ]
  }
];

// Component này sử dụng useSearchParams -> Cần được bao bọc bởi Suspense ở component cha
const SidebarItem = ({ item, level = 0, isOpen, toggleOpen }: { 
  item: MenuItem, level?: number, isOpen: (id: string) => boolean, toggleOpen: (id: string) => void
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // [Nguyên nhân gây lỗi build nếu không có Suspense]

  const hasChildren = item.children && item.children.length > 0;
  
  const checkActive = (menuItemPath?: string) => {
    if (!menuItemPath) return false;
    const [pathBase, queryString] = menuItemPath.split('?');
    
    if (pathBase !== pathname) return false;
    
    if (queryString) {
      const currentTab = searchParams.get('tab');
      const itemTab = new URLSearchParams(queryString).get('tab');
      return currentTab === itemTab;
    }
    return true;
  };

  const isSelfActive = checkActive(item.path);
  const isChildActive = item.children?.some(child => checkActive(child.path));
  const isActive = isSelfActive || (hasChildren && isChildActive);
  const isMenuOpen = isOpen(item.id);

  useEffect(() => {
    if (isChildActive && !isMenuOpen) {
      toggleOpen(item.id);
    }
  }, [pathname, searchParams, isChildActive, item.id, isMenuOpen, toggleOpen]);

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      toggleOpen(item.id);
      return;
    }

    if (item.path) {
      const [pathBase] = item.path.split('?');
      if (pathBase === pathname) {
        e.preventDefault(); 
        router.push(item.path, { scroll: false }); 
      }
    }
  };

  return (
    <div className="w-full select-none mb-1">
      <Link 
        href={item.path || '#'}
        onClick={handleClick}
        className={classNames(
          "flex items-center justify-between mx-3 py-2.5 px-3 rounded-lg text-sm transition-all duration-200 cursor-pointer group relative",
          {
            "bg-orange-50 text-orange-600 font-semibold shadow-sm": isActive && level === 0,
            "text-gray-600 hover:bg-gray-100 hover:text-gray-900": !isActive && level === 0,
            "pl-4 py-2 mt-1": level === 1,
            "text-orange-600 font-medium bg-orange-50/50": isSelfActive && level > 0,
            "text-gray-500 hover:text-orange-600 hover:bg-gray-50": !isSelfActive && level > 0,
          }
        )}
      >
        <div className="flex items-center gap-3 relative z-10">
          {level === 0 && (
            <span className={classNames("transition-colors", isActive ? "text-orange-600" : "text-gray-400 group-hover:text-gray-600")}>
              {item.icon}
            </span>
          )}
          {level === 1 && (
            <div className={classNames("w-1.5 h-1.5 rounded-full transition-colors mr-2", isSelfActive ? "bg-orange-500" : "bg-gray-300 group-hover:bg-orange-300")}></div>
          )}
          <span className="truncate">{item.label}</span>
        </div>
        
        {hasChildren && (
          <FiChevronDown 
            size={16} 
            className={classNames(
              "transition-transform duration-300", 
              isMenuOpen ? "rotate-180 text-orange-500" : "text-gray-400"
            )} 
          />
        )}
      </Link>

      <div 
        className={classNames(
          "overflow-hidden transition-all duration-300 ease-in-out ml-3 border-l border-gray-100",
          isMenuOpen ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0 mt-0"
        )}
      >
        {item.children?.map(child => (
          <SidebarItem 
            key={child.id} 
            item={child} 
            level={level + 1} 
            isOpen={isOpen} 
            toggleOpen={toggleOpen} 
          />
        ))}
      </div>
    </div>
  );
};

// [2] Đổi tên component chính thành SellerSidebarContent
const SellerSidebarContent = () => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'orders': false,
    'products': true
  });
  const router = useRouter();
  const { user } = useUserStore();
  const toggleOpen = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const handleLogout = async () => {
    try {
      // 1. Gọi API để xóa Cookie ở Backend
      await SellerAuthService.logout();
      
      // 2. Xóa thông tin User trong Client State (Zustand)
      useUserStore.getState().logout();

      // 3. Dùng window.location.href để reload sạch sẽ state và chuyển về login
      window.location.href = '/seller/login';
    } catch (error) {
      console.error('Đăng xuất thất bại:', error);
      // Vẫn force logout nếu lỗi API
      window.location.href = '/seller/login';
    }
  };
  return (
    <aside className="fixed top-0 left-0 w-[260px] h-screen bg-white border-r border-gray-200 shadow-sm z-50 flex flex-col font-sans">
      {/* Header */}
      <div className="h-[70px] flex items-center px-5 border-b border-gray-100 gap-3 shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-[#E78720] to-[#FFB05C] rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
          S
        </div>
        <div className="flex flex-col">
            <h1 className="font-bold text-gray-800 text-base leading-tight">Seller Hub</h1>
            <span className="text-[11px] text-gray-400 font-medium">QUẢN LÝ CỬA HÀNG</span>
        </div>
      </div>

      {/* Shop info block (B7.1, B7.2) — hiển thị seller đang ở shop nào.
          Trước đây sidebar chỉ có "Seller Hub" generic, seller login nhiều
          account không biết mình đang ở cái nào. */}
      {user && (
        <div className="px-4 py-3 border-b border-gray-100 bg-orange-50/40">
          <div className="flex items-center gap-3">
            {user.coverImage || user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.coverImage || user.avatar}
                alt={user.shopName || 'Shop avatar'}
                className="w-10 h-10 rounded-lg object-cover border border-orange-100"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                {(user.shopName || user.name || 'S').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">
                {user.shopName || user.name || 'Shop của bạn'}
              </p>
              <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
              {(user as any).phone && (
                <p className="text-[11px] text-gray-400 truncate">
                  SĐT: {(user as any).phone}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Menu List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
        {SELLER_MENU.map(item => (
          <SidebarItem 
            key={item.id} 
            item={item} 
            isOpen={(id) => !!openItems[id]} 
            toggleOpen={toggleOpen} 
          />
        ))}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/30 shrink-0">
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group font-medium">
            <FiLogOut size={18} className="group-hover:translate-x-[-2px] transition-transform" /> 
            <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

// [3] Tạo component Wrapper bọc Suspense để export
const SellerSidebar = () => {
  return (
    // Fallback UI đơn giản để tránh layout shift quá nhiều khi load
    <Suspense fallback={<div className="fixed top-0 left-0 w-[260px] h-screen bg-white border-r border-gray-200 z-50" />}>
      <SellerSidebarContent />
    </Suspense>
  );
};

export default React.memo(SellerSidebar);