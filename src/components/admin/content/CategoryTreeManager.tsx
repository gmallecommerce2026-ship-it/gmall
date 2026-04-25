// src/components/admin/content/CategoryTreeManager.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
    ChevronRight, ChevronDown, Plus, Edit2, Trash2, 
    Folder, FileText, Layout, RefreshCw, GripVertical, 
    Search, FolderOpen, CornerDownRight, XCircle, Save
} from 'lucide-react';
import { apiClient } from '@/lib/api/ApiClient';
import { toast } from 'react-hot-toast';

// --- DND KIT ---
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
  DragStartEvent,
  pointerWithin // Dùng cái này nhạy hơn closestCenter cho cây thư mục
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- TYPES ---
// Spec [0018]: filterKeys per category — admin định nghĩa filter nào hiện trên
// trang category/search. Shape: array of {key, label, type, options/min/max}.
export interface CategoryFilterKey {
  key: string;
  label: string;
  type: 'select' | 'multi' | 'range';
  options?: string[];
  min?: number;
  max?: number;
}

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  children?: CategoryNode[];
  parentId?: string | null;
  filterKeys?: CategoryFilterKey[];
}

// --- HOOK: PERSIST EXPANDED STATE ---
// Giúp lưu lại trạng thái đóng/mở vào LocalStorage
const usePersistedExpandedState = (key: string) => {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [isInitialized, setIsInitialized] = useState(false);

    // Load khi mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                setExpandedIds(new Set(JSON.parse(stored)));
            }
        } catch (e) {
            console.error("Failed to load expanded state", e);
        } finally {
            setIsInitialized(true);
        }
    }, [key]);

    // Hàm toggle
    const toggle = useCallback((id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            // Save ngay lập tức
            localStorage.setItem(key, JSON.stringify(Array.from(next)));
            return next;
        });
    }, [key]);

    // Hàm set cụ thể (dùng khi search)
    const setAll = useCallback((ids: string[]) => {
        const next = new Set(ids);
        setExpandedIds(next);
        localStorage.setItem(key, JSON.stringify(Array.from(next)));
    }, [key]);

    return { expandedIds, toggle, setAll, isInitialized };
};

// --- HELPER: RENDER OPTIONS FOR SELECT ---
const renderOptions = (nodes: CategoryNode[], level = 0, currentId: string | undefined): React.ReactNode[] => {
    let options: React.ReactNode[] = [];
    nodes.forEach(node => {
        if (node.id === currentId) return; 
        options.push(
            <option key={node.id} value={node.id} className="text-gray-900">
                {'\u00A0'.repeat(level * 4)} {level > 0 ? '└─ ' : ''} {node.name}
            </option>
        );
        if (node.children) {
            options = [...options, ...renderOptions(node.children, level + 1, currentId)];
        }
    });
    return options;
};

// --- COMPONENT: SORTABLE TREE NODE ---
interface SortableNodeProps {
    node: CategoryNode;
    level: number;
    searchQuery: string;
    expandedIds: Set<string>;
    onToggleExpand: (id: string) => void;
    onEdit: (node: CategoryNode) => void;
    onAdd: (parentId: string) => void;
    onDelete: (id: string, name: string) => void;
    renderChildren: (nodes: CategoryNode[], level: number, parentId: string) => React.ReactNode;
}

