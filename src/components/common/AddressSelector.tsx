// src/components/common/AddressSelector.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/ApiClient';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';

// Load Map Dynamic để tránh lỗi SSR
const DeliveryMap = dynamic(() => import('@/components/ui/DeliveryMap'), { 
    ssr: false,
    loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm">Đang tải bản đồ...</div>
});

interface AddressData {
    provinceId?: number;
    districtId?: number;
    wardCode?: string;
    specificAddress?: string; // Số nhà, đường
    fullAddress?: string;     // Địa chỉ gộp hiển thị
    lat?: number;
    lng?: number;
}

interface Props {
    value?: AddressData;
    onChange: (data: AddressData) => void;
    disabled?: boolean;
}

// Component Select nhỏ gọn
const CustomSelect = ({ label, value, onChange, options, disabled, loading, placeholder }: any) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex justify-between">
            {label}
            {loading && <span className="text-[10px] text-brand-orange animate-pulse">đang tải...</span>}
        </label>
        <select 
            className={`w-full px-3 py-2.5 bg-white border rounded-lg outline-none transition-all text-sm ${disabled ? 'bg-gray-50 text-gray-400' : 'border-gray-300 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10'}`}
            value={value ?? ''} // Sử dụng nullish coalescing
            onChange={(e) => onChange(e.target.value)} 
            disabled={disabled}
        >
            <option value="">{placeholder}</option>
            {options.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

export const AddressSelector: React.FC<Props> = ({ value, onChange, disabled }) => {
    // GHN Data Lists
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    
    // Loading states
    const [loadingLoc, setLoadingLoc] = useState({ p: false, d: false, w: false });
    
    // Labels for Map Query (để tìm kiếm trên bản đồ)
    const [labels, setLabels] = useState({ p: '', d: '', w: '' });
    const [mapQuery, setMapQuery] = useState("");

    // 1. Load Tỉnh/Thành khi mount
    // hooks-fix wiki 0031: external API fetch — set loading state là sync-loading-flag
    // hợp lệ. Disable set-state-in-effect; thêm provinces.length vào deps gây re-fetch
    // vô tận, dùng eslint-disable cho exhaustive-deps cũng cần.
    useEffect(() => {
        if (provinces.length > 0) return; // Tránh gọi lại nếu đã có data
        setLoadingLoc(prev => ({ ...prev, p: true }));
        apiClient.get('/ghn/provinces')
            .then(res => setProvinces(res?.map((p:any) => ({ value: p.ProvinceID, label: p.ProvinceName })) || []))
            .catch(() => toast.error("Lỗi kết nối GHN"))
            .finally(() => setLoadingLoc(prev => ({ ...prev, p: false })));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. Load Quận/Huyện khi chọn Tỉnh
    useEffect(() => {
        if (value?.provinceId) {
            // Chỉ fetch nếu chưa có district hoặc provinceId thay đổi
            setLoadingLoc(prev => ({ ...prev, d: true }));
            apiClient.get(`/ghn/districts?province_id=${value.provinceId}`)
                .then(res => setDistricts(res?.map((d:any) => ({ value: d.DistrictID, label: d.DistrictName })) || []))
                .finally(() => setLoadingLoc(prev => ({ ...prev, d: false })));

            // Cập nhật label ngay cả khi provinces chưa load xong (sẽ update lại khi provinces load xong)
            const pName = provinces.find(p => p.value == value.provinceId)?.label || '';
            if (pName) setLabels(prev => ({ ...prev, p: pName }));
        } else {
            // [QUAN TRỌNG] Chỉ clear khi thực sự không có provinceId (tránh lỗi khi init value rỗng rồi mới có data)
            setDistricts([]);
            setWards([]);
        }
    }, [value?.provinceId, provinces]);

    // 3. Load Phường/Xã khi chọn Quận
    useEffect(() => {
        if (value?.districtId) {
            setLoadingLoc(prev => ({ ...prev, w: true }));
            apiClient.get(`/ghn/wards?district_id=${value.districtId}`)
                .then(res => setWards(res?.map((w:any) => ({ value: w.WardCode, label: w.WardName })) || []))
                .finally(() => setLoadingLoc(prev => ({ ...prev, w: false })));

            const dName = districts.find(d => d.value == value.districtId)?.label || '';
            if (dName) setLabels(prev => ({ ...prev, d: dName }));
        } else {
             setWards([]);
        }
    }, [value?.districtId, districts]);

    // 4. Update Map Query khi đủ thông tin
    // hooks-fix wiki 0031: thêm mapQuery vào deps; guard `if(query !== mapQuery)` ngăn loop
    useEffect(() => {
        // Logic tìm tên Phường khi Wards đã load xong và có value.wardCode
        if(value?.wardCode && wards.length > 0) {
            const wName = wards.find(w => w.value == value.wardCode)?.label || '';
            if (wName) {
                setLabels(prev => ({ ...prev, w: wName }));
                // Chỉ update query map khi đủ 3 cấp
                if(labels.p && labels.d) {
                    const query = `${wName}, ${labels.d}, ${labels.p}`;
                    if(query !== mapQuery) setMapQuery(query);
                }
            }
        }
    }, [value?.wardCode, wards, labels.p, labels.d, mapQuery]);

    // Xử lý thay đổi dropdown
    const handleChange = (field: keyof AddressData, val: any) => {
        const newData = { ...value, [field]: val };
        
        // Reset cấp con
        if(field === 'provinceId') {
            newData.districtId = undefined;
            newData.wardCode = undefined;
            newData.specificAddress = ''; // Reset cả địa chỉ cũ để user nhập lại
        }
        if(field === 'districtId') {
            newData.wardCode = undefined;
        }

        // Tự động tạo chuỗi fullAddress cho hiển thị
        if(field === 'specificAddress' || field === 'wardCode') {
            // Lấy label hiện tại hoặc tìm trong mảng mới
            const w = field === 'wardCode' ? (wards.find(i => i.value == val)?.label) : labels.w;
            const specific = field === 'specificAddress' ? val : value?.specificAddress;
            // Tạo địa chỉ hiển thị đẹp
            newData.fullAddress = [specific, w, labels.d, labels.p].filter(Boolean).join(', ');
        }

        onChange(newData);
    };

    // Xử lý khi chọn trên Map
    const handleMapSelect = (mapData: { lat: number, lng: number, address?: any }) => {
        const update: any = { lat: mapData.lat, lng: mapData.lng };
        // Nếu chưa nhập số nhà, thử điền tự động từ map
        if(mapData.address && !value?.specificAddress) {
             const road = mapData.address.road || "";
             const house = mapData.address.house_number || "";
             const autoAddr = house ? `${house} ${road}` : road;
             if(autoAddr) update.specificAddress = autoAddr;
        }
        onChange({ ...value, ...update });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <CustomSelect 
                    label="Tỉnh / Thành" 
                    value={value?.provinceId} 
                    options={provinces} 
                    loading={loadingLoc.p} 
                    disabled={disabled}
                    onChange={(v:any) => handleChange('provinceId', Number(v))} // Ép kiểu Number
                    placeholder="-- Chọn Tỉnh --" 
                />
                
                <CustomSelect 
                    label="Quận / Huyện" 
                    value={value?.districtId} 
                    options={districts} 
                    loading={loadingLoc.d} 
                    disabled={disabled || !value?.provinceId}
                    onChange={(v:any) => handleChange('districtId', Number(v))} // Ép kiểu Number
                    placeholder="-- Chọn Quận --" 
                />
                
                <CustomSelect 
                    label="Phường / Xã" 
                    value={value?.wardCode} 
                    options={wards} 
                    loading={loadingLoc.w} 
                    disabled={disabled || !value?.districtId}
                    onChange={(v:any) => handleChange('wardCode', v)} // WardCode là String
                    placeholder="-- Chọn Phường --" 
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase">Số nhà, Tên đường</label>
                <input 
                    className="w-full border rounded-lg p-3 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all"
                    value={value?.specificAddress || ''}
                    onChange={e => handleChange('specificAddress', e.target.value)}
                    placeholder="Ví dụ: 123 Đường Nguyễn Huệ..."
                    disabled={disabled}
                />
            </div>

            {/* Map Preview */}
            <div className="w-full h-[300px] rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
                <DeliveryMap 
                    lat={value?.lat} 
                    lng={value?.lng}
                    addressQuery={mapQuery} 
                    onLocationSelect={handleMapSelect}
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded shadow text-[10px] text-gray-500 z-[400]">
                    Kéo thả ghim để chọn vị trí chính xác
                </div>
            </div>
        </div>
    );
};