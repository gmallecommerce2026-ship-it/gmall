// src/modules/payment/components/AddressSelectionModal.tsx
import React from 'react';
import { IAddress } from '@/services/address.service';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    addresses: IAddress[];
    selectedId: string | undefined;
    onSelect: (addr: IAddress) => void;
    onEdit: (addr: IAddress) => void;
    onAddNew: () => void;
}

const AddressSelectionModal: React.FC<Props> = ({ isOpen, onClose, addresses, selectedId, onSelect, onEdit, onAddNew }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[990] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
                <div className="p-5 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">Địa Chỉ Của Tôi</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-black">Đóng</button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
                    {addresses.map((addr) => {
                        const isSelected = selectedId === addr.id;
                        return (
                            <div key={addr.id} onClick={() => onSelect(addr)}
                                className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer bg-white flex justify-between items-start ${isSelected ? 'border-brand-orange shadow-sm ring-1 ring-brand-orange/20' : 'border-transparent hover:border-gray-200 hover:shadow-md'}`}
                            >
                                <div className="flex gap-3">
                                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-brand-orange' : 'border-gray-300'}`}>
                                        {isSelected && <div className="w-2.5 h-2.5 bg-brand-orange rounded-full" />}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">{addr.name}</span>
                                            <span className="h-4 w-[1px] bg-gray-300"></span>
                                            <span className="text-gray-600 font-medium">{addr.phone}</span>
                                            {addr.isDefault && <span className="bg-brand-orange text-white text-[10px] px-2 py-0.5 rounded font-bold">Mặc định</span>}
                                        </div>
                                        <p className="text-sm text-gray-600">{addr.fullAddress}</p>
                                    </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); onEdit(addr); }} className="text-brand-orange text-sm font-semibold underline hover:opacity-80 p-2">Sửa</button>
                            </div>
                        );
                    })}
                    
                    {addresses.length === 0 && (
                        <div className="text-center py-8 text-gray-500 italic">Bạn chưa lưu địa chỉ nào.</div>
                    )}
                </div>

                <div className="p-5 border-t bg-white rounded-b-2xl flex gap-3">
                    <button onClick={onAddNew} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 flex justify-center items-center gap-2">
                        <span className="text-xl leading-none">+</span> Thêm địa chỉ mới
                    </button>
                    <button onClick={onClose} className="flex-1 py-3 bg-brand-orange text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:opacity-90">Xác nhận</button>
                </div>
            </div>
        </div>
    );
};

export default AddressSelectionModal;