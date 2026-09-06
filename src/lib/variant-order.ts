// src/lib/variant-order.ts
//
// wiki 0095 B2 — Sắp xếp thứ tự HIỂN THỊ của option phân loại (tier options).
//
// Bug khách báo: PDP iPhone hiện "1TB, 2TB, 256GB, 512GB".
// Nguyên nhân: StickyBuyBox sort bằng
//     localeCompare(a, b, undefined, { numeric: true })
// → collation numeric chỉ so cụm chữ số ĐẦU TIÊN và bỏ qua đơn vị:
//     1 < 2 < 256 < 512  ⇒  1TB, 2TB, 256GB, 512GB.
//
// Fix: quy đổi "<số><đơn vị>" về một giá trị nền chung rồi mới so sánh
// (256GB = 256e9 < 512GB = 512e9 < 1TB = 1e12 < 2TB = 2e12).
//
// NGUYÊN TẮC AN TOÀN (quan trọng):
//  1. Hàm này CHỈ trả về THỨ TỰ HIỂN THỊ (mảng index gốc). Không bao giờ được
//     đổi thứ tự dữ liệu thật, vì `variants[].tierIndex` ("0,1") trỏ theo index
//     gốc của option — đổi mảng gốc = chọn nhầm SKU/giá/tồn kho.
//  2. Chỉ sắp lại khi TẤT CẢ option cùng một "họ" đo lường (đều dung lượng,
//     đều khối lượng, đều size chữ...). Còn lại giữ nguyên thứ tự seller đã
//     nhập — màu sắc "Đỏ/Xanh/Đen" không có thứ tự tự nhiên, tự ý sort
//     alphabet là sai ý seller.
//  3. Sort ổn định: giá trị bằng nhau thì giữ thứ tự gốc.

/** Bảng quy đổi đơn vị → { họ, hệ số về đơn vị nền của họ đó }. */
const UNITS: Record<string, { family: string; factor: number }> = {
  // Dung lượng số (nền: byte)
  b: { family: 'data', factor: 1 },
  kb: { family: 'data', factor: 1e3 },
  mb: { family: 'data', factor: 1e6 },
  gb: { family: 'data', factor: 1e9 },
  tb: { family: 'data', factor: 1e12 },
  pb: { family: 'data', factor: 1e15 },
  // Khối lượng (nền: gram)
  mg: { family: 'weight', factor: 0.001 },
  g: { family: 'weight', factor: 1 },
  gr: { family: 'weight', factor: 1 },
  kg: { family: 'weight', factor: 1e3 },
  tan: { family: 'weight', factor: 1e6 },
  tấn: { family: 'weight', factor: 1e6 },
  // Thể tích (nền: ml)
  ml: { family: 'volume', factor: 1 },
  cl: { family: 'volume', factor: 10 },
  l: { family: 'volume', factor: 1e3 },
  lit: { family: 'volume', factor: 1e3 },
  lít: { family: 'volume', factor: 1e3 },
  // Chiều dài (nền: mm)
  mm: { family: 'length', factor: 1 },
  cm: { family: 'length', factor: 10 },
  dm: { family: 'length', factor: 100 },
  m: { family: 'length', factor: 1e3 },
  km: { family: 'length', factor: 1e6 },
  // Bộ nhớ RAM hay ghi kèm — cùng họ data
  ram: { family: 'data', factor: 1 },
};

/**
 * Thang size chữ. Dùng khi option KHÔNG bắt đầu bằng số.
 * `2XL`/`XXL`, `3XL`/`XXXL`... quy về cùng một bậc.
 */
const SIZE_SCALE: Record<string, number> = {
  xxxs: -3, xxs: -2, xs: -1, s: 0, m: 1, l: 2,
  xl: 3, xxl: 4, xxxl: 5, xxxxl: 6, xxxxxl: 7,
};

