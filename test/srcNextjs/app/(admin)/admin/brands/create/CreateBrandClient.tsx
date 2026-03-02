"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { ArrowLeft, Save, UploadCloud, X } from "lucide-react";
// import { useGoBack } from "@/hooks/useGoBack"; // Nếu bạn có hook này

export default function CreateBrandClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: true // true: Active, false: Inactive
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto generate slug from name
    if (name === "name") {
        const slug = value.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/([^0-9a-z-\s])/g, "")
            .replace(/(\s+)/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");
        setFormData(prev => ({ ...prev, slug: slug, [name]: value }));
    }
  };

  // Giả lập upload ảnh
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        console.log("Submitting:", { ...formData, logoPreview });
        setLoading(false);
        router.push("/admin/brands"); // Quay lại danh sách
    }, 1000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Quay lại
        </button>
        <h1 className="text-xl font-bold text-gray-900">Thêm thương hiệu mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: General Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
             <h3 className="font-semibold text-gray-800 border-b pb-3 mb-4">Thông tin cơ bản</h3>
             
             {/* Name Input */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên thương hiệu <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nhập tên thương hiệu (VD: Samsung)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78720]/20 focus:border-[#E78720] outline-none transition-all"
                />
             </div>

             {/* Slug Input */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn (Slug)</label>
                <div className="flex items-center">
                    <span className="bg-gray-100 border border-r-0 border-gray-300 px-3 py-2 text-gray-500 text-sm rounded-l-lg">
                        /brand/
                    </span>
                    <input 
                        type="text" 
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#E78720]/20 focus:border-[#E78720] outline-none transition-all"
                    />
                </div>
             </div>

             {/* Description */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea 
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Nhập mô tả ngắn về thương hiệu..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78720]/20 focus:border-[#E78720] outline-none transition-all resize-none"
                />
             </div>
          </div>
        </div>

        {/* Right Column: Media & Status */}
        <div className="space-y-6">
            {/* Logo Upload */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">Logo thương hiệu</h3>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors relative group">
                    {logoPreview ? (
                        <div className="relative w-full aspect-square bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                             <img src={logoPreview} alt="Preview" className="w-full h-full object-contain" />
                             <button 
                                type="button"
                                onClick={() => setLogoPreview(null)}
                                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-red-50 text-red-500"
                             >
                                <X size={16} />
                             </button>
                        </div>
                    ) : (
                        <label className="cursor-pointer block py-8">
                            <UploadCloud className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                            <span className="text-sm font-medium text-gray-600">Tải ảnh lên</span>
                            <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG (Max 2MB)</p>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    )}
                </div>
            </div>

            {/* Status */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">Trạng thái</h3>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Kích hoạt</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={formData.status} 
                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))} 
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E78720]"></div>
                    </label>
                </div>
            </div>

            {/* Submit Actions */}
            <div className="flex flex-col gap-3">
                <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#E78720] hover:bg-[#d67610] text-white py-2.5 flex justify-center items-center gap-2 font-medium"
                >
                    {loading ? "Đang lưu..." : <><Save size={18} /> Lưu thương hiệu</>}
                </Button>
                <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => router.back()}
                    className="w-full border-gray-300 text-gray-700"
                >
                    Hủy bỏ
                </Button>
            </div>
        </div>
      </form>
    </div>
  );
}