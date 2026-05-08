'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { AddressService, IAddress } from '@/services/address.service';
import {
  GhnService,
  GhnProvince,
  GhnDistrict,
  GhnWard,
} from '@/services/ghn.service';

interface Props {
  open: boolean;
  initial?: IAddress | null;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Form tạo/sửa địa chỉ giao hàng với 3-level cascade dropdown GHN.
 *
 * Why GHN cascade thay vì text input tự do:
 * - Shipping fee & time calculation BE cần provinceId/districtId/wardCode
 *   khớp hệ GHN. Free text -> mất hoàn toàn feature tính phí.
 * - Quy cách GHN: province (int), district (int), ward (string code).
 *
 * Fix B2.2: trước đây button "Thêm/Cập nhật" không có onClick -> page
 * chỉ hiển thị readonly, không thể CRUD.
 */
export default function AddressFormModal({ open, initial, onClose, onSaved }: Props) {
  const isEdit = !!initial?.id;

  const [form, setForm] = useState<IAddress>({
    name: '',
    phone: '',
    provinceId: 0,
    districtId: 0,
    wardCode: '',
    address: '',
    fullAddress: '',
    isDefault: false,
  });

  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);
  const [saving, setSaving] = useState(false);

  // Reset form mỗi lần mở modal với initial khác.
  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({ ...initial });
      } else {
        setForm({
          name: '',
          phone: '',
          provinceId: 0,
          districtId: 0,
          wardCode: '',
          address: '',
          fullAddress: '',
          isDefault: false,
        });
      }
    }
  }, [open, initial]);

  // Load provinces 1 lần.
  useEffect(() => {
    if (!open) return;
    GhnService.getProvinces()
      .then(setProvinces)
      .catch(() => toast.error('Không tải được danh sách tỉnh/thành'));
  }, [open]);

  // Cascade: khi provinceId đổi -> load districts.
  useEffect(() => {
    if (!form.provinceId) {
      setDistricts([]);
      return;
    }
    GhnService.getDistricts(form.provinceId)
      .then(setDistricts)
      .catch(() => setDistricts([]));
  }, [form.provinceId]);

  // Cascade: districtId đổi -> load wards.
  useEffect(() => {
    if (!form.districtId) {
      setWards([]);
      return;
    }
    GhnService.getWards(form.districtId)
      .then(setWards)
      .catch(() => setWards([]));
  }, [form.districtId]);

  // Build fullAddress mỗi lần form đổi. Admin không phải edit tay.
  const computeFullAddress = () => {
    const parts: string[] = [];
    if (form.address) parts.push(form.address);
    const ward = wards.find((w) => w.WardCode === form.wardCode);
    if (ward) parts.push(ward.WardName);
    const district = districts.find((d) => d.DistrictID === form.districtId);
    if (district) parts.push(district.DistrictName);
    const province = provinces.find((p) => p.ProvinceID === form.provinceId);
    if (province) parts.push(province.ProvinceName);
    return parts.join(', ');
  };

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.address) {
      toast.error('Vui lòng điền họ tên, số điện thoại và địa chỉ cụ thể');
      return;
    }
    if (!form.provinceId || !form.districtId || !form.wardCode) {
      toast.error('Vui lòng chọn đủ tỉnh, quận/huyện và phường/xã');
      return;
    }

    setSaving(true);
    try {
      const payload: IAddress = {
        ...form,
        fullAddress: computeFullAddress(),
      };
      if (isEdit && initial?.id) {
        await AddressService.update(initial.id, payload);
        toast.success('Đã cập nhật địa chỉ');
      } else {
        await AddressService.create(payload);
        toast.success('Đã thêm địa chỉ mới');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi lưu địa chỉ');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <header className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg text-gray-900">
            {isEdit ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </header>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Họ tên"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 border rounded-lg outline-none focus:border-brand-orange"
            />
            <input
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="px-3 py-2 border rounded-lg outline-none focus:border-brand-orange"
            />
          </div>

          <select
            value={form.provinceId || ''}
            onChange={(e) =>
              setForm({
                ...form,
                provinceId: Number(e.target.value),
                districtId: 0,
                wardCode: '',
              })
            }
            className="w-full px-3 py-2 border rounded-lg outline-none focus:border-brand-orange"
          >
            <option value="">-- Chọn Tỉnh/Thành phố --</option>
            {provinces.map((p) => (
              <option key={p.ProvinceID} value={p.ProvinceID}>
                {p.ProvinceName}
              </option>
            ))}
          </select>

          <select
            value={form.districtId || ''}
            disabled={!form.provinceId}
            onChange={(e) =>
              setForm({ ...form, districtId: Number(e.target.value), wardCode: '' })
            }
            className="w-full px-3 py-2 border rounded-lg outline-none focus:border-brand-orange disabled:bg-gray-50"
          >
            <option value="">-- Chọn Quận/Huyện --</option>
            {districts.map((d) => (
              <option key={d.DistrictID} value={d.DistrictID}>
                {d.DistrictName}
              </option>
            ))}
          </select>

          <select
            value={form.wardCode}
            disabled={!form.districtId}
            onChange={(e) => setForm({ ...form, wardCode: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg outline-none focus:border-brand-orange disabled:bg-gray-50"
          >
            <option value="">-- Chọn Phường/Xã --</option>
            {wards.map((w) => (
              <option key={w.WardCode} value={w.WardCode}>
                {w.WardName}
              </option>
            ))}
          </select>

          <input
            placeholder="Số nhà, tên đường"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg outline-none focus:border-brand-orange"
          />

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
            />
            Đặt làm địa chỉ mặc định
          </label>
        </div>

        <footer className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </footer>
      </div>
    </div>
  );
}
