// FE service cho module Charity. BE endpoints xem:
//   docs/wiki/decisions/0011-charity-module.md
import { api } from './api';

export interface CharityFund {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  goalAmount: string;    // Decimal serialized as string
  currentAmount: string;
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  id: string;
  fundId: string;
  userId: string | null;
  amount: string;
  note: string | null;
  isAnonymous: boolean;
  createdAt: string;
  user: { id: string; name: string | null; avatar: string | null } | null;
}

export interface DonatePayload {
  fundId: string;
  amount: number;
  note?: string;
  isAnonymous?: boolean;
}

export const CharityService = {
  listFunds: async (): Promise<CharityFund[]> => {
    return api.get('/charity/funds');
  },

  getFund: async (slug: string): Promise<CharityFund> => {
    return api.get(`/charity/funds/${slug}`);
  },

  listDonations: async (slug: string, limit = 20): Promise<Donation[]> => {
    return api.get(`/charity/funds/${slug}/donations`, { params: { limit } });
  },

  donate: async (payload: DonatePayload) => {
    return api.post('/charity/donate', payload);
  },
};
