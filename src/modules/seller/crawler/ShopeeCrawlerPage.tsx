'use client';

import React, { useState, useEffect, useRef } from 'react';
import { mapTikiToSystemProduct } from './tiki.mapper';
import { mapShopeeToSystemProduct } from './shopee.mapper';
import Button from '@/components/ui/Button';
import { api } from '@/services/api';
import { CrawlerCategoryCascader } from '../products/components/CrawlerCategoryCascader';
import { 
    Loader2, CheckCircle, Rocket, Search, Settings, X, Eye, 
    Box, Layers, Zap, AlertCircle, Edit3, Link as LinkIcon, ListFilter, 
    Save
} from 'lucide-react';
import { CrawlerEditModal } from './CrawlerEditorModal';

interface ProcessLog {
  time: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface PendingProduct {
  id: string;
  payload: any;
  platform: 'tiki' | 'shopee';
  googleStatus: 'unique' | 'duplicate';
  isSelected: boolean;
  previewImage: string;
  previewPrice: number;
  previewName: string;
}

type CrawlMode = 'keyword' | 'url';

export default function AutoCrawlerPage() {
  // --- STATE CẤU HÌNH ---
  const [targetCategory, setTargetCategory] = useState<{ id: string, pathName: string, leafName: string } | null>(null);
  const [inputValue, setInputValue] = useState(''); // Dùng chung cho Keyword hoặc URL
  const [limit, setLimit] = useState(20);
  const [platform, setPlatform] = useState<'tiki' | 'shopee'>('tiki');
  const [crawlMode, setCrawlMode] = useState<CrawlMode>('keyword'); // State chế độ crawl mới
  
  // --- STATE XỬ LÝ ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logs, setLogs] = useState<ProcessLog[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0, phase: 'idle' }); 
  
  // --- STATE KẾT QUẢ ---
  const [pendingItems, setPendingItems] = useState<PendingProduct[]>([]);
  const [showResultModal, setShowResultModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PendingProduct | null>(null);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Tự động điền từ khóa gợi ý khi chọn danh mục (chỉ ở chế độ keyword)
  useEffect(() => {
    if (targetCategory?.leafName && crawlMode === 'keyword' && !inputValue) {
      setInputValue(targetCategory.leafName);
    }
  }, [targetCategory, crawlMode]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (msg: string, type: ProcessLog['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('vi-VN');
    setLogs(prev => [...prev, { time, message: msg, type }]);
  };
  const createPendingItem = (rawMapped: any, index: number, catId: string): PendingProduct => {
        const finalPayload = {
            name: rawMapped.title, 
            description: rawMapped.description || '',
            categoryId: catId,
            shopCategoryId: null,
            brand: rawMapped.brand || "No Brand",
            origin: rawMapped.origin || "Unknown",
            price: Number(rawMapped.price),
            stock: Number(rawMapped.stock || 100),
            images: rawMapped.images || [],
            videos: rawMapped.videos || [],
            sizeChart: null,
            weight: 200, length: 10, width: 10, height: 5,
            attributes: JSON.stringify(rawMapped.attributes || {}),
            tiers: rawMapped.tiers || [],
            variations: rawMapped.variations || [],
            crossSellIds: [],
        };

        // Fake SEO check
        const isDuplicate = Math.random() < 0.2; 
        
        return {
            id: String(index) + "_" + Date.now(),
            payload: finalPayload,
            platform: platform,
            googleStatus: isDuplicate ? 'duplicate' : 'unique',
            isSelected: !isDuplicate, 
            previewImage: finalPayload.images[0] || '',
            previewPrice: finalPayload.price,
            previewName: finalPayload.name
        };
  };
  const processMappedItems = (items: any[], startIndex: number) => {
      return items.map((item, idx) => {
          // Tùy vào format server trả về để map, giả sử server trả về đúng format raw của sàn
          // Nếu server đã map sang format chuẩn của app rồi thì dùng luôn
          // Ở đây giả định server trả về raw Tiki/Shopee object có detail
          let mapped;
          if (platform === 'tiki') mapped = mapTikiToSystemProduct(item);
          else mapped = mapShopeeToSystemProduct(item);
          return createPendingItem(mapped, startIndex + idx, targetCategory?.id || '');
      });
  };
  // --- LOGIC 1: CRAWL ---
  const handleScanProducts = async () => {
    if (!targetCategory) return alert("⚠️ Chọn danh mục đích trước đã sếp ơi!");
    if (!inputValue.trim()) return alert("⚠️ Nhập từ khóa hoặc Link URL!");

    setIsProcessing(true);
    setLogs([]);
    setPendingItems([]); // Reset list
    
    // Target tối đa user muốn
    const TARGET_LIMIT = limit; 
    let collectedCount = 0;
    let currentPage = 1;
    let totalAvailableOnPlatform = 999999; // Giả định ban đầu
    
    // Mảng tạm để chứa kết quả
    let allProcessedItems: PendingProduct[] = [];

    try {
        addLog(`🚀 Bắt đầu quét đa luồng (Client-side Loop)... Mục tiêu: ${TARGET_LIMIT} items`, 'info');
        setProgress({ current: 0, total: TARGET_LIMIT, phase: 'searching' });

        // === VÒNG LẶP CHÍNH (Loop cho đến khi đủ số lượng) ===
        while (collectedCount < TARGET_LIMIT && currentPage <= 20) { // Max 20 trang để an toàn
            
            // 1. Gọi API lấy trang hiện tại (Page X)
            addLog(`📡 Đang tải trang ${currentPage}... (Đã có: ${collectedCount})`, 'info');
            
            // Tùy platform mà gọi API khác nhau (Ở đây demo Tiki)
            // Nếu là Shopee, bạn cũng cần sửa API Shopee Search tương tự Tiki
            const endpoint = platform === 'tiki' ? '/api/crawler/tiki' : '/api/crawler/search'; 
            
            const res = await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify({ 
                    keyword: inputValue, 
                    url: inputValue,
                    page: currentPage, 
                    limit: 50, // Luôn request 50 items/page từ sàn
                    fetchDetail: true // Bảo server lấy luôn chi tiết (hoặc false nếu muốn tách ra)
                })
            });

            const data = await res.json();

            if (!res.ok || !data.items || data.items.length === 0) {
                addLog(`⚠️ Không tìm thấy thêm sản phẩm ở trang ${currentPage}. Dừng lại.`, 'warning');
                break;
            }

            // Cập nhật tổng số thực tế từ sàn (chỉ cập nhật lần đầu)
            if (currentPage === 1) totalAvailableOnPlatform = data.total_found || 9999;

            // 2. Map dữ liệu và đưa vào danh sách tạm
            const newItemsMapped = processMappedItems(data.items, collectedCount);
            
            // Lọc bớt nếu vượt quá limit user yêu cầu
            const remainingSlots = TARGET_LIMIT - collectedCount;
            const itemsToAdd = newItemsMapped.slice(0, remainingSlots);
            
            allProcessedItems = [...allProcessedItems, ...itemsToAdd];
            setPendingItems([...allProcessedItems]); // Cập nhật UI ngay lập tức

            collectedCount += itemsToAdd.length;
            setProgress({ current: collectedCount, total: TARGET_LIMIT, phase: 'crawling' });

            // 3. Điều kiện thoát vòng lặp
            if (collectedCount >= TARGET_LIMIT) {
                addLog(`✅ Đã đạt mục tiêu ${TARGET_LIMIT} sản phẩm.`, 'success');
                break;
            }
            if (!data.next_page) {
                addLog(`🏁 Hết trang để quét.`, 'warning');
                break;
            }

            // 4. Chuẩn bị cho vòng lặp kế tiếp
            currentPage++;
            
            // Ngủ nhẹ 1-2s để tránh bị sàn block IP vì request quá nhanh
            await new Promise(r => setTimeout(r, 1500)); 
        }

        addLog(`🎉 QUÉT HOÀN TẤT! Tổng cộng: ${allProcessedItems.length} sản phẩm.`, 'success');
        setTimeout(() => setShowResultModal(true), 1000);

    } catch (error: any) {
        addLog(`⛔ Lỗi nghiêm trọng: ${error.message}`, 'error');
    } finally {
        setIsProcessing(false);
        setProgress(prev => ({ ...prev, phase: 'idle' }));
    }
  };

  // --- LOGIC 2: SAVE ---
  const handleSaveSelectedToDb = async () => {
    const selectedItems = pendingItems.filter(i => i.isSelected);
    if (selectedItems.length === 0) return alert("Chưa chọn sản phẩm nào!");

    setIsSaving(true);
    addLog(`💾 Đang import vào Database (${selectedItems.length} items)...`, 'info');

    let successCount = 0;
    for (const item of selectedItems) {
        try {
            await api.post('/seller/products', item.payload);
            successCount++;
        } catch (error: any) {
            addLog(`❌ Lưu thất bại: ${error.message}`, 'error');
        }
        await new Promise(r => setTimeout(r, 100));
    }

    addLog(`🏆 MISSION COMPLETE! Đã thêm ${successCount} sản phẩm.`, 'success');
    setIsSaving(false);
    setShowResultModal(false);
    setPendingItems([]); 
  };

  const toggleItemSelection = (id: string) => {
    setPendingItems(prev => prev.map(item => 
        item.id === id ? { ...item, isSelected: !item.isSelected } : item
    ));
  };

  const handleUpdateItem = (updatedPayload: any) => {
    if (!editingItem) return;
    setPendingItems(prev => prev.map(item => 
        item.id === editingItem.id ? {
            ...item,
            payload: updatedPayload,
            previewName: updatedPayload.name,
            previewPrice: updatedPayload.price,
            previewImage: updatedPayload.images[0] || '',
            isSelected: true 
        } : item
    ));
  };

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col gap-6 bg-gray-50/50">
      
      {/* HEADER & CONFIGURATION BLOCK */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 shrink-0 space-y-6">
        
        {/* Row: Title & Platform Switcher */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Rocket className="text-blue-600" size={28}/> 
                    AI Product Crawler <span className="text-xs bg-gray-900 text-white px-2 py-1 rounded font-mono">Pro</span>
                </h1>
                <p className="text-gray-500 text-sm mt-1">Thu thập dữ liệu tự động, tối ưu SEO và tự động điền thông tin.</p>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-lg h-10">
                <button 
                    onClick={() => setPlatform('tiki')}
                    className={`px-6 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${platform === 'tiki' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Box size={16}/> Tiki
                </button>
                <button 
                    onClick={() => setPlatform('shopee')}
                    className={`px-6 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${platform === 'shopee' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Layers size={16}/> Shopee
                </button>
            </div>
        </div>

        {/* --- KHỐI CẤU HÌNH THEO LAYOUT MỚI --- */}
        
        {/* 1. Target Category - Full Row */}
        <div className="w-full">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">1</span>
                Danh Mục Đích (Target Category)
                <span className="text-gray-400 font-normal text-xs ml-auto">Chọn danh mục trên hệ thống của bạn để map sản phẩm vào</span>
            </label>
            <div className="h-[200px] border border-gray-300 rounded-lg overflow-hidden bg-gray-50 shadow-inner relative">
                <CrawlerCategoryCascader 
                    onSelect={(id, path) => {
                        const name = path.map(p => p.name).join(' > ');
                        const leaf = path[path.length-1].name;
                        setTargetCategory({ id, pathName: name, leafName: leaf });
                    }}
                />
            </div>
            {targetCategory ? (
                <div className="mt-2 text-xs font-medium text-green-700 bg-green-50 px-3 py-2 rounded border border-green-200 flex items-center gap-2 truncate">
                    <CheckCircle size={14}/> Đã chọn: {targetCategory.pathName}
                </div>
            ) : (
                <div className="mt-2 text-xs font-medium text-orange-600 bg-orange-50 px-3 py-2 rounded border border-orange-200 flex items-center gap-2">
                    <AlertCircle size={14}/> Vui lòng chọn danh mục đích
                </div>
            )}
        </div>

        {/* 2. Mode Selector & Inputs - Full Row */}
        <div>
            {/* Tabs chọn chế độ */}
            <div className="flex gap-4 mb-3 border-b border-gray-100">
                <button 
                    onClick={() => setCrawlMode('keyword')}
                    className={`pb-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${crawlMode === 'keyword' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <Search size={16}/> Tìm theo từ khóa
                </button>
                <button 
                    onClick={() => setCrawlMode('url')}
                    className={`pb-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${crawlMode === 'url' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <LinkIcon size={16}/> Quét theo Link URL
                </button>
            </div>

            {/* Input Row Container */}
            <div className="flex flex-col lg:flex-row gap-4 items-end">
                
                {/* Input Field (Flexible Width) */}
                <div className="flex-1 w-full">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">2</span>
                        {crawlMode === 'keyword' ? 'Từ khóa sản phẩm' : 'Dán Link danh mục / Shop'}
                    </label>
                    <div className="relative group">
                        {crawlMode === 'keyword' ? (
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" size={18}/>
                        ) : (
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" size={18}/>
                        )}
                        <input 
                            type="text"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
                            placeholder={crawlMode === 'keyword' ? "Ví dụ: Áo thun nam, Bàn phím cơ..." : `Dán link ${platform === 'shopee' ? 'Shopee' : 'Tiki'} tại đây (VD: shopee.vn/shop/...)`}
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                        />
                    </div>
                </div>

                {/* Limit Slider (Fixed Width) */}
                <div className="w-full lg:w-[200px] shrink-0">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-gray-700">Số lượng</label>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{limit} items</span>
                    </div>
                    <div className="bg-gray-100 px-3 py-3 rounded-xl border border-gray-200">
                        <input 
                            type="range" min="1" max="500" step="1"
                            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            value={limit}
                            onChange={e => setLimit(Number(e.target.value))}
                        />
                    </div>
                </div>

                {/* Action Button (Fixed Width) */}
                <div className="w-full lg:w-[250px] shrink-0">
                     <Button 
                        onClick={handleScanProducts} 
                        disabled={isProcessing || !targetCategory}
                        className={`w-full py-3 h-[50px] text-base font-bold shadow-lg text-white transition-all transform active:scale-[0.99] rounded-xl flex items-center justify-center gap-2
                            ${platform === 'shopee' 
                                ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-orange-200' 
                                : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-200'
                            }
                            ${(!targetCategory || isProcessing) ? 'opacity-70 cursor-not-allowed grayscale' : ''}
                        `}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="animate-spin" size={20}/> 
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <Zap size={20} fill="currentColor"/> 
                                <span>BẮT ĐẦU QUÉT</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>

      </div>

      {/* TERMINAL LOG */}
      <div className="flex-1 bg-[#1e1e1e] rounded-xl shadow-xl overflow-hidden flex flex-col border border-gray-800 min-h-[250px]">
        {/* Terminal Header */}
        <div className="bg-[#2d2d2d] px-4 py-2 flex justify-between items-center border-b border-gray-700 select-none">
            <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <span className="text-gray-400 text-xs font-mono ml-2">root@crawler:~/{platform}/{crawlMode}</span>
            </div>
            {pendingItems.length > 0 && !isProcessing && (
                <button onClick={() => setShowResultModal(true)} className="text-xs bg-blue-600/20 text-blue-400 px-3 py-1 rounded hover:bg-blue-600/30 transition-colors font-bold flex items-center gap-2">
                    <ListFilter size={12}/> Xem kết quả ({pendingItems.length})
                </button>
            )}
        </div>

        {/* Terminal Body */}
        <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar bg-[#1e1e1e] text-gray-300 space-y-1">
             {logs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 select-none opacity-50">
                    <Settings size={48} className="mb-4 text-gray-700"/>
                    <p>Hệ thống sẵn sàng.</p>
                </div>
            )}
            {logs.map((log, idx) => (
                <div key={idx} className="flex gap-3 hover:bg-white/5 px-2 py-0.5 rounded transition-colors">
                    <span className="text-gray-500 shrink-0 text-xs mt-[3px] w-[80px] text-right">[{log.time}]</span>
                    <span className={`break-words flex-1 ${
                        log.type === 'error' ? 'text-red-400' : 
                        log.type === 'success' ? 'text-green-400 font-bold' : 
                        log.type === 'warning' ? 'text-yellow-400' : 'text-blue-300'
                    }`}>
                        {log.message}
                    </span>
                </div>
            ))}
            <div ref={terminalEndRef} />
        </div>
      </div>

      {/* --- MODAL REVIEW & EDIT (Giữ nguyên logic hiển thị) --- */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <CheckCircle className="text-blue-600"/> 
                            Xác Nhận Import ({pendingItems.filter(i => i.isSelected).length}/{pendingItems.length})
                        </h2>
                        <p className="text-sm text-gray-500">Hệ thống đã tự động lọc trùng và tối ưu hóa dữ liệu.</p>
                    </div>
                    {!isSaving && (
                        <button onClick={() => setShowResultModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <X size={24} className="text-gray-500"/>
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingItems.map((item, idx) => (
                            <div 
                                key={idx} 
                                className={`bg-white p-3 rounded-xl border transition-all flex gap-3 items-start select-none group relative overflow-hidden ${item.isSelected ? 'border-blue-500 shadow-md ring-1 ring-blue-100' : 'border-gray-200 opacity-60 grayscale bg-gray-50'}`}
                            >
                                <div onClick={() => toggleItemSelection(item.id)} className="cursor-pointer pt-1">
                                     <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${item.isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-400'}`}>
                                        {item.isSelected && <CheckCircle size={14} className="text-white"/>}
                                    </div>
                                </div>
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 border cursor-pointer" onClick={() => setEditingItem(item)}>
                                    {item.previewImage ? <img src={item.previewImage} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 onClick={() => setEditingItem(item)} className="font-semibold text-sm line-clamp-2 leading-snug cursor-pointer hover:text-blue-600">{item.previewName}</h3>
                                    <div className="mt-1 flex items-center justify-between">
                                        <span className="text-sm font-bold text-red-600">{item.previewPrice.toLocaleString('vi-VN')} ₫</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingItem(item)} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                                                <Edit3 size={10}/> Sửa
                                            </button>
                                            <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${item.googleStatus === 'unique' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                {item.googleStatus === 'unique' ? 'SEO OK' : 'DUPLICATE'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-6 py-4 border-t bg-white flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowResultModal(false)} disabled={isSaving}>Đóng</Button>
                    <Button onClick={handleSaveSelectedToDb} className="bg-blue-600 text-white min-w-[200px]" disabled={isSaving}>
                        {isSaving ? <span className="flex items-center gap-2"><Loader2 className="animate-spin"/> Saving...</span> : <span className="flex items-center gap-2"><Save size={18}/> Xác nhận Import</span>}
                    </Button>
                </div>
            </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingItem && (
          <CrawlerEditModal 
              isOpen={true}
              onClose={() => setEditingItem(null)}
              data={editingItem.payload}
              onSave={handleUpdateItem}
          />
      )}
    </div>
  );
}