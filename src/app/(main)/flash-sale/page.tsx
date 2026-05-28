import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { apiClient } from '@/lib/api/ApiClient';

export const metadata: Metadata = {
  title: 'Flash Deal — GMall',
  description: 'Tất cả sản phẩm Flash Deal đang giảm giá sốc trên GMall.',
};

interface FlashSaleProduct {
  id: string;
  salePrice: number;
  originalPrice: number;
  sold: number;
  stock: number;
  product: {
    id: string;
    name: string;
    thumbnail?: string;
  };
}

interface FlashSaleData {
  id: string;
  startTime: string;
  endTime: string;
  products: FlashSaleProduct[];
}

async function getFlashSale(): Promise<FlashSaleData | null> {
  try {
    const res = await apiClient.get('/store/flash-sale/current');
    return (res?.data || res) as FlashSaleData;
  } catch (err) {
    console.error('[flash-sale] fetch error:', (err as any)?.message);
    return null;
  }
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default async function FlashSalePage() {
  const data = await getFlashSale();

  if (!data || !data.products?.length) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Flash Deal</h1>
        <p className="text-gray-500">Hiện chưa có khung giờ Flash Deal nào đang chạy.</p>
        <Link href="/" className="inline-block mt-6 px-6 py-2 bg-brand-orange text-white rounded-lg">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-2xl font-bold mb-1">⚡ Flash Deal</h1>
        <p className="text-sm opacity-90">
          Kết thúc lúc: {new Date(data.endTime).toLocaleString('vi-VN')}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {data.products.map(item => {
          const total = item.sold + item.stock;
          const percentSold = total > 0 ? Math.round((item.sold / total) * 100) : 0;
          const discount = item.originalPrice > 0
            ? Math.round(((item.originalPrice - item.salePrice) / item.originalPrice) * 100)
            : 0;
          return (
            <Link key={item.id} href={`/product-details/${item.product.id}`} className="group block">
              <div className="relative aspect-square rounded-md overflow-hidden bg-gray-100 mb-2 border border-gray-100">
                <Image
                  src={item.product.thumbnail || '/placeholder.png'}
                  alt={item.product.name}
                  fill
                  sizes="(min-width:1024px) 20vw, (min-width:768px) 25vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {discount > 0 && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-red-600 text-xs font-bold px-2 py-1">
                    -{discount}%
                  </div>
                )}
              </div>
              <p className="text-sm line-clamp-2 min-h-[2.5rem] text-gray-700">{item.product.name}</p>
              <span className="text-base font-bold text-orange-600 block mt-1">
                {formatCurrency(item.salePrice)}
              </span>
              <div className="relative w-full h-4 mt-1 bg-gray-200 rounded-full overflow-hidden text-[10px] leading-4 text-center text-white font-bold">
                <div className="absolute inset-y-0 left-0 bg-orange-500" style={{ width: `${Math.max(percentSold, 10)}%` }} />
                <span className="relative z-10 drop-shadow">
                  {item.stock === 0 ? 'Cháy hàng' : `Đã bán ${item.sold}`}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
