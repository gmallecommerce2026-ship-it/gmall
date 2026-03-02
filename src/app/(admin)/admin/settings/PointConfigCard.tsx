"use client";
import { useState, useEffect } from 'react';
// Xóa dòng import Card bị lỗi
import { AdminService } from '@/services/AdminService';
import { toast } from 'react-hot-toast'; 
import Button from '@/components/ui/Button'; //

export default function PointConfigCard() {
  const [rate, setRate] = useState<number>(10000);
  const [loading, setLoading] = useState(false);

  // Fetch dữ liệu khi load trang
  useEffect(() => {
    loadRate();
  }, []);

  const loadRate = async () => {
    try {
      const data = await AdminService.getConversionRate();
      // Kiểm tra nếu API trả về data.rate thì set, không thì dùng mặc định
      console.log("data: ", data, " VNĐ = 1 Xu");
      if (data || data.rate) {
        setRate(data || data.rate);
      }
    } catch (error) {
      console.error("Lỗi tải cấu hình xu", error);
      // Không toast lỗi ở đây để tránh spam khi mới vào trang nếu API chưa sẵn sàng
    }
  };

  const handleSave = async () => {
    if (rate < 1000) {
      toast.error("Tỷ lệ quy đổi tối thiểu là 1.000đ/xu");
      return;
    }

    setLoading(true);
    try {
      await AdminService.updateConversionRate(rate);
      toast.success("Đã cập nhật tỷ lệ quy đổi thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi lưu cấu hình.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Sử dụng div với class styles thay vì component Card
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Cấu hình Tích Xu (Loyalty Points)</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tỷ lệ quy đổi (VND / 1 Xu)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Ví dụ: Nếu nhập 10.000, khách hàng mua đơn 100.000đ sẽ nhận được 10 xu.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={1000}
              step={1000}
            />
            <span className="text-gray-600 font-medium">VNĐ = 1 Xu</span>
          </div>
        </div>

        <div className="pt-2 border-t mt-4 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Đang lưu...' : 'Lưu cấu hình'}
          </Button>
        </div>
      </div>
      
      <div className="mt-6 bg-blue-50 p-4 rounded-md">
        <h4 className="text-sm font-bold text-blue-800">Mô phỏng:</h4>
        <ul className="list-disc list-inside text-sm text-blue-700 mt-1">
          <li>Đơn hàng: <strong>250.000đ</strong></li>
          <li>Tỷ lệ hiện tại: <strong>{new Intl.NumberFormat('vi-VN').format(rate)}đ</strong> / xu</li>
          <li>Khách nhận được: <strong>{Math.floor(250000 / (rate || 1))} xu</strong></li>
        </ul>
      </div>
    </div>
  );
}