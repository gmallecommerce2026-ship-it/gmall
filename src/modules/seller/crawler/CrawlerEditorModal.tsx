// src/modules/seller/crawler/CrawlerEditorModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Trash2, Plus, Box, Type, LayoutGrid } from 'lucide-react';
import { DescriptionEditor } from '@/modules/seller/products/components/DescriptionEditor';
import { CrawlerCategoryCascader, CrawlerCategory } from '@/modules/seller/products/components/CrawlerCategoryCascader'; // Import Cascader
import { uploadFileToR2 } from '@/services/uploadService';
import Button from '@/components/ui/Button';

interface CrawlerEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any; // Payload của sản phẩm
    onSave: (updatedPayload: any) => void;
}

export const CrawlerEditModal = ({ isOpen, onClose, data, onSave }: CrawlerEditModalProps) => {
    // State quản lý dữ liệu form
    const [formData, setFormData] = useState<any>(null);
    // Thêm tab 'category'
    const [activeTab, setActiveTab] = useState<'basic' | 'desc' | 'images' | 'category'>('basic');
    const [isUploading, setIsUploading] = useState(false);

    // State hiển thị đường dẫn danh mục đã chọn (cho UI)
    const [selectedCategoryPath, setSelectedCategoryPath] = useState<CrawlerCategory[]>([]);

    // Khởi tạo dữ liệu khi mở modal
    useEffect(() => {
        if (isOpen && data) {
            setFormData({
                ...data,
                // Đảm bảo attributes là object để dễ sửa
                attributesObj: typeof data.attributes === 'string' ? JSON.parse(data.attributes) : data.attributes || {}
            });
            // Reset tab về basic khi mở mới
            setActiveTab('basic');
        }
    }, [isOpen, data]);

    if (!isOpen || !formData) return null;

    // --- HANDLERS ---
    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleAttributeChange = (key: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            attributesObj: { ...prev.attributesObj, [key]: value }
        }));
    };

    // Handler khi chọn danh mục từ Cascader
    const handleCategorySelect = (leafId: string, path: CrawlerCategory[]) => {
        setFormData((prev: any) => ({
            ...prev,
            categoryId: leafId, // Lưu ID danh mục vào form
            categoryName: path.map(c => c.name).join(' > ') // Lưu tên hiển thị nếu cần
        }));
        setSelectedCategoryPath(path);
    };

    // Upload ảnh Gallery
    const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploading(true);
            try {
                const files = Array.from(e.target.files);
                const newUrls: string[] = [];
                for (const file of files) {
                    const url = await uploadFileToR2(file);
                    newUrls.push(url);
                }
                setFormData((prev: any) => ({
                    ...prev,
                    images: [...(prev.images || []), ...newUrls]
                }));
            } catch (error) {
                alert("Lỗi upload ảnh!");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            images: prev.images.filter((_: any, i: number) => i !== index)
        }));
    };

    // Save
    const handleSave = () => {
        const payloadToSave = {
            ...formData,
            // Convert attributes ngược lại thành string JSON nếu backend yêu cầu
            attributes: JSON.stringify(formData.attributesObj),
            price: Number(formData.price),
            stock: Number(formData.stock)
        };
        // Xóa field tạm
        delete payloadToSave.attributesObj;
        
        onSave(payloadToSave);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 animate-in fade-in duration-200">
            {/* THAY ĐỔI KÍCH THƯỚC TẠI ĐÂY: w-[98vw] h-[96vh] */}
            <div className="bg-white w-[98vw] h-[96vh] max-w-none rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Type className="text-blue-600"/> Chỉnh sửa chi tiết sản phẩm
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={24} className="text-gray-500"/>
                    </button>
                </div>

                {/* Body - Chia 2 cột: Menu trái & Content phải */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col gap-2 shrink-0 overflow-y-auto">
                        {[
                            { id: 'basic', label: 'Thông tin cơ bản', icon: Box },
                            { id: 'category', label: 'Phân loại danh mục', icon: LayoutGrid }, // Tab mới
                            { id: 'images', label: 'Hình ảnh & Video', icon: ImageIcon },
                            { id: 'desc', label: 'Mô tả chi tiết', icon: Type },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left
                                    ${activeTab === tab.id 
                                        ? 'bg-blue-100 text-blue-700 shadow-sm' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <tab.icon size={18} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 bg-white relative">
                        
                        {/* TAB: BASIC INFO */}
                        {activeTab === 'basic' && (
                            <div className="space-y-6 max-w-4xl mx-auto">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Tên sản phẩm</label>
                                    <input 
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Giá hiển thị (VNĐ)</label>
                                        <input 
                                            type="number"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                            value={formData.price}
                                            onChange={(e) => handleChange('price', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Tồn kho mặc định</label>
                                        <input 
                                            type="number"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                            value={formData.stock}
                                            onChange={(e) => handleChange('stock', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Thương hiệu</label>
                                        <input 
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.brand}
                                            onChange={(e) => handleChange('brand', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Xuất xứ</label>
                                        <input 
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.origin}
                                            onChange={(e) => handleChange('origin', e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                {/* Attributes Loop */}
                                <div className="border-t pt-4 mt-4">
                                    <h3 className="font-bold text-gray-800 mb-4">Thuộc tính Crawl được</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(formData.attributesObj || {}).map(([key, val]: any) => (
                                            <div key={key}>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{key}</label>
                                                <input 
                                                    className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-1.5 text-sm focus:bg-white focus:border-blue-500 outline-none"
                                                    value={val}
                                                    onChange={(e) => handleAttributeChange(key, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: CATEGORY (NEW - SPLIT VIEW) */}
                        {activeTab === 'category' && (
                            <div className="h-full flex flex-col">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Phân loại & Mapping Danh mục</h3>
                                
                                {/* Grid 2 Cột */}
                                <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
                                    {/* Cột Trái: Thông tin hiện tại / Crawled */}
                                    <div className="border border-gray-200 rounded-xl bg-gray-50 p-4 flex flex-col">
                                        <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                                            Thông tin gốc (Từ nguồn Crawl)
                                        </h4>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên sản phẩm gốc</label>
                                                <div className="p-3 bg-white border rounded text-sm text-gray-800 font-medium">
                                                    {formData.name}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Danh mục gốc (Gợi ý)</label>
                                                <div className="p-3 bg-white border border-dashed rounded text-sm text-gray-600">
                                                    {formData.originalCategory || formData.category || "Không có dữ liệu danh mục gốc"}
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-4 border-t">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Danh mục hệ thống đang chọn</label>
                                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm font-bold break-words">
                                                    {selectedCategoryPath.length > 0 
                                                        ? selectedCategoryPath.map(c => c.name).join(' > ') 
                                                        : (formData.categoryName || "Chưa chọn danh mục")}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cột Phải: Selector */}
                                    <div className="border border-gray-200 rounded-xl bg-white flex flex-col overflow-hidden shadow-sm">
                                        <div className="p-3 border-b bg-gray-50">
                                            <h4 className="font-semibold text-gray-700">Chọn Danh mục Hệ thống</h4>
                                        </div>
                                        <div className="flex-1 min-h-0 relative">
                                            {/* Nhúng Component CrawlerCategoryCascader vào đây */}
                                            <div className="absolute inset-0 p-2">
                                                <CrawlerCategoryCascader onSelect={handleCategorySelect} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: DESCRIPTION (Tích hợp Editor) */}
                        {activeTab === 'desc' && (
                            <div className="h-full flex flex-col">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả sản phẩm (Rich Text)</label>
                                <div className="flex-1 border rounded-lg overflow-hidden flex flex-col">
                                        <div className="flex-1 overflow-auto">
                                        {/* Thêm check formData != null để an toàn */}
                                        {formData && (
                                            <DescriptionEditor 
                                                // Thêm || '' để tránh lỗi nếu description null
                                                value={formData.description || ''} 
                                                onChange={(val) => handleChange('description', val)} 
                                            />
                                        )}
                                        </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: IMAGES */}
                        {activeTab === 'images' && (
                            <div className="max-w-5xl mx-auto">
                                <label className="block text-sm font-bold text-gray-700 mb-4">Thư viện ảnh ({formData.images?.length || 0})</label>
                                <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                                    {formData.images?.map((img: string, idx: number) => (
                                        <div key={idx} className="relative aspect-square border rounded-lg group overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-all">
                                            <img src={img} className="w-full h-full object-cover" alt="preview" />
                                            <button 
                                                onClick={() => handleRemoveImage(idx)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:scale-110"
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                            {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[10px] text-center font-bold py-1">Ảnh bìa</span>}
                                        </div>
                                    ))}
                                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-400 hover:text-blue-500">
                                        {isUploading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div> : <Plus size={32}/>}
                                        <span className="text-xs font-bold mt-2">Thêm ảnh</span>
                                        <input type="file" multiple accept="image/*" hidden onChange={handleUploadImage} disabled={isUploading}/>
                                    </label>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
                    <Button variant="outline" onClick={onClose}>Hủy bỏ</Button>
                    <Button onClick={handleSave} className="bg-blue-600 text-white flex items-center gap-2">
                        <Save size={18}/> Lưu thay đổi
                    </Button>
                </div>
            </div>
        </div>
    );
};