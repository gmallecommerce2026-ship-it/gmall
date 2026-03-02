'use client';
import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { Copy, Gift, Send, Share2, Check } from 'lucide-react';
import { InputGroup } from '@/components/ui/InputGroup';

export default function InvitePage() {
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);

  const referralLink = "https://lovegifts.vn/register?ref=NGUYENA99";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Giới thiệu bạn bè</h1>
      
      {/* Banner Intro */}
      <div className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl p-6 mb-8 flex items-start gap-4 border border-orange-200">
         <div className="bg-white p-3 rounded-full shadow-sm text-brand-orange">
            <Gift size={32} />
         </div>
         <div>
             <h2 className="text-lg font-bold text-gray-800 mb-2">Mời bạn thêm vui - Nhận quà cực chất</h2>
             <p className="text-sm text-gray-700 leading-relaxed">
                Mời bạn bè tham gia đăng ký thành viên thành công tại Lovegifts, bạn sẽ được cộng <span className="font-bold text-brand-orange">20.000 điểm thưởng</span> vào tài khoản tích lũy.
             </p>
         </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
          {/* Phần 1: Gửi thư mời qua Email */}
          <div className="flex flex-col">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Send size={18} className="text-blue-500"/> Gửi thư mời qua Email
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full">
                  <p className="text-sm text-gray-500 mb-4">Nhập email của bạn bè để gửi lời mời tham gia ngay lập tức.</p>
                  
                  <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email bạn muốn mời tham gia:</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="vidu: banbe@gmail.com"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange text-sm"
                        />
                      </div>
                      <Button className="w-full flex items-center justify-center gap-2">
                          <Send size={16} /> Gửi thư mời
                      </Button>
                  </div>
              </div>
          </div>

          {/* Phần 2: Sao chép link */}
          <div className="flex flex-col">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Share2 size={18} className="text-green-500"/> Chia sẻ liên kết
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col justify-between">
                  <p className="text-sm text-gray-500 mb-4">
                    Hãy copy link dưới đây vào email, facebook để gửi cho bạn bè của bạn cùng tham gia LoveGifts.
                  </p>
                  
                  <div className="space-y-2">
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