// TS-fix wiki 0031: IGiftWrapCard.price required (spec 0018: 30k/50k) — bổ sung mặc định 30000
import { IGiftWrapCard } from './types';

export const greetingCardData: IGiftWrapCard[] = [
  {
    imageUrl: "url('/assets-gift-payment/ImageAsset20.png')",
    iconUrl: '/assets-gift-payment/SvgAsset24.svg',
    iconAlt: 'Svg Asset 24',
    price: 30000,
  },
  {
    imageUrl: "url('/assets-gift-payment/ImageAsset19.png')",
    iconUrl: '/assets-gift-payment/SvgAsset23.svg',
    iconAlt: 'Svg Asset 23',
    price: 30000,
  },
  {
    imageUrl: "url('/assets-gift-payment/ImageAsset18.png')",
    iconUrl: '/assets-gift-payment/SvgAsset22.svg',
    iconAlt: 'Svg Asset 22',
    price: 30000,
  },
  {
    imageUrl: "url('/assets-gift-payment/ImageAsset17.png')",
    iconUrl: '/assets-gift-payment/SvgAsset21.svg',
    iconAlt: 'Svg Asset 21',
    price: 30000,
  },
];
