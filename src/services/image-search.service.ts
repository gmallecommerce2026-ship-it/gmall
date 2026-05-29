// wiki 0052: image search FE client.
// Talks to POST /products/search/by-image (multipart) on the BE.
import { api } from './api';

export interface ImageSearchHit {
  productId: string;
  similarity: number; // 0..1 (1 = perfect match)
  name: string;
  price: number;
  image: string | null;
  shopId: string | null;
  slug: string;
}

export interface ImageSearchResponse {
  hits: ImageSearchHit[];
}

export const imageSearchService = {
  async byImage(file: File, opts?: { limit?: number; minSimilarity?: number }): Promise<ImageSearchHit[]> {
    const form = new FormData();
    form.append('image', file);

    const params = new URLSearchParams();
    if (opts?.limit != null) params.set('limit', String(opts.limit));
    if (opts?.minSimilarity != null) params.set('minSimilarity', String(opts.minSimilarity));

    const url = `/products/search/by-image${params.toString() ? `?${params}` : ''}`;
    const res = await api.post<ImageSearchResponse>(url, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.hits ?? [];
  },

  async byText(text: string, opts?: { limit?: number }): Promise<ImageSearchHit[]> {
    const params = new URLSearchParams();
    if (opts?.limit != null) params.set('limit', String(opts.limit));
    const url = `/products/search/by-text${params.toString() ? `?${params}` : ''}`;
    const res = await api.post<ImageSearchResponse>(url, { text });
    return res.hits ?? [];
  },
};
