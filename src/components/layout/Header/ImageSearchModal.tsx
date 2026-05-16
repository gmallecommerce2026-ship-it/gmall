// wiki 0052: Image search modal — upload ảnh, encode qua BE CLIP service,
// hiển grid sản phẩm gần nhất ngay trong modal.
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X, Upload, Loader2, ImageOff } from 'lucide-react';
import { imageSearchService, type ImageSearchHit } from '@/services/image-search.service';

interface ImageSearchModalProps {
  open: boolean;
  onClose: () => void;
}

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp';

export default function ImageSearchModal({ open, onClose }: ImageSearchModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hits, setHits] = useState<ImageSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setFile(null);
    setPreviewUrl((url) => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
    setHits([]);
    setError(null);
    setHasSearched(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const pickFile = (f: File | null) => {
    if (!f) return;
    if (!ACCEPT.split(',').includes(f.type)) {
      setError('Chỉ nhận ảnh JPG / PNG / WEBP.');
      return;
    }
    if (f.size > MAX_BYTES) {
      setError(`Ảnh quá lớn (tối đa ${(MAX_BYTES / 1024 / 1024).toFixed(0)} MB).`);
      return;
    }
    setError(null);
    setHits([]);
    setHasSearched(false);
    setFile(f);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  };

  const handleSearch = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const results = await imageSearchService.byImage(file, { limit: 24 });
      setHits(results);
      setHasSearched(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Không tìm được sản phẩm. Thử lại nhé.';
      setError(typeof msg === 'string' ? msg : 'Lỗi không xác định.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    pickFile(e.dataTransfer.files?.[0] ?? null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Tìm sản phẩm bằng hình ảnh</h2>
            <p className="text-xs text-gray-500">Tải lên 1 ảnh — hệ thống sẽ tìm 20+ SP có hình giống nhất.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!file ? (
            <label
              htmlFor="image-search-upload"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-orange-400 hover:bg-orange-50/40"
            >
              <Upload className="mb-3 h-10 w-10 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Kéo thả ảnh vào đây, hoặc click để chọn</span>
              <span className="mt-1 text-xs text-gray-400">JPG / PNG / WEBP, tối đa 5 MB</span>
              <input
                id="image-search-upload"
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {previewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="h-32 w-32 flex-shrink-0 rounded-lg object-cover ring-1 ring-gray-200"
                  />
                )}
                <div className="flex flex-1 flex-col gap-2">
                  <p className="truncate text-sm font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                  <div className="mt-auto flex gap-2">
                    <button
                      type="button"
                      onClick={handleSearch}
                      disabled={loading}
                      className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Đang tìm…
                        </span>
                      ) : (
                        'Tìm sản phẩm tương tự'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={reset}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Đổi ảnh
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
              )}

              {hasSearched && !loading && (
                <ResultsGrid hits={hits} onClose={onClose} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultsGrid({ hits, onClose }: { hits: ImageSearchHit[]; onClose: () => void }) {
  if (!hits.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 py-10 text-center">
        <ImageOff className="mb-2 h-8 w-8 text-gray-400" />
        <p className="text-sm font-medium text-gray-700">Không tìm thấy SP nào tương tự.</p>
        <p className="mt-1 text-xs text-gray-500">Thử ảnh khác — nền sạch, SP trung tâm khung hình.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
        {hits.length} sản phẩm tương tự
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {hits.map((hit) => (
          <Link
            key={hit.productId}
            href={`/products/${hit.slug}`}
            onClick={onClose}
            className="group block overflow-hidden rounded-lg border border-gray-100 transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-square bg-gray-100">
              {hit.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hit.image}
                  alt={hit.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-300">
                  <ImageOff className="h-8 w-8" />
                </div>
              )}
              <span className="absolute right-1 top-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {(hit.similarity * 100).toFixed(0)}%
              </span>
            </div>
            <div className="p-2">
              <p className="line-clamp-2 text-xs font-medium text-gray-800">{hit.name}</p>
              <p className="mt-0.5 text-sm font-semibold text-orange-600">
                {hit.price.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
