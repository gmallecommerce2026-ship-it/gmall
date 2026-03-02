// src/layout/admin/AdminSidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FiHome, 
  FiUsers, 
  FiBox, 
  FiLogOut, 
  FiChevronDown, 
  FiShield,
  FiPackage, 
  FiLayers,  
  FiDollarSign, 
  FiFileText,
  FiGift,
  FiMoon,
  FiTag // Thêm icon Tag
} from 'react-icons/fi';
import classNames from 'classnames';
import { AdminService } from '@/services/AdminService';

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  exact?: boolean; // [NEW] Thêm thuộc tính exact để bắt buộc so sánh chính xác
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
    ]
  },
  {
    id: 'shops',
    label: 'Quản lý cửa hàng',
    icon: <FiMoon size={20} />,
    children: [
      { id: 'sellers', label: 'Danh sách người bán', path: '/admin/users/sellers' },
      { id: 'seller_approval', label: 'Duyệt người bán', path: '/admin/users/approvals' },
    ]
  },
  {
    id: 'category',
    label: 'Quản lý Danh mục',
    icon: <FiLayers size={20} />,
    path: '/admin/mega-menu'
  },
  {
    id: 'products',
    label: 'Quản lí sản phẩm',
    icon: <FiBox size={20} />,
    children: [
      // [FIX] Thêm exact: true nếu bạn muốn chỉ sáng khi đúng url này (nhưng sẽ không sáng khi vào trang chi tiết sản phẩm)
      // Cách tốt nhất là giữ nguyên logic nhưng đảm bảo path của các item khác không trùng prefix.
      { id: 'all_products', label: 'Tất cả sản phẩm', path: '/admin/products' },
      { id: 'product_approvals', label: 'Duyệt sản phẩm', path: '/admin/products/approvals' },
      // [NEW] Đã thêm mục Gắn thẻ quà tặng với path riêng biệt
      { id: 'product_tags', label: 'Gắn thẻ quà tặng', path: '/admin/products/tagging' },
    ]
  },
  {
    id: 'finance',
    label: 'Tài chính & Doanh thu',
    icon: <FiDollarSign size={20} />,
    children: [
      { id: 'revenue', label: 'Doanh thu sàn', path: '/admin/finance/revenue' },
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing & Khuyến mãi',
    icon: <FiGift size={20} />,
    children: [
      { id: 'vouchers', label: 'Quản lý Vouchers', path: '/admin/marketing/vouchers' },
      { id: 'flash_sale', label: 'Flash Sale', path: '/admin/marketing/flash-sale' },
    ]
  },
  {
    id: 'ct',
    label: 'Nội dung hiển thị',
    icon: <FiFileText size={20} />,
    children: [
      { id: 'settings-home', label: 'Quản lí khối danh mục', path: '/admin/settings/home' },
      { id: 'content-management-cms', label: 'Quản lí nội dung (CMS)', path: '/admin/content' },
    ]
  },
  {
    id: 'blogs',
    label: 'Bài viết',
    icon: <FiFileText size={20} />,
    path: '/admin/blogs',
  },
  {
    id: 'brand',
    label: 'Quản lý thương hiệu',
    icon: <FiShield size={20} />,
    children: [
      { id: 'brands', label: 'Danh sách thương hiệu', path: '/admin/brands' },
      { id: 'add_brand', label: 'Thêm thương hiệu', path: '/admin/brands/create' },
    ]
  },
];

const SidebarItem = ({ item, level = 0, isOpen, toggleOpen }: { 
  item: MenuItem, level?: number, isOpen: (id: string) => boolean, toggleOpen: (id: string) => void
}) => {
  const pathname = usePathname();

  const hasChildren = item.children && item.children.length > 0;
  
  // [FIX] Cập nhật logic checkActive để chặt chẽ hơn
  const checkActive = (menuItemPath?: string) => {
    if (!menuItemPath) return false;

    // 1. Nếu trùng khớp hoàn toàn -> Active
    if (pathname === menuItemPath) return true;

    // 2. Nếu có thuộc tính exact -> Chỉ chấp nhận trùng khớp hoàn toàn (bỏ qua bên dưới)
    if (item.exact) return false;

    // 3. Kiểm tra xem có phải là sub-path không
    // Thêm dấu '/' vào cuối để đảm bảo so sánh chính xác các segment
    // VD: /admin/products/approvals sẽ match /admin/products/
    // NHƯNG /admin/products-old sẽ KHÔNG match /admin/products/
    if (pathname.startsWith(`${menuItemPath}/`)) {
       // [FIX NÂNG CAO] Xử lý trường hợp "Tất cả sản phẩm" (/admin/products) bị sáng khi vào "Duyệt sản phẩm" (/admin/products/approvals)
       // Nếu bạn muốn "Tất cả sản phẩm" KHÔNG sáng khi đang ở "Duyệt sản phẩm", 
       // bạn cần logic phức tạp hơn hoặc chấp nhận điều đó vì "Duyệt sản phẩm" là con của "Products".
       
       // Tuy nhiên, lỗi "Gắn thẻ quà tặng" (/admin/products/tagging) bị sáng khi vào "Duyệt sản phẩm" 
       // sẽ ĐƯỢC KHẮC PHỤC nhờ logic check '/' này và path chính xác.
       return true;
    }

    return false;
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

  const handleLogout = async () => {
    try {
      await AdminService.logout();
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/admin/login';
    }
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
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <FiLogOut size={18} /> <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default React.memo(AdminSidebar);