// src/modules/seller/crawler/shopee.mapper.ts
import { Product, ProductTier, ProductVariant } from '@/types/product';

const getShopeeImg = (id: string) => `https://down-vn.img.susercontent.com/file/${id}`;

// Interface mở rộng để trả về data raw cho Client xử lý tiếp
export interface ShopeeMappedData extends Partial<Product> {
  rawCategories?: { display_name: string; catid: number }[];
  rawAttributes?: any[];
}

export const mapShopeeToSystemProduct = (shopeeData: any): ShopeeMappedData => {
  const item = shopeeData.data;
  if (!item) throw new Error("No data found");

  // 1. Xử lý Tiers & Variants (Giữ nguyên logic cũ của bạn)
  const tiers: ProductTier[] = (item.tier_variations || []).map((tier: any) => ({
    name: tier.name,
    options: tier.options,
    images: tier.images ? tier.images.map(getShopeeImg) : undefined
  }));

  const variations: ProductVariant[] = (item.models || []).map((model: any) => ({
    id: String(model.itemid),
    price: model.price / 100000,
    stock: (model.stock && model.stock > 0) ? Number(model.stock) : 200,
    sku: model.itemid + '-' + model.modelid,
    imageUrl: model.image_id ? getShopeeImg(model.image_id) : undefined,
    tierIndex: model.extinfo?.tier_index || []
  }));

  // 2. Xử lý Attributes (Thuộc tính)
  // Shopee trả về attributes ở nhiều dạng, ta lấy dạng chuẩn nhất
  const attributes: Record<string, any> = {};
  if (item.attributes) {
    item.attributes.forEach((attr: any) => {
        attributes[attr.name] = attr.value;
    });
  }

  // 3. Return Data
  return {
    title: item.name,
    description: item.description ? item.description.replace(/\n/g, '<br/>') : '',
    // KHÔNG gán cứng categoryId ở đây nữa, để UI quyết định
    categoryId: undefined, 
    price: item.price / 100000,
    regularPrice: item.price_before_discount > 0 ? item.price_before_discount / 100000 : undefined,
    discountPercent: item.raw_discount,
    stockTotal: item.stock,
    stock: item.stock,
    imageUrl: getShopeeImg(item.image),
    images: item.images ? item.images.map(getShopeeImg) : [],
    videos: item.video_info_list ? item.video_info_list.map((v: any) => v.default_format.url) : [],
    status: 'DRAFT',
    brand: item.brand,
    attributes: attributes, // Map thêm attributes
    tiers,
    // TS-fix wiki 0031: Product type dùng `variants` (không phải `variations`)
    variants: variations,
    rating: item.item_rating?.rating_star || 0,
    salesCount: item.historical_sold || 0,
    
    // TRẢ VỀ RAW CATEGORIES ĐỂ AUTO-MAPPING Ở UI
    // Shopee API thường trả về field `categories` hoặc `fe_categories` chứa hierarchy
    rawCategories: item.categories || item.fe_categories || [], 
  };
};