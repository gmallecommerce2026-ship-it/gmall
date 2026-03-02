// src/components/ui/Breadcrumbs.tsx
import React from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="w-full">
      <ol className="flex items-center flex-wrap gap-y-1 text-sm text-gray-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.name}-${index}`} className="flex items-center min-w-0">
              {/* Separator Icon (Chỉ hiện nếu không phải item đầu tiên) */}
              {index > 0 && (
                <span className="mx-2 text-gray-400 flex-shrink-0">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </span>
              )}

              <Link
                href={item.href}
                className={`transition-colors whitespace-nowrap block ${
                  isLast
                    ? "text-gray-900 font-medium pointer-events-none max-w-[200px] md:max-w-[400px] truncate" 
                    // ^ Logic cắt chữ giống Shopee
                    : "hover:text-brand-orange hover:underline"
                }`}
                title={item.name} // Hiện full tên khi hover
                aria-current={isLast ? "page" : undefined}
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;