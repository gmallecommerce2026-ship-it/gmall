import { api } from "./api"; // Assuming you have an axios instance exported as 'api'

export const ProductService = {
  // 1. Frequently Bought Together
  getBoughtTogether: async (id: string) => {
    const res = await api.get(`/store/products/${id}/bought-together`);
    return res.data; 
  },

  // 2. More from this Shop
  getMoreFromShop: async (id: string) => {
    const res = await api.get(`/store/products/${id}/more-from-shop`);
    return res.data;
  },

  // 3. You May Also Like (Related)
  getRelated: async (id: string) => {
    const res = await api.get(`/store/products/${id}/related`);
    return res.data;
  },

  getBoughtTogetherProducts: async (productId: string) => {
    // Giả lập API call - delay 500ms
    await new Promise(resolve => setTimeout(resolve, 500));

    // Trả về mock data (Trong thực tế bạn sẽ gọi api.get(`/products/${productId}/bought-together`))
    return [
      {
        id: 'bt-1',
        name: 'Tai nghe Bluetooth Pro Chống Ồn',
        price: 350000,
        original_price: 500000,
        images: ['/assets-product/ImageAsset10.png'], // Đảm bảo đường dẫn ảnh hợp lệ
        slug: 'tai-nghe-bluetooth'
      },
      {
        id: 'bt-2',
        name: 'Cáp Sạc Nhanh 20W Bọc Dù Siêu Bền',
        price: 99000,
        original_price: 150000,
        images: ['/assets-product/ImageAsset12.png'],
        slug: 'cap-sac-nhanh'
      }
    ];
  }
};