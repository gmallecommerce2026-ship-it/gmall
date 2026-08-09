'use client';
import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Copy, Gift, Send, Share2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast'; // Đảm bảo bạn đã cài thư viện toast
import { useUserStore } from '@/store/useUserStore'; // Lấy user hiện tại để ref link đúng
import { apiClient } from '@/lib/api/ApiClient';

// Danh sách mẫu lời mời
const INVITE_TEMPLATES = [
    {
        id: 'default',
        label: 'Mặc định',
        content: 'Tham gia G-Mall cùng mình nhé! Ở đây có nhiều quà tặng ý nghĩa và ưu đãi hấp dẫn lắm.'
    },
    {
        id: 'fun',
        label: 'Rủ rê vui vẻ',
        content: 'Ê bồ, vào G-Mall lập team săn quà với tui đi. Đang có chương trình thưởng 20k điểm cho người mới đó!'
    },
    {
        id: 'formal',
        label: 'Trang trọng',
        content: 'Kính mời bạn trải nghiệm G-Mall - Nền tảng quà tặng trực tuyến uy tín. Đăng ký qua link của tôi để nhận ưu đãi chào mừng.'
    },
    {
        id: 'short',
        label: 'Ngắn gọn',
        content: 'G-Mall hay lắm, vào đăng ký thử đi!'
    }
];

