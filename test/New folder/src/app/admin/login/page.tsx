"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/ApiClient";
import { FiLock } from 'react-icons/fi'; // Cần cài react-icons
import { useUserStore } from "@/store/useUserStore";
import { AdminService } from "@/services/AdminService";
import toast from "react-hot-toast";
export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await AdminService.login(email, password);
      
      if (res?.user) {
         // Check quyền Admin kỹ hơn ở Client nếu cần
         if (res.user.role !== 'ADMIN') {
            toast.error("Bạn không có quyền truy cập!");
            return;
         }

         setUser(res.user);
         // XÓA việc lưu token
         
         toast.success("Xin chào Admin!");
         router.push("/admin/dashboard");
      }
    } catch (error: any) {
      toast.error("Sai tài khoản hoặc mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a202c] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden">
         <div className="bg-blue-600 p-6 text-center">
             <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                 <FiLock className="text-white text-xl" />
             </div>
             <h2 className="text-white text-xl font-bold uppercase tracking-wide">Administrator</h2>
             <p className="text-blue-100 text-xs mt-1">Hệ thống quản trị LoveGifts</p>
         </div>

         <div className="p-8">
             {error && (
                 <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100 text-center">
                     {error}
                 </div>
             )}

             <form onSubmit={handleAdminLogin} className="space-y-5">
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Email quản trị</label>
                     <input 
                        type="email" 
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                     />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                     <input 
                        type="password" 
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                     />
                 </div>

                 <button 
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded transition-colors shadow-md disabled:opacity-70"
                 >
                     {isLoading ? "Đang xác thực..." : "Đăng nhập Dashboard"}
                 </button>
             </form>
         </div>
         <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center text-xs text-gray-500">
             Chỉ dành cho nhân viên ủy quyền. IP của bạn đang được ghi lại.
         </div>
      </div>
    </div>
  );
}