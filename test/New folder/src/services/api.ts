import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Đảm bảo biến này là http://localhost:4001
  withCredentials: true,
});

function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
}

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // [SỬA] Chỉ lấy 'accessToken', BỎ 'token' cũ đi để tránh lỗi
      const token = 
        getCookie('accessToken');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// [NÊN DÙNG] Tự động logout nếu 401 để user biết đường đăng nhập lại
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
            // Xóa sạch token lỗi
            localStorage.removeItem('accessToken');
            document.cookie = 'accessToken=; path=/; max-age=0;';
            // window.location.href = '/login'; // Bật dòng này nếu muốn redirect
        }
    }
    return Promise.reject(error);
  }
);