/** "3XL" → "xxxl"; "2xl" → "xxl". Trả nguyên chuỗi nếu không khớp. */
function expandSizeToken(raw: string): string {
  const s = raw.toLowerCase().replace(/[\s.\-_]/g, '');
  const m = /^(\d+)x(l|s)$/.exec(s);
  if (m) {
    const n = Number(m[1]);
    // Chặn "99XL" sinh chuỗi khổng lồ — quá 5 bậc coi như không nhận diện được.
    if (n < 1 || n > 5) return s;
    return 'x'.repeat(n) + m[2];
  }
  return s;
}

interface Parsed {
  family: string;
  value: number;
}

/**
 * Đọc 1 option thành { họ, giá trị so sánh được }.
 * Trả null nếu không nhận diện được (→ giữ nguyên thứ tự gốc).
 */
function parseOption(raw: string): Parsed | null {
  const text = String(raw ?? '').trim();
  if (!text) return null;

  // 1) Size chữ: S / M / L / XL / 2XL... — PHẢI xét trước nhánh số, vì "2XL"
  //    cũng khớp regex "<số><chữ>" nhưng "xl" không phải đơn vị đo lường.
  const sizeKey = expandSizeToken(text);
  if (sizeKey in SIZE_SCALE) {
    return { family: 'size', value: SIZE_SCALE[sizeKey] };
  }

  // 2) Dạng "<số><đơn vị?>", chấp nhận dấu phẩy/chấm thập phân và khoảng trắng:
  //    "256GB", "1 TB", "1.5L", "0,5 kg"
  const num = /^([0-9]+(?:[.,][0-9]+)?)\s*([\p{L}]*)$/u.exec(text);
  if (num) {
    const value = Number(num[1].replace(',', '.'));
    if (!Number.isFinite(value)) return null;
    const unitRaw = num[2].toLowerCase();
    if (!unitRaw) return { family: 'number', value }; // số trần: "38", "39", "40"
    const unit = UNITS[unitRaw];
    if (!unit) return null; // đơn vị lạ → không dám sắp xếp
    return { family: unit.family, value: value * unit.factor };
  }

  return null;
}

/**
 * Trả về thứ tự HIỂN THỊ dưới dạng mảng index gốc.
 *
 * - Nhận diện được toàn bộ và cùng 1 họ → sắp tăng dần theo giá trị thật.
 * - Ngược lại → [0, 1, 2, ...] (giữ nguyên thứ tự seller nhập).
 *
 * @example
 * getVariantDisplayOrder(['1TB','2TB','256GB','512GB']) // [2, 3, 0, 1]
 * getVariantDisplayOrder(['Đỏ','Xanh','Đen'])           // [0, 1, 2]
 */
export function getVariantDisplayOrder(options: readonly string[]): number[] {
  const identity = options.map((_, i) => i);
  if (options.length < 2) return identity;

  const parsed = options.map(parseOption);
  if (parsed.some((p) => p === null)) return identity;

  const family = parsed[0]!.family;
  if (parsed.some((p) => p!.family !== family)) return identity;

  // Sort ổn định: so giá trị trước, hoà thì giữ index gốc.
  return identity
    .slice()
    .sort((a, b) => (parsed[a]!.value - parsed[b]!.value) || (a - b));
}

/**
 * Áp thứ tự hiển thị lên 1 tier, giữ ĐỒNG BỘ `options` và `images`.
 *
 * Trả kèm `originalIndexes` để component gọi `onSelect(originalIndexes[i])` —
 * đây là mấu chốt giữ đúng mapping tới `variants[].tierIndex`.
 *
 * Lưu ý: bug cũ ở StickyBuyBox sort `options` nhưng KHÔNG sort `images`
 * → ảnh swatch lệch nhãn. Hàm này sắp cả hai cùng lúc.
 */
export function applyVariantDisplayOrder<
  T extends { options: string[]; images?: string[] },
>(tier: T): { tier: T; originalIndexes: number[] } {
  const order = getVariantDisplayOrder(tier.options);
  const unchanged = order.every((v, i) => v === i);
  if (unchanged) return { tier, originalIndexes: order };

  return {
    tier: {
      ...tier,
      options: order.map((i) => tier.options[i]),
      ...(tier.images ? { images: order.map((i) => tier.images![i] ?? '') } : {}),
    },
    originalIndexes: order,
  };
}
