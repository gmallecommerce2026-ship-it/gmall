// src/modules/seller/products/AddProductPage.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    CheckCircle2, AlertCircle, Image as ImageIcon, Video,
    Plus, ChevronDown, ChevronUp, Info, Truck, Box, Flame,
    Edit2, Smartphone, Eye, HelpCircle, X,
    Star, Play, Film, ImagePlus, Ruler, TableProperties,
    Check, Link as LinkIcon, Search // [UPGRADE] Thêm icon Link
} from 'lucide-react';
import classNames from 'classnames';
import { api } from '@/services/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { uploadFileToR2 } from '@/services/uploadService';
import { CrossSellSelector } from './components/CrossSellSelector';
import { Edit } from 'lucide-react';
import { CategoryCascader } from './components/CategoryCascader';
import { SizeChartGenerator } from './components/SizeChartGenerator';
import { DescriptionEditor } from './components/DescriptionEditor';
import { SystemTagSelector } from '@/components/seller/SystemTagSelector';

// --- Types ---
interface Tier {
    name: string;
    options: string[];
    images: string[];
}
interface SkuRow {
    key: string;
    indices: number[];
    price: number;
    stock: number;
    sku: string;
}

// --- Constants ---
const TABS = [
    { id: 'basic', label: 'Thông tin cơ bản', active: true },
    { id: 'details', label: 'Thông tin chi tiết', active: false },
    { id: 'short-desc', label: 'Mô tả ngắn', active: false }, // Spec [0018] block 6 fields
    { id: 'desc', label: 'Mô tả', active: false },
    { id: 'sales', label: 'Thông tin bán hàng', active: false },
    { id: 'shipping', label: 'Vận chuyển', active: false },
    { id: 'others', label: 'Thông tin khác', active: false },
];

// [UPGRADE] Danh sách phần trăm độ mới cho sản phẩm cũ
const CONDITION_PERCENTS = [
    { label: '99% - Như mới', value: 99 },
    { label: '98%', value: 98 },
    { label: '95%', value: 95 },
    { label: '90%', value: 90 },
    { label: '80%', value: 80 },
    { label: 'Dưới 80%', value: 70 },
];

const SUGGESTIONS = [
    { id: 1, label: 'Thêm ít nhất 3 hình ảnh', done: false },
    { id: 2, label: 'Thêm video sản phẩm', done: false },
    { id: 3, label: 'Tên sản phẩm 25-100 ký tự', done: false },
    { id: 4, label: 'Mô tả > 100 ký tự & có hình ảnh', done: true },
    { id: 5, label: 'Điền đầy đủ thông tin thương hiệu', done: false },
];

const EXTENDED_ATTRIBUTES = [
    { key: 'warranty_period', label: 'Hạn bảo hành', placeholder: 'VD: 12 tháng' },
    { key: 'warranty_type', label: 'Loại bảo hành', placeholder: 'VD: Bảo hành điện tử' },
    { key: 'manufacture_year', label: 'Năm sản xuất', placeholder: 'VD: 2024' },
    { key: 'shelf_life', label: 'Hạn sử dụng', placeholder: 'VD: 24 tháng' },
    { key: 'country_origin', label: 'Nước sản xuất', placeholder: 'VD: Vietnam' },
    { key: 'ingredients', label: 'Thành phần', placeholder: 'VD: Cotton, Polyester...' },
    { key: 'instructions', label: 'Hướng dẫn sử dụng', placeholder: 'VD: Giặt tay...' },
    { key: 'storage_instructions', label: 'Hướng dẫn bảo quản', placeholder: 'VD: Nơi khô ráo' },
    { key: 'power_capacity', label: 'Công suất', placeholder: 'VD: 200W' },
    { key: 'voltage', label: 'Điện áp', placeholder: 'VD: 220V' },
    { key: 'compatible_models', label: 'Tương thích', placeholder: 'VD: iPhone 14, 15...' },
    { key: 'size_screen', label: 'Kích thước màn hình', placeholder: 'VD: 6.7 inch' },
    { key: 'main_camera', label: 'Camera chính', placeholder: 'VD: 48MP' },
    { key: 'battery_capacity', label: 'Dung lượng pin', placeholder: 'VD: 5000mAh' },
];

// --- Sub-components (Giữ nguyên hoặc chỉnh sửa nhỏ) ---

const MediaItem = ({
    type, index, isCover, onRemove, ratio = '1:1', url, className
}: {
    type: 'image' | 'video', index?: number, isCover?: boolean, onRemove: () => void, ratio?: '1:1' | '3:4', url?: string, className?: string
}) => (
    <div className={classNames(
        "group relative w-full rounded-lg border border-gray-200 bg-gray-50 overflow-hidden hover:border-orange-500 transition-all shadow-sm",
        ratio === '1:1' ? 'aspect-square' : 'aspect-[3/4]',
        className
    )}>
        <div className="w-full h-full flex items-center justify-center bg-gray-100/50 text-gray-300">
            {url ? (
                type === 'video' ? (
                    <video src={url} className="w-full h-full object-cover" controls />
                ) : (
                    <img src={url} alt="media" className="w-full h-full object-cover" />
                )
            ) : (
                type === 'image' ? <ImageIcon size={28} strokeWidth={1.5} /> : <Video size={28} strokeWidth={1.5} />
            )}
        </div>
        {isCover && (
            <div className="absolute top-0 left-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-10 flex items-center gap-1 shadow-sm">
                <Star size={10} fill="currentColor" /> Ảnh bìa
            </div>
        )}
        <button
            onClick={onRemove}
            type="button" // Important type button to avoid submit form
            className="absolute top-1 right-1 bg-white text-gray-500 p-1 rounded-full shadow-md hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-20 transform scale-90 group-hover:scale-100"
        >
            <X size={14} />
        </button>
    </div>
);

const UploadBox = ({ label, icon, onClick, ratio = '1:1', isCover, className }: any) => (
    <div
        onClick={onClick}
        className={classNames(
            "w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group hover:bg-orange-50/30",
            isCover ? "border-orange-300 bg-orange-50/10 hover:border-orange-500" : "border-gray-300 hover:border-orange-500",
            ratio === '1:1' ? 'aspect-square' : 'aspect-[3/4]',
            className
        )}
    >
        <div className={classNames("mb-1 transition-transform duration-200 group-hover:scale-110", isCover ? "text-orange-500" : "text-gray-400 group-hover:text-orange-500")}>
            {icon || <Plus size={24} />}
        </div>
        {label && (
            <span className={classNames("text-[10px] font-medium text-center px-1 leading-tight", isCover ? "text-orange-600" : "text-gray-500 group-hover:text-orange-600")}>
                {label}
            </span>
        )}
    </div>
);

const SectionCard = ({ children, title, id, className }: { children: React.ReactNode, title?: string, id?: string, className?: string }) => (
    <div id={id} className={classNames("bg-white rounded-xl shadow-sm border border-gray-100 scroll-mt-28 relative", className)}>
        {title && (
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                <h3 className="text-base font-bold text-gray-800">{title}</h3>
            </div>
        )}
        <div className="p-6">
            {children}
        </div>
    </div>
);

const FormLabel = ({ children, required, subText, helpText }: { children: React.ReactNode, required?: boolean, subText?: string, helpText?: string }) => (
    <div className="mb-2.5">
        <div className="flex items-center gap-1.5">
            <label className="text-sm font-medium text-gray-700">
                {children}
            </label>
            {required && <span className="text-red-500 text-xs font-bold" title="Bắt buộc">*</span>}
            {helpText && (
                <div className="group relative">
                    <HelpCircle size={14} className="text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {helpText}
                    </div>
                </div>
            )}
        </div>
        {subText && <p className="text-xs text-gray-500 mt-1 leading-snug">{subText}</p>}
    </div>
);

const InputField = ({ placeholder, suffix, className, type = "text", value, onChange }: any) => (
    <div className={classNames("group flex items-center border border-gray-300 rounded-lg bg-white h-11 px-3 w-full focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-200", className)}>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder || "Vui lòng nhập"}
            className="flex-1 outline-none text-sm text-gray-900 placeholder:text-gray-400 bg-transparent h-full w-full"
        />
        {suffix && (
            <div className="flex items-center pl-3 border-l border-gray-200 ml-2 h-3/5 text-gray-500 text-sm font-medium">
                {suffix}
            </div>
        )}
    </div>
);

