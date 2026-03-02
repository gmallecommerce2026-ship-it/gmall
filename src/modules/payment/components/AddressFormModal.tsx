"use client";
import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api/ApiClient';
import dynamic from 'next/dynamic';
import { AddressService, IAddress } from '@/services/address.service';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Load Map Dynamic để tránh lỗi SSR
const DeliveryMap = dynamic(() => import('@/components/ui/DeliveryMap'), { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm">Đang tải bản đồ...</div>
});

const CustomSelect = ({ label, value, onChange, options, disabled, loading, placeholder }: any) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide ml-1 flex justify-between">
            {label}
            {loading && <span className="text-[10px] text-brand-orange animate-pulse">đang tải...</span>}
        </label>
        <select 
            className={`w-full px-4 py-2.5 bg-white border rounded-xl outline-none transition-all text-sm ${disabled ? 'bg-gray-50 text-gray-400' : 'border-gray-300 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10'}`}
            value={value || ''} 
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

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: IAddress | null;
}

const AddressFormModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState<Partial<IAddress>>({
      name: '', phone: '', address: '', isDefault: false
  });
  
  // State Labels
  const [selectedLabels, setSelectedLabels] = useState({ province: '', district: '', ward: '' });

  // GHN Data
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  
  const [loadingLoc, setLoadingLoc] = useState({ p: false, d: false, w: false });
  const [submitting, setSubmitting] = useState(false);
  
  // FIX DEADLOCK MAP: Chỉ update query khi thực sự cần thiết
  const [mapQuery, setMapQuery] = useState("");

  // 1. Init Data & Provinces
  useEffect(() => {
    // Reset data hoặc Fill data
    if (initialData) {
        setFormData(initialData);
        // Load lại options cho District/Ward nếu đang Edit
        if(initialData.provinceId) {
                apiClient.get(`/ghn/districts?province_id=${initialData.provinceId}`)
                .then(res => setDistricts(res?.map((d:any) => ({ value: d.DistrictID, label: d.DistrictName })) || []));
        }
        if(initialData.districtId) {
                apiClient.get(`/ghn/wards?district_id=${initialData.districtId}`)
                .then(res => setWards(res?.map((w:any) => ({ value: w.WardCode, label: w.WardName })) || []));
        }
    } else {
        // Mặc định state đã rỗng do Modal được mount mới, nhưng set lại cho chắc chắn
        setFormData({ name: '', phone: '', address: '', isDefault: false });
        setSelectedLabels({ province: '', district: '', ward: '' });
        setMapQuery(""); 
    }
    
    // Load Provinces
    setLoadingLoc(prev => ({ ...prev, p: true }));
    apiClient.get('/ghn/provinces')
        .then(res => setProvinces(res?.map((p:any) => ({ value: p.ProvinceID, label: p.ProvinceName })) || []))
        .catch(() => toast.error("Lỗi tải tỉnh thành"))
        .finally(() => setLoadingLoc(prev => ({ ...prev, p: false })));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Load Districts
  useEffect(() => {
    if (formData.provinceId && (!initialData || formData.provinceId !== initialData.provinceId)) {
        setLoadingLoc(prev => ({ ...prev, d: true }));
        apiClient.get(`/ghn/districts?province_id=${formData.provinceId}`)
            .then(res => setDistricts(res?.map((d:any) => ({ value: d.DistrictID, label: d.DistrictName })) || []))
            .finally(() => setLoadingLoc(prev => ({ ...prev, d: false })));
        
        const pLabel = provinces.find(p => p.value == formData.provinceId)?.label || '';
        setSelectedLabels(prev => ({ ...prev, province: pLabel }));
    } 
  }, [formData.provinceId]);

  // 3. Load Wards
  useEffect(() => {
    if (formData.districtId && (!initialData || formData.districtId !== initialData.districtId)) {
        setLoadingLoc(prev => ({ ...prev, w: true }));
        apiClient.get(`/ghn/wards?district_id=${formData.districtId}`)
            .then(res => setWards(res?.map((w:any) => ({ value: w.WardCode, label: w.WardName })) || []))
            .finally(() => setLoadingLoc(prev => ({ ...prev, w: false })));

        const dLabel = districts.find(d => d.value == formData.districtId)?.label || '';
        setSelectedLabels(prev => ({ ...prev, district: dLabel }));
    }
  }, [formData.districtId]);

  // 4. Update Labels & Map Query (FIXED LOGIC)
  useEffect(() => {
     if (formData.wardCode) {
         const wLabel = wards.find(w => w.value == formData.wardCode)?.label || '';
         const dLabel = districts.find(d => d.value == formData.districtId)?.label || '';
         const pLabel = provinces.find(p => p.value == formData.provinceId)?.label || '';
         
         setSelectedLabels({ province: pLabel, district: dLabel, ward: wLabel });
         
         // FIX DEADLOCK: Chỉ setMapQuery khi có đủ 3 cấp và khác query cũ
         if(pLabel && dLabel && wLabel) {
             const newQuery = `${wLabel}, ${dLabel}, ${pLabel}`;
             if (newQuery !== mapQuery) {
                 setMapQuery(newQuery);
             }
         }
     }
  }, [formData.wardCode, formData.districtId, formData.provinceId, wards, districts, provinces]);

  const handleSubmit = async () => {
      try {
          if(!formData.name || !formData.phone || !formData.provinceId || !formData.districtId || !formData.wardCode || !formData.address) {
              toast.error("Vui lòng điền đầy đủ thông tin");
              return;
          }

          setSubmitting(true);
          
          // ... logic tạo payload giữ nguyên
          const payload: any = { 
              name: formData.name,
              phone: formData.phone,
              provinceId: formData.provinceId,
              districtId: formData.districtId,
              wardCode: formData.wardCode,
              specificAddress: formData.address,
              isDefault: formData.isDefault,
              lat: formData.lat || 0,
              lng: formData.lng || 0,
              fullAddress: `${formData.address}, ${selectedLabels.ward}, ${selectedLabels.district}, ${selectedLabels.province}`
          };

          if (initialData?.id) {
              await AddressService.update(initialData.id, payload);
              toast.success("Cập nhật thành công!");
          } else {
              await AddressService.create(payload);
              toast.success("Thêm mới thành công!");
          }
          
          // Gọi onSuccess và đợi nó hoàn tất (fetch data xong)
          if (onSuccess) {
              await onSuccess();
          }
          // Không cần gọi onClose() ở đây nữa vì onSuccess bên PaymentPage đã set showForm=false
          
      } catch (error: any) {
          console.error(error);
          const msg = error?.response?.data?.message;
          toast.error(Array.isArray(msg) ? msg[0] : (msg || "Có lỗi xảy ra"));
      } finally {
          setSubmitting(false);
      }
  };

  const handleMapSelect = (mapData: { lat: number, lng: number, address?: any }) => {
     // Cập nhật toạ độ không gây re-render các dropdown
     setFormData(prev => ({ ...prev, lat: mapData.lat, lng: mapData.lng }));
     
     // Auto-fill tên đường nếu chưa nhập
     if(mapData.address) {
         const road = mapData.address.road || "";
         const houseNumber = mapData.address.house_number || "";
         if(road && !formData.address) {
             setFormData(prev => ({ ...prev, address: houseNumber ? `${houseNumber} ${road}` : road }));
         }
     }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">{initialData ? 'Cập Nhật Địa Chỉ' : 'Thêm Địa Chỉ Mới'}</h3>
              <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-500 hover:text-red-500" /></button>
          </div>

          <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
              {/* Form Section */}
              <div className="w-full lg:w-[40%] p-6 overflow-y-auto border-r border-gray-100 bg-white">
                  <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-600 uppercase">Họ và tên</label>
                              <input className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-brand-orange" 
                                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nguyễn Văn A" />
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-600 uppercase">Số điện thoại</label>
                              <input className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-brand-orange" 
                                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="09xxxxxxx" />
                          </div>
                      </div>

                      <div className="space-y-4 pt-2">
                          <CustomSelect label="Tỉnh / Thành" value={formData.provinceId} options={provinces} loading={loadingLoc.p}
                              onChange={(v:any) => setFormData({...formData, provinceId: Number(v), districtId: undefined, wardCode: undefined})} placeholder="Chọn Tỉnh/Thành" />
                          
                          <CustomSelect label="Quận / Huyện" value={formData.districtId} options={districts} loading={loadingLoc.d} disabled={!formData.provinceId}
                              onChange={(v:any) => setFormData({...formData, districtId: Number(v), wardCode: undefined})} placeholder="Chọn Quận/Huyện" />
                          
                          <CustomSelect label="Phường / Xã" value={formData.wardCode} options={wards} loading={loadingLoc.w} disabled={!formData.districtId}
                              onChange={(v:any) => setFormData({...formData, wardCode: v})} placeholder="Chọn Phường/Xã" />
                      </div>

                      <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-600 uppercase">Địa chỉ chi tiết (Số nhà, đường)</label>
                          <textarea className="w-full border rounded-lg p-3 text-sm h-20 resize-none outline-none focus:border-brand-orange"
                              value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} 
                              placeholder="Ví dụ: Số 123, đường ABC..." />
                      </div>

                      <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.isDefault ? 'bg-brand-orange border-brand-orange' : 'border-gray-300'}`}>
                              {formData.isDefault && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <input type="checkbox" className="hidden" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} />
                          <span className="text-sm font-medium text-gray-700">Đặt làm địa chỉ mặc định</span>
                      </label>
                  </div>
              </div>

              {/* Map Section */}
              <div className="flex-1 bg-gray-100 relative min-h-[300px] lg:min-h-0">
                  <DeliveryMap 
                      lat={formData.lat} 
                      lng={formData.lng}
                      addressQuery={mapQuery} 
                      onLocationSelect={handleMapSelect}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg text-xs shadow text-gray-600 max-w-xs z-[400]">
                      💡 Kéo thả ghim đỏ để chọn vị trí chính xác.
                  </div>
              </div>
          </div>

          <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 text-sm">Hủy</button>
              <button onClick={handleSubmit} disabled={submitting}
                  className="px-8 py-2.5 rounded-xl font-bold text-white bg-brand-orange hover:bg-brand-orange/90 shadow-lg shadow-orange-200 text-sm flex items-center gap-2">
                  {submitting && <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
                  {initialData ? 'Lưu Thay Đổi' : 'Hoàn Thành'}
              </button>
          </div>
      </div>
    </div>
  );
};

export default AddressFormModal;