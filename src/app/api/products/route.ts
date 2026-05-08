// TS-fix wiki 0031: file rỗng -> Next yêu cầu route module export GET/POST
// Placeholder route handler — actual products logic ở BE NestJS, FE chỉ proxy nếu cần.
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { ok: true, message: 'Products proxy endpoint placeholder. Use BE /products/* directly.' },
    { status: 200 },
  );
}
