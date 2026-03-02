// src/services/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res.data,
  (error) => {
    if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
            // Gọi API logout để backend xóa cookie
             api.post('/auth/logout').catch(() => {});
             // Redirect về login
             // window.location.href = '/login'; 
        }
    }
    return Promise.reject(error);
  }
);