export default function InvitePage() {
  // State cho form gửi mail
  const [email, setEmail] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(INVITE_TEMPLATES[0].id);
  const [customMessage, setCustomMessage] = useState(INVITE_TEMPLATES[0].content);
  const [loading, setLoading] = useState(false);

  // State cho copy link
  const [copied, setCopied] = useState(false);
  const { user } = useUserStore(); // Lấy user ID

  // B3.6: dùng origin hiện tại (gmall.onrender.com, gmall.vn, localhost...) thay vì
  // hardcode lovegifts.vn. SSR fallback về env NEXT_PUBLIC_SITE_URL hoặc empty string.
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL ?? '');
  const referralLink = user?.id
    ? `${origin}/register?ref=${user.id}`
    : `${origin}/register`;

  // Khi chọn template, fill nội dung vào textarea
  useEffect(() => {
    const template = INVITE_TEMPLATES.find(t => t.id === selectedTemplate);
    if (template) {
        setCustomMessage(template.content);
    }
  }, [selectedTemplate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Đã sao chép liên kết giới thiệu!");
  };

  const handleSendInvite = async () => {
      if (!email || !customMessage) {
          toast.error("Vui lòng nhập email và nội dung lời mời");
          return;
      }

      setLoading(true);
      try {
          // wiki 0095 B4 — BUG GỐC khách chụp màn hình ("chỗ này báo lỗi email gửi đi"):
          // code cũ đọc `res.data.type`, nhưng ApiClient.post KHÔNG bọc kiểu axios —
          // nó trả THẲNG body JSON đã parse (xem ApiClient.request → res.json()).
          // Nên `res.data` là undefined → `res.data.type` ném TypeError → rơi vào
          // catch → LUÔN hiện toast đỏ "Có lỗi xảy ra khi gửi lời mời", kể cả khi
          // BE đã gửi mail thành công. Email vẫn đi, chỉ là UI báo sai.
          const res: any = await apiClient.post('/friends/invite-by-email', {
              email,
              message: customMessage
          });

          // BE trả { success, type: 'internal' | 'email', message } và message đã
          // nêu rõ email đích → hiển thị thẳng thay vì câu chung chung.
          toast.success(
              res?.message ||
              (res?.type === 'internal'
                  ? 'Đã gửi lời mời kết bạn!'
                  : 'Đã gửi thư mời thành công!')
          );

          setEmail(''); // Reset email sau khi gửi
      } catch (error: any) {
          // BE nêu rõ lý do (trùng email đã mời, đã là bạn bè, email của chính mình...)
          // — ưu tiên message thật, chỉ fallback khi mất mạng.
          toast.error(
              error?.response?.data?.message ||
              error?.message ||
              'Có lỗi xảy ra khi gửi lời mời'
          );
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Giới thiệu bạn bè</h1>
      
      {/* Banner Intro - GIỮ NGUYÊN */}
      <div className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl p-6 mb-8 flex items-start gap-4 border border-orange-200">
         <div className="bg-white p-3 rounded-full shadow-sm text-brand-orange">
            <Gift size={32} className="text-orange-500" />
         </div>
         <div>
             <h2 className="text-lg font-bold text-gray-800 mb-2">Mời bạn thêm vui - Nhận quà cực chất</h2>
             {/* wiki 0095 B6: câu cũ ghi "đăng ký thành viên thành công là được
                 20.000 điểm" — SAI so với luật thật trong code
                 (order.service.handleReferralReward): điểm chỉ về khi bạn được
                 mời có ĐƠN ĐẦU TIÊN đạt giá trị tối thiểu VÀ đã giao thành công.
                 Hứa sai về tiền/điểm là thứ user sẽ khiếu nại. */}
             <p className="text-sm text-gray-700 leading-relaxed">
                Mời bạn bè đăng ký GMall qua link của bạn. Khi bạn ấy nhận thành công đơn hàng đầu tiên đạt giá trị tối thiểu, bạn được cộng <span className="font-bold text-brand-orange text-orange-600">điểm thưởng</span> vào tài khoản tích lũy.{' '}
                <a href="/user/affiliate" className="text-orange-600 font-medium hover:underline">Xem link giới thiệu &amp; tiến độ →</a>
             </p>
         </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
          {/* Phần 1: Gửi thư mời qua Email - NÂNG CẤP */}
          <div className="flex flex-col">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Send size={18} className="text-blue-500"/> Gửi thư mời qua Email
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col">
                  <p className="text-sm text-gray-500 mb-4">
                      Nhập email của bạn bè và chọn lời nhắn để gửi lời mời tham gia ngay lập tức.
                  </p>
                  
                  <div className="space-y-4 flex-1">
                      {/* Email Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email bạn muốn mời:</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="vidu: banbe@gmail.com"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-orange-500 text-sm"
                        />
                      </div>

                      {/* Template Selector */}
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mẫu lời nhắn:</label>
                          <div className="relative">
                            <select
                                value={selectedTemplate}
                                onChange={(e) => setSelectedTemplate(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-orange-500 text-sm bg-white appearance-none cursor-pointer"
                            >
                                {INVITE_TEMPLATES.map(t => (
                                    <option key={t.id} value={t.id}>{t.label}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                          </div>
                      </div>

                      {/* Custom Message Textarea */}
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Nội dung chi tiết <span className="font-normal text-gray-400 text-xs">(có thể sửa)</span>:
                          </label>
                          <textarea 
                              value={customMessage}
                              onChange={(e) => setCustomMessage(e.target.value)}
                              rows={4}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-orange-500 text-sm resize-none"
                          />
                      </div>
                  </div>

                  <div className="mt-6">
                      <Button 
                        onClick={handleSendInvite}
                        disabled={loading || !email}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                          {loading ? (
                             <>Đang gửi...</>
                          ) : (
                             <><Send size={16} /> Gửi thư mời</>
                          )}
                      </Button>
                  </div>
              </div>
          </div>

          {/* Phần 2: Sao chép link - GIỮ NGUYÊN (Chỉ cập nhật Logic lấy user ID) */}
          <div className="flex flex-col">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Share2 size={18} className="text-green-500"/> Chia sẻ liên kết
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-4">
                        Hãy copy link dưới đây vào email, facebook để gửi cho bạn bè của bạn cùng tham gia GMall.
                    </p>
                    
                    <div className="space-y-3">
                        <div className="relative">
                            <input 
                                type="text" 
                                readOnly 
                                value={referralLink}
                                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600 font-medium focus:outline-none"
                            />
                            <button 
                                onClick={handleCopy}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                                title="Sao chép"
                            >
                                {copied ? <Check size={18} className="text-green-600"/> : <Copy size={18} className="text-gray-500"/>}
                            </button>
                        </div>
                        <div className="text-xs text-gray-400 text-center italic">
                            (Mã giới thiệu của bạn là: <span className="font-bold text-gray-600">{user?.id || '...'}</span>)
                        </div>
                    </div>
                  </div>

                  <div className="mt-4">
                      <Button 
                        variant="outline" 
                        onClick={handleCopy}
                        className={`w-full border-brand-orange text-brand-orange hover:bg-orange-50 ${copied ? 'bg-orange-50' : ''}`}
                      >
                         {copied ? 'Đã sao chép!' : 'Sao chép link'}
                      </Button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}