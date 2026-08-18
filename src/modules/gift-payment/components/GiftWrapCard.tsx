import React from 'react';

interface GiftWrapCardProps {
  imageUrl: string;
  iconUrl: string;
  iconAlt: string;
  // wiki 0108: `price` vốn ĐÃ được truyền vào (trang gọi `<GiftWrapCard {...item} />` và
  // mỗi mẫu trong `giftWrapData` đều có giá), nhưng interface không khai và component
  // không vẽ ra. Kết quả: khách nhìn thấy 6 ô toàn ảnh, bấm một ô rồi bị cộng thêm
  // 30.000–50.000đ vào tổng tiền mà không chỗ nào nói trước. Giá là thứ bắt buộc phải
  // hiện trước khi người ta chọn.
  price?: number;
  selected?: boolean;
}

const GiftWrapCard: React.FC<GiftWrapCardProps> = ({ imageUrl, iconUrl, iconAlt, price, selected }) => (
  <div className="flex flex-col items-center gap-1.5 w-[87px]">
    <div
      style={{ backgroundImage: imageUrl }}
      className="flex flex-col justify-start items-end pt-[10px] pr-[11px] rounded-[20px] w-[87px] h-[95px] overflow-hidden bg-cover bg-center"
    >
      <img width="19" height="18" src={iconUrl} alt={iconAlt} className="w-[19px] h-[18px]" />
    </div>
    {typeof price === 'number' && (
      <span
        className={`text-xs font-semibold ${selected ? 'text-brand-orange' : 'text-gray-600'}`}
      >
        {price === 0 ? 'Miễn phí' : `+${price.toLocaleString('vi-VN')}đ`}
      </span>
    )}
  </div>
);

export default GiftWrapCard;
