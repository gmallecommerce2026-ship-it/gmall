// src/app/api/crawler/tiki/route.ts
import { NextResponse } from 'next/server';

// --- CONFIGURATION ---
// Nếu deploy Vercel Pro, tăng giới hạn này lên. Vercel Free chỉ cho 10s (không đủ crawl 1000 items).
// Tốt nhất nên chạy cái này ở Background Job hoặc VPS nếu crawl số lượng lớn.
export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

const CRAWL_CONFIG = {
  ITEMS_PER_PAGE: 40, // Tiki mặc định
};

// TRICK: GIẢ MẠO TRÌNH DUYỆT
const FAKE_BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
  'x-source': 'local',
  'Connection': 'keep-alive',
};

// --- UTILS ---
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// --- HELPER: "PHẪU THUẬT" URL (Giữ nguyên logic của bạn) ---
function surgicalExtract(input: string) {
  if (!input.includes('tiki.vn') && !input.startsWith('http')) {
    return { type: 'keyword', val: input.trim() };
  }

  try {
    const urlStr = input.startsWith('http') ? input : `https://${input}`;
    const urlObj = new URL(urlStr);
    const path = urlObj.pathname;

    // CASE 1: SẢN PHẨM
    const productMatch = path.match(/-p(\d+)\.html/);
    if (productMatch) return { type: 'product', val: productMatch[1] };

    // CASE 2: DANH MỤC
    const pathParts = path.split('/').filter(p => p.length > 0);
    if (pathParts.length >= 2) {
      const potentialId = pathParts[pathParts.length - 1];
      if (potentialId.startsWith('c') && /^\d+$/.test(potentialId.substring(1))) {
        const categoryId = potentialId.substring(1);
        const urlKey = pathParts[pathParts.length - 2];
        const sellerId = urlObj.searchParams.get('src') || urlObj.searchParams.get('seller') || undefined;

        return {
          type: 'category_url',
          categoryId: categoryId,
          urlKey: urlKey,
          sellerId: sellerId,
          originalUrl: urlStr
        };
      }
    }

    const categoryMatches = [...path.matchAll(/c(\d+)/g)];
    if (categoryMatches.length > 0) {
      const lastMatch = categoryMatches[categoryMatches.length - 1];
      return { type: 'category_fallback', val: lastMatch[1], originalUrl: urlStr };
    }

    if (path.includes('/search')) {
      const q = urlObj.searchParams.get('q');
      return { type: 'keyword', val: q || input };
    }

    return { type: 'keyword', val: input };
  } catch (e) {
    return { type: 'keyword', val: input };
  }
}

// Hàm lấy chi tiết (Retry mechanism)
async function fetchProductDetail(id: string | number, retry = 0): Promise<any> {
  try {
    const includeFields = 'tag,images,gallery,variants,product_links,discount_tag,top_features,cta_desktop,attributes,specifications';
    const apiUrl = `https://tiki.vn/api/v2/products/${id}?platform=web&spid=${id}&include=${includeFields}`;
    const res = await fetch(apiUrl, { headers: FAKE_BROWSER_HEADERS });
    
    if (res.status === 429 && retry < 3) {
      console.warn(`⚠️ Rate limit hit for product ${id}. Retrying...`);
      await sleep(2000 * (retry + 1));
      return fetchProductDetail(id, retry + 1);
    }
    
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { return null; }
}

// Hàm lấy danh sách sản phẩm theo trang
async function fetchListingPage(page: number, info: any, limit: number = 50) {
  const baseUrl = 'https://tiki.vn/api/v2/products';
  const params = new URLSearchParams({
    limit: String(limit),
    include: 'advertisement',
    aggregations: '2',
    page: String(page),
    sort: 'top_seller',
    platform: 'web',
    version: 'v2'
  });

  const customHeaders: Record<string, string> = { ...FAKE_BROWSER_HEADERS };

  if (info.type === 'category_url') {
    params.append('category', info.categoryId);
    if (info.urlKey) params.append('urlKey', info.urlKey);
    if (info.sellerId) params.append('seller', info.sellerId);
    if (info.originalUrl) customHeaders['Referer'] = info.originalUrl;
  } else if (info.type === 'category_fallback') {
    params.append('category', info.val);
  } else {
    params.append('q', info.val);
  }

  const listApiUrl = `${baseUrl}?${params.toString()}`;
  const res = await fetch(listApiUrl, { headers: customHeaders });
  
  if (!res.ok) return { items: [], total: 0 };
  const data = await res.json();
  return { items: data.data || [], total: data.paging?.total || 0 };
}

// --- MAIN ROUTE ---
export async function POST(req: Request) {
  try {
    // 1. Nhận thêm tham số 'page' từ Client
    const body = await req.json().catch(() => ({}));
    const { url, keyword, page = 1, fetchDetail = false } = body || {};

    const inputToProcess = url || keyword;
    // Bug fix wiki 0064: empty body → trả 400 rõ ràng thay vì 500
    // (surgicalExtract(undefined) crash).
    if (!inputToProcess || typeof inputToProcess !== 'string') {
      return NextResponse.json({ error: 'Thiếu url hoặc keyword' }, { status: 400 });
    }

    const info: any = surgicalExtract(inputToProcess);

    console.log(`tiki-crawler: Mode ${info.type} | Page: ${page}`);

    // CASE 1: XỬ LÝ SẢN PHẨM LẺ (Giữ nguyên)
    if (info.type === 'product') {
      const data = await fetchProductDetail(info.val);
      if (!data) throw new Error("Sản phẩm không tồn tại");
      return NextResponse.json({ type: 'product', ...data });
    }

    // CASE 2: QUÉT DANH MỤC (CHỈ TRẢ VỀ 1 TRANG)
    // Không loop ở đây nữa, chỉ fetch đúng trang 'page'
    const { items, total } = await fetchListingPage(page, info, CRAWL_CONFIG.ITEMS_PER_PAGE);

    // Nếu Client yêu cầu lấy luôn chi tiết (Deep Crawl cho trang này)
    let finalItems = items;
    if (fetchDetail && items.length > 0) {
       // Chạy song song lấy chi tiết cho 50 items này
       // Lưu ý: Vẫn có rủi ro timeout nếu 50 items quá nặng, nhưng đỡ hơn 1000 items
       const detailPromises = items.map((item: any) => fetchProductDetail(item.id));
       const details = await Promise.all(detailPromises);
       finalItems = details.filter(d => d !== null);
    }

    return NextResponse.json({
      type: 'category_page',
      items: finalItems,
      total_found: total, // Tổng số sản phẩm có trên Tiki (để Client biết khi nào dừng)
      page: page,
      next_page: items.length > 0 ? page + 1 : null
    });

  } catch (error: any) {
    console.error("Crawler Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}