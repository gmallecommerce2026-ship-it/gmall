import { apiClient } from '@/lib/api/ApiClient';

export interface IAddress {
  id?: string;
  name: string;
  phone: string;
  provinceId: number;
  districtId: number;
  wardCode: string;
  address: string; // Số nhà, tên đường
  fullAddress: string; // Địa chỉ đầy đủ hiển thị
  lat?: number;
  lng?: number;
  isDefault: boolean;
}

export const AddressService = {
  // Lấy danh sách địa chỉ
  getAll: () => apiClient.get<IAddress[]>('/addresses'),
  
  
  // Tạo mới
  create: (data: IAddress) => apiClient.post('/addresses', data),
  
  // Cập nhật
  update: (id: string, data: IAddress) => apiClient.put(`/addresses/${id}`, data),
  
  // Xóa
  delete: (id: string) => apiClient.delete(`/addresses/${id}`),
  
  // Thiết lập mặc định
  setDefault: (id: string) => apiClient.patch(`/addresses/${id}/default`),
};