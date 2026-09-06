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

  // LUU Y (wiki 0108): `token` o day LUON undefined tren prod — cookie `accessToken`
  // thuoc host cua BE (`103-82-194-218.sslip.io`), khong phai `gmall.vn`, nen no khong
  // bao gio duoc gui kem request tro FE. Hai nhanh subdomain duoi day vi the se luon
  // coi moi nguoi la khach. Chung chi kich hoat khi host bat dau bang `admin.`/`seller.`
  // — hien nginx chi phuc vu `gmall.vn` va `www.gmall.vn` nen chung khong chay. Giu lai
  // de khong doi hanh vi ngoai pham vi, nhung DUNG dua vao chung de phan quyen.
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

  // ---------------------------------------------------------------------------
  // KHONG chan route theo cookie o day nua. (wiki 0108)
  //
  // Truoc day khoi nay chan `['/profile', '/checkout']`: khong thay cookie thi day ve
  // `/login?from=...`. Van de: cookie `accessToken` do BE dat, va BE nam o HOST KHAC
  // (`103-82-194-218.sslip.io`) so voi FE (`gmall.vn`). Cookie duoc gan vao dung host cua
  // BE — nen request tro `gmall.vn` KHONG BAO GIO mang theo no. `req.cookies.get(...)`
  // trong proxy vi vay LUON undefined, ke ca voi nguoi da dang nhap.
  //
  // Hau qua da do duoc tren prod: nguoi dung dang nhap that vao `/checkout/vouchers`
  // bi day ve `/login?from=%2Fcheckout%2Fvouchers` — dung o giua luong mua hang. Va
  // vi trang `/login` chi doc `?next=` (khong doc `?from=`), sau khi dang nhap lai ho
  // bi nem ve trang chu chu khong tro lai cho dang mua.
  //
  // Kiem chung quyen VAN CON, chi khong o day nua:
  //   - moi API deu qua JwtAuthGuard/RolesGuard cua BE (bien bao mat that);
  //   - `ApiClient` gap 401 thi tu dieu huong ve /login (hoac /admin/login, /seller/login).
  //
  // Muon chan som o tang server tro lai thi phai lam cho cookie thanh CUNG-SITE truoc:
  // cho nginx phuc vu BE duoi `https://gmall.vn/api/` roi doi `NEXT_PUBLIC_API_URL`.
  // Do la viec nen lam — Chrome dang bo dan cookie ben thu ba, va toan bo phien dang
  // nhap cua site nay hien dua tren mot cookie ben thu ba. Xem wiki 0108 phan "viec con lai".
  // ---------------------------------------------------------------------------

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};