'use client';

import React from 'react';
import { FiShield, FiHeart, FiDollarSign, FiBookOpen } from 'react-icons/fi';

export default function PoliciesPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chính sách & Quy định G-Mall</h1>
        <p className="text-gray-600 mt-2 text-lg">
          Cam kết minh bạch về chất lượng, phí vận hành và trách nhiệm xã hội.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Card 1: Phí sàn & Charity */}
        <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl border border-orange-100 shadow-sm">
            <div className="w-12 h-12 bg-orange-100 text-brand-orange rounded-xl flex items-center justify-center mb-6">
                <FiHeart size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cấu trúc Phí sàn & Quỹ Từ thiện</h2>
            <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
                <p>
                    Khác với các sàn TMĐT thông thường, G-Mall áp dụng mức phí bán hàng cố định là 
                    <span className="font-bold text-gray-900 text-lg mx-1">8%</span> 
                    trên mỗi đơn hàng thành công.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><span className="font-semibold">5%</span>: Phí vận hành hệ thống, marketing và kiểm duyệt chất lượng 3 lớp.</li>
                    <li>
                        <span className="font-semibold text-green-600">3%</span>: 
                        Được chuyển trực tiếp vào <strong>Quỹ G-Charity</strong>.
                    </li>
                </ul>
                <p className="italic text-gray-500 bg-white p-3 rounded-lg border border-orange-100 mt-2">
                    "Mỗi món quà được bán ra không chỉ mang lại niềm vui cho người nhận mà còn góp phần giúp đỡ những hoàn cảnh khó khăn."
                </p>
            </div>
        </div>

        {/* Card 2: Tiêu chuẩn chất lượng */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <FiShield size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tiêu chuẩn "G-Quality"</h2>
            <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
                <p>
                    Để duy trì trải nghiệm quà tặng cao cấp, Shop cần tuân thủ nghiêm ngặt:
                </p>
                <div className="space-y-3">
                    <div className="flex gap-3">
                        <span className="font-bold text-gray-900 min-w-[80px]">Bao bì:</span>
                        <span>Sản phẩm BẮT BUỘC phải có hộp quà, thiệp hoặc bao bì đóng gói chỉn chu, thẩm mỹ. Không chấp nhận gói bằng túi nilon đen.</span>
                    </div>
                    <div className="flex gap-3">
                        <span className="font-bold text-gray-900 min-w-[80px]">Hình ảnh:</span>
                        <span>Ảnh thật 100%, nền sạch (trắng hoặc décor phong cách), không chèn text quảng cáo rác.</span>
                    </div>
                    <div className="flex gap-3">
                        <span className="font-bold text-gray-900 min-w-[80px]">Xử lý:</span>
                        <span>Thời gian chuẩn bị hàng tối đa 24h (48h với hàng thiết kế riêng).</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Chi tiết văn bản pháp lý */}
      <div className="space-y-8">
          <section>
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                  <FiDollarSign className="text-gray-400" />
                  Quy định về Thanh toán & Đối soát
              </h3>
              <div className="text-gray-600 text-sm space-y-2 pl-4">
                  <p>1. Chu kỳ đối soát: G-Mall thực hiện đối soát tự động vào Thứ 2 và Thứ 5 hàng tuần.</p>
                  <p>2. Số dư khả dụng: Tiền hàng sẽ được ghi nhận vào ví Seller sau 3 ngày kể từ khi khách hàng xác nhận "Đã nhận được hàng" và không có khiếu nại.</p>
                  <p>3. Thuế: Seller có trách nhiệm xuất hóa đơn VAT cho khách hàng nếu có yêu cầu. G-Mall sẽ xuất hóa đơn VAT cho phần phí sàn thu của Seller.</p>
              </div>
          </section>

          <section>
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                  <FiBookOpen className="text-gray-400" />
                  Bộ quy tắc ứng xử (Code of Conduct)
              </h3>
              <div className="text-gray-600 text-sm space-y-2 pl-4">
                  <p>G-Mall xây dựng cộng đồng bán hàng văn minh. Chúng tôi nghiêm cấm:</p>
                  <ul className="list-disc pl-5 space-y-1">
                      <li>Sử dụng ngôn từ thiếu văn hóa, xúc phạm khách hàng trong kênh Chat.</li>
                      <li>Gửi hàng giả, hàng nhái, hoặc hàng khác hoàn toàn so với mô tả (Treo đầu dê bán thịt chó).</li>
                      <li>Gian lận đơn hàng ảo để tăng đánh giá/lượt mua.</li>
                  </ul>
                  <p className="text-red-500 font-medium mt-2">
                      * Vi phạm lần 1: Cảnh cáo & Khóa sản phẩm. <br/>
                      * Vi phạm lần 2: Khóa gian hàng vĩnh viễn & Giam giữ tiền hàng 90 ngày để xử lý khiếu nại.
                  </p>
              </div>
          </section>
      </div>

      <div className="mt-12 p-6 bg-gray-50 rounded-xl text-center">
          <p className="text-gray-500 text-sm mb-4">Cập nhật lần cuối: 01/01/2026</p>
          <button className="text-brand-orange hover:text-orange-700 font-medium text-sm underline">
              Tải xuống bản PDF đầy đủ
          </button>
      </div>
    </div>
  );
}