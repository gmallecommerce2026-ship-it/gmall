'use client';

import React, { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiTrash, FiLayout, FiCode, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface FooterLink { label: string; href: string; }
interface FooterSection { title: string; links: FooterLink[]; }
interface FooterConfig {
  about: FooterSection;
  support: FooterSection;
  policy: FooterSection;
  [key: string]: FooterSection; // Allow dynamic keys for safe parsing
}

interface FooterConfigEditorProps {
  initialData: any;
  onSave: (data: any) => Promise<void>;
  loading: boolean;
}

const DEFAULT_FOOTER: FooterConfig = {
    about: { title: "Về chúng tôi", links: [] },
    support: { title: "Hỗ trợ khách hàng", links: [] },
    policy: { title: "Chính sách", links: [] }
};

export default function FooterConfigEditor({ initialData, onSave, loading }: FooterConfigEditorProps) {
  const [mode, setMode] = useState<'gui' | 'json'>('gui');
  const [config, setConfig] = useState<FooterConfig>(DEFAULT_FOOTER);
  const [jsonText, setJsonText] = useState('');

  // 1. Init Data
  useEffect(() => {
    let finalData = DEFAULT_FOOTER;
    if (initialData && typeof initialData === 'object' && Object.keys(initialData).length > 0) {
        // Merge safe
        finalData = {
            about: { ...DEFAULT_FOOTER.about, ...(initialData.about || {}) },
            support: { ...DEFAULT_FOOTER.support, ...(initialData.support || {}) },
            policy: { ...DEFAULT_FOOTER.policy, ...(initialData.policy || {}) },
        };
    }
    setConfig(finalData);
    setJsonText(JSON.stringify(finalData, null, 2));
  }, [initialData]);

  // 2. Mode Switch
  const handleModeChange = (newMode: 'gui' | 'json') => {
    if (newMode === 'json') {
      setJsonText(JSON.stringify(config, null, 2));
      setMode('json');
    } else {
      try {
        const parsed = JSON.parse(jsonText);
        // Validate sơ bộ
        if (!parsed.about || !parsed.support) throw new Error('Thiếu các key quan trọng (about, support...)');
        setConfig(parsed);
        setMode('gui');
      } catch (e: any) {
        toast.error(`JSON lỗi: ${e.message}`);
      }
    }
  };

  const handleSave = () => {
    if (mode === 'json') {
      try {
        const parsed = JSON.parse(jsonText);
        onSave(parsed);
      } catch (e) {
        toast.error('JSON không hợp lệ!');
      }
    } else {
      onSave(config);
    }
  };

  // --- ACTIONS (Safe State Updates) ---
  const updateConfig = (fn: (prev: FooterConfig) => FooterConfig) => {
    setConfig(prev => {
        const next = fn(JSON.parse(JSON.stringify(prev))); // Deep copy
        return next;
    });
  };

  const updateSectionTitle = (key: string, val: string) => updateConfig(prev => {
    if (prev[key]) prev[key].title = val;
    return prev;
  });

  const addLink = (key: string) => updateConfig(prev => {
    if (prev[key]) {
        if(!prev[key].links) prev[key].links = [];
        prev[key].links.push({ label: 'Link Mới', href: '/' });
    }
    return prev;
  });

  const removeLink = (sectionKey: string, linkIdx: number) => updateConfig(prev => {
    prev[sectionKey]?.links?.splice(linkIdx, 1);
    return prev;
  });

  const updateLink = (sectionKey: string, linkIdx: number, field: keyof FooterLink, val: string) => updateConfig(prev => {
    const link = prev[sectionKey]?.links?.[linkIdx];
    if (link) link[field] = val;
    return prev;
  });


  // --- RENDER SECTION ---
  const renderSection = (sectionKey: string, labelMap: string) => {
    const section = config[sectionKey] || { title: '', links: [] };
    
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{labelMap}</span>
                <input 
                    value={section.title || ''}
                    onChange={(e) => updateSectionTitle(sectionKey, e.target.value)}
                    className="text-sm font-bold text-gray-800 text-right bg-transparent border-none focus:ring-0 outline-none hover:text-orange-600 transition-colors cursor-pointer"
                    placeholder="Tiêu đề..."
                />
            </div>
            <div className="p-4 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                <div className="space-y-3">
                    {(section.links || []).map((link, idx) => (
                        <div key={idx} className="flex items-start gap-2 group">
                            <div className="flex-1 grid grid-cols-1 gap-1">
                                <input 
                                    value={link.label || ''}
                                    onChange={(e) => updateLink(sectionKey, idx, 'label', e.target.value)}
                                    placeholder="Tên hiển thị"
                                    className="text-sm border border-gray-200 rounded px-2 py-1 focus:border-orange-500 outline-none w-full"
                                />
                                <input 
                                    value={link.href || ''}
                                    onChange={(e) => updateLink(sectionKey, idx, 'href', e.target.value)}
                                    placeholder="/duong-dan"
                                    className="text-xs text-gray-500 font-mono border border-gray-100 bg-gray-50 rounded px-2 py-1 focus:border-orange-500 outline-none w-full"
                                />
                            </div>
                            <button onClick={() => removeLink(sectionKey, idx)} className="mt-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                <FiTrash />
                            </button>
                        </div>
                    ))}
                </div>
                <button 
                    onClick={() => addLink(sectionKey)}
                    className="w-full mt-4 py-2 text-xs font-medium text-gray-500 border border-dashed border-gray-300 rounded hover:text-orange-600 hover:border-orange-400 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                >
                    <FiPlus /> Thêm Link
                </button>
            </div>
        </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center sticky top-0 z-20">
            <div>
               <h2 className="font-bold text-gray-800 text-lg">Cấu hình Footer</h2>
               <p className="text-xs text-gray-500">Quản lý các cột liên kết dưới chân trang</p>
            </div>
            
            <div className="flex items-center gap-4">
                {/* Switcher */}
                <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
                    <button 
                        onClick={() => handleModeChange('gui')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${mode === 'gui' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <FiLayout /> Giao diện
                    </button>
                    <button 
                        onClick={() => handleModeChange('json')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${mode === 'json' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <FiCode /> JSON
                    </button>
                </div>
                
                <div className="h-6 w-px bg-gray-300 mx-2"></div>

                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                    <FiSave /> {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-100 relative">
            {mode === 'json' ? (
                <div className="absolute inset-0 p-0 animate-in fade-in duration-200">
                    <textarea 
                        className="w-full h-full p-6 font-mono text-sm bg-[#1e1e1e] text-[#d4d4d4] resize-none focus:outline-none leading-relaxed"
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        spellCheck={false}
                    />
                </div>
            ) : (
                <div className="p-6 h-full overflow-y-auto custom-scrollbar animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-20">
                        {renderSection('about', 'Cột 1: Về chúng tôi')}
                        {renderSection('support', 'Cột 2: Hỗ trợ khách hàng')}
                        {renderSection('policy', 'Cột 3: Chính sách')}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}