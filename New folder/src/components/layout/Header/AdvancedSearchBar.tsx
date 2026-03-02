// src/components/layout/Header/AdvancedSearchBar.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTracking, EventType } from '@/hooks/useTracking';
import { HeaderIcons as Icons } from './HeaderIcons';
import { HOT_KEYWORDS, SUGGESTED_PRODUCTS, SEARCH_BANNERS } from './constants';

const AdvancedSearchBar = () => {
  const router = useRouter();
  const { track } = useTracking();
  const [keyword, setKeyword] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load History từ LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("search_history");
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch (e) {
          console.error("Lỗi parse history", e);
        }
      }
    }
  }, []);

  // Xử lý click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-play Banner
  useEffect(() => {
    if (!showSuggestions) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % SEARCH_BANNERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [showSuggestions]);

  const saveToHistory = (term: string) => {
    let newHistory = [term, ...history.filter((h) => h !== term)];
    newHistory = newHistory.slice(0, 5); // Giới hạn 5 items
    setHistory(newHistory);
    localStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("search_history");
  };

  const removeHistoryItem = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const newHistory = history.filter((h) => h !== term);
    setHistory(newHistory);
    localStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  const handleSearch = (searchTerm: string = keyword) => {
    if (searchTerm.trim()) {
      track(EventType.SEARCH, "search_bar_header", { keyword: searchTerm.trim() });
      saveToHistory(searchTerm.trim());
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
      setKeyword(searchTerm);
    }
  };

  return (
    // THAY ĐỔI: Tăng z-index từ z-50 lên z-[200] để cao hơn z-[100] của CategoryNavBar
    <div ref={containerRef} className="relative w-full z-[200]">
      <div
        className={`flex w-full h-[44px] bg-white border rounded-lg overflow-hidden transition-all duration-200 
        ${
          showSuggestions
            ? "border-brand-orange ring-1 ring-brand-orange shadow-md rounded-b-none"
            : "border-gray-200 hover:border-gray-400"
        }`}
      >
        {/* Input Area */}
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Tìm kiếm hơn 1000+ sản phẩm..."
            className="w-full h-full pl-4 pr-10 text-[14px] text-gray-800 outline-none placeholder:text-gray-400 font-inter bg-transparent"
          />

          {/* Camera Icon */}
          <div className="absolute right-2 p-2 cursor-pointer text-gray-400 hover:text-brand-orange transition-colors">
            <Icons.Camera className="w-5 h-5" />
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={() => handleSearch()}
          className="w-[60px] bg-brand-orange flex items-center justify-center hover:bg-brand-orange-dark transition-colors"
        >
          <Icons.Search className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* --- DROPDOWN GỢI Ý --- */}
      {showSuggestions && (
        <div className="absolute top-[44px] left-0 w-full bg-white rounded-b-lg shadow-xl border border-t-0 border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top flex flex-col md:flex-row min-h-[350px]">
          
          {/* CỘT TRÁI: Lịch sử & Hot Search */}
          <div className="w-full md:w-[38%] bg-gray-50/50 border-r border-gray-100 flex flex-col">
            {/* Lịch sử tìm kiếm */}
            {history.length > 0 && (
              <div className="p-4 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <Icons.Time className="w-3.5 h-3.5" /> Lịch sử tìm kiếm
                  </h3>
                  <button onClick={clearHistory} className="text-[10px] text-gray-400 hover:text-red-500 flex items-center gap-1">
                    Xóa tất cả
                  </button>
                </div>
                <div className="flex flex-col">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleSearch(item)}
                      className="group flex items-center justify-between py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                    >
                      <span className="text-[13px] text-gray-700 truncate">{item}</span>
                      <span
                        onClick={(e) => removeHistoryItem(e, item)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                      >
                        <Icons.Trash className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hot Search */}
            <div className="p-4 flex-1">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Icons.Fire className="w-3.5 h-3.5 text-red-500" /> Xu hướng
              </h3>
              <div className="space-y-1">
                {HOT_KEYWORDS.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => handleSearch(item.text)}
                    className="flex items-center justify-between p-2 rounded hover:bg-white hover:shadow-sm cursor-pointer transition-all group border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded ${
                          index < 3 ? "text-white" : "text-gray-500 bg-gray-200"
                        } ${index === 0 ? "bg-red-500" : index === 1 ? "bg-orange-400" : index === 2 ? "bg-yellow-400" : ""}`}
                      >
                        {index + 1}
                      </span>
                      <span className="text-[13px] text-gray-700 font-medium group-hover:text-brand-orange">
                        {item.text}
                      </span>
                    </div>
                    {item.isHot && <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">HOT</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Banner & Sản phẩm gợi ý */}
          <div className="w-full md:w-[62%] p-4 flex flex-col gap-4">
            {/* Banner Carousel Mini */}
            <div className="w-full h-[120px] rounded-lg overflow-hidden relative group shadow-sm">
              {SEARCH_BANNERS.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt="Banner"
                  className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${
                    idx === currentBanner ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {SEARCH_BANNERS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      idx === currentBanner ? "bg-white w-4" : "bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Sản phẩm gợi ý */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Sản phẩm nổi bật</h3>
              <div className="grid grid-cols-3 gap-3">
                {SUGGESTED_PRODUCTS.map((prod) => (
                  <Link href={`/product-details/${prod.id}`} key={prod.id} className="group cursor-pointer">
                    <div className="relative rounded-md overflow-hidden border border-gray-100 bg-white hover:border-brand-orange/50 transition-colors">
                      <div className="aspect-square relative overflow-hidden bg-gray-100">
                         <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                         {prod.discount && (
                           <div className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-1 rounded-sm">{prod.discount}</div>
                         )}
                      </div>
                      <div className="p-2">
                        <p className="text-[12px] text-gray-800 font-medium line-clamp-2 min-h-[32px] group-hover:text-brand-orange transition-colors">
                          {prod.name}
                        </p>
                        <p className="text-[13px] font-bold text-brand-orange mt-1">{prod.price}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchBar;