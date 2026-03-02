// src/modules/seller/products/components/SizeChartGenerator.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Plus, X, Save, RotateCcw, LayoutTemplate } from 'lucide-react';
import { uploadFileToR2 } from '@/services/uploadService';
import classNames from 'classnames';
import { toBlob } from 'html-to-image';

interface SizeChartGeneratorProps {
    onSave: (url: string) => void;
    onCancel: () => void;
}
const COLORS = {
    bgWhite: '#ffffff',
    bgHeader: '#ffedd5', // tương đương bg-orange-100
    bgRowEven: '#ffffff',
    bgRowOdd: '#f9fafb', // tương đương bg-gray-50
    textPrimary: '#1f2937', // gray-800
    textOrange: '#ea580c', // orange-600
    border: '#9ca3af', // gray-400
    borderStrong: '#1f2937', // gray-800
};
// Mẫu dữ liệu Shopee
const TEMPLATES = {
    CLOTHING: {
        cols: ['Kích cỡ', 'Chiều cao (cm)', 'Cân nặng (kg)', 'Vòng ngực (cm)'],
        rows: [
            ['S', '150 - 155', '40 - 45', '80'],
            ['M', '155 - 160', '46 - 50', '84'],
            ['L', '160 - 165', '51 - 55', '88'],
            ['XL', '165 - 170', '56 - 65', '92']
        ]
    },
    SHOES: {
        cols: ['Size EU', 'Size UK', 'Size US', 'Chiều dài chân (cm)'],
        rows: [
            ['36', '3.5', '5.5', '23.0'],
            ['37', '4.0', '6.0', '23.5'],
            ['38', '5.0', '7.0', '24.0'],
            ['39', '6.0', '8.0', '24.5']
        ]
    }
};

