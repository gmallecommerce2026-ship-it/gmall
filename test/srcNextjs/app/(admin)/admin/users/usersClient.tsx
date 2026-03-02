'use client';

import React, { useEffect, useState } from 'react';
import { AdminService } from '@/services/AdminService';
import { AdminUser } from '@/types/admin';
import { 
    FiSearch, FiLock, FiUnlock, FiFilter, FiBriefcase, FiPlus, FiX, FiUser, FiShoppingBag, FiShield, 
    FiTrash2, FiGrid
} from 'react-icons/fi';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { CategoryService } from '@/services/category.service';

// [CẬP NHẬT] Định nghĩa Role khớp với Backend: BUYER thay vì USER
type UserRole = 'ADMIN' | 'SELLER' | 'BUYER';

interface EnhancedAdminUser extends AdminUser {
    pointBalance: number;
    dominantIndustry?: string;
    role: UserRole; // Override type role từ AdminUser để chắc chắn
    shop?: {
        name: string;
    }
}

// Định nghĩa form data cho Create User
interface CreateUserForm {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: UserRole;
    shopName: string;
}

// [CẬP NHẬT] Mặc định là BUYER
const INITIAL_FORM: CreateUserForm = {
    name: '', email: '', password: '', phone: '', role: 'BUYER', shopName: ''
};