const SelectField = ({ placeholder, value, onChange, options = [] }: any) => (
    <div className="flex items-center justify-between border border-gray-300 rounded-lg bg-white h-11 px-3 w-full cursor-pointer hover:border-orange-500 hover:bg-orange-50/10 transition-all duration-200 group relative">
        <select
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        >
            <option value="">{placeholder}</option>
            {options.map((opt: any) => {
                const val = typeof opt === 'object' ? opt.value : opt;
                const label = typeof opt === 'object' ? opt.label : opt;
                return <option key={val} value={val}>{label}</option>;
            })}
        </select>

        <span className={classNames("text-sm truncate", value ? "text-gray-900 font-medium" : "text-gray-400")}>
            {(() => {
                if (!value) return placeholder || "Vui lòng chọn";
                const selected = options.find((o: any) => (typeof o === 'object' ? o.value === value : o === value));
                return selected ? (typeof selected === 'object' ? selected.label : selected) : value;
            })()}
        </span>
        <ChevronDown className="text-gray-400 group-hover:text-orange-500 transition-colors" size={18} />
    </div>
);
const SearchableSelectField = ({ placeholder, value, onChange, options = [] }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Lọc danh sách theo từ khóa tìm kiếm
    const filteredOptions = options.filter((opt: any) => {
        const label = typeof opt === 'object' ? opt.label : opt;
        return label?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Lấy label của item đang được chọn để hiển thị
    const selectedLabel = React.useMemo(() => {
        if (!value) return placeholder || "Vui lòng chọn";
        const selected = options.find((o: any) => (typeof o === 'object' ? o.value === value : o === value));
        return selected ? (typeof selected === 'object' ? selected.label : selected) : value;
    }, [value, options, placeholder]);

    return (
        <div ref={dropdownRef} className="relative w-full">
            {/* Box hiển thị (Nút bấm mở dropdown) */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={classNames(
                    "flex items-center justify-between border rounded-lg bg-white h-11 px-3 w-full cursor-pointer transition-all duration-200 group",
                    isOpen ? "border-orange-500 ring-2 ring-orange-100" : "border-gray-300 hover:border-orange-500"
                )}
            >
                <span className={classNames("text-sm truncate", value ? "text-gray-900 font-medium" : "text-gray-400")}>
                    {selectedLabel}
                </span>
                <ChevronDown className={classNames("text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} size={18} />
            </div>

            {/* Dropdown List - Sửa lại class định vị tuyệt đối và z-index cao */}
            {isOpen && (
                <div className="absolute left-0 top-[calc(100%+8px)] w-full bg-white border border-gray-200 rounded-lg shadow-xl z-[100] max-h-72 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-1">

                    {/* Thanh Search dính chặt ở trên */}
                    <div className="p-2 border-b border-gray-100 bg-gray-50 shrink-0">
                        <div className="flex items-center px-2 py-1.5 bg-white border border-gray-300 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
                            <Search size={14} className="text-gray-400 mr-2 shrink-0" />
                            <input
                                type="text"
                                className="w-full bg-transparent outline-none text-sm text-gray-700"
                                placeholder="Tìm kiếm thương hiệu..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Danh sách options */}
                    <div className="overflow-y-auto flex-1 p-1 custom-scrollbar bg-white">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt: any) => {
                                const val = typeof opt === 'object' ? opt.value : opt;
                                const label = typeof opt === 'object' ? opt.label : opt;
                                const isSelected = val === value;
                                return (
                                    <div
                                        key={val}
                                        onClick={() => {
                                            onChange(val);
                                            setIsOpen(false);
                                            setSearchTerm('');
                                        }}
                                        className={classNames(
                                            "px-3 py-2 text-sm rounded-md cursor-pointer transition-colors flex items-center justify-between",
                                            isSelected ? "bg-orange-50 text-orange-600 font-medium" : "text-gray-700 hover:bg-gray-50"
                                        )}
                                    >
                                        {label}
                                        {isSelected && <Check size={16} className="text-orange-500" />}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-3 py-6 text-sm text-gray-500 text-center italic">
                                Không tìm thấy thương hiệu nào
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
// --- Main Page Component ---

// Spec [0018]: block paste link Shopee/Tiki -> BE crawl -> trả brand/name/image
// để seller click "Áp dụng" auto-fill form. Inline component để tránh thêm file.
const CrawlFromUrlBlock = ({ onApply }: { onApply: (data: any) => void }) => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<any>(null);

    const handleCrawl = async () => {
        if (!url) return toast.error('Nhập link sản phẩm Shopee hoặc Tiki');
        setLoading(true);
        try {
            const res: any = await api.post('/brands/crawl', { url });
            const data = res?.data || res;
            setPreview(data);
            toast.success('Đã crawl xong, kiểm tra rồi bấm Áp dụng');
        } catch (e: any) {
            toast.error(e?.response?.data?.message || e?.message || 'Lỗi crawl link');
            setPreview(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-6 bg-purple-50 border border-purple-100 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
                <LinkIcon size={16} className="text-purple-500" />
                <span className="text-sm font-semibold text-purple-700">
                    Auto-fill từ link Shopee / Tiki
                </span>
            </div>
            <div className="flex gap-2">
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Dán link sản phẩm Shopee/Tiki..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-purple-500 bg-white"
                />
                <button
                    type="button"
                    onClick={handleCrawl}
                    disabled={loading || !url}
                    className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all"
                >
                    {loading ? 'Đang lấy...' : 'Lấy thông tin'}
                </button>
            </div>

            {preview && (
                <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-start gap-3">
                    {preview.image && (
                        <img src={preview.image} alt={preview.name} className="w-16 h-16 object-cover rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="text-xs uppercase font-bold text-gray-400">{preview.source}</div>
                        <div className="text-sm font-semibold text-gray-800 truncate">{preview.name || '(không có tên)'}</div>
                        <div className="text-xs text-gray-500 mt-1">
                            Brand: <strong>{preview.brand || '(không có)'}</strong>
                            {preview.category && <> · DM: {preview.category}</>}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => onApply(preview)}
                        className="px-3 py-1.5 text-xs bg-orange-600 text-white font-semibold rounded hover:bg-orange-700 shrink-0"
                    >
                        Áp dụng
                    </button>
                </div>
            )}

            <div className="text-[11px] text-gray-500 leading-snug">
                * Lazada chưa hỗ trợ. * Shopee có thể bị anti-bot tuỳ thời điểm.
            </div>
        </div>
    );
};

const AddProductPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Spec [0018]: nút "Sửa SP" load lại form tạo mới với data prefilled.
    // editId từ query ?editId=<productId>. Nếu có -> fetch + prefill.
    const editId = searchParams.get('editId') || null;
    const isEditMode = !!editId;
    const [activeTab, setActiveTab] = useState('basic');
    const [imageRatio, setImageRatio] = useState<'1:1' | '3:4'>('1:1');
    const [sizeChartMode, setSizeChartMode] = useState<'template' | 'image'>('template');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [crossSellIds, setCrossSellIds] = useState<string[]>([]);
    const [showSizeChartGenerator, setShowSizeChartGenerator] = useState(false);

    // State
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [shopCategoryId, setShopCategoryId] = useState('');
    //   const [systemTags, setSystemTags] = useState<string[]>([]);
    const [gtin, setGtin] = useState('');
    const [desc, setDesc] = useState('');

    // Detail
    const [brand, setBrand] = useState('');
    const [origin, setOrigin] = useState('');
    const [material, setMaterial] = useState('');
    const [style, setStyle] = useState('');
    const [isShowMoreAttributes, setIsShowMoreAttributes] = useState(false);
    const [extraAttributes, setExtraAttributes] = useState<Record<string, string>>({});

    // Spec [0018]: Mô tả ngắn — block 6 fields hiển thị nhanh trên trang SP
    // (khác với "Mô tả sản phẩm" rich text dài bên dưới). Lưu vào Product.shortDesc Json.
    const [shortDescBrand, setShortDescBrand] = useState('');       // 1. Thương hiệu (story ngắn)
    const [shortDescFeatures, setShortDescFeatures] = useState(''); // 2. Đặc điểm nổi bật
    const [shortDescBenefits, setShortDescBenefits] = useState(''); // 3. Lợi ích
    const [shortDescRecipient, setShortDescRecipient] = useState(''); // 4. Phù hợp tặng cho
    const [shortDescOccasion, setShortDescOccasion] = useState('');   // 5. Dịp tặng
    const [shortDescNote, setShortDescNote] = useState('');           // 6. Ghi chú

    // Shipping
    const [weight, setWeight] = useState(0);
    const [length, setLength] = useState(0);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    // Media
    const [images, setImages] = useState<string[]>([]);
    const [videos, setVideos] = useState<string[]>([]);
    const [sizeChartImage, setSizeChartImage] = useState<string | null>(null);

    // [UPGRADE] State cho Video URL Input
    const [videoUrlInput, setVideoUrlInput] = useState('');

    // [UPGRADE] State cho Tình trạng sản phẩm
    const [condition, setCondition] = useState<string>('new'); // 'new' | 'used'
    const [conditionPercent, setConditionPercent] = useState<number>(99);

    // Sales (Variants)
    const [tiers, setTiers] = useState<Tier[]>([]);
    const [skuRows, setSkuRows] = useState<SkuRow[]>([]);

    // Single Price
    const [singlePrice, setSinglePrice] = useState(0);
    const [singleStock, setSingleStock] = useState(0);

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [categoryPath, setCategoryPath] = useState<any[]>([]);

    const [shopCategories, setShopCategories] = useState<any[]>([]);
    const [brandsList, setBrandsList] = useState<{ label: string, value: string }[]>([]);
    // Fetch Categories
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Chú ý: Ở Admin là GET /admin/brands, ở Seller thường là GET /brands (chỉ lấy brands active)
                const [brandsRes, shopRes] = await Promise.all([
                    api.get('/brands', { params: { status: 'active', limit: 500 } }).catch(() => []),
                    api.get('/seller/shop-categories').catch(() => [])
                ]);

                // Parse Brands từ Admin
                const brandsData = (brandsRes as any)?.data || (Array.isArray(brandsRes) ? brandsRes : []);
                if (Array.isArray(brandsData)) {
                    // Mặc định luôn có tùy chọn "No Brand"
                    const formattedBrands = brandsData.map((b: any) => ({ label: b.name, value: b.name })); // Hoặc b.id tùy BE của bạn lưu gì vào DB
                    setBrandsList([{ label: 'No Brand', value: 'No Brand' }, ...formattedBrands]);
                }

                // Parse Shop Categories
                const shopCatsData = (shopRes as any)?.data || (Array.isArray(shopRes) ? shopRes : []);
                if (Array.isArray(shopCatsData)) {
                    setShopCategories(shopCatsData.map((c: any) => ({ label: c.name, value: c.id })));
                }
            } catch (error) {
                console.error("Lỗi lấy dữ liệu khởi tạo:", error);
            }
        };
        fetchInitialData();
    }, []);

    // Spec [0018]: prefill form khi editId có. Map từ Product schema -> state.
    // Một số field phức tạp (tiers/variants) chỉ cố gắng best-effort, nếu schema
    // attributes khác giữa create vs read thì admin có thể phải tinh chỉnh sau.
    useEffect(() => {
        if (!editId) return;
        let cancelled = false;
        (async () => {
            try {
                // Wiki 0068 A1: endpoint owner-scoped /seller/products/:id (trước gọi
                // /products/:id không tồn tại -> 404 -> toast "không tải được dữ liệu").
                const res: any = await api.get(`/seller/products/${editId}`);
                const product = res?.data || res;
                if (!product || cancelled) return;

                setName(product.name ?? '');
                setDesc(product.description ?? '');
                setSinglePrice(Number(product.price ?? 0));
                setSingleStock(Number(product.stock ?? 0));
                setCategoryId(product.categoryId ?? '');
                setShopCategoryId(product.shopCategoryId ?? '');
                setBrand(product.brand ?? '');
                setOrigin(product.origin ?? '');
                setWeight(Number(product.weight ?? 0));
                setLength(Number(product.length ?? 0));
                setWidth(Number(product.width ?? 0));
                setHeight(Number(product.height ?? 0));

                // images: schema lưu Json (array URL string hoặc array {url})
                if (Array.isArray(product.images)) {
                    const urls = product.images.map((i: any) => typeof i === 'string' ? i : i.url).filter(Boolean);
                    setImages(urls);
                }
                if (Array.isArray(product.videos)) {
                    const urls = product.videos.map((v: any) => typeof v === 'string' ? v : v.url).filter(Boolean);
                    setVideos(urls);
                }

                // Spec [0018]: shortDesc 6 fields
                if (product.shortDesc) {
                    try {
                        const sd = typeof product.shortDesc === 'string' ? JSON.parse(product.shortDesc) : product.shortDesc;
                        setShortDescBrand(sd.brand ?? '');
                        setShortDescFeatures(sd.features ?? '');
                        setShortDescBenefits(sd.benefits ?? '');
                        setShortDescRecipient(sd.recipient ?? '');
                        setShortDescOccasion(sd.occasion ?? '');
                        setShortDescNote(sd.note ?? '');
                    } catch {/* ignore */ }
                }

                // attributes JSON string -> parse và spread vào state riêng
                if (product.attributes) {
                    try {
                        const a = typeof product.attributes === 'string' ? JSON.parse(product.attributes) : product.attributes;
                        if (a.material) setMaterial(a.material);
                        if (a.style) setStyle(a.style);
                        if (a.gtin) setGtin(a.gtin);
                        if (a.condition) setCondition(a.condition);
                        if (a.conditionPercent) setConditionPercent(a.conditionPercent);
                    } catch {/* ignore */ }
                }

                if (Array.isArray(product.crossSellProducts)) {
                    setCrossSellIds(product.crossSellProducts.map((p: any) => p.id));
                }
            } catch (e: any) {
                console.error('[AddProductPage] prefill fail:', e);
                toast.error('Không tải được dữ liệu sản phẩm để chỉnh sửa');
            }
        })();
        return () => { cancelled = true; };
    }, [editId]);

    const handleSizeChartCreated = (url: string) => {
        setSizeChartImage(url);
        setSizeChartMode('image');
        setShowSizeChartGenerator(false);
    };

    const toggleRatio = (ratio: '1:1' | '3:4') => setImageRatio(ratio);

    const scrollToSection = (id: string) => {
        setActiveTab(id);
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // [UPGRADE] Xử lý upload nhiều file và input video
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'sizeChart') => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploading(true);
            const files = Array.from(e.target.files);

            try {
                // --- SỬA ĐỔI TẠI ĐÂY: Upload tuần tự thay vì Promise.all ---
                const newUrls: string[] = [];

                for (const file of files) {
                    // Đợi file này xong mới upload file tiếp theo
                    // Giúp tránh spam API và tránh lỗi 403 Rate Limit
                    const url = await uploadFileToR2(file);
                    newUrls.push(url);
                }
                // -----------------------------------------------------------

                if (type === 'image') {
                    setImages(prev => [...prev, ...newUrls]);
                }
                else if (type === 'video') {
                    // Logic giới hạn 1 video nếu upload file
                    if (files.length > 1) {
                        alert("Đã upload xong. Lưu ý: Chỉ video đầu tiên được chọn, các video khác vui lòng dùng URL.");
                        if (newUrls.length > 0) setVideos(prev => [...prev, newUrls[0]]);
                    } else {
                        setVideos(prev => [...prev, ...newUrls]);
                    }
                }
                else if (type === 'sizeChart') {
                    if (newUrls.length > 0) setSizeChartImage(newUrls[0]);
                }
            } catch (error: any) {
                console.error(error);
                // Hiển thị lỗi cụ thể nếu có
                if (error?.response?.status === 403) {
                    alert("Bạn thao tác quá nhanh, vui lòng thử lại hoặc chọn ít ảnh hơn.");
                } else {
                    alert("Lỗi khi tải file lên.");
                }
            } finally {
                setIsUploading(false);
                e.target.value = ''; // Reset input
            }
        }
    };

    // [UPGRADE] Thêm Video bằng URL
    const handleAddVideoUrl = () => {
        if (!videoUrlInput.trim()) return;
        // Có thể thêm validate URL youtube/tiktok ở đây nếu cần
        setVideos(prev => [...prev, videoUrlInput.trim()]);
        setVideoUrlInput('');
    };

    const qualitySuggestions = React.useMemo(() => {
        const getPlainTextLength = (htmlString: string) => {
            return htmlString.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().length;
        };

        const descLength = getPlainTextLength(desc);
        const hasDescImage = desc.includes('<img');

        return [
            { id: 1, label: 'Thêm ít nhất 3 hình ảnh', done: images.length >= 3 },
            { id: 2, label: 'Thêm video sản phẩm', done: videos.length > 0 },
            { id: 3, label: 'Tên sản phẩm 25-100 ký tự', done: name.trim().length >= 25 && name.trim().length <= 100 },
            { id: 4, label: 'Mô tả > 100 ký tự & có hình ảnh', done: descLength > 100 && hasDescImage },
            { id: 5, label: 'Điền đầy đủ thông tin thương hiệu', done: !!brand && brand !== '' && !!origin && origin !== '' },
        ];
    }, [images, videos, name, desc, brand, origin]);

    const completedCount = qualitySuggestions.filter(s => s.done).length;
    const totalCriteria = qualitySuggestions.length;
    const progressPercent = Math.round((completedCount / totalCriteria) * 100);

    // ... (Logic Tier, Options, SKU - Giữ nguyên như cũ) ...
    // #16 (wiki 0044/0045): max nhóm phân loại = 5 (theo spec Require GMall + feedback Pass 2 #16).
    // Trước đây cứng 2. SKU matrix builder giờ dùng generic Cartesian product.
    const MAX_TIERS = 5;
    const addTier = () => { if (tiers.length < MAX_TIERS) setTiers([...tiers, { name: '', options: [], images: [] }]); };
    const removeTier = (index: number) => { const n = [...tiers]; n.splice(index, 1); setTiers(n); };
    const updateTierName = (idx: number, v: string) => { const n = [...tiers]; n[idx].name = v; setTiers(n); };

    const addOptionToTier = (idx: number, val: string) => {
        if (!val.trim()) return;
        const n = [...tiers];
        if (!n[idx].options.includes(val)) {
            n[idx].options.push(val);
            n[idx].images.push('');
            setTiers(n);
        }
    };

    const removeOptionFromTier = (tIdx: number, oIdx: number) => {
        const n = [...tiers];
        n[tIdx].options.splice(oIdx, 1);
        n[tIdx].images.splice(oIdx, 1);
        setTiers(n);
    };

    const handleTierImageUpload = async (tIdx: number, oIdx: number, file: File) => {
        try {
            setIsUploading(true);
            const url = await uploadFileToR2(file);
            const n = [...tiers];
            n[tIdx].images[oIdx] = url;
            setTiers(n);
        } catch (e) {
            alert("Lỗi tải ảnh phân loại");
        } finally {
            setIsUploading(false);
        }
    };

    const removeTierImage = (tIdx: number, oIdx: number) => {
        const n = [...tiers];
        n[tIdx].images[oIdx] = '';
        setTiers(n);
    };

    // #16: Cartesian product generic cho tiers.length từ 1 đến MAX_TIERS=5.
    // Trước đây hardcode chỉ handle 1 hoặc 2 tiers → SKU matrix rỗng khi tiers > 2.
    const generateSkuMatrix = useCallback(() => {
        if (tiers.length === 0) return [];
        const tierOpts = tiers.map(t => t.options);
        if (tierOpts.some(opts => opts.length === 0)) return [];
        // Cartesian: reduce mỗi tier nhân với accumulator.
        // Bắt đầu với [{ key: '', indices: [] }], mỗi step expand mỗi row × mỗi option của tier kế.
        const initial: { key: string; indices: number[] }[] = [{ key: '', indices: [] }];
        const cartesian = tierOpts.reduce((acc, opts) => {
            return acc.flatMap(row =>
                opts.map((opt, optIdx) => ({
                    key: row.key ? `${row.key} - ${opt}` : opt,
                    indices: [...row.indices, optIdx],
                }))
            );
        }, initial);
        return cartesian.map(c => ({ ...c, price: 0, stock: 0, sku: '' }));
    }, [tiers]);

    // hooks-fix wiki 0031: cố ý bỏ skuRows khỏi deps — effect sync skuRows từ tiers,
    // thêm skuRows sẽ infinite loop vì setSkuRows lại trigger chính nó.
    useEffect(() => {
        const newRows = generateSkuMatrix();
        const merged = newRows.map(r => {
            const exist = skuRows.find(old => old.key === r.key);
            return exist ? exist : r;
        });
        setSkuRows(merged);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tiers, generateSkuMatrix]);

    const updateSkuRow = (idx: number, field: keyof SkuRow, val: any) => {
        const n = [...skuRows];
        n[idx] = { ...n[idx], [field]: val };
        setSkuRows(n);
    };

    const handleBulkApply = (p: number, s: number, k: string) => {
        const n = skuRows.map(r => ({ ...r, price: p || r.price, stock: s || r.stock, sku: k || r.sku }));
        setSkuRows(n);
    };

    // --- SUBMIT ---
    // Audit Seller #18: trước đây nút "Lưu nháp" UI fake — không có handler.
    // Bây giờ truyền `asDraft=true` → submit với status='DRAFT' (BE đã hỗ trợ
    // ProductStatus.DRAFT trong enum). Draft không cần đủ thông tin (không
    // block submit nếu thiếu categoryId).
    const handleSubmit = async (asDraft: boolean = false) => {
        if (!asDraft && !categoryId) {
            alert("Vui lòng chọn Ngành hàng (Danh mục sàn) để hệ thống phân loại.");
            return;
        }
        if (asDraft && !name?.trim()) {
            toast.error('Vui lòng nhập ít nhất "Tên sản phẩm" để lưu nháp');
            return;
        }
        try {
            setIsLoading(true);

            const finalPrice = tiers.length > 0 && skuRows.length > 0 ? skuRows[0].price : singlePrice;
            const finalStock = tiers.length > 0 && skuRows.length > 0 ? skuRows.reduce((a, b) => a + Number(b.stock), 0) : singleStock;
            const validTiers = tiers.filter(t => t.name && t.options.length > 0);
            const validVariations = skuRows.map(r => ({
                price: Number(r.price),
                stock: Number(r.stock),
                sku: r.sku,
                tierIndex: r.indices
            }));

            const payload = {
                name,
                description: desc,
                categoryId: categoryId || "cat_default",
                shopCategoryId: shopCategoryId || null,
                brand: brand || "No Brand",
                origin: origin || "Vietnam",
                price: Number(finalPrice),
                stock: Number(finalStock),

                images,
                videos,
                sizeChart: sizeChartImage,

                weight: Number(weight),
                length: Number(length),
                width: Number(width),
                height: Number(height),

                attributes: JSON.stringify({
                    material,
                    style,
                    gtin,
                    // [UPGRADE] Gửi thêm thông tin tình trạng
                    condition,
                    conditionPercent: condition === 'used' ? conditionPercent : 100,
                    ...extraAttributes
                }),

                // Spec [0018]: shortDesc 6 fields lưu Json (BE đã thêm cột Product.shortDesc)
                shortDesc: {
                    brand: shortDescBrand,
                    features: shortDescFeatures,
                    benefits: shortDescBenefits,
                    recipient: shortDescRecipient,
                    occasion: shortDescOccasion,
                    note: shortDescNote,
                },

                tiers: validTiers,
                variations: validVariations,
                crossSellIds,
                //systemTags: systemTags,
                systemTags: [],
                // Draft → BE lưu Product.status = 'DRAFT', không trigger admin review.
                // Default (không draft) → BE để default 'PENDING' chờ admin duyệt.
                ...(asDraft ? { status: 'DRAFT' } : {}),
            };

            if (isEditMode && editId) {
                await api.patch(`/seller/products/${editId}`, payload);
                toast.success(asDraft ? 'Đã lưu bản nháp' : 'Cập nhật sản phẩm thành công!');
            } else {
                await api.post('/seller/products', payload);
                toast.success(asDraft ? 'Đã lưu bản nháp' : 'Đăng sản phẩm thành công!');
            }
            // Draft → ở lại form để user tiếp tục chỉnh; submit thật → chuyển danh sách.
            if (!asDraft) router.push('/seller-dashboard/products/all');

        } catch (error: any) {
            console.error("LỖI KHI SUBMIT:", error);
            toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[1440px] mx-auto pb-32">
            {/* Header Title */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    {isEditMode
                        ? 'Cập nhật thông tin sản phẩm. Các thay đổi sẽ áp dụng ngay sau khi lưu.'
                        : 'Vui lòng điền đầy đủ thông tin để sản phẩm được duyệt nhanh nhất'}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* LEFT: Suggestions */}
                <div className="hidden xl:block col-span-3 sticky top-24 z-10">
                    {/* ... (Giữ nguyên phần Suggestions) ... */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Header Gradient */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1 bg-white/20 rounded-full"><CheckCircle2 size={16} className="text-white" /></div>
                                <span className="text-white font-bold text-sm">Chất lượng sản phẩm</span>
                                <span className="ml-auto text-white text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">{completedCount}/{totalCriteria}</span>
                            </div>
                            <div className="w-full bg-black/20 rounded-full h-1.5 mt-1">
                                <div className="bg-white h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                        </div>
                        <div className="p-2">
                            {qualitySuggestions.map((item) => (
                                <div key={item.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className={classNames("mt-0.5 transition-all duration-300", item.done ? "text-green-500 scale-110" : "text-gray-300")}>
                                        {item.done ? <CheckCircle2 size={18} fill="currentColor" className="text-white bg-green-500 rounded-full" /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-current"></div>}
                                    </div>
                                    <span className={classNames("text-sm font-medium leading-snug transition-colors duration-300", item.done ? "text-gray-400 line-through decoration-gray-300" : "text-gray-700")}>
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className={classNames("p-3 text-center border-t transition-colors duration-300", progressPercent === 100 ? "bg-green-50 border-green-100" : "bg-orange-50 border-orange-100")}>
                            {progressPercent === 100 ? (
                                <span className="text-xs text-green-700 font-bold flex items-center justify-center gap-1"><Check size={14} /> Tuyệt vời! Sản phẩm đã chuẩn SEO</span>
                            ) : (
                                <span className="text-xs text-orange-600 font-medium">Hoàn thiện để tăng hiển thị SEO</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* CENTER: Main Form */}
                <div className="col-span-1 lg:col-span-8 xl:col-span-6 flex flex-col gap-6">

                    {/* Navigation Tabs - Sticky */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1.5 flex items-center overflow-x-auto no-scrollbar sticky top-[70px] z-30">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => scrollToSection(tab.id)}
                                className={classNames("flex-1 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-lg transition-all duration-200", activeTab === tab.id ? "bg-orange-50 text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Section: Basic Info */}
                    <SectionCard title="Thông tin cơ bản" id="basic" className="relative z-50">
                        <div className="mb-8">
                            <FormLabel required subText="Ảnh bìa là hình ảnh đầu tiên khách hàng nhìn thấy. Nên dùng ảnh chất lượng cao, nền trắng.">
                                Ảnh bìa sản phẩm
                            </FormLabel>
                            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                                <div className="w-[140px] shrink-0">
                                    {images.length > 0 ? (
                                        <MediaItem type="image" index={0} isCover={true} url={images[0]} onRemove={() => setImages(images.filter((_, i) => i !== 0))} />
                                    ) : (
                                        <label>
                                            <UploadBox label="Tải ảnh bìa" isCover={true} />
                                            {/* [UPGRADE] Thêm multiple cho input ảnh bìa (dù chỉ hiện 1 nhưng UX cho phép chọn lại) */}
                                            <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
                                        </label>
                                    )}
                                </div>
                                {/* ... guidance text ... */}
                                <div className="text-sm text-gray-500 space-y-2 py-2 flex-1">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                                        <span>Tải lên hình ảnh 1:1.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                                        <span className="leading-snug">Ảnh bìa sẽ được hiển thị tại các trang Kết quả tìm kiếm, Gợi ý hôm nay,...</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-8"></div>

                        {/* Grid Ảnh sản phẩm */}
                        <div className="mb-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                                <div><FormLabel subText="Đăng thêm hình ảnh chi tiết các góc độ (tối đa 8 ảnh)">Hình ảnh sản phẩm</FormLabel></div>
                                <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg border border-gray-200 self-start md:self-center">
                                    <span className="text-xs font-medium text-gray-500 pl-2">Tỷ lệ:</span>
                                    <button onClick={() => toggleRatio('1:1')} className={classNames("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm", imageRatio === '1:1' ? "bg-white text-orange-600 border border-gray-200" : "text-gray-500 hover:bg-gray-100")}>1:1</button>
                                    <button onClick={() => toggleRatio('3:4')} className={classNames("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm", imageRatio === '3:4' ? "bg-white text-orange-600 border border-gray-200" : "text-gray-500 hover:bg-gray-100")}>3:4</button>
                                </div>
                            </div>
                            <div className={classNames("grid gap-4 transition-all", imageRatio === '1:1' ? "grid-cols-4 md:grid-cols-5 lg:grid-cols-6" : "grid-cols-3 md:grid-cols-4 lg:grid-cols-5")}>
                                {images.map((img, idx) => (<MediaItem key={idx} type="image" index={idx} url={img} ratio={imageRatio} isCover={idx === 0} onRemove={() => setImages(images.filter((_, i) => i !== idx))} />))}
                                {images.length < 9 && (
                                    <label>
                                        <UploadBox label={`Thêm ảnh (${images.length}/9)`} ratio={imageRatio} />
                                        {/* [UPGRADE] Thêm thuộc tính multiple */}
                                        <input type="file" hidden accept="image/*" multiple onChange={(e) => handleFileUpload(e, 'image')} />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-8"></div>

                        {/* [UPGRADE] Video Upload & URL */}
                        <div className="mb-6">
                            <FormLabel>Video sản phẩm</FormLabel>
                            <div className="flex flex-col gap-4">
                                {/* Danh sách video đã có */}
                                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                                    {videos.map((vid, idx) => (
                                        <MediaItem key={idx} type="video" index={idx} ratio="1:1" url={vid} onRemove={() => setVideos(videos.filter((_, i) => i !== idx))} />
                                    ))}

                                    {/* Nút Upload File (Chỉ 1 file) */}
                                    <label className={classNames("cursor-pointer", videos.length >= 5 && "hidden")}>
                                        <UploadBox label="Tải video lên" icon={<Video size={24} />} ratio="1:1" />
                                        <input type="file" hidden accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} />
                                    </label>
                                </div>

                                {/* Input thêm URL Video */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                                    <p className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1">
                                        <LinkIcon size={12} /> Hoặc thêm video từ URL (Youtube, TikTok...)
                                    </p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={videoUrlInput}
                                            onChange={(e) => setVideoUrlInput(e.target.value)}
                                            placeholder="Dán đường dẫn video tại đây..."
                                            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-orange-500"
                                        />
                                        <button
                                            onClick={handleAddVideoUrl}
                                            type="button"
                                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                                        >
                                            Thêm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-6"></div>

                        {/* Name, Category, GTIN */}
                        <div className="space-y-6">
                            <div><FormLabel required>Tên sản phẩm</FormLabel><InputField value={name} onChange={(e: any) => setName(e.target.value)} placeholder="Nhập tên sản phẩm chuẩn SEO..." /></div>

                            <div className="mt-6">
                                <FormLabel required helpText="Chọn ngành hàng chính xác giúp sản phẩm dễ dàng được tìm thấy và tối ưu SEO">
                                    Ngành hàng
                                </FormLabel>

                                <div className="relative group">
                                    <div
                                        onClick={() => setShowCategoryModal(true)}
                                        className={classNames("w-full min-h-[44px] px-3 py-2 border rounded-lg flex items-center justify-between cursor-pointer bg-white transition-all", categoryId ? "border-orange-500 bg-orange-50/10" : "border-gray-300 hover:border-orange-400")}
                                    >
                                        {categoryPath.length > 0 ? (
                                            <div className="flex items-center gap-1.5 flex-wrap text-sm text-gray-900 font-medium">
                                                {categoryPath.map((c, i) => (
                                                    <React.Fragment key={c.id}>{i > 0 && <span className="text-gray-400 text-xs">/</span>}<span>{c.name}</span></React.Fragment>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Chọn ngành hàng (Ví dụ: Thời trang nam &gt; Áo &gt; Áo phông)</span>
                                        )}
                                        <Edit size={16} className="text-gray-400 group-hover:text-orange-500" />
                                    </div>
                                </div>

                                {/* [UPGRADE] Modal chọn ngành hàng - Tăng kích thước max-width */}
                                {showCategoryModal && (
                                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                                        {/* Thay đổi: Bỏ max-w cũ, dùng fixed height để đảm bảo layout full, bỏ overflow-hidden ở đây để component con tự xử lý */}
                                        <div className="bg-white w-full max-w-[95vw] lg:max-w-7xl rounded-xl shadow-2xl flex flex-col h-[85vh] overflow-hidden">

                                            {/* [FIX]: Xóa bỏ Header thủ công và padding (p-6) bao quanh cũ.
                                   Để CategoryCascader tự render Header/Footer của chính nó -> Tránh bị 2 header và giúp nút Xác nhận luôn hiển thị.
                                */}

                                            <CategoryCascader
                                                selectedId={categoryId}
                                                onSelect={(id, path) => {
                                                    if (id) {
                                                        setCategoryId(id);
                                                        setCategoryPath(path);
                                                        setShowCategoryModal(false);
                                                    }
                                                }}
                                                // [FIX]: Truyền thêm onClose để hiển thị nút Hủy trong component
                                                onClose={() => setShowCategoryModal(false)}
                                            // Nếu muốn cho phép chọn danh mục cha, bỏ comment dòng dưới (tùy nghiệp vụ)
                                            // allowSelectParent={true}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* <div className="mt-6 animate-in fade-in slide-in-from-top-2">
                    <FormLabel 
                        subText="Gắn thẻ để sản phẩm xuất hiện trong các bộ lọc 'Người nhận', 'Dịp lễ'..." 
                        helpText="Việc gắn thẻ này không bắt buộc nhưng giúp tăng khả năng hiển thị sản phẩm tới đúng đối tượng khách hàng."
                    >
                        Phân loại nâng cao (System Tags)
                    </FormLabel>
                    <SystemTagSelector 
                        selectedTags={systemTags} 
                        onChange={setSystemTags} 
                    />
                </div> */}
                            <div><FormLabel>Mã GTIN / Barcode</FormLabel><InputField value={gtin} onChange={(e: any) => setGtin(e.target.value)} placeholder="Nhập mã GTIN..." /></div>
                        </div>
                    </SectionCard>

                    {/* ... (Các Section chi tiết, mô tả giữ nguyên) ... */}
                    <SectionCard title="Thông tin chi tiết" id="details" className="relative z-40">
                        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 items-start">
                            <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                            <div>
                                <p className="text-sm text-blue-800 font-medium">Cải thiện mức độ hiển thị</p>
                                <p className="text-xs text-blue-600 mt-1">Điền thêm các thuộc tính giúp sản phẩm dễ dàng được tìm thấy hơn.</p>
                            </div>
                        </div>

                        {/* Spec [0018]: crawl brand từ URL Shopee/Tiki để auto-fill */}
                        <CrawlFromUrlBlock
                            onApply={(data) => {
                                if (data.brand) setBrand(data.brand);
                                if (data.name && !name) setName(data.name);
                                if (data.image && images.length === 0) setImages([data.image]);
                                if (data.description && !desc) setDesc(data.description);
                                toast.success(`Đã lấy dữ liệu từ ${data.source}`);
                            }}
                        />

                        <SectionCard title="Thông tin chi tiết" id="details" className="relative z-40">
                            <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 items-start">
                                <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                                <div>
                                    <p className="text-sm text-blue-800 font-medium">Cải thiện mức độ hiển thị</p>
                                    <p className="text-xs text-blue-600 mt-1">Điền thêm các thuộc tính giúp sản phẩm dễ dàng được tìm thấy hơn.</p>
                                </div>
                            </div>

                            {/* Crawl data (nếu có) */}
                            <CrawlFromUrlBlock
                                onApply={(data) => {
                                    if (data.brand) setBrand(data.brand);
                                    if (data.name && !name) setName(data.name);
                                    if (data.image && images.length === 0) setImages([data.image]);
                                    if (data.description && !desc) setDesc(data.description);
                                    toast.success(`Đã lấy dữ liệu từ ${data.source}`);
                                }}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

                                {/* CỘT 1: Thương hiệu -> z-50 để không bị che dropdown */}
                                <div className="relative z-50">
                                    <FormLabel required>Thương hiệu</FormLabel>
                                    <SearchableSelectField
                                        value={brand}
                                        onChange={setBrand}
                                        options={brandsList.length > 0 ? brandsList : [{ label: 'No Brand', value: 'No Brand' }]}
                                        placeholder="Chọn thương hiệu"
                                    />
                                </div>

                                {/* CỘT 2: Xuất xứ -> z-40 */}
                                <div className="relative z-40">
                                    <FormLabel required>Xuất xứ</FormLabel>
                                    <SelectField value={origin} onChange={setOrigin} options={['Việt Nam', 'Trung Quốc', 'Hàn Quốc']} placeholder="Chọn xuất xứ" />
                                </div>

                                {/* CỘT 3: Chất liệu -> z-30 */}
                                <div className="relative z-30">
                                    <FormLabel>Chất liệu</FormLabel>
                                    <InputField value={material} onChange={(e: any) => setMaterial(e.target.value)} />
                                </div>

                                {/* CỘT 4: Kiểu dáng -> z-20 */}
                                <div className="relative z-20">
                                    <FormLabel>Kiểu dáng</FormLabel>
                                    <InputField value={style} onChange={(e: any) => setStyle(e.target.value)} />
                                </div>

                                {isShowMoreAttributes && EXTENDED_ATTRIBUTES.map((attr) => (
                                    <div key={attr.key} className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <FormLabel>{attr.label}</FormLabel>
                                        <InputField placeholder={attr.placeholder} value={extraAttributes[attr.key] || ''} onChange={(e: any) => setExtraAttributes(prev => ({ ...prev, [attr.key]: e.target.value }))} />
                                    </div>
                                ))}

                                <div className="col-span-1 md:col-span-2">
                                    <button onClick={() => setIsShowMoreAttributes(!isShowMoreAttributes)} className="flex items-center gap-2 text-orange-600 text-sm font-medium hover:bg-orange-50 px-3 py-2 rounded-lg transition-colors w-full justify-center border border-dashed border-orange-200">
                                        {isShowMoreAttributes ? <><ChevronUp size={16} /> Thu gọn</> : <><ChevronDown size={16} /> Hiển thị thêm 14 thuộc tính khác</>}
                                    </button>
                                </div>
                            </div>
                        </SectionCard>
                    </SectionCard>

                    {/* Spec [0018]: Mô tả ngắn — 6 fields hiển thị nhanh trên trang SP.
              Khác mô tả dài bên dưới: dùng để khoe nhanh "tặng cho ai - dịp gì - điểm nổi bật".
              Lưu vào Product.shortDesc Json. Tất cả optional. */}
                    <SectionCard title="Mô tả ngắn (Giới thiệu nhanh)" id="short-desc">
                        <div className="mb-5 bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3 items-start">
                            <Info className="text-amber-500 shrink-0 mt-0.5" size={18} />
                            <div>
                                <p className="text-sm text-amber-800 font-medium">Hiển thị ngay đầu trang sản phẩm</p>
                                <p className="text-xs text-amber-700 mt-1">Khách lướt qua đọc ngay phần này. Điền ngắn, đủ ý, có cảm xúc — đặc biệt là <strong>tặng ai</strong> và <strong>dịp nào</strong>.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            <div className="md:col-span-2">
                                <FormLabel>Câu chuyện thương hiệu</FormLabel>
                                <textarea
                                    value={shortDescBrand}
                                    onChange={(e) => setShortDescBrand(e.target.value)}
                                    maxLength={200}
                                    rows={2}
                                    placeholder="VD: Thương hiệu thủ công Việt với 10 năm kinh nghiệm làm gốm Bát Tràng..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                                />
                                <div className="text-right text-xs text-gray-400 mt-1">{shortDescBrand.length}/200</div>
                            </div>

                            <div>
                                <FormLabel>Đặc điểm nổi bật</FormLabel>
                                <textarea
                                    value={shortDescFeatures}
                                    onChange={(e) => setShortDescFeatures(e.target.value)}
                                    maxLength={300}
                                    rows={3}
                                    placeholder="VD: Hộp gỗ óc chó nguyên khối, lót nhung đỏ, khắc tên miễn phí..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                                />
                                <div className="text-right text-xs text-gray-400 mt-1">{shortDescFeatures.length}/300</div>
                            </div>

                            <div>
                                <FormLabel>Lợi ích cho người nhận</FormLabel>
                                <textarea
                                    value={shortDescBenefits}
                                    onChange={(e) => setShortDescBenefits(e.target.value)}
                                    maxLength={300}
                                    rows={3}
                                    placeholder="VD: Lưu giữ kỷ niệm, sang trọng, dùng được nhiều năm..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                                />
                                <div className="text-right text-xs text-gray-400 mt-1">{shortDescBenefits.length}/300</div>
                            </div>

                            <div>
                                <FormLabel>Phù hợp tặng cho</FormLabel>
                                <input
                                    type="text"
                                    value={shortDescRecipient}
                                    onChange={(e) => setShortDescRecipient(e.target.value)}
                                    maxLength={150}
                                    placeholder="VD: Bố, sếp, đối tác, người thân U50..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                />
                            </div>

                            <div>
                                <FormLabel>Dịp tặng phù hợp</FormLabel>
                                <input
                                    type="text"
                                    value={shortDescOccasion}
                                    onChange={(e) => setShortDescOccasion(e.target.value)}
                                    maxLength={150}
                                    placeholder="VD: Sinh nhật, kỷ niệm, Tết, khai trương, tân gia..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <FormLabel>Ghi chú thêm</FormLabel>
                                <textarea
                                    value={shortDescNote}
                                    onChange={(e) => setShortDescNote(e.target.value)}
                                    maxLength={200}
                                    rows={2}
                                    placeholder="VD: Có hộp quà miễn phí, tặng kèm thiệp, gói trong 24h..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                                />
                                <div className="text-right text-xs text-gray-400 mt-1">{shortDescNote.length}/200</div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Mô tả sản phẩm" id="desc">
                        {/* Giữ nguyên */}
                        <div className="space-y-4">
                            <DescriptionEditor value={desc} onChange={(val) => setDesc(val)} />
                            <div className="text-right text-xs text-gray-400">Độ dài hiện tại: {desc.length} ký tự</div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Thông tin bán hàng" id="sales">
                        {/* Giữ nguyên Logic SKU Matrix */}
                        <div className="mb-8">
                            <FormLabel>Phân loại hàng</FormLabel>
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                                {tiers.map((tier, tIdx) => (
                                    <div key={tIdx} className="bg-white p-4 rounded-lg border border-gray-200 relative shadow-sm">
                                        <button onClick={() => removeTier(tIdx)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500"><X size={18} /></button>
                                        <div className="mb-4">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Nhóm phân loại {tIdx + 1}</label>
                                            <input className="block w-full border-b border-gray-200 py-1.5 text-sm font-semibold outline-none focus:border-orange-500 bg-transparent" placeholder="VD: Màu sắc, Kích thước" value={tier.name} onChange={e => updateTierName(tIdx, e.target.value)} />
                                        </div>
                                        <div className="space-y-3">
                                            {tier.options.map((opt, oIdx) => (
                                                <div key={oIdx} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2">
                                                    <div className="flex-1 flex items-center border border-gray-300 rounded-lg bg-white px-3 h-10 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                                                        <input className="flex-1 outline-none text-sm" value={opt} onChange={(e) => { const n = [...tiers]; n[tIdx].options[oIdx] = e.target.value; setTiers(n); }} />
                                                        <button onClick={() => removeOptionFromTier(tIdx, oIdx)} className="text-gray-400 hover:text-red-500 ml-2"><X size={14} /></button>
                                                    </div>
                                                    {tIdx === 0 && (
                                                        <div className="shrink-0 w-10 h-10">
                                                            {tier.images[oIdx] ? (
                                                                <div className="w-full h-full rounded border border-gray-200 relative group overflow-hidden">
                                                                    <img src={tier.images[oIdx]} className="w-full h-full object-cover" />
                                                                    <button onClick={() => removeTierImage(tIdx, oIdx)} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"><X size={14} /></button>
                                                                </div>
                                                            ) : (
                                                                <label className="w-full h-full border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 cursor-pointer hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all" title="Tải ảnh phân loại">
                                                                    <ImagePlus size={16} />
                                                                    <input type="file" hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleTierImageUpload(tIdx, oIdx, e.target.files[0])} />
                                                                </label>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 max-w-[200px]">
                                                    <input className="w-full text-sm border border-dashed border-orange-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-100 placeholder:text-orange-400 text-orange-700 bg-orange-50/30" placeholder="+ Thêm phân loại (Enter)" onKeyDown={(e) => { if (e.key === 'Enter') { addOptionToTier(tIdx, e.currentTarget.value); e.currentTarget.value = ''; } }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {tiers.length < MAX_TIERS && (
                                    <button onClick={addTier} className="flex items-center gap-2 text-orange-600 border border-orange-200 bg-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-orange-50 transition-colors w-full justify-center border-dashed"><Plus size={16} /> Thêm nhóm phân loại {tiers.length + 1} <span className="text-xs text-orange-400">(tối đa {MAX_TIERS})</span></button>
                                )}
                            </div>
                        </div>

                        <div className="mb-8">
                            <FormLabel required>Giá bán & Kho hàng</FormLabel>
                            {tiers.length === 0 ? (
                                <div className="grid grid-cols-2 gap-6">
                                    <div><FormLabel>Giá bán (₫)</FormLabel><InputField type="number" value={singlePrice} onChange={(e: any) => setSinglePrice(e.target.value)} /></div>
                                    <div><FormLabel>Kho hàng</FormLabel><InputField type="number" value={singleStock} onChange={(e: any) => setSingleStock(e.target.value)} /></div>
                                </div>
                            ) : (
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    {/* ... Bulk Edit UI ... */}
                                    {skuRows.length > 0 && (
                                        <div className="bg-orange-50 p-3 flex flex-wrap gap-2 items-center text-xs border-b border-orange-100">
                                            <span className="font-bold text-orange-700 mr-2">Áp dụng nhanh:</span>
                                            <input id="bulk-price" type="number" placeholder="Giá bán" className="w-24 border border-orange-200 rounded px-2 py-1 focus:border-orange-500 outline-none" />
                                            <input id="bulk-stock" type="number" placeholder="Kho" className="w-20 border border-orange-200 rounded px-2 py-1 focus:border-orange-500 outline-none" />
                                            <input id="bulk-sku" placeholder="Mã SKU" className="w-24 border border-orange-200 rounded px-2 py-1 focus:border-orange-500 outline-none" />
                                            <button onClick={() => { const p = Number((document.getElementById('bulk-price') as HTMLInputElement).value); const s = Number((document.getElementById('bulk-stock') as HTMLInputElement).value); const k = (document.getElementById('bulk-sku') as HTMLInputElement).value; handleBulkApply(p, s, k); }} className="bg-orange-600 text-white px-3 py-1 rounded font-bold hover:bg-orange-700 transition-colors">Áp dụng</button>
                                        </div>
                                    )}
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                                            <tr><th className="px-4 py-3 font-medium">Phân loại</th><th className="px-4 py-3 font-medium">Giá bán (₫)</th><th className="px-4 py-3 font-medium">Kho hàng</th><th className="px-4 py-3 font-medium">SKU</th></tr>
                                        </thead>
                                        <tbody>
                                            {skuRows.length === 0 ? (<tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic bg-white">Vui lòng thiết lập phân loại hàng trước</td></tr>) : (
                                                skuRows.map((r, i) => (
                                                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                                                        <td className="px-4 py-2 font-medium text-gray-800">{r.key}</td>
                                                        <td className="px-4 py-2"><input type="number" className="border border-gray-300 rounded w-full px-2 py-1.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all" value={r.price} onChange={e => updateSkuRow(i, 'price', e.target.value)} /></td>
                                                        <td className="px-4 py-2"><input type="number" className="border border-gray-300 rounded w-full px-2 py-1.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all" value={r.stock} onChange={e => updateSkuRow(i, 'stock', e.target.value)} /></td>
                                                        <td className="px-4 py-2"><input className="border border-gray-300 rounded w-full px-2 py-1.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all" value={r.sku} onChange={e => updateSkuRow(i, 'sku', e.target.value)} /></td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3">
                                <FormLabel helpText="Giúp khách hàng chọn đúng size, giảm tỷ lệ trả hàng.">Bảng quy đổi kích cỡ</FormLabel>
                                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                                    <button onClick={() => setSizeChartMode('template')} className={classNames("text-xs font-semibold px-3 py-1.5 rounded-md transition-all", sizeChartMode === 'template' ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Chọn Template</button>
                                    <button onClick={() => setSizeChartMode('image')} className={classNames("text-xs font-semibold px-3 py-1.5 rounded-md transition-all", sizeChartMode === 'image' ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Tải ảnh lên</button>
                                </div>
                            </div>
                            {sizeChartMode === 'template' ? (
                                <div className="bg-gray-50/50 border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all">
                                    {/* ... Logic template giữ nguyên ... */}
                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-orange-100 border border-orange-50"><Ruler size={28} className="text-orange-500" /></div>
                                    {sizeChartImage ? (
                                        <div className="flex flex-col items-center">
                                            <p className="text-sm font-semibold text-green-600 mb-1 flex items-center gap-1"><CheckCircle2 size={16} /> Đã tạo bảng quy đổi</p>
                                            <div className="w-[120px] aspect-[3/4] rounded border border-gray-200 overflow-hidden mb-3 relative group cursor-pointer" onClick={() => setShowSizeChartGenerator(true)}>
                                                <img src={sizeChartImage} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white text-xs font-bold">Chỉnh sửa</span></div>
                                            </div>
                                            <button onClick={() => setShowSizeChartGenerator(true)} className="text-sm text-orange-600 font-medium hover:underline">Tạo lại bảng khác</button>
                                        </div>
                                    ) : (
                                        <>
                                            <h4 className="text-sm font-semibold text-gray-800 mb-1">Chưa có bảng quy đổi nào</h4>
                                            <p className="text-xs text-gray-500 mb-4 max-w-xs">Tạo bảng quy đổi chuẩn giúp khách hàng dễ dàng lựa chọn sản phẩm hơn.</p>
                                            <button onClick={() => setShowSizeChartGenerator(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-orange-200 text-orange-600 text-sm font-bold rounded-lg hover:bg-orange-50 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"><Plus size={16} strokeWidth={2.5} /> Thiết lập bảng quy đổi</button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3 transition-all">
                                    <div className="w-[140px]">
                                        {sizeChartImage ? (
                                            <MediaItem type="image" index={0} url={sizeChartImage} onRemove={() => setSizeChartImage(null)} ratio="3:4" />
                                        ) : (
                                            <label>
                                                <UploadBox label="Tải ảnh bảng size" ratio="3:4" icon={<TableProperties size={24} />} />
                                                <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'sizeChart')} />
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 italic">* Khuyến khích sử dụng ảnh tỉ lệ 3:4 để hiển thị tốt nhất trên điện thoại.</p>
                                </div>
                            )}
                        </div>
                    </SectionCard>

                    <SectionCard title="Vận chuyển" id="shipping">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div><FormLabel required subText="Trọng lượng sau đóng gói">Cân nặng (Gram)</FormLabel><InputField type="number" suffix="gr" value={weight} onChange={(e: any) => setWeight(Number(e.target.value))} /></div>
                            <div>
                                <FormLabel required subText="Kích thước sau đóng gói (D x R x C)">Kích thước (cm)</FormLabel>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="relative"><input className="w-full h-11 border border-gray-300 rounded-lg px-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 outline-none" placeholder="Dài" type="number" value={length} onChange={(e) => setLength(Number(e.target.value))} /><span className="absolute right-2 top-3.5 text-xs text-gray-400 pointer-events-none">cm</span></div>
                                    <div className="relative"><input className="w-full h-11 border border-gray-300 rounded-lg px-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 outline-none" placeholder="Rộng" type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} /><span className="absolute right-2 top-3.5 text-xs text-gray-400 pointer-events-none">cm</span></div>
                                    <div className="relative"><input className="w-full h-11 border border-gray-300 rounded-lg px-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 outline-none" placeholder="Cao" type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} /><span className="absolute right-2 top-3.5 text-xs text-gray-400 pointer-events-none">cm</span></div>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Cài đặt Mua kèm / Combo" id="cross-sell">
                        <div className="mb-4">
                            <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-start gap-2"><Info size={16} className="mt-0.5 shrink-0" /><div><strong>Mẹo tăng doanh số:</strong> Chọn các sản phẩm thường được mua cùng nhau (Ví dụ: Giày + Tất, Điện thoại + Ốp lưng) để hiển thị trong mục "Thường được mua cùng" trên trang chi tiết.</div></div>
                            <FormLabel>Chọn sản phẩm mua kèm</FormLabel>
                            <CrossSellSelector selectedIds={crossSellIds} onChange={setCrossSellIds} />
                        </div>
                    </SectionCard>

                    <SectionCard title="Thông tin khác" id="others">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <div>
                                {/* [UPGRADE] Logic Tình trạng Mới/Cũ */}
                                <FormLabel>Tình trạng</FormLabel>
                                <SelectField
                                    value={condition}
                                    onChange={setCondition}
                                    options={[
                                        { label: 'Mới', value: 'new' },
                                        { label: 'Đã qua sử dụng', value: 'used' }
                                    ]}
                                    placeholder="Chọn tình trạng"
                                />

                                {/* Dropdown % hiển thị khi chọn Đã qua sử dụng */}
                                {condition === 'used' && (
                                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                        <FormLabel subText="Đánh giá mức độ mới của sản phẩm">Độ mới (%)</FormLabel>
                                        <SelectField
                                            value={conditionPercent}
                                            onChange={setConditionPercent}
                                            options={CONDITION_PERCENTS}
                                            placeholder="Chọn độ mới"
                                        />
                                    </div>
                                )}
                            </div>
                            <div><FormLabel>SKU sản phẩm</FormLabel><InputField placeholder="Mã SKU (nếu có)" /></div>
                        </div>
                    </SectionCard>

                </div>

                {/* RIGHT: Preview (Giữ nguyên) */}
                <div className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-24">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <h3 className="font-bold text-gray-800 mb-4 text-center">Xem trước hiển thị</h3>
                        <div className="mx-auto w-[240px] border-4 border-gray-800 rounded-[2rem] overflow-hidden shadow-xl bg-white relative h-[480px]">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-5 bg-gray-800 rounded-b-xl z-20"></div>
                            <div className="h-full flex flex-col overflow-hidden bg-gray-50">
                                <div className="h-12 bg-white flex items-end pb-2 px-3 shadow-sm z-10"><div className="w-4 h-4 rounded-full bg-gray-200"></div></div>
                                <div className="aspect-square bg-gray-200 flex items-center justify-center text-gray-400">
                                    {images[0] ? <img src={images[0]} className="w-full h-full object-cover" /> : <ImageIcon size={32} />}
                                </div>
                                <div className="p-3 flex-1 bg-white">
                                    <div className="text-sm font-medium line-clamp-2">{name || 'Tên sản phẩm...'}</div>
                                    <div className="text-orange-500 font-bold mt-1">₫{Number(skuRows[0]?.price || singlePrice).toLocaleString()}</div>
                                    {condition === 'used' && <div className="mt-1 text-[10px] text-white bg-gray-500 px-1.5 py-0.5 rounded inline-block">Cũ - {conditionPercent}%</div>}
                                </div>
                                <div className="h-12 bg-white border-t border-gray-100 flex items-center px-2 gap-2 mt-auto">
                                    <div className="flex-1 h-8 bg-gray-800 rounded flex items-center justify-center text-[10px] text-white font-medium">Thêm vào giỏ</div>
                                    <div className="flex-1 h-8 bg-orange-500 rounded flex items-center justify-center text-[10px] text-white font-medium">Mua ngay</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FIXED BOTTOM BAR */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 py-4 px-6 md:px-10">
                <div className="max-w-[1440px] mx-auto flex items-center justify-between">
                    <div className="hidden md:flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 size={16} className="text-green-500" />Lưu nháp để tiếp tục sau</div>
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <button onClick={() => router.back()} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all">Hủy bỏ</button>
                        <button
                            onClick={() => handleSubmit(true)}
                            disabled={isLoading || isUploading}
                            className="px-6 py-2.5 rounded-lg border border-orange-500 text-orange-600 text-sm font-semibold hover:bg-orange-50 transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Đang lưu...' : 'Lưu nháp'}
                        </button>
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={isLoading || isUploading}
                            className="px-8 py-2.5 rounded-lg bg-orange-600 text-white text-sm font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-700 hover:shadow-orange-600/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                        >
                            {isLoading
                                ? 'Đang lưu...'
                                : (isUploading
                                    ? 'Đang tải ảnh...'
                                    : (isEditMode ? 'Cập nhật sản phẩm' : 'Lưu & Hiển thị'))}
                        </button>
                    </div>
                </div>
            </div>
            {showSizeChartGenerator && <SizeChartGenerator onSave={handleSizeChartCreated} onCancel={() => setShowSizeChartGenerator(false)} />}
        </div>
    );
};

export default AddProductPage;