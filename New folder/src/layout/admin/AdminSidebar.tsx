// src/layout/admin/AdminSidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FiHome, 
  FiUsers, 
  FiShoppingBag, 
  FiBox, 
  FiSettings, 
  FiLogOut, 
  FiChevronDown, 
  FiShield,
  FiPackage, 
  FiLayers,  
  FiDollarSign, 
  FiFileText,
  FiGift
} from 'react-icons/fi';
import classNames from 'classnames';

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

// Menu Admin đã được mở rộng
const ADMIN_MENU: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Tổng quan',
    icon: <FiHome size={20} />,
    path: '/admin/dashboard',
  },
  {
    id: 'orders',
    label: 'Quản lý đơn hàng',
    icon: <FiPackage size={20} />,
    path: '/admin/orders',
  },
  {
    id: 'users',
    label: 'Quản lý người dùng',
    icon: <FiUsers size={20} />,
    children: [
      { id: 'all_users', label: 'Danh sách người dùng', path: '/admin/users' },
      { id: 'sellers', label: 'Danh sách người bán', path: '/admin/users/sellers' },
      { id: 'seller_approval', label: 'Duyệt người bán', path: '/admin/users/approvals' },
    ]
  },
  {
    id: 'shops',
    label: 'Quản lý cửa hàng',
    icon: <FiShoppingBag size={20} />,
    children: [
      { id: 'active_shops', label: 'Cửa hàng hoạt động', path: '/admin/shops' },
      { id: 'violation_shops', label: 'Vi phạm & Khóa', path: '/admin/shops/violations' },
    ]
  },
  {
    id: 'products',
    label: 'Sản phẩm & Danh mục',
    icon: <FiBox size={20} />,
    children: [
      { id: 'all_products', label: 'Tất cả sản phẩm', path: '/admin/products' },
      // --- THÊM MỚI TẠI ĐÂY ---
      { id: 'product_approvals', label: 'Duyệt sản phẩm', path: '/admin/products/approvals' },
      // ------------------------
      { id: 'categories', label: 'Danh mục ngành hàng', path: '/admin/categories' },
      { id: 'reported_products', label: 'Sản phẩm bị báo cáo', path: '/admin/products/reports' },
    ]
  },
  {
    id: 'finance',
    label: 'Tài chính & Doanh thu',
    icon: <FiDollarSign size={20} />,
    children: [
      { id: 'revenue', label: 'Doanh thu sàn', path: '/admin/finance/revenue' },
      { id: 'payouts', label: 'Yêu cầu rút tiền', path: '/admin/finance/payouts' },
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing & Khuyến mãi',
    icon: <FiGift size={20} />,
    children: [
      { id: 'vouchers', label: 'Quản lý Voucher', path: '/admin/marketing/vouchers' },
      // Có thể thêm Flash Sale, Banner sau này
    ]
  },
  {
    id: 'content',
    label: 'Nội dung & Bài viết',
    icon: <FiFileText size={20} />,
    path: '/admin/content',
  },
  {
    id: 'system',
    label: 'Hệ thống & Cài đặt',
    icon: <FiSettings size={20} />,
    children: [
      { id: 'banners', label: 'Banner & Marketing', path: '/admin/settings/banners' },
      { id: 'shipping', label: 'Đơn vị vận chuyển', path: '/admin/settings/shipping' },
      { id: 'permissions', label: 'Phân quyền Admin', path: '/admin/settings/permissions' },
    ]
  },
];

const SidebarItem = ({ item, level = 0, isOpen, toggleOpen }: { 
  item: MenuItem, level?: number, isOpen: (id: string) => boolean, toggleOpen: (id: string) => void
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const hasChildren = item.children && item.children.length > 0;
  
  const checkActive = (menuItemPath?: string) => {
    if (!menuItemPath) return false;
    return pathname.startsWith(menuItemPath);
  };

  const isSelfActive = checkActive(item.path);
  const isChildActive = item.children?.some(child => checkActive(child.path));
  const isActive = isSelfActive || isChildActive;
  
  useEffect(() => {
    if (isChildActive && !isOpen(item.id)) {
      toggleOpen(item.id);
    }
  }, [pathname, isChildActive, item.id, isOpen, toggleOpen]);

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      toggleOpen(item.id);
      return;
    }
    if (item.path && item.path === pathname) {
        e.preventDefault(); 
    }
  };

  return (
    <div className="w-full select-none">
      <Link 
        href={item.path || '#'}
        onClick={handleClick}
        className={classNames(
          "flex items-center justify-between py-3.5 px-6 text-sm transition-all duration-200 cursor-pointer group hover:bg-gray-50",
          {
            "text-[#E78720] bg-orange-50/80 font-semibold border-r-[3px] border-[#E78720]": isActive && level === 0,
            "text-gray-600": !isActive && level === 0,
            "pl-12 py-3": level === 1,
            "text-[#E78720] font-medium": isSelfActive && level > 0,
            "text-gray-500 hover:text-[#E78720]": !isSelfActive && level > 0,
          }
        )}
      >
        <div className="flex items-center gap-3.5">
          {level === 0 && (
            <span className={isActive ? "text-[#E78720]" : "text-gray-400 group-hover:text-[#E78720]"}>
              {item.icon}
            </span>
          )}
          <span className="truncate">{item.label}</span>
        </div>
        {hasChildren && (
          <FiChevronDown 
            size={16} 
            className={classNames(
              "text-gray-400 transition-transform duration-200", 
              isOpen(item.id) ? "rotate-180" : ""
            )} 
          />
        )}
      </Link>
      
      <div 
        className={classNames(
          "overflow-hidden transition-all duration-300 bg-gray-50/30", 
          isOpen(item.id) ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
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

const AdminSidebar = () => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ 
    'users': true,
    'products': true 
  });
  
  const toggleOpen = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="fixed top-0 left-0 w-[260px] h-screen bg-white border-r border-gray-200 shadow-sm z-50 flex flex-col">
      <div className="h-[80px] flex items-center px-6 border-b border-gray-100 gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-gray-300">
          <FiShield size={18}/>
        </div>
        <div>
            <h1 className="font-bold text-lg text-gray-800 leading-none">LoveGifts</h1>
            <span className="text-[10px] text-gray-500 font-bold tracking-wide uppercase">Admin Portal</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-1">
        {ADMIN_MENU.map(item => (
          <SidebarItem 
            key={item.id} 
            item={item} 
            isOpen={(id) => !!openItems[id]} 
            toggleOpen={toggleOpen} 
          />
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <FiLogOut size={18} /> <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default React.memo(AdminSidebar);