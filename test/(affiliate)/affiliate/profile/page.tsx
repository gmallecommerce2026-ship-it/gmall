'use client';
import React, { useState } from 'react';
import { User, CreditCard, Bell, Save } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function AffiliateProfilePage() {
  const [activeTab, setActiveTab] = useState('info'); // info | payment | noti

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Hồ sơ Affiliate</h1>

      <div className="flex flex-col md:flex-row gap-6">
         {/* Left Sidebar Menu */}
         <div className="w-full md:w-64 space-y-2">
            <ProfileTabButton 
               active={activeTab === 'info'} 
               onClick={() => setActiveTab('info')} 
               icon={<User size={18}/>} 
               label="Thông tin chung"
            />
            <ProfileTabButton 
               active={activeTab === 'payment'} 
               onClick={() => setActiveTab('payment')} 
               icon={<CreditCard size={18}/>} 
               label="Tài khoản nhận tiền"
            />
            <ProfileTabButton 
               active={activeTab === 'noti'} 
               onClick={() => setActiveTab('noti')} 
               icon={<Bell size={18}/>} 
               label="Cài đặt thông báo"
            />
         </div>

         {/* Right Content Form */}
         <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
            
            {/* TAB: INFO */}
            {activeTab === 'info' && (
               <div className="space-y-6">
                  <h2 className="text-lg font-bold border-b pb-4 mb-4">Thông tin cá nhân</h2>
                  
                  <div className="flex items-center gap-4 mb-6">
                     <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500">
                        A
                     </div>
                     <Button variant="outline">Đổi Avatar</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormGroup label="Họ và tên" value="Nguyễn Văn A" />
                     <FormGroup label="Số điện thoại" value="0987654321" />
                     <FormGroup label="Email" value="nguyenvana@gmail.com" disabled />
                     <FormGroup label="Mã giới thiệu (Ref ID)" value="user123" disabled note="Không thể thay đổi" />
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                     <Button className="gap-2"><Save size={16}/> Lưu thay đổi</Button>
                  </div>
               </div>
            )}

            {/* TAB: PAYMENT */}
            {activeTab === 'payment' && (
               <div className="space-y-6">
                  <h2 className="text-lg font-bold border-b pb-4 mb-4">Thông tin thanh toán</h2>
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm mb-4">
                     ⚠️ Vui lòng điền chính xác thông tin ngân hàng. Tên chủ tài khoản phải trùng với tên đăng ký (Nguyễn Văn A).
                  </div>

                  <div className="space-y-4 max-w-md">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngân hàng</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-primary-500">
                           <option>Vietcombank</option>
                           <option>Techcombank</option>
                           <option>MB Bank</option>
                        </select>
                     </div>
                     <FormGroup label="Số tài khoản" placeholder="Nhập số tài khoản..." />
                     <FormGroup label="Tên chủ tài khoản" value="NGUYEN VAN A" placeholder="Viết hoa không dấu" />
                     <FormGroup label="Chi nhánh (Optional)" placeholder="VD: Chi nhánh Ba Đình" />
                  </div>

                  <div className="pt-4 flex justify-end">
                     <Button className="gap-2"><Save size={16}/> Cập nhật ngân hàng</Button>
                  </div>
               </div>
            )}

            {/* TAB: NOTIFICATION */}
            {activeTab === 'noti' && (
               <div className="space-y-6">
                  <h2 className="text-lg font-bold border-b pb-4 mb-4">Cài đặt thông báo</h2>
                  
                  <div className="space-y-4">
                     <ToggleRow title="Thông báo khi có đơn hàng mới" desc="Nhận email ngay khi có người mua hàng qua link của bạn." checked={true} />
                     <ToggleRow title="Thông báo đối soát hoa hồng" desc="Nhận thông báo vào các kỳ đối soát hàng tháng." checked={true} />
                     <ToggleRow title="Tin tức chiến dịch mới" desc="Nhận thông báo khi có chiến dịch thưởng hấp dẫn." checked={false} />
                  </div>

                   <div className="pt-4 flex justify-end">
                     <Button className="gap-2"><Save size={16}/> Lưu cài đặt</Button>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

// Sub-components for Profile Page
const ProfileTabButton = ({ active, onClick, icon, label }: any) => (
   <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
         active ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
      }`}
   >
      {icon} {label}
   </button>
);

const FormGroup = ({ label, value, placeholder, disabled, note }: any) => (
   <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input 
         type="text" 
         defaultValue={value} 
         placeholder={placeholder}
         disabled={disabled}
         className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-primary-500 ${disabled ? 'bg-gray-100 text-gray-500' : ''}`}
      />
      {note && <p className="text-xs text-gray-500 mt-1">{note}</p>}
   </div>
);

const ToggleRow = ({ title, desc, checked }: any) => (
   <div className="flex items-start justify-between py-2">
      <div>
         <p className="font-medium text-gray-800">{title}</p>
         <p className="text-sm text-gray-500">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
         <input type="checkbox" className="sr-only peer" defaultChecked={checked} />
         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
      </label>
   </div>
);