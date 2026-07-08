'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { Plus, MoreVertical } from 'lucide-react';
import { AddressService, IAddress } from '@/services/address.service';
import { toast } from 'react-hot-toast';
// CẬP NHẬT IMPORT ĐỂ DÙNG CHUNG FORM VỚI TRANG PAYMENT
import AddressFormModal from '@/modules/payment/components/AddressFormModal';

export default function AddressPage() {
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IAddress | null>(null);

  const fetchAddresses = async () => {
    try {
      // TS-fix wiki 0031: AddressService.getAll trả thẳng IAddress[]; xử lý null fallback
      const res = await AddressService.getAll();
      const list = Array.isArray(res) ? res : ((res as any)?.data ?? []);
      setAddresses(list);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (id: string) => {
    if(!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
        await AddressService.delete(id);
        toast.success('Đã xóa địa chỉ');
        fetchAddresses(); // Reload list
    } catch (error) {
        toast.error('Không thể xóa địa chỉ');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
        await AddressService.setDefault(id);
        toast.success('Đã thiết lập mặc định');
        fetchAddresses();
    } catch (error) {
        toast.error('Lỗi kết nối');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
        <div>
            <h1 className="text-xl font-bold text-gray-800">Địa chỉ của tôi</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý thông tin giao hàng</p>
        </div>
        <Button
          className="!px-4 !py-2.5 flex items-center gap-2 text-sm"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
            <Plus size={16} /> Thêm địa chỉ mới
        </Button>
      </div>

      {/* Address List */}
      {loading ? (
         <div className="text-center py-10">Đang tải...</div>
      ) : (
      <div className="space-y-6">
        {addresses.length === 0 && <p className="text-gray-500">Bạn chưa lưu địa chỉ nào.</p>}
        
        {addresses.map((addr) => (
            <div key={addr.id} className="flex flex-col md:flex-row justify-between border-b border-gray-100 pb-6 last:border-0">
                <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800 text-base">{addr.name}</span>
                        <div className="h-4 w-px bg-gray-300 mx-1"></div>
                        <span className="text-gray-500 text-sm">{addr.phone}</span>
                    </div>
                    <div className="text-gray-600 text-sm mb-2">
                        <p>{addr.address}</p>
                        <p>{addr.fullAddress}</p> 
                    </div>
                    <div className="flex gap-2 mt-2">
                        {addr.isDefault && (
                            <span className="border border-brand-orange text-brand-orange text-xs px-2 py-0.5 rounded font-medium">Mặc định</span>
                        )}
                    </div>
                </div>
                
                <div className="flex md:flex-col items-end justify-center gap-3 md:gap-2 mt-4 md:mt-0">
                    <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setEditing(addr);
                            setModalOpen(true);
                          }}
                          className="text-blue-600 text-sm hover:underline font-medium"
                        >
                          Cập nhật
                        </button>
                        {!addr.isDefault && (
                            <button 
                                onClick={() => handleDelete(addr.id!)}
                                className="text-red-500 text-sm hover:underline"
                            >
                                Xóa
                            </button>
                        )}
                    </div>
                    <button 
                        onClick={() => !addr.isDefault && handleSetDefault(addr.id!)}
                        className={`text-sm px-3 py-1.5 border rounded transition-colors ${addr.isDefault ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-gray-300 text-gray-600 hover:border-brand-orange hover:text-brand-orange'}`}
                        disabled={addr.isDefault}
                    >
                        Thiết lập mặc định
                    </button>
                </div>
            </div>
        ))}
      </div>
      )}

      {/* SỬA LẠI PROPS ĐỂ MATCH VỚI PAYMENT ADDRESS MODAL */}
      <AddressFormModal
        isOpen={modalOpen}
        initialData={editing}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchAddresses}
      />
    </div>
  );
}