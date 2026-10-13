// src/components/layout/Header/AdvancedSearchBar.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTracking, EventType } from '@/hooks/useTracking';
import { HeaderIcons as Icons } from './HeaderIcons';
import { HOT_KEYWORDS, SUGGESTED_PRODUCTS, SEARCH_BANNERS } from './constants';
import { useDebounce } from '@/hooks/useDebounce';
import { api } from '@/services/api';
// Giả sử ApiClient export default hoặc export class static.
// Nếu lỗi import, hãy kiểm tra lại file ApiClient.ts của bạn.
import { apiClient, ApiClient } from '@/lib/api/ApiClient';

const AdvancedSearchBar = () => {
  const router = useRouter();
  const { track } = useTracking();
  const [keyword, setKeyword] = useState("");
  // Debounce keyword 300ms
  const debouncedKeyword = useDebounce(keyword, 300);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // State cho kết quả tìm kiếm live
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentBanner, setCurrentBanner] = useState(0);

  // --- EFFECT: GỌI API KHI TYPING ---
  // Fix BUG-FE-2 (wiki 0030): AbortController + cleanup. Trước đây gõ "iphone"
  // (request A chậm) rồi gõ "iphone 15" (request B nhanh hơn) → B về trước rồi
  // A về sau ghi đè kết quả của B → user thấy gợi ý sai keyword.
  useEffect(() => {
    if (!showSuggestions) return;
    if (!debouncedKeyword.trim()) {
      // hooks-fix wiki 0031: clear là legitimate reset on dep change
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestedProducts([]);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    apiClient
      .get(`/store/products`, {
        params: { search: debouncedKeyword, limit: 6 },
        signal: controller.signal,
      })
      .then((res: any) => {
        // [FIX wiki 0095/0099/0103] `apiClient` là fetch, KHÔNG bọc `{ data }` như axios và
        // `request()` trả `null` ở nhánh 401-redirect + khi body không parse được JSON →
        // `res.data` ném TypeError, làm chết luôn thanh gợi ý tìm kiếm ở Header.
        // BE `/store/products` trả `{ data, meta }` nên `.data` đúng khoá; chuẩn hoá về mảng
        // vì `suggestedProducts` được render bằng `.map`.
        const list = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
        setSuggestedProducts(Array.isArray(list) ? list : []);
      })
      .catch((error) => {
        // axios cancellation: error.code === 'ERR_CANCELED' hoặc error.name === 'CanceledError'
        if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') return;
        console.error("Search suggestion error", error);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    // Cleanup: cancel request đang in-flight khi keyword đổi → kết quả cũ không
    // ghi đè state mới.
    return () => controller.abort();
  }, [debouncedKeyword, showSuggestions]);

  // --- EFFECT: LOAD TRENDING KEYWORDS từ BE (#20 + #38) ---
  // Cache-by-default ở BE (5 phút) nên refetch mỗi lần dropdown mở chấp nhận được.
  // Fallback hardcoded HOT_KEYWORDS nếu BE down hoặc fetch fail.
  const [trendingKw, setTrendingKw] = useState<{ keyword: string; count: number }[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    api
      .get<{ keyword: string; count: number }[]>('/tracking/trending-keywords?limit=8')
      .then((rows) => {
        if (!cancelled && Array.isArray(rows)) setTrendingKw(rows);
      })
      .catch(() => {
        // Silent fail — fallback to HOT_KEYWORDS hardcoded.
      });
    return () => {
      cancelled = true;
    };
  }, []);
  // Item shape compat với HOT_KEYWORDS: { id, text, isHot }
  const displayHotKeywords = useMemo(() => {
    if (!trendingKw || trendingKw.length === 0) return HOT_KEYWORDS;
    return trendingKw.map((r, idx) => ({
      id: idx + 1,
      text: r.keyword,
      isHot: idx < 3,
    }));
  }, [trendingKw]);

  // --- EFFECT: LOAD HISTORY ---
  // hooks-fix wiki 0031: load từ localStorage on mount — sync from external system,
  // legitimate setState in effect.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("search_history");
      if (saved) {
        try {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setHistory(JSON.parse(saved));
        } catch (e) {
          console.error("Lỗi parse history", e);
        }
      }
    }
  }, []);
  // --- EFFECT: KIỂM TRA TRÌNH DUYỆT CÓ HỖ TRỢ GIỌNG NÓI ---
  // Kiểm tra trong effect (không phải lúc render) để không lệch hydration SSR.
  useEffect(() => {
    const w = window as any;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVoiceSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => recognitionRef.current?.abort?.();
  }, []);
  // --- EFFECT: CLICK OUTSIDE ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- EFFECT: AUTO PLAY BANNER ---
  useEffect(() => {
    if (!showSuggestions) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % SEARCH_BANNERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [showSuggestions]);

  // --- HELPERS: HISTORY ---
  const saveToHistory = (term: string) => {
    let newHistory = [term, ...history.filter((h) => h !== term)];
    newHistory = newHistory.slice(0, 5);
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
  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = 'vi-VN';
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => {
      const text = Array.from(e.results).map((r: any) => r[0].transcript).join('');
      setKeyword(text);
      setShowSuggestions(true);
      // Nói xong (kết quả cuối) thì tự tìm kiếm
      if (e.results[e.results.length - 1].isFinal) handleSearch(text);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    try { rec.start(); } catch { setIsListening(false); }
  };
  // --- HELPER: FORMAT PRICE ---
  const formatPrice = (price: any) => {
    if (typeof price === 'number') {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }
    return price; // Trả về nguyên gốc nếu là string (cho mock data)
  };

  // --- LOGIC HIỂN THỊ SẢN PHẨM ---
  // Nếu đang gõ text -> dùng suggestedProducts (API)
  // Nếu không gõ -> dùng SUGGESTED_PRODUCTS (Mock constants)
  const isSearching = keyword.trim().length > 0;
  const productsToDisplay = isSearching ? suggestedProducts : SUGGESTED_PRODUCTS;

  return (
    <>
      <div ref={containerRef} className="relative w-full z-[200]">
        <div
          className={`flex w-full h-[44px] bg-white border rounded-lg overflow-hidden transition-all duration-200
        ${showSuggestions
              ? "border-brand-orange ring-1 ring-brand-orange shadow-md rounded-b-none"
              : "border-gray-200 hover:border-gray-400"
            }`}
        >
          {/* Input Area */}
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                if (!showSuggestions) setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Tìm kiếm hơn 1000+ sản phẩm..."
              className="w-full h-full pl-4 pr-16 text-[14px] text-gray-800 outline-none placeholder:text-gray-400 font-inter bg-transparent"
            />
            <div className="absolute right-2 flex items-center gap-0.5">
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  aria-label="Xoá nội dung tìm kiếm"
                  title="Xoá"
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              )}
              {voiceSupported && (
                <button
                  type="button"
                  onClick={toggleVoice}
                  aria-label={isListening ? 'Dừng nghe' : 'Tìm kiếm bằng giọng nói'}
                  title={isListening ? 'Đang nghe... bấm để dừng' : 'Tìm kiếm bằng giọng nói'}
                  className={`p-1.5 rounded-full transition-colors ${isListening ? 'text-white bg-red-500 animate-pulse' : 'text-gray-400 hover:text-brand-orange'
                    }`}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="2" width="6" height="12" rx="3" />
                    <path d="M5 11a7 7 0 0014 0M12 18v4" />
                  </svg>
                </button>
              )}
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
                  {displayHotKeywords.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => handleSearch(item.text)}
                      className="flex items-center justify-between p-2 rounded hover:bg-white hover:shadow-sm cursor-pointer transition-all group border border-transparent hover:border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded ${index < 3 ? "text-white" : "text-gray-500 bg-gray-200"
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

              {/* Nếu KHÔNG search thì hiện Banner */}
              {!isSearching && (
                <div className="w-full h-[120px] rounded-lg overflow-hidden relative group shadow-sm">
                  {SEARCH_BANNERS.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt="Banner"
                      className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${idx === currentBanner ? "opacity-100" : "opacity-0"
                        }`}
                    />
                  ))}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {SEARCH_BANNERS.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentBanner ? "bg-white w-4" : "bg-white/60"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Danh sách sản phẩm (Logic động) */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    {isSearching ? `Kết quả cho "${keyword}"` : "Sản phẩm nổi bật"}
                  </h3>
                  {isLoading && <span className="text-[10px] text-brand-orange animate-pulse">Đang tìm...</span>}
                </div>

                {/* Grid Sản Phẩm */}
                {productsToDisplay.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {productsToDisplay.map((prod) => {
                      // Xử lý ảnh: API trả về mảng images, Mock trả về string image
                      const displayImage = prod.images?.[0] || prod.image || "/placeholder.png";

                      return (
                        <Link href={`/product-details/${prod.id || prod.slug}`} key={prod.id} onClick={() => setShowSuggestions(false)} className="group cursor-pointer">
                          <div className="relative rounded-md overflow-hidden border border-gray-100 bg-white hover:border-brand-orange/50 transition-colors h-full flex flex-col">
                            <div className="aspect-square relative overflow-hidden bg-gray-100">
                              <img
                                src={displayImage}
                                alt={prod.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              {prod.discount && (
                                <div className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-1 rounded-sm">{prod.discount}</div>
                              )}
                            </div>
                            <div className="p-2 flex-1 flex flex-col justify-between">
                              <p className="text-[12px] text-gray-800 font-medium line-clamp-2 min-h-[32px] group-hover:text-brand-orange transition-colors">
                                {prod.name}
                              </p>
                              <p className="text-[13px] font-bold text-brand-orange mt-1">
                                {formatPrice(prod.price)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  // Trường hợp search không có kết quả
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                    {isLoading ? "Đang tải..." : "Không tìm thấy sản phẩm phù hợp"}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdvancedSearchBar;