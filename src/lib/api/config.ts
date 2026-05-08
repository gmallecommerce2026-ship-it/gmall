/**
 * Fix BUG-FE-10 (wiki 0030): centralize API base URL với production safety.
 *
 * Trước đây 6 file fallback `'http://localhost:3001'` nếu env thiếu. Build prod
 * quên set NEXT_PUBLIC_API_URL → bundled JS gửi request tới `localhost:3001` từ
 * trình duyệt user → CORS error / connection refused / silent fail. User thấy
 * trang trắng.
 *
 * Giải pháp:
 * - Dev: fallback localhost (DX tốt cho local dev không cần .env).
 * - Prod: throw nếu thiếu env → CI build fail sớm thay vì serve broken bundle.
 *
 * Sử dụng: `import { API_BASE_URL } from '@/lib/api/config'`
 */
const env = process.env.NEXT_PUBLIC_API_URL?.trim();

if (process.env.NODE_ENV === 'production' && !env) {
  // Throw ở MODULE LOAD TIME → bundle fail / runtime error sớm,
  // dễ debug hơn nhiều so với "tất cả request fail im lặng".
  throw new Error(
    'NEXT_PUBLIC_API_URL is required in production build. ' +
    'Set it in .env.production or CI/CD env vars.'
  );
}

export const API_BASE_URL = env || 'http://localhost:3001';
