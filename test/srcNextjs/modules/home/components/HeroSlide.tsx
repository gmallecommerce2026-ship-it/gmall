import React from "react";

const HeroSlide = ({
  src,
  alt,
  width,
  top,
  left,
  zIndex,
  isDimmed,
}: {
  src: string;
  alt: string;
  width: string;
  top?: string;
  left: string;
  zIndex: number;
  isDimmed?: boolean;
}) => (
  <img
    className={`rounded-[4px] h-[124px] overflow-hidden absolute
      ${isDimmed ? "bg-black/20" : ""}
    `}
    src={src}
    alt={alt}
    style={{
      width: width,
      top: top ? top : undefined,
      left: left,
      zIndex: zIndex,
    }}
  />
);

export default HeroSlide;