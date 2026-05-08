// src/types/blog.ts
import { Product } from './product'; //

export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  HIDDEN = 'HIDDEN',
}

// TS-fix wiki 0031: BlogPost - allow `category` as either string-key or full Category object,
// thêm excerpt cho list/card UI, để BlogCard render an toàn khi BE trả raw object.
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string; // HTML string
  thumbnail?: string;
  // Có thể là slug/id (string) hoặc object đầy đủ tùy endpoint
  category?: string | { id?: string; name: string; slug?: string };
  status: BlogStatus;

  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[]; // Array string
  viewCount?: number;

  // Bản trích / mô tả ngắn (BE optional)
  excerpt?: string;
  description?: string;

  // Relations
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  relatedProducts?: Product[]; // Full product objects

  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogDto {
  title: string;
  content: string;
  thumbnail?: string;
  category?: string;
  status?: BlogStatus;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  relatedProductIds?: string[]; // Array UUID
}

// FIX: Sử dụng type alias thay vì interface extends Partial
export type UpdateBlogDto = Partial<CreateBlogDto>;

export interface BlogQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: BlogStatus;
  category?: string;
}

export interface PaginatedResponse<T> {
  data: T[]; 
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Author {
  id: string;
  name: string;
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null; // Quan trọng để nâng cấp 2 cấp
  children?: Category[];    // Dùng sau khi transform
}

// Interface cho API response (nếu cần)
export interface BlogResponse {
  data: BlogPost[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}