const SortableTreeNode = ({ 
    node, level, searchQuery, expandedIds, onToggleExpand, 
    onEdit, onAdd, onDelete, renderChildren 
}: SortableNodeProps) => {
    
    const hasChildren = node.children && node.children.length > 0;
    
    // Logic hiển thị: Nếu đang search thì luôn mở, nếu không thì theo state đã lưu
    const isExpanded = searchQuery ? true : expandedIds.has(node.id);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: node.id, data: { type: 'Category', node } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const isActiveMatch = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isRoot = level === 0;

    return (
        <div ref={setNodeRef} style={style} className="relative touch-none">
            {/* Tree Guide Lines */}
            {level > 0 && (
                <div 
                    className="absolute left-[-18px] top-0 bottom-0 w-px bg-gray-200"
                    style={{ height: hasChildren && isExpanded ? '100%' : '24px' }} 
                />
            )}
            {level > 0 && (
                <div className="absolute left-[-18px] top-[24px] w-[18px] h-px bg-gray-200" />
            )}

            <div 
                className={`
                    group flex items-center gap-3 p-3 mb-2 rounded-lg border transition-all relative
                    ${isRoot 
                        ? 'bg-white border-gray-200 shadow-sm hover:border-orange-300' 
                        : 'bg-white border-transparent hover:bg-gray-50 border-gray-100 hover:border-gray-200'
                    }
                    ${isActiveMatch ? 'ring-2 ring-orange-400 bg-orange-50' : ''}
                    ${isDragging ? 'z-50 ring-2 ring-orange-400 bg-orange-50 shadow-xl' : ''}
                `}
            >
                {/* Drag Handle - Tăng vùng bấm */}
                <div 
                    {...attributes} 
                    {...listeners} 
                    className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-orange-500 p-2 -ml-2 rounded transition-colors"
                >
                    <GripVertical size={18} />
                </div>

                {/* Expand Toggle */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleExpand(node.id); }}
                    className={`
                        p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all
                        ${!hasChildren ? 'invisible' : ''}
                    `}
                >
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>

                {/* Icon */}
                <div className={`
                    w-8 h-8 flex items-center justify-center rounded-lg shrink-0
                    ${isRoot ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-500'}
                `}>
                    {isRoot ? <Layout size={18} /> : (hasChildren ? <Folder size={16} /> : <FileText size={16} />)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 cursor-pointer py-1" onClick={() => onEdit(node)}>
                    <div className="flex items-center gap-2">
                        <span className={`font-medium truncate ${isActiveMatch ? 'text-orange-700' : 'text-gray-700'}`}>
                            {node.name}
                        </span>
                        {isRoot && <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Menu</span>}
                    </div>
                    {/* Slug ẩn trên mobile */}
                    <div className="text-xs text-gray-400 font-mono truncate hidden sm:block">/{node.slug}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAdd(node.id); }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Thêm con"
                    >
                        <Plus size={16} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(node); }}
                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Sửa"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(node.id, node.name); }}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Recursive Children */}
            {hasChildren && isExpanded && (
                <div className="pl-8 relative"> 
                     <div className="absolute left-[13px] top-0 bottom-2 w-px bg-gray-200 opacity-50"></div>
                     {renderChildren(node.children!, level + 1, node.id)}
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---
const CategoryTreeManager = () => {
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sử dụng Hook custom để quản lý trạng thái mở/đóng
  const { expandedIds, toggle, setAll, isInitialized } = usePersistedExpandedState('admin-mega-menu-state');

  // --- HELPER FUNCTIONS ---
  const findNode = (nodes: CategoryNode[], id: string): CategoryNode | undefined => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
          const found = findNode(node.children, id);
          if (found) return found;
      }
    }
  };

  const findParent = (nodes: CategoryNode[], id: string, parent: CategoryNode | null = null): CategoryNode | null => {
      for (const node of nodes) {
          if (node.id === id) return parent;
          if (node.children) {
              const found = findParent(node.children, id, node);
              if (found) return found;
          }
      }
      return null;
  };

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<CategoryNode | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', parentId: '' });
  // Spec [0018]: filterKeys per category — array CategoryFilterKey, BE lưu Json.
  const [filterKeys, setFilterKeys] = useState<CategoryFilterKey[]>([]);

  // --- SENSORS (TINH CHỈNH ĐỂ DRAG NHẠY HƠN) ---
  const sensors = useSensors(
    useSensor(PointerSensor, { 
        activationConstraint: { 
            distance: 4 // Di chuyển 4px mới bắt đầu drag (tránh click nhầm nhưng vẫn nhạy)
        } 
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchTree = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/categories/tree');
      setTree(Array.isArray(res) ? res : (res?.data || []));
    } catch (error) {
      toast.error("Lỗi tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  // Chỉ fetch khi state expand đã sẵn sàng để tránh giật UI
  useEffect(() => { 
      if(isInitialized) fetchTree(); 
  }, [isInitialized]);

  // --- DND HANDLERS ---
  const handleDragStart = (event: DragStartEvent) => setActiveDragId(event.active.id as string);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    // Kiểm tra cơ bản
    if (!over || active.id === over.id) return;

    // 1. Tìm thông tin cha của node nguồn và đích
    const activeParent = findParent(tree, active.id as string);
    const overParent = findParent(tree, over.id as string);
    const activeParentId = activeParent ? activeParent.id : 'root';
    const overParentId = overParent ? overParent.id : 'root';

    // 2. Ràng buộc: Chỉ cho phép sắp xếp cùng cấp (Sibling Sort)
    // Nếu khác cha -> Tức là người dùng đang cố kéo vào thư mục khác -> Không cho phép ở chế độ Sort này
    if (activeParentId !== overParentId) {
        // Không hiện Toast lỗi nữa để đỡ khó chịu, chỉ đơn giản là snap về chỗ cũ
        return; 
    }

    // 3. Cập nhật State (Optimistic UI)
    const reorderNodes = (nodes: CategoryNode[]): CategoryNode[] => {
        return nodes.map(node => {
             // Tìm thấy cha chứa cả 2 thằng con
             if (node.children && node.children.some(c => c.id === active.id) && node.children.some(c => c.id === over.id)) {
                 const oldIndex = node.children.findIndex(c => c.id === active.id);
                 const newIndex = node.children.findIndex(c => c.id === over.id);
                 return { ...node, children: arrayMove(node.children, oldIndex, newIndex) };
             }
             if (node.children) return { ...node, children: reorderNodes(node.children) };
             return node;
        });
    };

    let newTree;
    if (activeParentId === 'root') {
        // Root Level
        const oldIdx = tree.findIndex(n => n.id === active.id);
        const newIdx = tree.findIndex(n => n.id === over.id);
        if (oldIdx !== -1 && newIdx !== -1) {
             newTree = arrayMove(tree, oldIdx, newIdx);
        } else {
             newTree = tree;
        }
    } else {
        // Nested Level
        newTree = reorderNodes(tree);
    }
    
    setTree(newTree);

    // 4. Gọi API lưu
    try {
        const payloadParentId = activeParentId === 'root' ? null : activeParentId;
        const targetList = payloadParentId 
            ? findNode(newTree, payloadParentId)?.children || [] 
            : newTree;
        
        await apiClient.post('/categories/update-order', {
             parentId: payloadParentId,
             orderedIds: targetList.map(item => item.id)
        });
        toast.success("Đã cập nhật vị trí", { id: 'order-success' });
    } catch (e) {
        toast.error("Lỗi lưu vị trí");
        fetchTree(); // Revert nếu lỗi
    }
  };

  // --- CRUD ACTIONS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
          name: formData.name,
          slug: formData.slug,
          parentId: formData.parentId || null,
          // Spec [0018]: filterKeys gửi lên Json — clean rỗng thành []
          filterKeys: filterKeys.filter(f => f.key && f.label),
      };

      if (editingNode) {
        await apiClient.patch(`/categories/${editingNode.id}`, payload);
        toast.success("Cập nhật thành công");
      } else {
        await apiClient.post('/categories', payload);
        toast.success("Tạo mới thành công");
      }
      closeModal();
      fetchTree();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa danh mục "${name}"?\nTất cả danh mục con cũng sẽ bị ảnh hưởng.`)) return;
    
    try {
      await apiClient.delete(`/categories/${id}`);
      toast.success("Đã xóa danh mục");
      fetchTree();
    } catch (error: any) {
      // --- BẮT ĐẦU SỬA ---
      // Kiểm tra xem server có trả về message lỗi cụ thể không
      const serverMessage = error.response?.data?.message || error.message;

      // Nếu lỗi là 400 (Bad Request) - Thường là lỗi logic nghiệp vụ từ BE
      if (error.response?.status === 400) {
          // Hiển thị toast lỗi với thời gian dài hơn (duration: 5000ms) để người dùng kịp đọc
          toast.error(serverMessage, {
             duration: 5000,
             style: {
               maxWidth: '500px', // Mở rộng chiều ngang nếu thông báo dài
               border: '1px solid #EF4444', // Viền đỏ cho nổi bật
               padding: '16px',
               color: '#713200',
             },
             // Có thể thêm icon tùy chỉnh nếu muốn
             icon: '⚠️',
          });
      } else {
          // Lỗi chung chung (500, mạng, ...)
          toast.error("Không thể xóa danh mục này do có các sản phẩm hiện đang thuộc danh mục này.");
      }
      // --- KẾT THÚC SỬA ---
    }
  };

  // --- RENDER RECURSIVE ---
  const RenderList = ({ items, level, parentId }: { items: CategoryNode[], level: number, parentId: string }) => (
    <SortableContext 
        id={parentId} 
        items={items.map(i => i.id)} 
        strategy={verticalListSortingStrategy}
    >
        <div className="flex flex-col">
            {items.map(node => (
                <SortableTreeNode 
                    key={node.id} 
                    node={node} 
                    level={level}
                    searchQuery={searchQuery}
                    expandedIds={expandedIds}
                    onToggleExpand={toggle}
                    onEdit={(n) => {
                        setEditingNode(n);
                        setFormData({ name: n.name, slug: n.slug, parentId: n.parentId || '' });
                        // Spec [0018]: prefill filterKeys; BE trả Json hoặc string tuỳ Prisma version
                        const fk = (n as any).filterKeys;
                        let parsed: CategoryFilterKey[] = [];
                        try {
                            parsed = typeof fk === 'string' ? JSON.parse(fk) : (Array.isArray(fk) ? fk : []);
                        } catch { parsed = []; }
                        setFilterKeys(parsed);
                        setIsModalOpen(true);
                    }}
                    onAdd={(pid) => { setEditingNode(null); setFormData({ name: '', slug: '', parentId: pid }); setFilterKeys([]); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                    renderChildren={(nodes, lvl, pid) => <RenderList items={nodes} level={lvl} parentId={pid} />}
                />
            ))}
        </div>
    </SortableContext>
  );

  const closeModal = () => { setIsModalOpen(false); setEditingNode(null); };

  return (
    <DndContext 
        sensors={sensors} 
        // QUAN TRỌNG: pointerWithin giúp phát hiện va chạm tốt hơn cho nested items so với closestCenter
        collisionDetection={pointerWithin} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
    >
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[750px]">
            {/* TOOLBAR */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-4 border-b border-gray-100 gap-4">
                <div className="relative w-full md:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18}/>
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm danh mục..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={fetchTree} className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-gray-200 hover:border-orange-200 transition-all" title="Làm mới">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => { setEditingNode(null); setFormData({ name: '', slug: '', parentId: '' }); setFilterKeys([]); setIsModalOpen(true); }}
                        className="flex-1 md:flex-none bg-gray-900 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-gray-200 hover:shadow-orange-200 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18} /> Thêm Mới
                    </button>
                </div>
            </div>

            {/* TREE CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/30">
                {loading || !isInitialized ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3">
                        <RefreshCw className="animate-spin text-orange-500" size={24}/>
                        <span className="text-gray-400 text-sm">Đang tải cấu trúc...</span>
                    </div>
                ) : tree.length > 0 ? (
                    <RenderList items={tree} level={0} parentId="root" />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FolderOpen size={32} className="text-gray-300"/>
                        </div>
                        <p className="font-medium text-gray-500">Chưa có danh mục nào</p>
                    </div>
                )}
            </div>
            
            {/* DRAG OVERLAY */}
            <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
                {activeDragId ? (
                   <div className="bg-white p-3 rounded-lg shadow-2xl border border-orange-200 w-[280px] flex items-center gap-3">
                       <GripVertical size={20} className="text-orange-500"/>
                       <span className="font-bold text-gray-800">Đang di chuyển...</span>
                   </div>
                ) : null}
            </DragOverlay>

            {/* MODAL (GIỮ NGUYÊN FORM LOGIC) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={closeModal} />
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{editingNode ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Quản lý thông tin hiển thị trên menu</p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors"><XCircle size={24}/></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                            <div className="grid gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Tên danh mục <span className="text-red-500">*</span></label>
                                    <input 
                                        required 
                                        autoFocus
                                        type="text" 
                                        value={formData.name} 
                                        onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-gray-800 placeholder:text-gray-400" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 flex justify-between">
                                        Đường dẫn (Slug)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">/</span>
                                        <input 
                                            type="text" 
                                            value={formData.slug} 
                                            onChange={e => setFormData({ ...formData, slug: e.target.value })} 
                                            className="w-full border border-gray-300 rounded-lg pl-6 pr-4 py-2.5 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-mono text-sm text-gray-700" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Danh mục cha</label>
                                    <div className="relative">
                                        <CornerDownRight className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                                        <select
                                            value={formData.parentId || ''}
                                            onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all appearance-none bg-white text-gray-700"
                                        >
                                            <option value="">-- Là danh mục gốc (Root) --</option>
                                            {renderOptions(tree, 0, editingNode?.id)}
                                        </select>
                                    </div>
                                </div>

                                {/* Spec [0018]: filterKeys editor — bộ lọc hiển thị trên trang category này */}
                                <div className="space-y-2 border-t border-gray-100 pt-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-gray-700">Bộ lọc (Filters)</label>
                                        <button
                                            type="button"
                                            onClick={() => setFilterKeys(prev => [...prev, { key: '', label: '', type: 'select', options: [] }])}
                                            className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                                        >
                                            <Plus size={14} /> Thêm filter
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-gray-400 leading-snug">
                                        Định nghĩa các bộ lọc hiển thị trên trang danh mục (sidebar trái). Để trống nếu không cần.
                                    </p>

                                    {filterKeys.length === 0 && (
                                        <div className="text-center py-4 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400">
                                            Chưa có filter nào. Bấm "Thêm filter" để tạo.
                                        </div>
                                    )}

                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                        {filterKeys.map((fk, idx) => (
                                            <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
                                                <div className="grid grid-cols-12 gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Key (VD: size)"
                                                        value={fk.key}
                                                        onChange={e => setFilterKeys(prev => prev.map((f, i) => i === idx ? { ...f, key: e.target.value } : f))}
                                                        className="col-span-3 px-2 py-1.5 border border-gray-300 rounded text-xs font-mono outline-none focus:border-orange-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Nhãn (VD: Kích cỡ)"
                                                        value={fk.label}
                                                        onChange={e => setFilterKeys(prev => prev.map((f, i) => i === idx ? { ...f, label: e.target.value } : f))}
                                                        className="col-span-5 px-2 py-1.5 border border-gray-300 rounded text-xs outline-none focus:border-orange-500"
                                                    />
                                                    <select
                                                        value={fk.type}
                                                        onChange={e => setFilterKeys(prev => prev.map((f, i) => i === idx ? { ...f, type: e.target.value as any } : f))}
                                                        className="col-span-3 px-2 py-1.5 border border-gray-300 rounded text-xs outline-none focus:border-orange-500 bg-white"
                                                    >
                                                        <option value="select">1 chọn</option>
                                                        <option value="multi">Nhiều chọn</option>
                                                        <option value="range">Khoảng số</option>
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFilterKeys(prev => prev.filter((_, i) => i !== idx))}
                                                        className="col-span-1 text-red-500 hover:bg-red-50 rounded flex items-center justify-center"
                                                        title="Xoá filter"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>

                                                {(fk.type === 'select' || fk.type === 'multi') && (
                                                    <input
                                                        type="text"
                                                        placeholder="Các lựa chọn, cách nhau bằng dấu phẩy. VD: S, M, L, XL"
                                                        value={(fk.options || []).join(', ')}
                                                        onChange={e => setFilterKeys(prev => prev.map((f, i) => i === idx ? { ...f, options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } : f))}
                                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs outline-none focus:border-orange-500"
                                                    />
                                                )}

                                                {fk.type === 'range' && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            type="number"
                                                            placeholder="Min (VD: 0)"
                                                            value={fk.min ?? ''}
                                                            onChange={e => setFilterKeys(prev => prev.map((f, i) => i === idx ? { ...f, min: e.target.value === '' ? undefined : Number(e.target.value) } : f))}
                                                            className="px-2 py-1.5 border border-gray-300 rounded text-xs outline-none focus:border-orange-500"
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="Max (VD: 5000000)"
                                                            value={fk.max ?? ''}
                                                            onChange={e => setFilterKeys(prev => prev.map((f, i) => i === idx ? { ...f, max: e.target.value === '' ? undefined : Number(e.target.value) } : f))}
                                                            className="px-2 py-1.5 border border-gray-300 rounded text-xs outline-none focus:border-orange-500"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button type="button" onClick={closeModal} className="px-5 py-2.5 text-gray-600 hover:bg-white hover:shadow-sm rounded-lg text-sm font-medium border border-transparent hover:border-gray-200 transition-all">Hủy bỏ</button>
                            <button onClick={handleSubmit} className="px-5 py-2.5 bg-gray-900 hover:bg-orange-600 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-orange-200 transition-all">
                                {editingNode ? 'Lưu thay đổi' : 'Tạo mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </DndContext>
  );
};

export default CategoryTreeManager;