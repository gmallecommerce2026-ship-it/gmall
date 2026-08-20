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
  FiHeart,
  FiAlertCircle,
  FiX,
  FiTag // Thêm icon Tag
} from 'react-icons/fi';
import classNames from 'classnames';
import { AdminService, type PendingCounts } from '@/services/AdminService';
// [round15 FIX admin-logout-store] cần clear persisted Zustand "user-storage" khi admin logout
import { useUserStore } from '@/store/useUserStore';
// wiki 0110: drawer cho màn hình nhỏ — xem giải thích trong PortalNavContext.tsx
import { usePortalNav, PortalNavOverlay, portalSidebarClass } from '@/layout/shared/PortalNavContext';
// wiki 0111: các màn duyệt bắn sự kiện này sau khi xử lý xong để badge cập nhật ngay.
import { PENDING_COUNTS_REFRESH_EVENT } from '@/lib/admin/pendingCounts';

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  exact?: boolean; // [NEW] Thêm thuộc tính exact để bắt buộc so sánh chính xác
  /**
   * wiki 0111 — khoá đếm việc đang chờ, hiện thành con số cạnh mục menu.
   * Nhiều khoá thì cộng lại: trang "Duyệt người bán" gồm cả shop mới lẫn yêu cầu sửa hồ sơ,
   * nên badge của nó phải là tổng, khớp với số dòng người dùng thấy khi bấm vào.
   */
  badge?: (keyof PendingCounts)[];
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
      // #56: exact để khi vào /admin/users/sellers, "Danh sách người dùng"
      // KHÔNG bị highlight thêm + group "users" KHÔNG bị mở cùng "shops".
      { id: 'all_users', label: 'Danh sách người dùng', path: '/admin/users', exact: true },
    ]
  },
  {
    id: 'shops',
    label: 'Quản lý cửa hàng',
    icon: <FiMoon size={20} />,
    children: [
      { id: 'sellers', label: 'Danh sách người bán', path: '/admin/users/sellers' },
      { id: 'seller_approval', label: 'Duyệt người bán', path: '/admin/users/approvals', badge: ['sellerApprovals', 'shopUpdates'] },
      // wiki 0110: /admin/shops là danh sách CỬA HÀNG (khác "người bán" = tài khoản) và là
      // cửa vào tự nhiên của /admin/shops/[id]; trước đây trang chi tiết chỉ tới được qua
      // trang duyệt sản phẩm, còn trang danh sách thì không tới được từ đâu cả.
      { id: 'shop_list', label: 'Danh sách cửa hàng', path: '/admin/shops', exact: true },
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
      // #59: exact để "Tất cả sản phẩm" KHÔNG sáng cùng lúc với "Duyệt sản phẩm"
      // / "Gắn thẻ quà tặng" — path /admin/products là prefix của /admin/products/approvals.
      { id: 'all_products', label: 'Tất cả sản phẩm', path: '/admin/products', exact: true },
      { id: 'product_approvals', label: 'Duyệt sản phẩm', path: '/admin/products/approvals', badge: ['productApprovals'] },
      { id: 'product_tags', label: 'Gắn thẻ quà tặng', path: '/admin/products/tagging' },
    ]
  },
  {
    id: 'finance',
    label: 'Tài chính & Doanh thu',
    icon: <FiDollarSign size={20} />,
    children: [
      { id: 'revenue', label: 'Doanh thu sàn', path: '/admin/finance/revenue' },
      // wiki 0109: màn duyệt rút tiền (seller + người tiếp thị) trước chỉ tới được qua
      // link nhỏ trong card "Chờ thanh toán" ở trang Doanh thu (wiki 0108). Đưa lên menu
      // vì đây là bước cuối của vòng tiền affiliate — admin phải tìm thấy mà không cần biết trước.
      { id: 'payouts', label: 'Duyệt rút tiền', path: '/admin/finance/payouts', badge: ['payouts'] },
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing & Khuyến mãi',
    icon: <FiGift size={20} />,
    children: [
      { id: 'vouchers', label: 'Quản lý Vouchers', path: '/admin/marketing/vouchers' },
      { id: 'flash_sale', label: 'Flash Sale', path: '/admin/marketing/flash-sale' },
      // wiki 0109: trang /admin/affiliate (duyệt hồ sơ người tiếp thị + đối soát + chốt sổ,
      // wiki 0105) đã chạy trên prod từ 17/08 nhưng commit ce609a8 quên gắn vào menu → trang
      // mồ côi, khách báo "không thấy nút duyệt". Sidebar là lối vào DUY NHẤT của khu admin.
      { id: 'affiliate', label: 'Tiếp thị liên kết', path: '/admin/affiliate', badge: ['affiliateAccounts'] },
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
    // wiki 0110: BE có đủ CRUD quỹ + chiến dịch (`/admin/charity/*`) và trang thanh toán
    // của khách ĐANG dùng `GET /charity/campaigns/active` để hiện ô quyên góp — nhưng
    // không có mục menu nào, nên không ai tạo/sửa được chiến dịch đang chạy thật.
    id: 'charity',
    label: 'Từ thiện',
    icon: <FiHeart size={20} />,
    children: [
      { id: 'charity_campaigns', label: 'Chiến dịch quyên góp', path: '/admin/charity/campaigns' },
      { id: 'charity_funds', label: 'Quỹ từ thiện', path: '/admin/charity/funds' },
    ]
  },
  {
    // wiki 0110: seller gửi khiếu nại từ Kênh người bán → `POST /complaints`, BE lưu và mở
    // sẵn `/admin/complaints`, nhưng FE chưa từng có màn hình admin nào → khiếu nại nằm
    // trong DB không ai đọc. Đây là chiều NGƯỢC của bug 0109: API có, màn hình không có.
    id: 'complaints',
    label: 'Khiếu nại & Báo lỗi',
    icon: <FiAlertCircle size={20} />,
    path: '/admin/complaints',
    badge: ['complaints'],
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

/**
 * wiki 0111 — số việc đang chờ của MỘT mục menu, tính cả các mục con.
 *
 * Tính đệ quy để nhóm cha gánh tổng của con: gốc rễ của vụ hồ sơ tiếp thị nằm chờ hai ngày
 * là các màn duyệt đều nằm trong nhóm ĐANG ĐÓNG — không mở nhóm ra thì không thấy gì. Con
 * số phải xuyên qua được lớp đóng/mở đó, nếu không nó chỉ hữu ích với người vốn đã biết
 * đường.
 */
const countFor = (item: MenuItem, counts: PendingCounts | null): number => {
  if (!counts) return 0;
  const own = (item.badge ?? []).reduce((sum, key) => sum + (counts[key] ?? 0), 0);
  const fromChildren = (item.children ?? []).reduce((sum, c) => sum + countFor(c, counts), 0);
  return own + fromChildren;
};

/** Chấm số việc chờ. Không hiện gì khi bằng 0 — badge "0" chỉ là nhiễu thị giác. */
const PendingBadge = ({ value }: { value: number }) => {
  if (!value) return null;
  return (
    <span
      // aria-label để người dùng trình đọc màn hình không nghe thấy một con số trần trụi.
      aria-label={`${value} việc đang chờ xử lý`}
      className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white"
    >
      {value > 99 ? '99+' : value}
    </span>
  );
};

const SidebarItem = ({ item, level = 0, isOpen, toggleOpen, counts }: {
  item: MenuItem, level?: number, isOpen: (id: string) => boolean, toggleOpen: (id: string) => void,
  counts: PendingCounts | null,
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
        <div className="flex shrink-0 items-center">
          {/* wiki 0111: nhóm cha chỉ gánh số khi ĐANG ĐÓNG — mở ra rồi thì từng mục con đã
              hiện số của mình, để cả hai cùng hiện là đếm hai lần trước mắt người đọc. */}
          <PendingBadge value={hasChildren && isOpen(item.id) ? 0 : countFor(item, counts)} />
          {hasChildren && (
            <FiChevronDown
              size={16}
              className={classNames(
                "ml-2 text-gray-400 transition-transform duration-200",
                isOpen(item.id) ? "rotate-180" : ""
              )}
            />
          )}
        </div>
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
            counts={counts}
          />
        ))}
      </div>
    </div>
  );
};

