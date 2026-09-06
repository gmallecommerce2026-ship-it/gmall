'use client';

import * as React from 'react';
import Link from 'next/link';

export interface CategoryItem {
  id: string | number;
  name: string;
  slug: string;
  parentId?: string | number | null;
  children?: CategoryItem[];
  [key: string]: any; // Tránh lỗi khi BlogCategory có thêm các field khác
}

interface BlogCategoryMenuProps {
  categories: CategoryItem[];
  selectedCategory?: string;
}

export function BlogCategoryMenu({ categories = [], selectedCategory = '' }: BlogCategoryMenuProps) {
  return (
    <nav className="relative z-30 w-full border-b border-gray-200 bg-white shadow-xs">
      <div className="flex items-center">
        <ul className="flex flex-wrap items-center gap-1 text-sm font-medium text-gray-700">
          {/* Nút Về tất cả bài viết */}
          <li>
            <Link
              href="/blog"
              className={`inline-block px-3.5 py-2.5 rounded-md transition ${
                !selectedCategory
                  ? 'text-blue-600 font-semibold bg-blue-50'
                  : 'hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Tất cả
            </Link>
          </li>

          {/* Danh mục cấp 1 */}
          {categories.map((item) => {
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const isActive = selectedCategory === item.slug;

            return (
              <li key={String(item.id)} className="group relative">
                <Link
                  href={`/blog?category=${item.slug}`}
                  className={`flex items-center gap-1 px-3 py-2.5 rounded-md transition ${
                    isActive
                      ? 'text-blue-600 font-semibold bg-blue-50'
                      : 'hover:text-blue-600 hover:bg-gray-50 group-hover:text-blue-600'
                  }`}
                >
                  <span>{item.name}</span>
                  {hasChildren && (
                    <svg
                      className="h-3.5 w-3.5 text-gray-400 transition-transform duration-200 group-hover:rotate-180 group-hover:text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>

                {/* Dropdown cấp 2 */}
                {hasChildren && (
                  <div className="invisible absolute left-0 top-full min-w-[200px] rounded-lg border border-gray-100 bg-white py-1.5 opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:opacity-100">
                    <ul className="flex flex-col">
                      {item.children!.map((subItem) => {
                        const hasSubChildren = Boolean(subItem.children && subItem.children.length > 0);
                        const isSubActive = selectedCategory === subItem.slug;

                        return (
                          <li key={String(subItem.id)} className="group/sub relative">
                            <Link
                              href={`/blog?category=${subItem.slug}`}
                              className={`flex items-center justify-between px-4 py-2 text-sm transition ${
                                isSubActive
                                  ? 'text-blue-600 font-medium bg-blue-50'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                              }`}
                            >
                              <span>{subItem.name}</span>
                              {hasSubChildren && (
                                <svg
                                  className="h-3.5 w-3.5 text-gray-400 group-hover/sub:text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </Link>

                            {/* Dropdown cấp 3 (bung sang bên phải) */}
                            {hasSubChildren && (
                              <div className="invisible absolute left-full top-0 min-w-[180px] rounded-lg border border-gray-100 bg-white py-1.5 opacity-0 shadow-lg transition-all duration-150 group-hover/sub:visible group-hover/sub:opacity-100">
                                <ul className="flex flex-col">
                                  {subItem.children!.map((thirdItem) => (
                                    <li key={String(thirdItem.id)}>
                                      <Link
                                        href={`/blog?category=${thirdItem.slug}`}
                                        className={`block px-4 py-2 text-sm transition ${
                                          selectedCategory === thirdItem.slug
                                            ? 'text-blue-600 font-medium bg-blue-50'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                        }`}
                                      >
                                        {thirdItem.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}