export const SizeChartGenerator = ({ onSave, onCancel }: SizeChartGeneratorProps) => {
    const [cols, setCols] = useState<string[]>(TEMPLATES.CLOTHING.cols);
    const [rows, setRows] = useState<string[][]>(TEMPLATES.CLOTHING.rows);
    const [isSaving, setIsSaving] = useState(false);
    
    // Ref để chụp ảnh
    const captureRef = useRef<HTMLDivElement>(null);

    // --- Actions ---
    const updateCol = (idx: number, val: string) => {
        const n = [...cols]; n[idx] = val; setCols(n);
    };

    const updateRow = (rIdx: number, cIdx: number, val: string) => {
        const n = [...rows]; n[rIdx][cIdx] = val; setRows(n);
    };

    const addRow = () => setRows([...rows, Array(cols.length).fill('')]);
    const removeRow = (idx: number) => setRows(rows.filter((_, i) => i !== idx));

    const addCol = () => {
        setCols([...cols, 'Mới']);
        setRows(rows.map(r => [...r, '']));
    };
    
    const removeCol = (idx: number) => {
        if (cols.length <= 1) return;
        setCols(cols.filter((_, i) => i !== idx));
        setRows(rows.map(r => r.filter((_, i) => i !== idx)));
    };

    const loadTemplate = (type: 'CLOTHING' | 'SHOES') => {
        setCols(TEMPLATES[type].cols);
        setRows(TEMPLATES[type].rows);
    };

    // --- Core Logic: Generate Image & Upload ---
    const handleGenerateAndUpload = async () => {
        if (!captureRef.current) return;
        try {
            setIsSaving(true);
            
            // Dùng html-to-image thay cho html2canvas
            const blob = await toBlob(captureRef.current, { 
                cacheBust: true,
                backgroundColor: '#ffffff' 
            });

            if (blob) {
                const file = new File([blob], `size-chart-${Date.now()}.png`, { type: 'image/png' });
                const url = await uploadFileToR2(file);
                onSave(url);
            }

        } catch (error) {
            console.error("Lỗi tạo ảnh:", error);
            alert("Có lỗi khi tạo bảng quy đổi. Vui lòng thử lại.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Thiết lập bảng quy đổi kích cỡ</h3>
                        <p className="text-sm text-gray-500">Tạo bảng size chuẩn giúp giảm tỷ lệ hoàn hàng</p>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-auto bg-gray-100 p-6 flex gap-6">
                    
                    {/* Left: Editor */}
                    <div className="flex-1 flex flex-col gap-4">
                        {/* Toolbar */}
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-wrap gap-2 items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-600 mr-2">Mẫu nhanh:</span>
                                <button onClick={() => loadTemplate('CLOTHING')} className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1"><LayoutTemplate size={14}/> Quần áo</button>
                                <button onClick={() => loadTemplate('SHOES')} className="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors flex items-center gap-1"><LayoutTemplate size={14}/> Giày dép</button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={addCol} className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">+ Thêm cột</button>
                                <button onClick={addRow} className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">+ Thêm dòng</button>
                            </div>
                        </div>

                        {/* Editable Table */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-auto max-h-[500px]">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        {cols.map((col, idx) => (
                                            <th key={idx} className="p-2 border border-gray-200 min-w-[100px] group relative">
                                                <input 
                                                    value={col} 
                                                    onChange={(e) => updateCol(idx, e.target.value)}
                                                    className="w-full bg-transparent font-bold outline-none text-center focus:text-orange-600 uppercase"
                                                />
                                                <button onClick={() => removeCol(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10}/></button>
                                            </th>
                                        ))}
                                        <th className="w-10 p-2 bg-gray-50 border border-gray-200"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, rIdx) => (
                                        <tr key={rIdx} className="hover:bg-gray-50">
                                            {row.map((cell, cIdx) => (
                                                <td key={cIdx} className="p-2 border border-gray-200">
                                                    <input 
                                                        value={cell}
                                                        onChange={(e) => updateRow(rIdx, cIdx, e.target.value)}
                                                        className="w-full outline-none text-center bg-transparent"
                                                        placeholder="..."
                                                    />
                                                </td>
                                            ))}
                                            <td className="p-2 border border-gray-200 text-center">
                                                <button onClick={() => removeRow(rIdx)} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {rows.length === 0 && <div className="p-8 text-center text-gray-400">Chưa có dữ liệu</div>}
                        </div>
                    </div>

                    {/* Right: Preview & Render Area (Hidden from view logic handled by CSS if needed, but we show it for UX) */}
                    <div className="w-[300px] shrink-0 flex flex-col gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-gray-800 mb-2 text-sm flex items-center gap-2"><Save size={14}/> Preview kết quả</h4>
                            <p className="text-xs text-gray-500 mb-4">Đây là hình ảnh sẽ được tạo ra và hiển thị cho khách hàng.</p>
                            
                            {/* KHU VỰC SẼ ĐƯỢC CHỤP ẢNH (CAPTURE NODE) */}
                            <div className="border border-gray-200 overflow-hidden rounded-lg bg-white">
                                <div 
                                    ref={captureRef} 
                                    className="p-4 min-w-full inline-block"
                                    // 1. Ghi đè background trắng bằng HEX
                                    style={{ 
                                        fontFamily: 'Arial, sans-serif',
                                        backgroundColor: COLORS.bgWhite, 
                                        color: COLORS.textPrimary
                                    }} 
                                >
                                    <div className="mb-3">
                                        <h3 
                                            className="font-bold uppercase text-center text-lg pb-2 mb-2"
                                            // 2. Ghi đè màu text và border
                                            style={{ 
                                                color: COLORS.textOrange,
                                                borderBottom: `2px solid ${COLORS.textOrange}`
                                            }}
                                        >
                                            Bảng quy đổi kích cỡ
                                        </h3>
                                    </div>
                                    <table 
                                        className="w-full text-sm border-collapse"
                                        // 3. Ghi đè border bảng
                                        style={{ border: `1px solid ${COLORS.borderStrong}` }}
                                    >
                                        <thead>
                                            <tr style={{ backgroundColor: COLORS.bgHeader, color: '#000000' }}>
                                                {cols.map((c, i) => (
                                                    <th key={i} 
                                                        className="px-3 py-2 font-bold text-center whitespace-nowrap"
                                                        style={{ border: `1px solid ${COLORS.border}` }}
                                                    >
                                                        {c}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((r, i) => (
                                                <tr key={i} 
                                                    // 4. Xử lý màu nền chẵn lẻ bằng HEX
                                                    style={{ backgroundColor: i % 2 === 0 ? COLORS.bgRowEven : COLORS.bgRowOdd }}
                                                >
                                                    {r.map((c, j) => (
                                                        <td key={j} 
                                                            className="px-3 py-2 text-center font-medium"
                                                            style={{ 
                                                                border: `1px solid ${COLORS.border}`,
                                                                color: COLORS.textPrimary
                                                            }}
                                                        >
                                                            {c}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div 
                                        className="mt-2 text-[10px] text-center italic"
                                        style={{ color: '#9ca3af' }} // gray-400
                                    >
                                        * Số đo thực tế có thể chênh lệch 1-2cm
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
                    <button onClick={onCancel} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">Hủy</button>
                    <button 
                        onClick={handleGenerateAndUpload}
                        disabled={isSaving}
                        className="px-6 py-2 rounded-lg bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-700 flex items-center gap-2 disabled:opacity-70"
                    >
                        {isSaving ? (
                            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Đang xử lý...</>
                        ) : (
                            <><Save size={18}/> Lưu bảng quy đổi</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};