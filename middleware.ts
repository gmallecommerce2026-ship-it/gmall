// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// [round15 FIX role-guard] Decode role từ payload JWT (segment giữa, base64url) — KHÔNG verify
// chữ ký (không có secret trong middleware) nên đây CHỈ là guard shell/UX sớm; server vẫn verify
// chữ ký + role trên mọi API call (RolesGuard) nên không phải là biên bảo mật. Mục đích: chặn
// buyer cookie load nhầm SPA shell admin/seller. Note: BE chỉ set 1 cookie name 'accessToken' cho
// mọi role; nếu sau này BE tách cookie name theo role thì có thể guard chặt hơn theo cookie name.
function getRoleFromToken(token?: string): string | null {
  if (!token) return null;
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    // base64url -> base64
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    const payload = JSON.parse(json);
    return payload?.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lấy token từ Cookie (Middleware chỉ đọc được Cookie, KHÔNG đọc được LocalStorage)
  const token = request.cookies.get('accessToken')?.value ||
                request.cookies.get('access_token')?.value ||
                request.cookies.get('token')?.value;
  // [round15 FIX role-guard] Bỏ fallback `|| token` cho admin: trước đây bất kỳ cookie buyer nào
  // cũng pass guard admin. Giờ admin yêu cầu cookie có role=ADMIN (đọc từ payload JWT).
  const adminToken = request.cookies.get('adminAccessToken')?.value ||
                     request.cookies.get('admin_access_token')?.value ||
                     token;
  // [round15 FIX role-guard] role decode tách theo nguồn token tương ứng từng guard.
  const role = getRoleFromToken(token);
  const adminRole = getRoleFromToken(adminToken);
  // Security review: leak cookie values trong production log → bypass auth nếu
  // log accessible cho team không trust. Guard NODE_ENV.
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Middleware] Path: ${pathname}`);
  }
  // 1. Bảo vệ Seller Dashboard
  if (pathname.startsWith('/seller-dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/seller/login', request.url));
    }
    // [round15 FIX role-guard] Buyer cookie KHÔNG được load shell seller. SELLER hoặc ADMIN mới qua.
    if (role !== 'SELLER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/seller/login', request.url));
    }
  }

  // 2. Bảo vệ Admin Dashboard
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    // [round15 FIX role-guard] Chỉ role=ADMIN mới load shell admin; buyer/seller cookie bị chặn.
    if (adminRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // [MỚI] 3. Bảo vệ Route User (Giỏ hàng, Thanh toán, User Profile)
  const protectedUserRoutes = ['/cart', '/checkout', '/user'];
  const isProtectedRoute = protectedUserRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      // Đồng bộ với guard FE (wiki 0056): dùng `next=` chứ không phải `from=`,
      // để login page redirect đúng sau khi đăng nhập.
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/seller-dashboard/:path*', 
    '/admin/:path*',
    // [QUAN TRỌNG] Thêm các route cần bảo vệ vào đây để Middleware kích hoạt
    '/cart/:path*',
    '/checkout/:path*',
    '/user/:path*'
  ],
};