const AdminSidebar = () => {
  // Default chỉ mở những menu group user thường xuyên dùng. KHÔNG default-open
  // 'users' VÀ 'products' đồng thời — vì user thường chỉ ở 1 group tại 1 thời
  // điểm; đồng-loạt-mở gây cảm giác sidebar lộn xộn (#56). Group con sẽ tự
  // mở khi pathname match qua useEffect trong SidebarItem.
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  // wiki 0110: khi không có PortalNavProvider (test render thẳng component), context trả về
  // giá trị mặc định isOpen=false → sidebar giữ nguyên hành vi desktop, không sập.
  const { isOpen: isNavOpen, close: closeNav } = usePortalNav();

  // wiki 0111 — số việc đang chờ, hiện cạnh các mục duyệt.
  const [counts, setCounts] = useState<PendingCounts | null>(null);
  const pathname = usePathname();

  // Tải lại khi đổi trang, và khi một màn duyệt báo là vừa xử lý xong việc.
  //
  // KHÔNG hẹn giờ thăm dò nền. Hai mốc trên đã phủ hết đường mà con số có thể đổi từ phía
  // admin này; thăm dò chỉ thêm lưu lượng để bắt thay đổi của admin KHÁC — chuyện hiếm, và
  // trễ vài phút cũng không sao.
  //
  // Chỉ nghe `pathname` là chưa đủ: các trang duyệt xử lý tại chỗ rồi ở nguyên trang (đã
  // đọc lại `/admin/affiliate`, `/admin/products/approvals`, `/admin/complaints` — không
  // trang nào điều hướng sau khi duyệt), nên duyệt liên tiếp mà badge treo số cũ.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await AdminService.getPendingCounts();
        if (!cancelled && res) setCounts(res);
      } catch {
        // Badge hỏng thì im lặng: đây là thứ nhắc việc, không được phép cản trở điều hướng.
        // Giữ nguyên số cũ thay vì xoá về 0 — 0 giả còn tệ hơn một con số hơi cũ.
      }
    };
    void load();
    window.addEventListener(PENDING_COUNTS_REFRESH_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(PENDING_COUNTS_REFRESH_EVENT, load);
    };
  }, [pathname]);

  const toggleOpen = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // [round15 L2 FIX] Light-reset KHÔNG redirect: trước đây gọi useUserStore.logout()
  // mà trên path /admin/* logout() tự window.location.assign('/'), rồi line kế tiếp set
  // href='/admin/login' → 2 navigation đồng bộ chọi nhau (race, dựa vào last-write-wins).
  // Clear store fields + persisted storage trực tiếp (mirror logout() trừ redirect) để
  // điều hướng có-định-hướng /admin/login bên dưới là navigation DUY NHẤT.
  const resetUserStoreNoRedirect = () => {
    try {
      useUserStore.setState({ user: null, isAuthenticated: false });
      localStorage.removeItem('user-storage');
      localStorage.removeItem('cart-storage');
      localStorage.removeItem('gmall-checkout-storage');
    } catch { /* ignore */ }
  };

  const handleLogout = async () => {
    try {
      await AdminService.logout();
      // [round15 L2 FIX] clear store (không redirect) để admin identity không sống sót
      // sang storefront sau khi cookie đã bị xoá; điều hướng /admin/login là duy nhất.
      resetUserStoreNoRedirect();
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout error:', error);
      // [round15 L2 FIX] vẫn clear store (không redirect) kể cả khi BE logout lỗi.
      resetUserStoreNoRedirect();
      window.location.href = '/admin/login';
    }
  };

  return (
    <>
    {/* wiki 0110: nền mờ chỉ tồn tại dưới lg — trên desktop sidebar luôn hiện, không có gì để đóng. */}
    <PortalNavOverlay />
    <aside id="portal-sidebar" className={portalSidebarClass(isNavOpen)}>
      <div className="h-[80px] flex items-center px-6 border-b border-gray-100 gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-gray-300">
          <FiShield size={18}/>
        </div>
        <div>
            <h1 className="font-bold text-lg text-gray-800 leading-none">GMall</h1>
            <span className="text-[10px] text-gray-500 font-bold tracking-wide uppercase">Admin Portal</span>
        </div>
        {/* Nút đóng chỉ có nghĩa khi đang là drawer. Overlay cũng đóng được, nhưng nút X là
            thứ người dùng tìm trước, và là điểm dừng bàn phím rõ ràng. */}
        <button
          type="button"
          onClick={closeNav}
          aria-label="Đóng menu điều hướng"
          className="lg:hidden ml-auto p-2 -mr-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-1">
        {ADMIN_MENU.map(item => (
          <SidebarItem
            key={item.id}
            item={item}
            isOpen={(id) => !!openItems[id]}
            toggleOpen={toggleOpen}
            counts={counts}
          />
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <FiLogOut size={18} /> <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
    </>
  );
};

export default React.memo(AdminSidebar);