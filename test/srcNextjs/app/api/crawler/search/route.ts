// src/app/api/crawler/search/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { keyword, limit = 20, platform = 'tiki' } = await req.json();

    if (platform === 'tiki') {
      // API Search công khai của Tiki
      const encodedKeyword = encodeURIComponent(keyword);
      const tikiUrl = `https://tiki.vn/api/v2/products?limit=${limit}&include=advertisement&aggregations=2&trackity_id=1&q=${encodedKeyword}`;

      const res = await fetch(tikiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      });

      if (!res.ok) throw new Error("Lỗi kết nối Tiki Search");

      const data = await res.json();
      
      // Map data trả về danh sách URL sạch
      const products = (data.data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        // Tạo link giả để hàm crawler chi tiết dùng
        url: `https://tiki.vn/${item.url_path}`, 
        price: item.price,
        image: item.thumbnail_url
      }));

      return NextResponse.json({ products });
    }

    // Nếu muốn mở rộng Shopee sau này thì viết thêm else if ở đây
    return NextResponse.json({ error: "Platform chưa hỗ trợ search" }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}