import { IGiftWrapCard } from './types';

// Spec [0018]: chỉ 30k / 50k, bỏ free và 20k. 3 mẫu thiết kế đơn giản 30k +
// 3 mẫu cao cấp 50k để khách có lựa chọn cả thẩm mỹ và mức giá.
export const giftWrapData: IGiftWrapCard[] = [
  {
    imageUrl: "url('/assets-gift-payment/ImageAsset15.png')",
    iconUrl: '/assets-gift-payment/SvgAsset19.svg',
    iconAlt: 'Svg Asset 19',
    price: 30000,
  },
  {
    imageUrl: "url('/assets-gift-payment/ImageAsset14.png')",
    iconUrl: '/assets-gift-payment/SvgAsset18.svg',
    iconAlt: 'Svg Asset 18',
    price: 30000,
  },
  {
    imageUrl: "url('/assets-gift-payment/ImageAsset13.png')",
    iconUrl: '/assets-gift-payment/SvgAsset17.svg',
    iconAlt: 'Svg Asset 17',
    price: 30000,
  },
  {
    imageUrl: "url('/assets-gift-payment/ImageAsset12.png')",
    iconUrl: '/assets-gift-payment/SvgAsset16.svg',
    iconAlt: 'Svg Asset 16',
    price: 50000,
  },
  {
    imageUrl: "url('/assets-gift-payment/ImageAsset11.png')",
    iconUrl: '/assets-gift-payment/SvgAsset15.svg',
    iconAlt: 'Svg Asset 15',
    price: 50000,
  },
  {
    imageUrl: "url('/assets-gift-payment/ImageAsset10.png')",
    iconUrl: '/assets-gift-payment/SvgAsset14.svg',
    iconAlt: 'Svg Asset 14',
    price: 50000,
  },
];
