// src/components/ui/Breadcrumbs.tsx
import React from "react";
import Link from "next/link";
// Thay vì import từ @/icons có thể gây lỗi, hãy dùng SVG trực tiếp
// import ArrowRightIcon from "@/icons/arrow-right.svg"; 

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.name} className="flex items-center gap-2">
              <Link
                href={item.href}
                className={`font-sans text-base ${
                  isLast
                    ? "text-black font-medium pointer-events-none" // Disable link cho item cuối
                    : "text-gray-600 hover:text-brand-orange transition-colors"
                }`}
                aria-current={isLast ? "page" : undefined}
              >
                {item.name}
              </Link>
              {!isLast && (
                // SVG Chevron Right đơn giản
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;