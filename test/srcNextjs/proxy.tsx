import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const hostname = req.headers.get('host') || ''; 
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('accessToken')?.value || 
                req.cookies.get('access_token')?.value || 
                req.cookies.get('token')?.value;
  
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