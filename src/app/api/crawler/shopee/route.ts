// src/app/api/crawler/shopee/route.ts
import { NextResponse } from 'next/server';

// Audit Seller #19: "Lỗi 403 import sản phẩm Shopee".
// Root cause: Shopee API có Cloudflare/Akamai bot protection → request server-side
// thường bị 403 nếu không có cookie thật / không qua proxy IP residential.
// Fix: thử 2 lần với UA khác nhau; nếu vẫn fail → trả 502 với message rõ ràng
// cho FE hiển thị "Shopee đã chặn, vui lòng thử lại sau hoặc dùng URL Tiki".
const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
];

async function fetchShopeeWithRetry(shopId: string, itemId: string): Promise<Response> {
  const shopeeApi = `https://shopee.vn/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`;
  let lastErr = '';
  for (const ua of USER_AGENTS) {
    try {
      const res = await fetch(shopeeApi, {
        headers: {
          'User-Agent': ua,
          Referer: 'https://shopee.vn/',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
        },
      });
      if (res.ok) return res;
      lastErr = `${res.status} ${res.statusText}`;
    } catch (e: any) {
      lastErr = e.message;
    }
  }
  throw new Error(`Shopee chặn request: ${lastErr}`);
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Thiếu URL sản phẩm' }, { status: 400 });
    }

    const regex = /i\.(\d+)\.(\d+)/;
    const match = url.match(regex);
    if (!match) {
      return NextResponse.json({ error: 'URL Shopee không đúng format (cần dạng .../-i.{shopId}.{itemId})' }, { status: 400 });
    }

    const response = await fetchShopeeWithRetry(match[1], match[2]);
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    // 502 thay vì 500 — báo rõ "upstream block", FE handler có thể hint
    // user thử lại sau hoặc đổi sang Tiki.
    return NextResponse.json(
      {
        error: 'Shopee đã chặn request crawler (bot protection). Vui lòng thử lại sau hoặc dùng URL Tiki.',
        detail: error.message,
      },
      { status: 502 },
    );
  }
}