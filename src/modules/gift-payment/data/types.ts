export interface IGiftWrapCard {
  imageUrl: string;
  iconUrl: string;
  iconAlt: string;
  price: number; // Spec [0018]: chỉ 30.000 hoặc 50.000
}

export interface IShippingOption {
  text: string;
  isHeader?: boolean;
  minWidth: string;
}

export interface IVoucherOption {
  text: string;
  isLarge?: boolean;
  isMediumWeight?: boolean;
  minWidth: string;
  marginTop?: string;
}

export interface IPaymentSummaryRow {
  label: string;
  value: string;
  width: string;
  isSlightlyShifted?: boolean;
  gap: string;
  valueMinWidth: string;
}