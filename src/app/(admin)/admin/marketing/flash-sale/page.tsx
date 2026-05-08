// src/app/(admin)/admin/marketing/flash-sale/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiClock, FiCalendar, FiMoreVertical, FiPlayCircle, FiCheckCircle, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { Zap } from 'lucide-react';
import { AdminService } from '@/services/AdminService';
import { FlashSaleSession, FlashSaleStatus, CreateFlashSaleDto } from '@/types/admin';

// Helper function format date for input datetime-local
const formatDateForInput = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
  return localISOTime;
};

// Helper display format
const formatDisplayDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
};

export default function FlashSalePage() {
  const [sessions, setSessions] = useState<FlashSaleSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<FlashSaleSession | null>(null);

  // Form handling
  const { register, handleSubmit, reset, setValue, setError, formState: { errors, isSubmitting } } = useForm<CreateFlashSaleDto>();

  // Fetch Data
  // hooks-fix wiki 0031: useCallback wrapping for stable effect dep
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdminService.getFlashSaleSessions(selectedDate);
      if (res) {
        // Giả sử API trả về mảng trực tiếp hoặc object { data: [] }
        setSessions(Array.isArray(res) ? res : res.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Handlers
  const handleCreate = () => {
    setEditingSession(null);
    reset({
      startTime: '',
      endTime: '',
      status: FlashSaleStatus.ENABLED
    });
    setIsModalOpen(true);
  };

  const handleEdit = (session: FlashSaleSession) => {
    setEditingSession(session);
    setValue('startTime', formatDateForInput(session.startTime));
    setValue('endTime', formatDateForInput(session.endTime));
    setValue('status', session.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khung giờ này?')) return;
    try {
      await AdminService.deleteFlashSaleSession(id);
      fetchSessions();
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi xóa');
    }
  };

  const handleToggleStatus = async (session: FlashSaleSession) => {
    try {
      const newStatus = session.status === FlashSaleStatus.ENABLED ? FlashSaleStatus.DISABLED : FlashSaleStatus.ENABLED;
      await AdminService.updateFlashSaleSession(session.id, { status: newStatus });
      fetchSessions();
    } catch (error: any) {
      alert('Không thể cập nhật trạng thái: ' + error.message);
    }
  };

  const onSubmit = async (data: CreateFlashSaleDto) => {
    // Validation
    if (new Date(data.endTime) <= new Date(data.startTime)) {
      setError('endTime', { type: 'manual', message: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu' });
      return;
    }

    try {
      // [FIX] Sử dụng Enum trực tiếp thay vì string
      // data.status từ checkbox trả về boolean (true/false)
      // FlashSaleStatus.ENABLED sẽ có giá trị thực là chuỗi "ENABLED" -> Đúng ý API
      const finalStatus = data.status ? FlashSaleStatus.ENABLED : FlashSaleStatus.DISABLED;

      const payload = {
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
        status: finalStatus, // <--- TypeScript sẽ chịu kiểu này
      };

      console.log('Payload gửi lên:', payload);

      if (editingSession) {
        // payload lúc này khớp hoàn toàn với Partial<CreateFlashSaleDto>
        await AdminService.updateFlashSaleSession(editingSession.id, payload);
      } else {
        await AdminService.createFlashSaleSession(payload);
      }
      
      setIsModalOpen(false);
      fetchSessions();
      alert('Thao tác thành công!'); 
    } catch (error: any) {
      console.error(error);
      const errorMessage = Array.isArray(error.message) 
        ? error.message.join(', ') 
        : error.message || 'Có lỗi xảy ra.';
      alert(`Lỗi API: ${errorMessage}`);
    }
  };

  // Stats Calculations (Client side for now based on fetched list)
  const ongoingCount = sessions.filter(s => s.timeStatus === 'ONGOING').length;
  const upcomingCount = sessions.filter(s => s.timeStatus === 'UPCOMING').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <div className="bg-yellow-400 text-red-600 p-1.5 rounded-full"><Zap size={20} fill="currentColor" /></div>
             <h1 className="text-2xl font-bold text-gray-800">Quản Lý Flash Sale</h1>
           </div>
           <p className="text-gray-500 text-sm">Tạo khung giờ & Duyệt sản phẩm đăng ký từ Seller</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-brand-orange text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-orange-600 font-medium shadow-sm transition"
        >
          <FiPlus size={18} /> Tạo Khung Giờ Mới
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-3 gap-6 mb-8">
         <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Đang Diễn Ra</p>
               <h3 className="text-2xl font-bold text-blue-600 mt-1">{ongoingCount} Session{ongoingCount !== 1 && 's'}</h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-full text-blue-600"><FiPlayCircle size={24} /></div>
         </div>
         <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Sắp Diễn Ra</p>
               <h3 className="text-2xl font-bold text-orange-600 mt-1">{upcomingCount} Session{upcomingCount !== 1 && 's'}</h3>
            </div>
            <div className="bg-orange-50 p-3 rounded-full text-orange-600"><FiClock size={24} /></div>
         </div>
         <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Tổng Session (Ngày)</p>
               <h3 className="text-2xl font-bold text-green-600 mt-1">{sessions.length}</h3>
            </div>
            <div className="bg-green-50 p-3 rounded-full text-green-600"><FiCheckCircle size={24} /></div>
         </div>
      </div>

      {/* SESSION LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
           <h3 className="font-bold text-gray-700">Danh Sách Khung Giờ</h3>
           <div className="flex gap-2 text-sm items-center">
              <span className="text-gray-500 mr-2">Lọc theo ngày:</span>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 border rounded shadow-sm text-gray-700 focus:outline-brand-orange"
              />
           </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : sessions.length === 0 ? (
          <div className="p-10 text-center text-gray-500">Không có khung giờ nào trong ngày này.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="px-6 py-4 font-semibold uppercase">Khung Giờ</th>
                <th className="px-6 py-4 font-semibold uppercase">Trạng Thái</th>
                <th className="px-6 py-4 font-semibold uppercase">Sản Phẩm</th>
                <th className="px-6 py-4 font-semibold uppercase">Bật/Tắt</th>
                <th className="px-6 py-4 font-semibold uppercase text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {sessions.map(session => (
                <tr key={session.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-bold text-gray-800">
                      <div className="flex items-center gap-2">
                         <FiClock className="text-gray-400"/> 
                         <span>{formatDisplayDate(session.startTime)} <br/> <span className="text-gray-400 text-xs font-normal">đến</span> {formatDisplayDate(session.endTime)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold
                          ${session.timeStatus === 'ONGOING' ? 'bg-red-100 text-red-600 animate-pulse' : ''}
                          ${session.timeStatus === 'UPCOMING' ? 'bg-blue-100 text-blue-600' : ''}
                          ${session.timeStatus === 'ENDED' ? 'bg-gray-100 text-gray-500' : ''}
                      `}>
                          {session.timeStatus === 'ONGOING' && '⚡ Đang diễn ra'}
                          {session.timeStatus === 'UPCOMING' && 'Sắp diễn ra'}
                          {session.timeStatus === 'ENDED' && 'Đã kết thúc'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="font-bold">{session._count?.products || 0}</span> sản phẩm
                    </td>
                    <td className="px-6 py-4">
                        <button 
                          onClick={() => handleToggleStatus(session)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            session.status === FlashSaleStatus.ENABLED ? 'bg-brand-orange' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            session.status === FlashSaleStatus.ENABLED ? 'translate-x-6' : 'translate-x-1'
                          }`}/>
                        </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => handleEdit(session)} className="text-blue-500 hover:text-blue-700 p-1" title="Chỉnh sửa">
                          <FiEdit2 size={18}/>
                        </button>
                        <button onClick={() => handleDelete(session.id)} className="text-red-400 hover:text-red-600 p-1" title="Xóa">
                          <FiTrash2 size={18}/>
                        </button>
                      </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL CREATE/EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">{editingSession ? 'Cập Nhật Khung Giờ' : 'Tạo Khung Giờ Mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu</label>
                <input 
                  type="datetime-local" 
                  {...register('startTime', { required: 'Vui lòng chọn thời gian bắt đầu' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                />
                {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>}
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>
                <input 
                  type="datetime-local" 
                  {...register('endTime', { required: 'Vui lòng chọn thời gian kết thúc' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                />
                {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime.message}</p>}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="statusCheckbox"
                  className="w-4 h-4 text-brand-orange rounded border-gray-300 focus:ring-brand-orange"
                  {...register('status')}
                  // React Hook Form checkboxes work slightly differently with Enums, but simplified here:
                  onChange={(e) => setValue('status', e.target.checked ? FlashSaleStatus.ENABLED : FlashSaleStatus.DISABLED)}
                  defaultChecked={editingSession ? editingSession.status === FlashSaleStatus.ENABLED : true}
                />
                <label htmlFor="statusCheckbox" className="text-sm text-gray-700">Kích hoạt ngay sau khi tạo</label>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50 flex justify-center items-center"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    editingSession ? 'Lưu Thay Đổi' : 'Tạo Mới'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}