import { Metadata } from 'next';
import Link from 'next/link';
import { CharityService, CharityFund } from '@/services/charity.service';

export const metadata: Metadata = {
  title: 'Quỹ từ thiện — GMall',
  description:
    'Chung tay góp sức cùng GMall xây dựng các quỹ từ thiện ý nghĩa. Mỗi đóng góp là một hành động yêu thương.',
};

// Server component fetch trực tiếp từ BE. Không cache (data thay đổi khi có donation mới).
// Nếu tương lai muốn ISR, dùng `revalidate = 60` để refresh mỗi phút.
async function getFunds(): Promise<CharityFund[]> {
  try {
    return await CharityService.listFunds();
  } catch (err) {
    console.error('[charity] Failed to list funds', err);
    return [];
  }
}

function formatVND(amount: string) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function ProgressBar({ current, goal }: { current: string; goal: string }) {
  const g = Number(goal);
  const c = Number(current);
  const pct = g > 0 ? Math.min(100, Math.round((c / g) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span className="font-semibold text-brand-orange">{formatVND(current)}</span>
        <span>{g > 0 ? `mục tiêu ${formatVND(goal)}` : 'không giới hạn'}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-orange transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function CharityPage() {
  const funds = await getFunds();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Quỹ từ thiện <span className="text-brand-orange">GMall</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Mỗi món quà bạn tặng, mỗi đơn hàng bạn đặt đều góp phần nhỏ vào các quỹ hỗ
          trợ cộng đồng. Chung tay cùng chúng tôi để lan tỏa yêu thương.
        </p>
      </header>

      {funds.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          Hiện chưa có quỹ nào đang hoạt động. Hãy quay lại sau.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {funds.map((fund) => (
            <Link
              key={fund.id}
              href={`/charity/${fund.slug}`}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-100 flex flex-col"
            >
              {fund.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fund.image}
                  alt={fund.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6 flex-1 flex flex-col gap-4">
                <h2 className="text-lg font-bold text-gray-900 line-clamp-2">{fund.name}</h2>
                {fund.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">{fund.description}</p>
                )}
                <div className="mt-auto">
                  <ProgressBar current={fund.currentAmount} goal={fund.goalAmount} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
