import { api } from './api';

export type ComplaintCategory = 'shipping' | 'product' | 'finance' | 'system' | 'other';
export type ComplaintStatus = 'open' | 'processing' | 'resolved' | 'rejected';

export interface Complaint {
  id: string;
  userId: string;
  category: ComplaintCategory;
  relatedOrderId: string | null;
  title: string;
  content: string;
  attachments: string[] | null;
  status: ComplaintStatus;
  adminNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintInput {
  category: ComplaintCategory;
  title: string;
  content: string;
  relatedOrderId?: string;
  attachments?: string[];
}

export interface PaginatedComplaints {
  data: Complaint[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const ComplaintService = {
  create(dto: CreateComplaintInput) {
    return api.post<Complaint>('/complaints', dto);
  },
  listMine(params: { page?: number; limit?: number; status?: ComplaintStatus } = {}) {
    return api.get<PaginatedComplaints>('/complaints/me', { params });
  },
};