export default function UsersClient() {
  // --- STATE DỮ LIỆU ---
  const [users, setUsers] = useState<EnhancedAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  
  // [CẬP NHẬT] roleFilter mặc định là ALL, các giá trị khác phải là ADMIN, SELLER, BUYER
  const [roleFilter, setRoleFilter] = useState<string>('ALL'); 
  
  const [industryNameFilter, setIndustryNameFilter] = useState(''); 
  const [pointRange, setPointRange] = useState({ min: '', max: '' });
  
  // Categories List (cho dropdown ngành hàng)
  const [categories, setCategories] = useState<any[]>([]);
  
  // UI State
  const [showFilters, setShowFilters] = useState(false);
  
  // --- STATE MODAL ---
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<EnhancedAdminUser | null>(null);
  const [banReason, setBanReason] = useState('');
  const [formData, setFormData] = useState<CreateUserForm>(INITIAL_FORM);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // --- DEBOUNCE ---
  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedMinPoint = useDebounce(pointRange.min, 500);
  const debouncedMaxPoint = useDebounce(pointRange.max, 500);

  // --- [FIX LOGIC] STRICT CLIENT-SIDE FILTERING ---
  const filteredUsers = users.filter(user => {
      // 1. Chốt chặn Role: So sánh chính xác với BUYER, SELLER, ADMIN
      if (roleFilter !== 'ALL') {
          // So sánh không phân biệt hoa thường để an toàn (vd: Buyer vs BUYER)
          if (user.role?.toUpperCase() !== roleFilter) return false;
      }

      // 2. Lọc theo Ngành hàng (nếu có chọn)
      if (industryNameFilter) {
          if (!user.dominantIndustry) return false;
          return user.dominantIndustry.toLowerCase().includes(industryNameFilter.toLowerCase());
      }
      return true;
  });

  // --- API CALLS ---

  // 1. Fetch Danh mục
  useEffect(() => {
      const fetchCats = async () => {
          try {
              const response: any = await CategoryService.getTree();
              let catList: any[] = [];
              if (Array.isArray(response)) {
                  catList = response;
              } else if (response && Array.isArray(response?.data)) {
                  catList = response?.data;
              }
              setCategories(catList);
          } catch(e) { 
              console.error("Lỗi tải danh mục:", e); 
              setCategories([]);
          }
      };
      fetchCats();
  }, []);

  // 2. Fetch Users từ Server
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { 
          page, 
          limit: 10, 
          search: debouncedSearch,
          // Gửi đúng role lên Server (BUYER/SELLER/ADMIN)
          role: roleFilter,
          minPoints: debouncedMinPoint || undefined,
          maxPoints: debouncedMaxPoint || undefined,
      };
      
      const response: any = await AdminService.getUsers(params);
      
      if (response && (response.data || Array.isArray(response))) {
        const dataList = Array.isArray(response) ? response : response.data;
        const meta = response.meta || {};
        
        setUsers(dataList);
        setTotalPages(meta.totalPages || 1);
        setTotalUsers(meta.total || dataList.length);
      } else {
        setUsers([]);
        setTotalUsers(0);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Không thể tải danh sách');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // --- EFFECT HANDLERS ---
  
  // Reset về trang 1 khi search hoặc đổi khoảng điểm
  useEffect(() => { 
      setPage(1); 
  }, [debouncedSearch, debouncedMinPoint, debouncedMaxPoint]);
  
  // Gọi API khi các dependency thay đổi
  useEffect(() => { 
      fetchUsers(); 
  }, [page, debouncedSearch, roleFilter, debouncedMinPoint, debouncedMaxPoint]);

  // --- ACTIONS HANDLERS ---

  const handleTabChange = (newRole: string) => {
      if (roleFilter === newRole) return;
      setRoleFilter(newRole);
      setPage(1); 
  };

  const openDeleteModal = (user: EnhancedAdminUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
        setDeleteLoading(true);
        await AdminService.deleteUser(selectedUser.id);
        setIsDeleteModalOpen(false); 
        toast.success(`Đã xóa vĩnh viễn: ${selectedUser.email}`);
        fetchUsers(); 
        setSelectedUser(null);
    } catch (error: any) {
        console.error("Lỗi xóa user:", error);
        const msg = error?.response?.data?.message || error.message || 'Lỗi không xác định';
        toast.error(msg);
    } finally {
        setDeleteLoading(false);
    }
  };

  const openBanModal = (user: EnhancedAdminUser) => {
    setSelectedUser(user);
    setBanReason('');
    if (user.isBanned) {
      if (window.confirm(`Mở khóa cho ${user.fullName}?`)) handleToggleBan(user, false);
    } else {
      setIsBanModalOpen(true);
    }
  };

  const handleToggleBan = async (user: EnhancedAdminUser, isBanned: boolean, reason?: string) => {
    try {
      await AdminService.toggleBanUser(user.id, isBanned, reason);
      toast.success(isBanned ? 'Đã khóa' : 'Đã mở khóa');
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isBanned, banReason: reason } : u));
      setIsBanModalOpen(false);
    } catch (error) {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name || !formData.email || !formData.password) {
          toast.error("Vui lòng điền các trường bắt buộc");
          return;
      }
      if (formData.role === 'SELLER' && !formData.shopName) {
          toast.error("Người bán cần phải có Tên Shop");
          return;
      }
      try {
          setCreateLoading(true);
          await AdminService.createUser(formData);
          toast.success(`Đã tạo ${formData.role === 'SELLER' ? 'Seller & Shop' : 'người dùng'} thành công!`);
          setIsCreateModalOpen(false);
          setFormData(INITIAL_FORM); // Reset form về mặc định (BUYER)
          fetchUsers();
      } catch (error: any) {
          console.error(error);
          const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
          toast.error(errorMessage); 
      } finally {
          setCreateLoading(false);
      }
  };

  // [CẬP NHẬT QUAN TRỌNG] Định nghĩa Tabs với ID là BUYER
  const ROLE_TABS = [
      { id: 'ALL', label: 'Tất cả', icon: FiGrid },
      { id: 'BUYER', label: 'Người mua', icon: FiUser }, // Đã sửa ID từ USER -> BUYER
      { id: 'SELLER', label: 'Người bán', icon: FiShoppingBag },
      { id: 'ADMIN', label: 'Quản trị', icon: FiShield },
  ];

  return (
    <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h2>
                <p className="text-sm text-gray-500 mt-1">Quản lý tài khoản, phân quyền và trạng thái hoạt động.</p>
            </div>
            
            <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all active:scale-95"
            >
                <FiPlus size={18} /> <span>Tạo tài khoản</span>
            </button>
        </div>

        {/* Tabs & Search Filter Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* 1. Tabs Navigation */}
            <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar px-2">
                {ROLE_TABS.map((tab) => {
                    const isActive = roleFilter === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`
                                relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap
                                ${isActive ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                            `}
                        >
                            <tab.icon size={16} className={isActive ? 'text-orange-600' : 'text-gray-400'} />
                            {tab.label}
                            {isActive && (
                                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-orange-600 rounded-t-full" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* 2. Search & Filter Controls */}
            <div className="p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-shadow"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2.5 border rounded-lg flex items-center gap-2 transition-colors font-medium text-sm
                        ${showFilters ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
                    >
                        <FiFilter size={16} /> 
                        <span>Bộ lọc {showFilters ? 'đóng' : 'khác'}</span>
                    </button>
                </div>

                {/* Advanced Filters Panel */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-100 animate-fade-in-down">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Ngành hàng (Seller)</label>
                            <select 
                                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                                value={industryNameFilter}
                                onChange={(e) => setIndustryNameFilter(e.target.value)}
                                disabled={roleFilter !== 'SELLER' && roleFilter !== 'ALL'} 
                            >
                                <option value="">Tất cả ngành hàng</option>
                                {categories.map((cat: any) => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Khoảng điểm tích lũy</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" placeholder="Min (0)" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500"
                                    value={pointRange.min} onChange={e => setPointRange(prev => ({...prev, min: e.target.value}))}
                                />
                                <span className="text-gray-300 font-bold">-</span>
                                <input 
                                    type="number" placeholder="Max (∞)" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500"
                                    value={pointRange.max} onChange={e => setPointRange(prev => ({...prev, max: e.target.value}))}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-gray-600 text-xs uppercase font-semibold border-b border-gray-100">
                        <tr>
                            <th className="p-4 pl-6">Người dùng</th>
                            <th className="p-4">Liên hệ</th>
                            <th className="p-4">Vai trò</th>
                            <th className="p-4">Shop Info</th>
                            <th className="p-4 text-right">Xu tích lũy</th>
                            <th className="p-4 text-center">Trạng thái</th>
                            <th className="p-4 text-right pr-6">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={7} className="p-4"><div className="h-12 bg-gray-100 rounded-lg w-full"/></td>
                                </tr>
                            ))
                        ) : filteredUsers.length === 0 ? ( 
                            <tr><td colSpan={7} className="p-12 text-center text-gray-500 flex-col justify-center items-center">
                                <div className="flex justify-center mb-2"><FiSearch size={32} className="text-gray-300"/></div>
                                <p>Không tìm thấy dữ liệu phù hợp.</p>
                            </td></tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-orange-50/30 transition-colors group">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`} className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" alt=""/>
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${user.isBanned ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">{user.fullName}</p>
                                                <p className="text-xs text-gray-500">@{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col text-gray-600 gap-0.5">
                                            <span className="font-medium text-xs text-gray-900">{user.email}</span>
                                            <span className="text-xs text-gray-500">{user.phone || '---'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${
                                            user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                            user.role === 'SELLER' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            'bg-gray-100 text-gray-600 border-gray-200'
                                        }`}>
                                            {/* Logic hiển thị Role text */}
                                            {user.role === 'BUYER' ? 'Buyer' : user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {user.role === 'SELLER' ? (
                                            <div className="flex flex-col gap-1.5">
                                                {user.shop?.name && <span className="text-sm font-semibold text-gray-800">{user.shop.name}</span>}
                                                {user.dominantIndustry ? 
                                                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 w-fit"><FiBriefcase size={10}/> {user.dominantIndustry}</span> :
                                                    <span className="text-[10px] text-gray-400 italic">Chưa có SP</span>
                                                }
                                            </div>
                                        ) : <span className="text-gray-300">-</span>}
                                    </td>
                                    <td className="p-4 text-right font-medium font-mono text-gray-700">{new Intl.NumberFormat('vi-VN').format(user.pointBalance)}</td>
                                    <td className="p-4 text-center">
                                        {user.isBanned ? 
                                            <span className="text-red-600 text-xs font-bold bg-red-50 px-2.5 py-1 rounded-md border border-red-100">Banned</span> : 
                                            <span className="text-green-600 text-xs font-bold bg-green-50 px-2.5 py-1 rounded-md border border-green-100">Active</span>
                                        }
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => openBanModal(user)} 
                                                title={user.isBanned ? 'Mở khóa' : 'Khóa tài khoản'}
                                                className={`p-2 rounded-lg transition-colors ${user.isBanned ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-red-500'}`}
                                            >
                                                {user.isBanned ? <FiUnlock size={16}/> : <FiLock size={16}/>}
                                            </button>
                                            <button 
                                                onClick={() => openDeleteModal(user)} 
                                                title="Xóa người dùng"
                                                className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
             
             {/* Pagination */}
             <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm bg-gray-50/30">
                 <div className="text-gray-500 text-xs">Hiển thị trang {page} trên tổng số {totalPages}</div>
                 <div className="flex gap-2">
                    <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-gray-600 disabled:opacity-50 hover:bg-gray-50 hover:text-orange-600 transition">Trước</button>
                    <button disabled={page>=totalPages} onClick={() => setPage(p=>p+1)} className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-gray-600 disabled:opacity-50 hover:bg-gray-50 hover:text-orange-600 transition">Sau</button>
                 </div>
            </div>
        </div>

        {/* --- MODALS --- */}
        
        {/* 1. Create User Modal */}
        {isCreateModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Thêm người dùng mới</h3>
                            <p className="text-sm text-gray-500">Tạo tài khoản hệ thống (Admin, Seller, Buyer)</p>
                        </div>
                        <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition"><FiX size={20}/></button>
                    </div>

                    <div className="p-8 overflow-y-auto">
                        <form id="create-user-form" onSubmit={handleCreateUser} className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                {/* [CẬP NHẬT] Đổi ID USER -> BUYER */}
                                {[
                                    { id: 'BUYER', label: 'Người mua', icon: FiUser, color: 'border-gray-200 text-gray-600', active: 'border-gray-600 bg-gray-50 text-gray-900 ring-1 ring-gray-600' },
                                    { id: 'SELLER', label: 'Người bán (Shop)', icon: FiShoppingBag, color: 'border-blue-200 text-blue-600', active: 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' },
                                    { id: 'ADMIN', label: 'Quản trị viên', icon: FiShield, color: 'border-purple-200 text-purple-600', active: 'border-purple-600 bg-purple-50 text-purple-700 ring-1 ring-purple-600' }
                                ].map((role) => (
                                    <div 
                                        key={role.id}
                                        onClick={() => setFormData({...formData, role: role.id as any})}
                                        className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02] ${formData.role === role.id ? role.active : 'border-gray-100 hover:border-gray-300'}`}
                                    >
                                        <role.icon size={24} className={formData.role === role.id ? '' : 'text-gray-400'}/>
                                        <span className="font-semibold text-sm">{role.label}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Thông tin đăng nhập</h4>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                                        <input type="text" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" placeholder="VD: Nguyễn Văn A" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                                        <input type="email" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" placeholder="example@gmall.com.vn" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
                                        <input type="password" required minLength={6} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" placeholder="Min 6 ký tự" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                        <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" placeholder="0987..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">{formData.role === 'SELLER' ? 'Thông tin Cửa hàng' : 'Thông tin bổ sung'}</h4>
                                    {formData.role === 'SELLER' ? (
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-4 animate-fade-in">
                                            <div>
                                                <label className="block text-sm font-bold text-blue-800 mb-1">Tên Shop <span className="text-red-500">*</span></label>
                                                <input type="text" required className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" placeholder="VD: Gmall Store Official" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} />
                                                <p className="text-xs text-blue-600 mt-1">Hệ thống sẽ tự động tạo URL shop (slug) từ tên này.</p>
                                            </div>
                                            <div className="text-xs text-blue-800 bg-blue-100 p-3 rounded">💡 <b>Lưu ý:</b> Tài khoản Seller sẽ được tự động kích hoạt Shop ở trạng thái <b>Active</b>. Chủ shop có thể cập nhật thêm thông tin sau.</div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            {formData.role === 'ADMIN' ? (
                                                <>
                                                    <FiShield size={40} className="mb-2 text-purple-200"/><p className="text-sm">Tài khoản này có toàn quyền truy cập hệ thống Admin Dashboard.</p>
                                                </>
                                            ) : (
                                                <>
                                                    <FiUser size={40} className="mb-2 text-gray-200"/><p className="text-sm">Tài khoản người dùng thông thường để mua sắm.</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Hủy bỏ</Button>
                        <Button variant="primary" isLoading={createLoading} onClick={(e: any) => handleCreateUser(e)} className="bg-orange-600 hover:bg-orange-700 px-8">{createLoading ? 'Đang tạo...' : 'Xác nhận tạo'}</Button>
                    </div>
                </div>
            </div>
        )}

        {/* 2. Ban/Unban Modal */}
        {isBanModalOpen && selectedUser && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                 <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                     <h3 className="text-lg font-bold mb-4 text-gray-800">{selectedUser.isBanned ? 'Mở khóa' : 'Khóa tài khoản'}: {selectedUser.fullName}</h3>
                     <textarea className="w-full border p-3 rounded-lg mb-4 h-24 focus:ring-2 focus:ring-red-500 outline-none resize-none" placeholder="Nhập lý do (tùy chọn)..." value={banReason} onChange={e => setBanReason(e.target.value)} />
                     <div className="flex justify-end gap-3">
                         <Button variant="ghost" onClick={() => setIsBanModalOpen(false)}>Hủy</Button>
                         <Button variant="primary" className={`${selectedUser.isBanned ? 'bg-green-600' : 'bg-red-600'}`} onClick={() => handleToggleBan(selectedUser, !selectedUser.isBanned, banReason)}>Xác nhận</Button>
                     </div>
                 </div>
             </div>
        )}

        {/* 3. Delete Modal */}
        {isDeleteModalOpen && selectedUser && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-red-100">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4"><FiTrash2 size={32} /></div>
                        <h3 className="text-xl font-bold text-gray-900">Xác nhận xóa vĩnh viễn?</h3>
                        <p className="text-gray-500 mt-2">Bạn đang thực hiện xóa tài khoản <b>{selectedUser.fullName}</b>. {selectedUser.role === 'SELLER' && (<span className="block text-red-600 font-medium mt-1">⚠️ Lưu ý: Toàn bộ cửa hàng và sản phẩm của Seller này sẽ bị xóa sạch!</span>)}</p>
                        <p className="text-xs text-gray-400 mt-4 bg-gray-50 p-2 rounded">Hành động này không thể hoàn tác.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button className="flex-1" variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Hủy</Button>
                        <Button className="flex-1 bg-red-600 hover:bg-red-700" variant="primary" isLoading={deleteLoading} onClick={handleDeleteUser}>Xác nhận xóa</Button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}