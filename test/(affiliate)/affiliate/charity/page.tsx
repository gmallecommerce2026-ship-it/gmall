import React from 'react';
import { Heart, Users, Target } from 'lucide-react';

export default function CharityPage() {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">Đóng góp của bạn tạo nên thay đổi</h1>
        <p className="text-gray-500">Mỗi đơn hàng affiliate của bạn không chỉ mang lại thu nhập mà còn giúp đỡ cộng đồng.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CharityStat 
          label="Tổng tiền quỹ từ bạn" 
          value="500.000₫" 
          icon={<Heart className="text-red-500 fill-current" />} 
        />
        <CharityStat 
          label="Cộng đồng đã đóng góp" 
          value="125.000.000₫" 
          icon={<Users className="text-blue-500" />} 
        />
        <CharityStat 
          label="Chiến dịch đang chạy" 
          value="3" 
          icon={<Target className="text-orange-500" />} 
        />
      </div>

      {/* Distribution Chart & Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Phân bổ đóng góp</h3>
          <div className="space-y-4">
            <ProgressBar label="Quỹ Trẻ em vùng cao" percent={60} color="bg-blue-500" amount="300.000₫" />
            <ProgressBar label="Cứu trợ động vật" percent={30} color="bg-green-500" amount="150.000₫" />
            <ProgressBar label="Người già neo đơn" percent={10} color="bg-orange-500" amount="50.000₫" />
          </div>
          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            💡 Bạn có thể thay đổi tỷ lệ đóng góp trong phần <span className="font-semibold text-primary-600 cursor-pointer">Cài đặt thanh toán</span>.
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-lg">Chiến dịch từ thiện nổi bật</h3>
          
          <CharityCampaignCard 
            title="Áo ấm cho em 2025"
            desc="Quyên góp mua áo ấm cho trẻ em tại Hà Giang."
            target="500tr"
            current="350tr"
            percent={70}
            image="/images/charity-1.jpg"
          />
          <CharityCampaignCard 
            title="Trạm cứu hộ chó mèo"
            desc="Xây dựng thêm chuồng trại và mua thức ăn y tế."
            target="200tr"
            current="50tr"
            percent={25}
            image="/images/charity-2.jpg"
          />
        </div>
      </div>
    </div>
  );
}

const CharityStat = ({ label, value, icon }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
    <div className="p-4 bg-gray-50 rounded-full mb-3">{icon}</div>
    <div className="text-2xl font-bold text-gray-800">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

const ProgressBar = ({ label, percent, color, amount }: any) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="font-medium">{label}</span>
      <span className="text-gray-500">{amount} ({percent}%)</span>
    </div>
    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
    </div>
  </div>
);

const CharityCampaignCard = ({ title, desc, target, current, percent, image }: any) => (
  <div className="flex bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="w-32 bg-gray-200 shrink-0">
      {/* <Image src={image} ... /> */}
    </div>
    <div className="p-4 flex-1">
      <h4 className="font-bold text-gray-800">{title}</h4>
      <p className="text-sm text-gray-500 mb-3">{desc}</p>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Đạt được: {current}</span>
          <span>Mục tiêu: {target}</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500" style={{ width: `${percent}%` }}></div>
        </div>
      </div>
    </div>
  </div>
);