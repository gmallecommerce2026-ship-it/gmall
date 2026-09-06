'use client';

import * as React from 'react';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { blogService, BlogCategory } from '@/services/blog.service';
import { BlogPost } from '@/types/blog';

// --- Components ---
import { HeroSection } from '@/modules/blog/components/HeroSection';
import { CategoryBlock, CategoryLayoutType } from '@/modules/blog/components/CategoryBlock';
import { BlogSidebar } from '@/modules/blog/components/BlogSidebar';
import { BlogCategoryMenu, CategoryItem } from '../components/BlogCategoryMenu';

// --- CONSTANTS ---
const LAYOUT_CYCLE: CategoryLayoutType[] = ['layout-A', 'layout-B', 'layout-E', 'layout-D', 'layout-C'];
const COLOR_CYCLE: string[] = [
  'bg-blue-600', 'bg-pink-500', 'bg-indigo-600', 
  'bg-rose-500', 'bg-green-600', 'bg-orange-500', 'bg-slate-700'
];

export default function BlogClient() {
  const searchParams = useSearchParams();
  
  const selectedCategory = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  // State dữ liệu
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [heroPosts, setHeroPosts] = useState<BlogPost[]>([]);
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [sectionPostsMap, setSectionPostsMap] = useState<Record<string, BlogPost[]>>({});
  const [filterResult, setFilterResult] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // --- INITIAL FETCH ---
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const res: any = await blogService.getPublicBlogs({ page: 1, limit: 12 });
<<<<<<< HEAD
        const latest: BlogPost[] = res?.data || res?.items || [];
=======
        // [FIX wiki 0095/0099/0103] `blogService` dùng `apiClient` (fetch) — `request()` trả
        // `null` ở nhánh 401-redirect và khi body không parse được JSON → `res.data` ném
        // TypeError, cả trang blog trắng. Chuẩn hoá về mảng vì bên dưới gọi `.slice`/`.map`.
        const rawLatest = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
        const latest: BlogPost[] = Array.isArray(rawLatest) ? rawLatest : [];
>>>>>>> c73f8b0f27eae7ca451959b67723d4c85b230a41
        setHeroPosts(latest.slice(0, 5));
        setLatestPosts(latest);
      } catch (error) {
        console.error("Latest posts fetch error:", error);
      }
      try {
        const cats: any = await blogService.getCategories();
        setCategories(cats || []);
      } catch (error) {
        console.error("Categories fetch error:", error);
      }
      setLoading(false);
    };
    initData();
  }, []);

  // --- DỰNG CÂY DANH MỤC NHIỀU CẤP ---
  const categoryTree = useMemo(() => {
    if (!categories.length) return [];
    
    // Clone nodes kèm mảng children
    const nodes: CategoryItem[] = categories.map((c: any) => ({
      ...c,
      children: [],
    }));

    const idMap = new Map<string, CategoryItem>();
    nodes.forEach(node => idMap.set(String(node.id), node));

    const tree: CategoryItem[] = [];
    nodes.forEach(node => {
      if (node.parentId && idMap.has(String(node.parentId))) {
        idMap.get(String(node.parentId))!.children!.push(node);
      } else {
        tree.push(node);
      }
    });

    return tree;
  }, [categories]);

  // Map slug -> Category
  const categoryMap = useMemo(() => {
    const slugMap = new Map<string, BlogCategory>();
    categories.forEach(node => slugMap.set(node.slug, node));
    return slugMap;
  }, [categories]);

  const rootCategories = useMemo(() => {
    return categories.filter((c: any) => !c.parentId).slice(0, 8);
  }, [categories]);

  // --- FETCH POSTS CHO SECTIONS ---
  useEffect(() => {
    if (rootCategories.length === 0) return;
    if (selectedCategory || search) return;

    const fetchSectionPosts = async () => {
      const promises = rootCategories.map(cat => 
        blogService.getPublicBlogs({ category: cat.slug, limit: 6 })
          .then(res => ({ 
            slug: cat.slug, 
            posts: (res as any)?.data || (res as any)?.items || [] 
          }))
          .catch(() => ({ slug: cat.slug, posts: [] }))
      );

      const results = await Promise.all(promises);
      const newPostMap: Record<string, BlogPost[]> = {};
      results.forEach(item => {
        if (item.posts.length > 0) newPostMap[item.slug] = item.posts;
      });
      setSectionPostsMap(newPostMap);
    };

    fetchSectionPosts();
  }, [rootCategories, selectedCategory, search]);

  // --- FETCH KHI SEARCH / FILTER ---
  useEffect(() => {
    if (!selectedCategory && !search) {
      setFilterResult([]);
      return;
    }

    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const res: any = await blogService.getPublicBlogs({
          page: 1, 
          limit: 20, 
          search: search,
          category: selectedCategory,
        });
<<<<<<< HEAD
        setFilterResult(res?.data || res?.items || []);
      } catch (error) { 
        console.error(error); 
      } finally { 
        setLoading(false); 
      }
=======
        // [FIX wiki 0095/0099/0103] Cùng lý do: `apiClient` trả `null` khi 401 / body rỗng →
        // `res.data` ném TypeError. `filterResult` được render bằng `.map` nên phải là mảng.
        const filtered = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
        setFilterResult(Array.isArray(filtered) ? filtered : []);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
>>>>>>> c73f8b0f27eae7ca451959b67723d4c85b230a41
    };
    fetchFiltered();
  }, [search, selectedCategory]);

  return (
    <div className="font-sans text-gray-900">
      <div className="container mx-auto px-4 mt-4 pb-20">
        {/* Menu danh mục nhiều cấp */}
        {categoryTree.length > 0 && (
          <div className="mb-6">
            <BlogCategoryMenu 
              categories={categoryTree} 
              selectedCategory={selectedCategory} 
            />
          </div>
        )}

        {loading && rootCategories.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Đang tải nội dung...</p>
          </div>
        ) : !loading && rootCategories.length === 0 && heroPosts.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center">
            <p className="text-gray-700 font-semibold text-lg mb-2">Chưa có bài viết nào</p>
            <p className="text-gray-500 text-sm">Hãy quay lại sau, đội ngũ nội dung đang chuẩn bị bài mới.</p>
          </div>
        ) : (
          <main>
            {!selectedCategory && !search && <HeroSection posts={heroPosts} />}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
              <div className="col-span-12 lg:col-span-8 space-y-2">

                {/* Filter/Search List */}
                {selectedCategory || search ? (
                  <div className="animate-fade-in">
                    <h3 className="text-xl font-bold mb-6 border-b pb-2">
                      {selectedCategory 
                        ? `Danh mục: ${categoryMap.get(selectedCategory)?.name || selectedCategory}`
                        : `Tìm kiếm: "${search}"`}
                    </h3>
                    {filterResult.length > 0 ? (
                      <CategoryBlock 
                        category={(categoryMap.get(selectedCategory) || { id: 'search', name: 'Kết quả', slug: '' }) as any} 
                        posts={filterResult} 
                        layout="layout-A"
                      />
                    ) : (
                      <div className="text-center py-10 text-gray-500">Không tìm thấy bài viết nào.</div>
                    )}
                  </div>
                ) : (
                  /* Sections Trang chủ */
                  <>
                    {latestPosts.length > 0 && (
                      <CategoryBlock
                        category={{ id: 'latest', name: 'Bài mới nhất', slug: '' } as any}
                        posts={latestPosts}
                        layout="layout-A"
                        color="bg-slate-700"
                      />
                    )}
                    {rootCategories.map((cat, idx) => {
                      const posts = sectionPostsMap[cat.slug];
                      if (!posts || posts.length === 0) return null;
                      
                      const layout = LAYOUT_CYCLE[idx % LAYOUT_CYCLE.length];
                      const color = COLOR_CYCLE[idx % COLOR_CYCLE.length];
                      const showBanner = (idx + 1) % 3 === 0;
                      const enhancedCategory = categoryMap.get(cat.slug) || cat;

                      return (
                        <React.Fragment key={String(cat.id)}>
                          <CategoryBlock 
                            category={enhancedCategory as any} 
                            posts={posts} 
                            layout={layout} 
                            color={color}
                          />
                          {showBanner && (
                            <div className="w-full h-24 md:h-32 bg-gray-100 rounded-[3px] flex items-center justify-center text-xs text-gray-400 mb-10 border border-dashed border-gray-300">
                              ADVERTISEMENT
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Sidebar */}
              <aside className="hidden lg:block lg:col-span-4 h-fit sticky top-20 pl-4 border-l border-gray-100">
                <BlogSidebar /> 
              </aside>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}