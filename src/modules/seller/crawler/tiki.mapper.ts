import { Product, ProductTier, ProductVariant } from '@/types/product';

// Interface mở rộng để hứng data raw nếu cần xử lý thêm ở UI
export interface TikiMappedData extends Partial<Product> {
  rawCategories?: { id: number; name: string }[];
}

export const mapTikiToSystemProduct = (tikiData: any): TikiMappedData => {
  // 1. Xử lý Tiers (Phân loại: Màu, Size)
  const tiers: ProductTier[] = [];
  const optionMap: Record<string, number> = {}; // Map value -> index (VD: "Đỏ" -> 0)

  if (tikiData.configurable_options && tikiData.configurable_options.length > 0) {
    tikiData.configurable_options.forEach((opt: any) => {
      const options = opt.values.map((v: any) => v.label);
      tiers.push({
        name: opt.name, // VD: "Màu sắc"
        options: options,
        images: [] // Tiki ít khi map ảnh vào tier definition, mà map vào từng variant con
      });
      
      // Tạo map index để dùng cho variant bên dưới
      opt.values.forEach((v: any, idx: number) => {
        optionMap[v.label] = idx;
      });
    });
  }

  // 2. Xử lý Variants (Biến thể con)
  let variants: ProductVariant[] = [];
  if (tikiData.configurable_products && tikiData.configurable_products.length > 0) {
    variants = tikiData.configurable_products.map((child: any) => {
      // Tìm index cho tier. VD: child có option1="Đỏ", option2="L" -> [0, 2]
      const tierIndex: number[] = [];
      
      // Tiki lưu option values trong child.option1, child.option2...
      // Cần loop qua tiers để tìm value tương ứng
      tiers.forEach((tier, tIdx) => {
        // Tiki lưu key kiểu "option1", "option2" tương ứng thứ tự options
        const childVal = child[`option${tIdx + 1}`]; 
        const optIdx = tier.options.indexOf(childVal);
        if (optIdx !== -1) tierIndex.push(optIdx);
      });

      return {
        id: String(child.id),
        price: child.price,
        originalPrice: child.original_price,
        stock: child.quantity_sold?.value ? 100 : 200, // Tiki giấu tồn kho thật, giả lập tạm
        sku: child.sku || `${tikiData.id}-${child.id}`,
        imageUrl: child.thumbnail_url,
        tierIndex: tierIndex
      };
    });
  } else {
    // Sản phẩm đơn (không biến thể) -> Tạo 1 variant mặc định
    variants.push({
      price: tikiData.price,
      stock: 100, // Fake stock
      sku: tikiData.sku,
      imageUrl: tikiData.thumbnail_url,
      tierIndex: []
    });
  }

  // 3. Xử lý Attributes (Thông số kỹ thuật)
  const attributes: Record<string, any> = {};
  if (tikiData.specifications && tikiData.specifications.length > 0) {
    tikiData.specifications.forEach((group: any) => {
      group.attributes.forEach((attr: any) => {
        attributes[attr.name] = attr.value; // VD: "Dung lượng pin": "3000mAh"
      });
    });
  }

  // 4. Return Data
  return {
    title: tikiData.name,
    description: tikiData.description, // Tiki trả sẵn HTML, rất ngon!
    price: tikiData.price,
    regularPrice: tikiData.original_price,
    discountPercent: tikiData.discount_rate,
    stockTotal: 1000, // Tiki không public stock tổng
    stock: 1000,
    
    imageUrl: tikiData.thumbnail_url,
    images: tikiData.images?.map((img: any) => img.base_url) || [],
    videos: [], // Tiki ít dùng video trong API này
    
    brand: tikiData.brand?.name,
    origin: attributes['Xuất xứ'] || undefined, // Trích xuất từ attributes nếu có
    
    attributes,
    tiers,
    variants,
    
    rating: tikiData.rating_average,
    reviewCount: tikiData.review_count,
    salesCount: tikiData.all_time_quantity_sold || 0,
    
    status: 'DRAFT',
    
    // Để Auto-map Category
    rawCategories: tikiData.breadcrumbs || [], 
  };
};