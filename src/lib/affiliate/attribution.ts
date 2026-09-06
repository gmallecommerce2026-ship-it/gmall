/**
 * wiki 0105 — quy đổi affiliate phía trình duyệt.
 *
 * Cách hoạt động: người mua bấm `/product-details/<id>?aff=<code>` → ghi vào cookie
 * `gm_aff` một bản đồ `sản phẩm → mã link`, hạn 30 ngày. Tới lúc thanh toán, checkout
 * đọc bản đồ này và gửi kèm; BE KIỂM LẠI TOÀN BỘ (link đúng sản phẩm, hồ sơ đã duyệt,
 * sản phẩm còn bật affiliate, không tự mua) nên cookie bị sửa cũng vô ích.
 *
 * Vì sao lưu theo TỪNG SẢN PHẨM chứ không phải một mã duy nhất cho cả phiên:
 * đây là affiliate SẢN PHẨM. Người mua có thể bấm link sản phẩm A của người X rồi link
 * sản phẩm B của người Y; gán cả giỏ cho một người là cướp công của người kia, và khiến
 * seller trả hoa hồng cho món chẳng ai giới thiệu.
 *
 * Vì sao dùng cookie chứ không phải localStorage: giỏ hàng và checkout đều chạy phía
 * client nên cả hai đọc được, nhưng cookie còn sống qua tab mới và có hạn tự hết —
 * localStorage thì tồn tại vĩnh viễn, quy đổi cho một cú click từ hai năm trước là sai.
 */

const COOKIE_NAME = 'gm_aff';
const TTL_DAYS = 30;
/** Giữ tối đa ngần này mục để cookie không phình quá giới hạn ~4KB của trình duyệt. */
const MAX_ENTRIES = 20;

interface Entry {
  /** mã link */
  c: string;
  /** thời điểm bấm (ms) — để tự dọn mục quá hạn */
  t: number;
}

type Store = Record<string, Entry>;

function readRaw(): Store {
  if (typeof document === 'undefined') return {};
  const hit = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!hit) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(hit.slice(COOKIE_NAME.length + 1)));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    // Cookie hỏng (người dùng sửa tay, hoặc định dạng cũ) → coi như trống thay vì ném
    // lỗi. Quy đổi hỏng chỉ làm mất hoa hồng, không được phép làm hỏng việc mua hàng.
    return {};
  }
}

function writeRaw(store: Store) {
  if (typeof document === 'undefined') return;
  const value = encodeURIComponent(JSON.stringify(store));
  const expires = new Date(Date.now() + TTL_DAYS * 86400_000).toUTCString();
  // `SameSite=Lax` để cookie vẫn theo được khi người dùng bấm link từ Facebook/Zalo
  // sang (điều hướng cấp cao nhất) — `Strict` sẽ chặn đúng luồng chính của tính năng này.
  document.cookie = `${COOKIE_NAME}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function prune(store: Store): Store {
  const cutoff = Date.now() - TTL_DAYS * 86400_000;
  const alive = Object.entries(store).filter(
    ([, e]) => e && typeof e.c === 'string' && typeof e.t === 'number' && e.t > cutoff,
  );
  // Quá số mục cho phép → bỏ những mục CŨ NHẤT trước.
  alive.sort((a, b) => b[1].t - a[1].t);
  return Object.fromEntries(alive.slice(0, MAX_ENTRIES));
}

/**
 * Ghi nhận một lượt bấm link cho một sản phẩm. Click SAU đè click TRƯỚC — người dẫn
 * khách gần nhất là người được ghi nhận, đúng thông lệ của các sàn.
 */
export function rememberAffiliate(productId: string, code: string) {
  if (!productId || !code) return;
  const store = prune(readRaw());
  store[productId] = { c: code, t: Date.now() };
  writeRaw(prune(store));
}

/** Mã link đang gắn với một sản phẩm (nếu còn hạn). */
export function affiliateCodeFor(productId: string): string | null {
  const store = prune(readRaw());
  return store[productId]?.c ?? null;
}

/**
 * Danh sách quy đổi cần gửi kèm khi thanh toán, CHỈ cho những sản phẩm thực sự có trong
 * đơn. Không gửi cả bản đồ: BE sẽ bỏ qua phần thừa, nhưng gửi ít đi là payload nhỏ hơn
 * và không tiết lộ những gì người dùng từng xem mà không mua.
 */
export function affiliateRefsFor(productIds: string[]): { productId: string; code: string }[] {
  const store = prune(readRaw());
  const out: { productId: string; code: string }[] = [];
  for (const id of new Set(productIds)) {
    const e = store[id];
    if (e?.c) out.push({ productId: id, code: e.c });
  }
  return out;
}

/** Xoá quy đổi của những sản phẩm đã mua xong — tránh gán lại cho đơn sau. */
export function forgetAffiliates(productIds: string[]) {
  if (!productIds.length) return;
  const store = prune(readRaw());
  let changed = false;
  for (const id of productIds) {
    if (store[id]) {
      delete store[id];
      changed = true;
    }
  }
  if (changed) writeRaw(store);
}
