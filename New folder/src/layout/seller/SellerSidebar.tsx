// src/layout/seller/SellerSidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { 
  FiHome, FiBox, FiShoppingBag, 
  FiChevronDown, FiLogOut, FiTruck, FiClipboard, 
  FiGift
} from 'react-icons/fi';
import { Settings } from 'lucide-react'; // Lưu ý: Nên cố gắng dùng 1 bộ icon duy nhất nếu có thể
import classNames from 'classnames';

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
    ]
  },
  {
    id: 'marketing',
    label: 'Kênh Marketing',
    icon: <FiGift size={20} />, // Need to import FiGift
    children: [
      { id: 'promotion_list', label: 'Quản lý Mã giảm giá', path: '/seller-dashboard/promotions' },
      { id: 'promotion_create', label: 'Tạo Mã giảm giá', path: '/seller-dashboard/promotions/create' },
    ]
  },
  {
    id: 'profile',
    label: "Hồ sơ Shop",
    icon: <Settings size={20} />, 
    path: "/seller-dashboard/settings/profile",
  }
];

const SidebarItem = ({ item, level = 0, isOpen, toggleOpen }: { 
  item: MenuItem, level?: number, isOpen: (id: string) => boolean, toggleOpen: (id: string) => void
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasChildren = item.children && item.children.length > 0;
  
  // Logic kiểm tra Active giữ nguyên vì nó đã tốt
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
  // Item được coi là active nếu chính nó active hoặc con nó active (để highlight menu cha)
  const isActive = isSelfActive || (hasChildren && isChildActive);
  const isMenuOpen = isOpen(item.id);

  // Tự động mở menu cha nếu con đang active
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
          // Style cho Level 0 (Menu chính)
          {
            "bg-orange-50 text-orange-600 font-semibold shadow-sm": isActive && level === 0,
            "text-gray-600 hover:bg-gray-100 hover:text-gray-900": !isActive && level === 0,
            
            // Style cho Level 1 (Submenu)
            "pl-4 py-2 mt-1": level === 1,
            "text-orange-600 font-medium bg-orange-50/50": isSelfActive && level > 0,
            "text-gray-500 hover:text-orange-600 hover:bg-gray-50": !isSelfActive && level > 0,
          }
        )}
      >
        <div className="flex items-center gap-3 relative z-10">
          {/* Icon chỉ hiện ở level 0 */}
          {level === 0 && (
            <span className={classNames("transition-colors", isActive ? "text-orange-600" : "text-gray-400 group-hover:text-gray-600")}>
              {item.icon}
            </span>
          )}
          
          {/* Dot chỉ dẫn cho level 1 */}
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

      {/* Submenu Container */}
      <div 
        className={classNames(
          "overflow-hidden transition-all duration-300 ease-in-out ml-3 border-l border-gray-100", // Thêm border trái để tạo đường dẫn
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

const SellerSidebar = () => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ 
    'orders': false,
    'products': true 
  });
  
  const toggleOpen = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
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
        <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group font-medium">
            <FiLogOut size={18} className="group-hover:translate-x-[-2px] transition-transform" /> 
            <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default React.memo(SellerSidebar);