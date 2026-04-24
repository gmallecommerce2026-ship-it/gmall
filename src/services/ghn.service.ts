// Wrapper GHN endpoints ở BE (xem G-Mall-BE/src/modules/ghn/ghn.controller.ts).
import { apiClient } from '@/lib/api/ApiClient';

export interface GhnProvince {
  ProvinceID: number;
  ProvinceName: string;
}
export interface GhnDistrict {
  DistrictID: number;
  DistrictName: string;
}
export interface GhnWard {
  WardCode: string;
  WardName: string;
}

// BE ghn module proxy GHN API trả về `{ data: [...] }` hoặc array trực tiếp tuỳ version.
// Wrapper này normalize về array.
function unwrap<T>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
}

export const GhnService = {
  getProvinces: async (): Promise<GhnProvince[]> => {
    const res = await apiClient.get('/ghn/provinces');
    return unwrap<GhnProvince>(res);
  },
  getDistricts: async (provinceId: number): Promise<GhnDistrict[]> => {
    const res = await apiClient.get('/ghn/districts', { params: { provinceId } });
    return unwrap<GhnDistrict>(res);
  },
  getWards: async (districtId: number): Promise<GhnWard[]> => {
    const res = await apiClient.get('/ghn/wards', { params: { districtId } });
    return unwrap<GhnWard>(res);
  },
};
