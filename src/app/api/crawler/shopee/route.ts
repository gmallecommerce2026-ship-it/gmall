// src/app/api/crawler/shopee/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    // 1. Extract ShopID và ItemID từ URL bằng Regex
    // Hỗ trợ dạng: shopee.vn/product-name-i.12345.67890
    const regex = /i\.(\d+)\.(\d+)/;
    const match = url.match(regex);

    if (!match) {
      return NextResponse.json({ error: 'URL không hợp lệ' }, { status: 400 });
    }

    const shopId = match[1];
    const itemId = match[2];

    // 2. Gọi API Shopee (Giả lập User-Agent để tránh block cơ bản)
    const shopeeApi = `https://shopee.vn/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`;
    
    const response = await fetch(shopeeApi, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://shopee.vn/',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) {
      throw new Error(`Shopee block hoặc lỗi: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}