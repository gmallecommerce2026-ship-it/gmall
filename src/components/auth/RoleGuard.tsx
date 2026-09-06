// src/components/auth/RoleGuard.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore, type User } from '@/store/useUserStore';
import { AuthService } from '@/services/AuthService';

export type AppRole = User['role']; // 'BUYER' | 'SELLER' | 'ADMIN'

// ---------------------------------------------------------------------------
// TẠI SAO GUARD PHÂN QUYỀN NẰM Ở CLIENT, KHÔNG Ở `src/proxy.tsx` (wiki 0108)
//
// Phiên đăng nhập của site dựa trên cookie `accessToken` do BE set, và BE nằm ở
// HOST KHÁC với FE (`103-82-194-218.sslip.io` vs `gmall.vn`). Cookie được gắn vào
// đúng host của BE, nên request trỏ `gmall.vn` KHÔNG BAO GIỜ mang theo nó →
// `req.cookies.get('accessToken')` trong proxy LUÔN undefined, kể cả với người đã
// đăng nhập. Mọi kiểu chặn-theo-cookie ở tầng server vì thế sẽ đá CẢ người dùng
// thật ra ngoài — đã xảy ra thật: khối chặn `/checkout` cũ đá người đang giữa
// luồng mua hàng về `/login`. Thứ FE thực sự nhìn thấy được là `useUserStore`
// (persist localStorage + `/auth/me` gọi qua `withCredentials`), nên guard phải
// chạy trong trình duyệt.
//
// Phạm vi: guard này CHỈ che giao diện (trước đây buyer mở `/admin/dashboard` là
// thấy nguyên khung Admin Portal). Biên bảo mật thật vẫn là `RolesGuard` của BE —
// mọi API trả 401/403 cho sai role. Đừng coi RoleGuard là lớp chống lộ dữ liệu.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// PHÂN BIỆT "ĐANG TẢI / CHƯA XÁC ĐỊNH" VỚI "ĐÃ XÁC ĐỊNH LÀ KHÁCH"
//
// `useUserStore` KHÔNG có cờ nào nói "/auth/me đã trả lời chưa":
//   - `_hasHydrated` chỉ báo persist đọc xong localStorage, không liên quan tới
//     kết quả `/auth/me`;
//   - `user === null` sau rehydrate KHÔNG đồng nghĩa là khách: localStorage có thể
//     trống trong khi cookie httpOnly vẫn còn hiệu lực (login với "Ghi nhớ" tắt →
//     `pagehide` xoá `user-storage`; người dùng tự clear site data; incognito /
//     storage bị chặn...). Lúc đó `AuthProvider` vẫn đang bay `/auth/me` và sẽ
//     `setUser(ADMIN)` một nhịp sau.
// ⇒ Nếu redirect ngay khi `_hasHydrated && !user` thì ADMIN THẬT bấm F5 sẽ bị nem
//   về `/admin/login` oan. Nên ở đây coi "store rỗng" = CHƯA KẾT LUẬN: tự hỏi BE
//   `/auth/me` đúng một lần, chỉ quyết định khi đã có câu trả lời dứt khoát (có
//   user nhưng sai role, hoặc `/auth/me` xác nhận là khách).
//
// `/auth/me` được `services/api.ts` miễn khỏi interceptor 401
// (`isCheckAuthRequest`) nên probe này không tự kéo theo hard-redirect — guard giữ
// toàn quyền quyết định. `AuthService.getMe()` cũng tự `setUser` khi thành công
// nên probe idempotent với `AuthProvider`.
// ---------------------------------------------------------------------------

interface RoleGuardProps {
  /** Các role được xem khu vực này. Ví dụ `['ADMIN']`, `['SELLER', 'ADMIN']`. */
  allow: readonly AppRole[];
  /** Đích điều hướng khi không đủ quyền (hoặc là khách). */
  redirectTo: string;
  children: React.ReactNode;
}

export default function RoleGuard({ allow, redirectTo, children }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname() ?? '';

  const user = useUserStore((s) => s.user);

  // `mounted`: server prerender VÀ lần render đầu ở client đều ra spinner. Vừa
  // tránh lệch hydration (persist của zustand rehydrate ngay lúc import module,
  // nên client-first-render có thể đã có user trong khi HTML từ server thì chưa),
  // vừa đảm bảo khung quản trị không nằm trong HTML trả về cho mọi người.
  const [mounted, setMounted] = useState(false);
  // `probeDone`: `/auth/me` do guard tự gọi đã settle → từ đây "không có user"
  // mới được hiểu là "đã xác định là khách".
  const [probeDone, setProbeDone] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Trang đăng nhập/đăng ký nằm trong cùng cây route thì phải cho qua, nếu không
  // redirect sẽ tự quay vòng. Hiện `/admin/login` ở `app/admin/login` và
  // `/seller/login` ở `app/seller/login` — đều NGOÀI group `(admin)`/`(seller)`
  // nên không chạm guard; check này là chốt an toàn nếu sau này ai đó dọn route.
  const isAuthPage = pathname.endsWith('/login') || pathname.endsWith('/register');

  const probeStarted = useRef(false);
  useEffect(() => {
    if (!mounted || isAuthPage) return;
    // Store đã có user → đã có câu trả lời, không cần hỏi lại BE.
    if (user) return;
    if (probeStarted.current) return;
    probeStarted.current = true;

    let alive = true;
    AuthService.getMe()
      .catch(() => null) // getMe đã tự catch, đây chỉ là chốt phòng xa
      .then(() => {
        // Nếu getMe thành công nó đã setUser → `user` đổi → nhánh trên quyết định.
        if (alive) setProbeDone(true);
      });
    return () => {
      alive = false;
    };
  }, [mounted, isAuthPage, user]);

  // Đã có kết luận dứt khoát về danh tính người đang xem?
  const resolved = mounted && (!!user || probeDone);
  const allowed = resolved && !!user && allow.includes(user.role);

  const redirected = useRef(false);
  useEffect(() => {
    if (isAuthPage || !resolved || allowed) return;
    if (redirected.current) return;
    redirected.current = true;
    // `replace` (không `push`) để nút Back không quay lại đúng trang vừa bị chặn.
    router.replace(redirectTo);
  }, [isAuthPage, resolved, allowed, redirectTo, router]);

  if (isAuthPage) return <>{children}</>;

  // Chưa xác định → chỉ hiện khung chờ, TUYỆT ĐỐI không render nội dung quản trị
  // và cũng không điều hướng. Không đủ quyền → giữ khung chờ trong lúc `replace`
  // đang bay, vẫn không hé phần nào của khung quản trị.
  if (!allowed) {
    return (
      <div
        role="status"
        aria-label="Đang kiểm tra quyền truy cập"
        className="min-h-screen w-full bg-[#f5f5f5] flex items-center justify-center"
      >
        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
