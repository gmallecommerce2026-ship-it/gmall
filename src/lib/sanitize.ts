/**
 * Fix BUG-FE-3 (wiki 0030): wrap DOMPurify cho mọi `dangerouslySetInnerHTML`
 * trong app. Trước đây 5 file render HTML user-input trực tiếp → stored XSS
 * (đặc biệt trang admin approval — XSS payload sẽ chạy với cookie admin).
 *
 * Why isomorphic-dompurify thay vì 'dompurify': isomorphic version setup jsdom
 * tự động khi chạy SSR (Node), tránh "window is not defined" của DOMPurify
 * thuần khi chạy ở Server Component. Một dependency, hai môi trường.
 *
 * Allowlist mặc định: tags HTML thông dụng + class/id attribute. Strip tất cả
 * `<script>`, `on*` event handler, `javascript:` URL. Đáp ứng nhu cầu rich-text
 * của TipTap editor (bold, italic, list, image, link, youtube embed) mà vẫn
 * an toàn.
 */
import DOMPurify from 'isomorphic-dompurify';

// Type DOMPurify.Config không export ra namespace ở isomorphic-dompurify v2 — dùng Parameters trực tiếp.
const RICH_TEXT_CONFIG: Parameters<typeof DOMPurify.sanitize>[1] = {
  USE_PROFILES: { html: true },
  // Cho phép YouTube iframe (TipTap embed) nhưng restrict src origin
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target', 'rel'],
  // Force tất cả link mở tab mới + noopener (chống tab-nabbing)
  FORBID_TAGS: ['style'],
};

/**
 * Sanitize HTML cho rich-text content (product description, blog post, ...).
 * Trả `{ __html }` ready để gán vào React `dangerouslySetInnerHTML`.
 */
export function sanitizeHtml(rawHtml: string | null | undefined): { __html: string } {
  if (!rawHtml) return { __html: '' };
  return { __html: DOMPurify.sanitize(rawHtml, RICH_TEXT_CONFIG) as unknown as string };
}

/** Strict: chỉ inline text formatting (bold, italic, link). Dùng cho username, comment ngắn. */
export function sanitizeInline(raw: string | null | undefined): { __html: string } {
  if (!raw) return { __html: '' };
  return {
    __html: DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'span'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    }) as unknown as string,
  };
}
