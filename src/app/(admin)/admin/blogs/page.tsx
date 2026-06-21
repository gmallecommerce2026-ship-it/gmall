'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
    FiPlus, FiSearch, FiEdit2, FiTrash2, FiFileText,
    FiGlobe, FiX, FiImage, FiArrowLeft, FiEye, FiCheck,
    FiUploadCloud, FiLoader, FiSettings, FiSave, FiMove, FiChevronRight,
    FiLayers // [NEW] Import icon cho nút danh mục
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// --- IMPORTS ---
import { DescriptionEditor } from '@/modules/seller/products/components/DescriptionEditor';
import { blogService, BlogCategory } from '@/services/blog.service';
import { BlogPost, BlogStatus } from '@/types/blog';
import { uploadFileToR2 } from '@/services/uploadService';
import { buildCategoryTree } from '@/modules/blog/utils';

import {
    DndContext,
    closestCenter,
    pointerWithin,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- HELPER: Flatten Tree để hiển thị trong Select option và List ---
const flattenCategories = (categories: any[], level = 0, result: any[] = []) => {
    categories.forEach(cat => {
        result.push({ ...cat, level });
        if (cat.children && cat.children.length > 0) {
            flattenCategories(cat.children, level + 1, result);
        }
    });
    return result;
};

// --- SUB-COMPONENT: SORTABLE CATEGORY ROW (Wiki 0068 C10) ---
const SortableCatItem = ({ cat, editingId, onEdit, onDelete }: any) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginLeft: `${cat.level * 20}px`,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between p-2 rounded-lg border hover:border-blue-300 transition-colors
                ${editingId === cat.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}
        >
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 touch-none"
                    title="Kéo để sắp xếp"
                >
                    <FiMove size={14} />
                </button>
                {cat.level > 0 && <FiChevronRight size={14} className="text-gray-400" />}
                <span className={`text-sm ${cat.level === 0 ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>
                    {cat.name}
                </span>
            </div>
            <div className="flex gap-1">
                <button type="button" onClick={() => onEdit(cat)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"><FiEdit2 size={14} /></button>
                <button type="button" onClick={() => onDelete(cat.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded"><FiTrash2 size={14} /></button>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: CATEGORY MANAGER MODAL ---
interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: BlogCategory[];
    onRefresh: () => void;
}

const CategoryManagerModal = ({ isOpen, onClose, categories, onRefresh }: CategoryModalProps) => {
    const [name, setName] = useState('');
    const [parentId, setParentId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Xử lý Tree Data từ danh sách phẳng categories
    const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
    const flatCategories = useMemo(() => flattenCategories(categoryTree), [categoryTree]);

    // Reset form khi mở modal
    useEffect(() => {
        if (isOpen) {
            setName('');
            setParentId('');
            setEditingId(null);
        }
    }, [isOpen]);

    // Wiki 0068 C10: state + handlers cho kéo thả sắp xếp danh mục
    const [orderedCats, setOrderedCats] = useState<any[]>([]);
    const [orderedTree, setOrderedTree] = useState<any[]>([]);
    const [isOrderChanged, setIsOrderChanged] = useState(false);
    const [savingOrder, setSavingOrder] = useState(false);

    // Tự động tính toán lại danh sách hiển thị phẳng (flat list) từ Cây đã sắp xếp
    const orderedCats = useMemo(() => flattenCategories(orderedTree), [orderedTree]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    // Khi dữ liệu server về, set vào Tree
    useEffect(() => {
        setOrderedTree(categoryTree);
        setIsOrderChanged(false);
    }, [categoryTree]);

    // BỘ LỌC THÔNG MINH: Chỉ cho phép kéo thả/đổi vị trí giữa các item CÙNG CẤP (chung cha)
    const customCollisionDetection = useCallback((args: any) => {
        const pointerCollisions = pointerWithin(args);
        if (pointerCollisions.length === 0) return [];

        const activeId = args.active.id;
        const activeItem = orderedCats.find((c: any) => c.id === activeId);
        if (!activeItem) return [];

        return pointerCollisions.filter((collision) => {
            const collisionId = collision.id;
            if (collisionId === activeId) return true; // Cho phép va chạm với chính nó
            const collisionItem = orderedCats.find((c: any) => c.id === collisionId);
            // Chỉ bắt va chạm nếu target có CÙNG parentId
            return collisionItem && collisionItem.parentId === activeItem.parentId;
        });
    }, [orderedCats]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeItem = orderedCats.find((i: any) => i.id === active.id);
        const overItem = orderedCats.find((i: any) => i.id === over.id);

        if (!activeItem || !overItem || activeItem.parentId !== overItem.parentId) return;

        // Đệ quy để hoán đổi vị trí bên trong mảng Tree lồng nhau
        const reorderNodes = (nodes: any[]): any[] => {
            const activeIdx = nodes.findIndex((n) => n.id === active.id);
            const overIdx = nodes.findIndex((n) => n.id === over.id);

            // Nếu tìm thấy cả 2 anh em trong cùng cấp -> Hoán đổi
            if (activeIdx !== -1 && overIdx !== -1) {
                return arrayMove(nodes, activeIdx, overIdx);
            }

            // Nếu không, đi sâu vào đệ quy
            return nodes.map((node) => {
                if (node.children && node.children.length > 0) {
                    return { ...node, children: reorderNodes(node.children) };
                }
                return node;
            });
        };

        const newTree = reorderNodes(orderedTree);
        setOrderedTree(newTree); // Cập nhật Tree -> orderedCats sẽ tự render theo
        setIsOrderChanged(true);
    };

    const handleSaveOrder = async () => {
        setSavingOrder(true);
        try {
            await blogService.reorderCategories(orderedCats.map((c, i) => ({ id: c.id, sortOrder: i })));
            toast.success('Đã lưu thứ tự danh mục');
            setIsOrderChanged(false);
            onRefresh();
        } catch {
            toast.error('Lưu thứ tự thất bại');
        } finally {
            setSavingOrder(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return toast.error('Tên danh mục không được để trống');

        setLoading(true);
        try {
            const payload = {
                name,
                parentId: parentId || undefined
            };

            if (editingId) {
                if (editingId === parentId) {
                    toast.error("Không thể chọn chính mình làm danh mục cha");
                    setLoading(false);
                    return;
                }
                await blogService.updateCategory(editingId, payload);
                toast.success('Cập nhật danh mục thành công');
            } else {
                await blogService.createCategory(payload);
                toast.success('Tạo danh mục thành công');
            }
            setName('');
            setParentId('');
            setEditingId(null);
            onRefresh();
        } catch (error) {
            toast.error('Có lỗi xảy ra khi lưu danh mục');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (cat: any) => {
        setName(cat.name);
        setParentId(cat.parentId || '');
        setEditingId(cat.id);
    };

    const handleCancelEdit = () => {
        setName('');
        setParentId('');
        setEditingId(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn chắc chắn muốn xóa danh mục này? Nếu có danh mục con, chúng cũng có thể bị ảnh hưởng.')) return;
        try {
            await blogService.deleteCategory(id);
            toast.success('Đã xóa danh mục');
            onRefresh();
        } catch (error) {
            toast.error('Không thể xóa danh mục này (có thể đang được sử dụng)');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-gray-800">Quản lý Danh Mục Blog</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><FiX size={20} /></button>
                </div>

                {/* Form Area */}
                <div className="p-4 bg-gray-50 border-b space-y-3">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={editingId ? "Sửa tên danh mục..." : "Nhập tên danh mục mới..."}
                                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                            {/* Parent Selector */}
                            <select
                                value={parentId}
                                onChange={(e) => setParentId(e.target.value)}
                                className="w-1/3 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">-- Danh mục gốc --</option>
                                {flatCategories.map((cat: any) => (
                                    cat.id !== editingId && (
                                        <option key={cat.id} value={cat.id}>
                                            {Array(cat.level).fill('— ').join('') + cat.name}
                                        </option>
                                    )
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-2">
                            {editingId && (
                                <button type="button" onClick={handleCancelEdit} className="px-3 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-300">
                                    Hủy
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                            >
                                {loading ? <FiLoader className="animate-spin" /> : (editingId ? <FiSave /> : <FiPlus />)}
                                {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* List Area — Wiki 0068 C10: kéo thả sắp xếp danh mục */}
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {orderedCats.length === 0 ? (
                        <p className="text-center text-gray-500 py-4 text-sm">Chưa có danh mục nào</p>
                    ) : (
                        <>
                            <p className="text-[11px] text-gray-400 px-1 pb-1 flex items-center gap-1">
                                <FiMove size={11} /> Kéo biểu tượng để sắp xếp thứ tự hiển thị
                            </p>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={customCollisionDetection} // Thay closestCenter thành customCollisionDetection
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext items={orderedCats.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-1">
                                        {orderedCats.map((cat: any) => (
                                            <SortableCatItem
                                                key={cat.id}
                                                cat={cat}
                                                editingId={editingId}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </>
                    )}
                </div>

                {/* Thanh lưu thứ tự — chỉ hiện khi có thay đổi */}
                {isOrderChanged && (
                    <div className="p-3 border-t bg-amber-50 flex items-center justify-between">
                        <span className="text-xs text-amber-700">Thứ tự đã thay đổi — nhớ lưu lại</span>
                        <button
                            type="button"
                            onClick={handleSaveOrder}
                            disabled={savingOrder}
                            className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                        >
                            {savingOrder ? <FiLoader className="animate-spin" /> : <FiSave />} Lưu thứ tự
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const SortableRow = ({ post, handleEdit, handleDelete, children, index }: any) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: post.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 99 : 'auto',
        position: isDragging ? 'relative' as const : 'static' as const,
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={`hover:bg-gray-50 transition-colors group ${isDragging ? 'bg-blue-50 opacity-80 shadow-lg' : ''}`}
        >
            <td className="pl-4 py-4 w-20">
                <div className="flex items-center gap-3">
                    <button
                        {...attributes}
                        {...listeners}
                        className="p-2 cursor-grab text-gray-400 hover:text-blue-600 active:cursor-grabbing hover:bg-gray-100 rounded"
                        title="Kéo để sắp xếp"
                    >
                        <FiMove size={18} />
                    </button>
                    <span className="font-mono text-sm font-bold text-gray-500 select-none">
                        {typeof index === 'number' ? index + 1 : '#'}
                    </span>
                </div>
            </td>
            {children}
        </tr>
    );
};

// --- SEO PREVIEW COMPONENT ---
const GoogleSearchPreview = ({ title, desc, slug }: { title: string, desc: string, slug: string }) => {
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 w-full">
            <h3 className="text-gray-500 text-xs font-semibold uppercase mb-2">Xem trước kết quả tìm kiếm (Google)</h3>
            <div className="font-sans">
                <div className="flex items-center gap-2 mb-1">
                    <div className="bg-gray-200 rounded-full w-7 h-7 flex items-center justify-center text-xs">Logo</div>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-800">Tên Sàn Thương Mại</span>
                        <span className="text-xs text-gray-500">https://domain.com › blog › {slug || 'bai-viet-moi'}</span>
                    </div>
                </div>
                <h4 className="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate font-medium">
                    {title || 'Tiêu đề bài viết chưa nhập...'}
                </h4>
                <p className="text-sm text-[#4d5156] mt-1 line-clamp-2">
                    {desc || 'Vui lòng nhập thẻ mô tả (Meta Description) để tối ưu hiển thị trên Google. Đoạn này nên chứa từ khóa chính và kích thích người dùng click.'}
                </p>
            </div>
        </div>
    )
}

// --- MAIN PAGE ---
export default function BlogsPage() {
    const [view, setView] = useState<'LIST' | 'EDITOR'>('LIST');
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOrderChanged, setIsOrderChanged] = useState(false);
    // Data State
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [isCatModalOpen, setIsCatModalOpen] = useState(false); // State for Category Modal

    // Filter State
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterCategory, setFilterCategory] = useState<string>('');

    // Form State
    const [formData, setFormData] = useState({
        id: '', title: '', slug: '', content: '', thumbnail: '',
        categoryId: '',
        status: BlogStatus.DRAFT,
        metaTitle: '', metaDescription: '', keywords: [] as string[],
        relatedProducts: [] as any[]
    });

    // --- INIT DATA ---
    const fetchCats = async () => {
        try {
            const res = await blogService.getCategories();
            setCategories(res || []);
        } catch (error) {
            console.error("Lỗi tải danh mục:", error);
        }
    };

    useEffect(() => {
        fetchCats();
    }, []);

    const flatCategories = useMemo(() => {
        const tree = buildCategoryTree(categories);
        return flattenCategories(tree);
    }, [categories]);

    // --- API FETCH LIST ---
    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await blogService.getBlogs({
                search: search,
                status: filterStatus as BlogStatus || undefined,
                category: filterCategory || undefined,
                limit: 100,
            });
            const data = (res as any).items || (res as any).data || [];
            setPosts(data);
        } catch (error) {
            toast.error('Không thể tải danh sách bài viết');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [search, filterStatus, filterCategory]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBlogs();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchBlogs]);

    // --- HANDLERS ---
    const handleCreateNew = () => {
        setFormData({
            id: '', title: '', slug: '', content: '', thumbnail: '',
            categoryId: '',
            status: BlogStatus.DRAFT,
            metaTitle: '', metaDescription: '', keywords: [],
            relatedProducts: []
        });
        setView('EDITOR');
    }

    const handleEdit = async (post: BlogPost) => {
        try {
            toast.loading('Đang tải dữ liệu...', { id: 'load-detail' });
            const detail = await blogService.getBlogById(post.id);

            const catId = typeof detail.category === 'object' && detail.category !== null
                ? (detail.category as any).id
                : (detail.category as string || '');

            setFormData({
                ...detail,
                id: detail.id,
                title: detail.title,
                slug: detail.slug,
                content: detail.content || '',
                thumbnail: detail.thumbnail || '',
                categoryId: catId,
                status: detail.status,
                metaTitle: detail.metaTitle || '',
                metaDescription: detail.metaDescription || '',
                keywords: detail.keywords || [],
                relatedProducts: detail.relatedProducts || []
            });
            toast.success('Tải dữ liệu thành công', { id: 'load-detail' });
            setView('EDITOR');
        } catch (error) {
            toast.error('Lỗi khi tải chi tiết bài viết', { id: 'load-detail' });
            console.error(error);
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
        try {
            await blogService.deleteBlog(id);
            toast.success('Đã xóa bài viết');
            fetchBlogs();
        } catch (error) {
            toast.error('Xóa thất bại');
        }
    }

    const generateSlug = (text: string) => {
        return text.toString().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormData(prev => ({
            ...prev,
            title: val,
            slug: !prev.id ? generateSlug(val) : prev.slug
        }));
    }

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleUploadThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const toastId = toast.loading('Đang tải ảnh lên...');

        try {
            const url = await uploadFileToR2(file);
            if (url) {
                setFormData(prev => ({ ...prev, thumbnail: url }));
                toast.success('Tải ảnh thành công', { id: toastId });
            } else {
                throw new Error('Không nhận được URL ảnh');
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi tải ảnh', { id: toastId });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const [productSearch, setProductSearch] = useState('');
    const [searchedProducts, setSearchedProducts] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setPosts((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);
                return newItems;
            });
            setIsOrderChanged(true);
        }
    };

    const handleSaveOrder = async () => {
        const payload = posts.map((post, index) => ({
            id: post.id,
            sortOrder: index
        }));

        try {
            toast.loading('Đang cập nhật vị trí...', { id: 'order-save' });
            await blogService.updateBlogOrder(payload);
            toast.success('Đã cập nhật thứ tự hiển thị', { id: 'order-save' });
            setIsOrderChanged(false);
        } catch (error) {
            toast.error('Lỗi khi lưu thứ tự');
        }
    };

    useEffect(() => {
        if (!productSearch.trim() || view !== 'EDITOR') {
            setSearchedProducts([]);
            return;
        }

        const searchProd = async () => {
            setIsSearching(true);
            try {
                const items = await blogService.searchProducts(productSearch);
                setSearchedProducts(Array.isArray(items) ? items : []);
            } catch (e) {
                console.error("Search Error:", e);
                setSearchedProducts([]);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(searchProd, 500);
        return () => clearTimeout(timer);
    }, [productSearch, view]);

    const addProduct = (product: any) => {
        if (formData.relatedProducts.find(p => p.id === product.id)) {
            toast.error('Sản phẩm này đã được chọn');
            return;
        }
        setFormData(prev => ({
            ...prev,
            relatedProducts: [...prev.relatedProducts, product]
        }));
        setProductSearch('');
        setSearchedProducts([]);
    }

    const handleRemoveProduct = (id: string) => {
        setFormData(prev => ({
            ...prev,
            relatedProducts: prev.relatedProducts.filter(p => p.id !== id)
        }));
    }

    const handleSave = async (specificStatus?: BlogStatus) => {
        if (!formData.title) return toast.error('Vui lòng nhập tiêu đề');
        if (!formData.slug) return toast.error('Vui lòng nhập đường dẫn (slug)');
        if (!formData.categoryId) return toast.error('Vui lòng chọn danh mục');

        const finalStatus = specificStatus || formData.status;

        if (specificStatus) {
            setFormData(prev => ({ ...prev, status: specificStatus }));
        }

        const payload = {
            title: formData.title,
            slug: formData.slug,
            content: formData.content,
            thumbnail: formData.thumbnail,
            status: finalStatus,
            categoryId: formData.categoryId,
            relatedProductIds: formData.relatedProducts.map(p => p.id),

            metaTitle: formData.metaTitle,
            metaDescription: formData.metaDescription,
            keywords: formData.keywords,
        };

        toast.loading('Đang lưu bài viết...', { id: 'save-blog' });
        try {
            if (formData.id) {
                await blogService.updateBlog(formData.id, payload);
            } else {
                await blogService.createBlog(payload as any);
            }
            toast.success('Lưu bài viết thành công!', { id: 'save-blog' });
            setView('LIST');
            fetchBlogs();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Có lỗi xảy ra', { id: 'save-blog' });
        }
    }

    // --- RENDER MAIN LAYOUT ---
    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* [MOD] Modal luôn render ở đây, không phụ thuộc vào view */}
            <CategoryManagerModal
                isOpen={isCatModalOpen}
                onClose={() => setIsCatModalOpen(false)}
                categories={categories}
                onRefresh={fetchCats}
            />

            {view === 'EDITOR' ? (
                // ================= EDITOR VIEW =================
                <div className="space-y-6">
                    {/* Editor Header */}
                    <div className="flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur z-20 py-4 border-b border-gray-100 px-1 shadow-sm -mx-1">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setView('LIST')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <FiArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">{formData.id ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</h1>
                                <p className="text-xs text-gray-500">
                                    {formData.status === BlogStatus.PUBLISHED ?
                                        <span className="text-green-600 flex items-center gap-1"><FiCheck /> Đang công khai</span> :
                                        'Bản nháp'
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleSave(BlogStatus.DRAFT)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Lưu nháp
                            </button>
                            <button
                                onClick={() => handleSave(BlogStatus.PUBLISHED)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200"
                            >
                                {formData.status === BlogStatus.PUBLISHED ? 'Cập nhật' : 'Xuất bản ngay'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Title & Slug */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài viết (H1) <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={handleTitleChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-lg placeholder-gray-300"
                                            placeholder="Nhập tiêu đề hấp dẫn..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Đường dẫn (Slug)</label>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                                            <span className="text-gray-400 select-none">domain.com/blog/</span>
                                            <input
                                                type="text"
                                                value={formData.slug}
                                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                                className="bg-transparent flex-1 focus:outline-none text-gray-800 font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Editor */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung chi tiết</label>
                                <div className="prose-editor">
                                    <DescriptionEditor
                                        value={formData.content}
                                        onChange={(val) => setFormData({ ...formData, content: val })}
                                    />
                                </div>
                            </div>

                            {/* SEO Settings */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                                <div className="flex items-center gap-2 mb-4">
                                    <FiGlobe className="text-blue-500" size={20} />
                                    <h2 className="text-lg font-bold text-gray-800">Cấu hình SEO</h2>
                                </div>

                                <div className="mb-6">
                                    <GoogleSearchPreview
                                        title={formData.metaTitle || formData.title}
                                        desc={formData.metaDescription}
                                        slug={formData.slug}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                                            <span className={`text-xs ${(formData.metaTitle?.length || 0) > 60 ? 'text-red-500' : 'text-green-600'}`}>
                                                {formData.metaTitle?.length || 0}/60
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.metaTitle}
                                            onChange={e => setFormData({ ...formData, metaTitle: e.target.value })}
                                            placeholder="Tiêu đề hiển thị trên Google"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                                            <span className={`text-xs ${(formData.metaDescription?.length || 0) > 160 ? 'text-red-500' : 'text-green-600'}`}>
                                                {formData.metaDescription?.length || 0}/160
                                            </span>
                                        </div>
                                        <textarea
                                            rows={3}
                                            value={formData.metaDescription}
                                            onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
                                            placeholder="Mô tả ngắn gọn, chứa từ khóa chính..."
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (cách nhau dấu phẩy)</label>
                                        <input
                                            type="text"
                                            value={formData.keywords.join(', ')}
                                            onChange={e => setFormData({ ...formData, keywords: e.target.value.split(',').map(s => s.trim()) })}
                                            placeholder="quà tặng, sinh nhật, handmade..."
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Settings */}
                        <div className="space-y-6">
                            {/* Organization */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Thông tin chung</h3>
                                <div className="space-y-4">
                                    {/* Category Select with Modal Trigger */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-xs font-medium text-gray-500">Danh mục</label>
                                            <button
                                                onClick={() => setIsCatModalOpen(true)}
                                                className="text-[10px] text-blue-600 flex items-center gap-1 hover:underline cursor-pointer bg-blue-50 px-2 py-0.5 rounded"
                                            >
                                                <FiSettings size={10} /> Quản lý
                                            </button>
                                        </div>
                                        <select
                                            value={formData.categoryId}
                                            onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">-- Chọn danh mục --</option>
                                            {flatCategories.map((cat: any) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {Array(cat.level).fill('— ').join('') + cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Trạng thái</label>
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as BlogStatus })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value={BlogStatus.DRAFT}>Bản nháp</option>
                                            <option value={BlogStatus.PUBLISHED}>Công khai</option>
                                            <option value={BlogStatus.HIDDEN}>Ẩn</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Featured Image */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Ảnh đại diện</h3>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleUploadThumbnail}
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group bg-gray-50/50 min-h-[150px] flex flex-col items-center justify-center"
                                >
                                    {formData.thumbnail ? (
                                        <div className="relative w-full h-full rounded overflow-hidden shadow-sm">
                                            <img src={formData.thumbnail} alt="Thumbnail" className="object-cover w-full h-auto max-h-[200px]" />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFormData({ ...formData, thumbnail: '' });
                                                }}
                                                className="absolute top-2 right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    ) : isUploading ? (
                                        <div className="flex flex-col items-center text-blue-500">
                                            <FiLoader className="animate-spin mb-2" size={24} />
                                            <span className="text-xs">Đang tải lên...</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-400">
                                            <FiUploadCloud size={32} className="mb-2 text-gray-300" />
                                            <span className="text-xs font-medium">Nhấn để tải ảnh lên</span>
                                        </div>
                                    )}
                                </div>
                                {!formData.thumbnail && (
                                    <div className="mt-3">
                                        <span className="text-[10px] text-gray-400 mb-1 block">Hoặc nhập URL:</span>
                                        <input
                                            type="text"
                                            className="w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
                                            placeholder="https://..."
                                            onBlur={(e) => e.target.value && setFormData({ ...formData, thumbnail: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Related Products */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Sản phẩm gắn thẻ</h3>
                                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                        {formData.relatedProducts.length}
                                    </span>
                                </div>

                                {/* Search Input */}
                                <div className="relative mb-3 z-10">
                                    <input
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        placeholder="Tìm thêm sản phẩm..."
                                        className="w-full pl-8 pr-8 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <FiSearch className="absolute left-2.5 top-2.5 text-gray-400 w-3 h-3" />
                                    {isSearching && <FiLoader className="absolute right-2.5 top-2.5 text-blue-500 w-3 h-3 animate-spin" />}

                                    {/* Search Dropdown */}
                                    {searchedProducts.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-100 rounded-lg mt-1 max-h-60 overflow-y-auto">
                                            {searchedProducts.map(p => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => addProduct(p)}
                                                    className="p-2 hover:bg-blue-50 cursor-pointer flex gap-3 items-center border-b border-gray-50 last:border-0"
                                                >
                                                    <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 overflow-hidden border">
                                                        {p.images[0].url || (p.images && p.images[0].url) ? (
                                                            <img src={p.images[0].url} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">IMG</div>
                                                        )}
                                                    </div>
                                                    <div className="truncate flex-1">
                                                        <div className="text-xs font-medium text-gray-800 truncate">{p.name || p.title}</div>
                                                        <div className="text-[10px] text-gray-500">{Number(p.price || 0).toLocaleString()}đ</div>
                                                    </div>
                                                    <FiPlus className="text-blue-500" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* List Selected Products */}
                                <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                                    {formData.relatedProducts.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 px-4">
                                            <FiSearch size={24} className="mb-2 opacity-20" />
                                            <p className="text-xs">Chưa có sản phẩm nào.</p>
                                        </div>
                                    ) : (
                                        formData.relatedProducts.map((prod, idx) => (
                                            <div key={`${prod.id}-${idx}`} className="flex items-center gap-2 p-2 border border-gray-100 rounded-lg hover:bg-blue-50 transition-colors group bg-white shadow-sm">
                                                <div className="w-10 h-10 bg-gray-200 rounded flex-shrink-0 relative overflow-hidden">
                                                    {prod.images[0].url || (prod.images && prod.images[0]) ? (
                                                        <img src={prod.images[0].url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center text-[8px] text-gray-400">IMG</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-gray-700 truncate">{prod.name || prod.title}</p>
                                                    <p className="text-[10px] text-gray-500">{Number(prod.price || 0).toLocaleString()}đ</p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveProduct(prod.id)}
                                                    className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <FiX size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // ================= LIST VIEW =================
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Quản Lý Bài Viết</h1>
                            <p className="text-sm text-gray-500">Tin tức & Blog chuẩn SEO</p>
                        </div>

                        {/* [NEW] Buttons Toolbar */}
                        <div className="flex gap-2">
                            {/* Nút mở Modal quản lý danh mục ngay tại trang List */}
                            <button
                                onClick={() => setIsCatModalOpen(true)}
                                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
                            >
                                <FiLayers size={18} /> Quản lý danh mục
                            </button>

                            <button onClick={handleCreateNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium">
                                <FiPlus size={18} /> Viết bài mới
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm tiêu đề..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">Tất cả danh mục</option>
                                {flatCategories.map((cat: any) => (
                                    <option key={cat.id} value={cat.id}>
                                        {Array(cat.level).fill('— ').join('') + cat.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">Trạng thái</option>
                                <option value="PUBLISHED">Công khai</option>
                                <option value="DRAFT">Nháp</option>
                                <option value="HIDDEN">Ẩn</option>
                            </select>
                        </div>
                    </div>

                    {isOrderChanged && (
                        <div className="fixed bottom-5 right-5 z-50 animate-bounce-in">
                            <button
                                onClick={handleSaveOrder}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold"
                            >
                                <FiSave /> Lưu thứ tự mới
                            </button>
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
                                    <tr>
                                        <th className="pl-4 py-4 w-20">#</th>
                                        <th className="p-4 w-1/3">Bài viết</th>
                                        <th className="p-4">Tác giả</th>
                                        <th className="p-4 text-center">Trạng thái</th>
                                        <th className="p-4 text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <SortableContext
                                    items={posts.map(p => p.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-gray-500">Đang tải danh sách...</td>
                                            </tr>
                                        ) : posts.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-gray-500">Chưa có bài viết nào</td>
                                            </tr>
                                        ) : (
                                            <SortableContext
                                                items={posts.map(p => p.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {posts.map((post, index) => (
                                                    <SortableRow
                                                        key={post.id}
                                                        post={post}
                                                        index={index}
                                                        handleEdit={handleEdit}
                                                        handleDelete={handleDelete}
                                                    >

                                                        <td className="p-4">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                                                                    {post.thumbnail ? (
                                                                        <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><FiFileText /></div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p onClick={() => handleEdit(post)} className="font-medium text-gray-800 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors">
                                                                        {post.title}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                                                            {typeof post.category === 'object' && post.category !== null
                                                                                ? (post.category as any).name
                                                                                : (post.category || 'Chưa phân loại')}
                                                                        </span>
                                                                        <span className="text-xs text-gray-400">• {new Date(post.createdAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="p-4">
                                                            <p className="text-gray-800">{post.author?.name || 'Admin'}</p>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${post.status === BlogStatus.PUBLISHED ? 'bg-green-100 text-green-700' :
                                                                post.status === BlogStatus.HIDDEN ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                {post.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <a
                                                                    href={`/blog/${post.slug || post.id}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    title="Xem thử (mở tab mới)"
                                                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded inline-flex items-center"
                                                                >
                                                                    <FiEye />
                                                                </a>
                                                                <button onClick={() => handleEdit(post)} title="Chỉnh sửa" className="p-2 text-blue-600 hover:bg-blue-50 rounded"><FiEdit2 /></button>
                                                                <button onClick={() => handleDelete(post.id)} title="Xóa" className="p-2 text-red-600 hover:bg-red-50 rounded"><FiTrash2 /></button>
                                                            </div>
                                                        </td>
                                                    </SortableRow>
                                                ))}
                                            </SortableContext>
                                        )}
                                    </tbody>
                                </SortableContext>
                            </table>
                        </DndContext>
                    </div>
                </div>
            )}
        </div>
    );
}