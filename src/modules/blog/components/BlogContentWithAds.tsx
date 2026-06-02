'use client';

// Wiki 0068 D12: xen kẽ quảng cáo (banner location='BLOG_DETAIL') vào giữa nội
// dung bài viết. Trước đây body render 1 khối dangerouslySetInnerHTML, không có
// chỗ chèn ad. Banner do admin tạo qua CMS (Banner.location free-string), không
// cần đổi BE. Không có banner → render y như cũ (graceful, không ảnh hưởng).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { sanitizeHtml } from '@/lib/sanitize';

interface BannerItem {
  id: string;
  src: string;
  alt?: string;
  title?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

// Tách HTML đã sanitize thành các block top-level. Dùng DOMParser (client-only)
// để KHÔNG làm vỡ cấu trúc lồng nhau (vd <ul><li><p>…). SSR/initial trả null.
function splitIntoBlocks(html: string): string[] | null {
  if (!html) return [];
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return null;
  try {
    const doc = new DOMParser().parseFromString(`<div id="__root">${html}</div>`, 'text/html');
    const root = doc.getElementById('__root');
    if (!root) return null;
    const out: string[] = [];
    root.childNodes.forEach((node) => {
      if (node.nodeType === 1) {
        out.push((node as Element).outerHTML);
      } else if (node.nodeType === 3 && node.textContent?.trim()) {
        out.push(`<p>${node.textContent}</p>`);
      }
    });
    return out.length ? out : null;
  } catch {
    return null;
  }
}

const AD_INTERVAL = 3; // chèn 1 quảng cáo sau mỗi 3 block nội dung

const AdSlot = ({ b }: { b: BannerItem }) => {
  const inner = (
    <div className="not-prose my-8 relative w-full rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-gradient-to-r from-orange-50 to-pink-50">
      <span className="absolute top-2 left-2 z-10 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded uppercase tracking-wide">
        Tài trợ
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={b.src}
        alt={b.alt || b.title || 'Quảng cáo'}
        className="w-full h-32 md:h-44 object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
      {(b.title || b.ctaLabel) && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center px-6">
          <div className="text-white">
            {b.title && <h3 className="text-lg md:text-2xl font-bold drop-shadow !text-white !mt-0">{b.title}</h3>}
            {b.ctaLabel && (
              <span className="inline-block mt-2 bg-brand-orange px-4 py-1.5 rounded-full text-sm font-semibold">
                {b.ctaLabel}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
  return b.ctaLink ? <Link href={b.ctaLink} className="block">{inner}</Link> : inner;
};

export default function BlogContentWithAds({
  content,
  proseClassName,
}: {
  content: string;
  proseClassName: string;
}) {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [blocks, setBlocks] = useState<string[] | null>(null);

  useEffect(() => {
    api
      .get<BannerItem[]>('/content/banners?location=BLOG_DETAIL')
      .then((res) => setBanners(Array.isArray(res) ? res : []))
      .catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    setBlocks(splitIntoBlocks(sanitizeHtml(content).__html));
  }, [content]);

  // SSR/initial hoặc không có ad/không tách được block → render nguyên khối (như cũ)
  if (!blocks || banners.length === 0) {
    return <div className={proseClassName} dangerouslySetInnerHTML={sanitizeHtml(content)} />;
  }

  const nodes: React.ReactNode[] = [];
  let adIdx = 0;
  blocks.forEach((block, i) => {
    nodes.push(<div key={`b-${i}`} dangerouslySetInnerHTML={{ __html: block }} />);
    if ((i + 1) % AD_INTERVAL === 0 && i < blocks.length - 1) {
      const b = banners[adIdx % banners.length];
      adIdx++;
      nodes.push(<AdSlot key={`ad-${i}`} b={b} />);
    }
  });

  return <div className={proseClassName}>{nodes}</div>;
}
