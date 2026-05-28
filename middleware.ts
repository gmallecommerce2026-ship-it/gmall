// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Lấy token từ Cookie (Middleware chỉ đọc được Cookie, KHÔNG đọc được LocalStorage)
  const token = request.cookies.get('accessToken')?.value || 
                request.cookies.get('access_token')?.value || 
                request.cookies.get('token')?.value;
  const adminToken = request.cookies.get('adminAccessToken')?.value || 
                     request.cookies.get('admin_access_token')?.value || 
                     token;
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
  }

  // 2. Bảo vệ Admin Dashboard
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();
    if (!adminToken) {
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