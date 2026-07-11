// src/proxy.tsx
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const { pathname } = req.nextUrl;
  
  // 1. [THÊM MỚI] Bỏ qua ngay lập tức nếu đây là API call (dựa vào header hoặc path pattern)
  // Axios/Fetch thường có header 'accept' là application/json
  const acceptHeader = req.headers.get('accept') || '';
  if (acceptHeader.includes('application/json') || pathname.startsWith('/api/')) {
      return NextResponse.next();
  }

  const token = req.cookies.get('accessToken')?.value ||
                req.cookies.get('access_token')?.value ||
                req.cookies.get('token')?.value;

  // 2. Logic hiện tại của bạn giữ nguyên
  if (hostname.startsWith('admin.')) {
    if (!token && !pathname.startsWith('/auth')) {
       return NextResponse.redirect(new URL('/auth/admin-login', req.url));
    }
    return NextResponse.rewrite(new URL(`/admin${pathname}`, req.url));
  }

  if (hostname.startsWith('seller.')) {
     if (!token && !pathname.startsWith('/auth')) {
       return NextResponse.redirect(new URL('/auth/seller-login', req.url));
    }
     return NextResponse.rewrite(new URL(`/seller${pathname}`, req.url));
  }

  const protectedPaths = ['/profile', '/checkout'];
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};