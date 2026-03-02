import React from 'react';

interface GiftWrapCardProps {
  imageUrl: string;
  iconUrl: string;
  iconAlt: string;
}

const GiftWrapCard: React.FC<GiftWrapCardProps> = ({
  imageUrl,
  iconUrl,
  iconAlt,
}) => (
  <div
    style={{ backgroundImage: imageUrl }}
    className="flex flex-col justify-start items-end pt-[10px] pr-[11px] rounded-[20px] w-[87px] h-[95px] overflow-hidden bg-cover bg-center"
  >
    <img
      width="19"
      height="18"
      src={iconUrl}
      alt={iconAlt}
      className="w-[19px] h-[18px]"
    />
  </div>
);

export default GiftWrapCard;