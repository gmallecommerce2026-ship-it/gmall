import React from 'react';

// Nếu chưa có heroicons, có thể thay bằng text "<" ">"
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const delta = 1; // Số trang hiển thị 2 bên trang hiện tại

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
              currentPage === i
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {i}
          </button>
        );
      } else if (
        (i === currentPage - delta - 1 && i > 1) ||
        (i === currentPage + delta + 1 && i < totalPages)
      ) {
        pages.push(
          <span key={i} className="w-9 h-9 flex items-center justify-center text-gray-400">
            ...
          </span>
        );
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>

      {renderPageNumbers()}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;