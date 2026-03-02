// src/modules/home/components/InteractiveHeroStack.tsx
"use client";

import React, { useState } from "react";

// Định nghĩa kiểu cho một slide, dựa trên cấu trúc của data3
interface SlideItem {
  dataField13: string; // src
  dataField14: string; // alt
  dataField15: string; // width (px)
  dataField16: boolean; // top (1px)
  dataField17: string; // left (px)
  dataField18: string; // zIndex
  dataField19: boolean; // isDimmed
}

interface InteractiveHeroStackProps {
  slides: SlideItem[];
}

const brightnessLookup: { [key: number]: string } = {
  0: "brightness-100", 
  1: "brightness-75",  
  4: "brightness-50", 
  3: "brightness-50", 
  2: "brightness-50", 
};

const InteractiveHeroStack: React.FC<InteractiveHeroStackProps> = ({ slides }) => {
  const [activeIndex, setActiveIndex] = useState(0); 
  const numSlides = slides.length;
  const containerWidth = 1092; 

  const positionStyles = slides.map(item => ({
    width: (parseFloat(item.dataField15) / containerWidth) * 100, 
    left: (parseFloat(item.dataField17 || "0") / containerWidth) * 100, 
    top: item.dataField16 ? "1px" : undefined,
    zIndex: parseInt(item.dataField18),
  }));

  const styleLookup = [
    positionStyles[0],
    positionStyles[1],
    positionStyles[4], 
    positionStyles[3], 
    positionStyles[2]  
  ];

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % numSlides);
  };

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + numSlides) % numSlides);
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="relative w-full max-w-[1092px] h-[125px] group">
      <button
        onClick={goToPrevious}
        className="absolute top-1/2 -translate-y-1/2 left-4 z-[99] p-2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label="Previous Slide"
      >
        {/* SVG Chevron Left */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {slides.map((slide, slideIndex) => {
        const relativeIndex = (slideIndex - activeIndex + numSlides) % numSlides;
        const styleProps = styleLookup[relativeIndex];
        const brightnessClass = brightnessLookup[relativeIndex] || 'brightness-50';

        if (!styleProps) return null;

        return (
          <img
            key={slide.dataField14}
            src={slide.dataField13}
            alt={slide.dataField14}
            onClick={() => goToSlide(slideIndex)}
            className={`
              rounded-[4px] h-[124px] overflow-hidden absolute
              transition-all duration-500 ease-in-out cursor-pointer
              ${brightnessClass}
            `}
            style={{
              width: `${styleProps.width}%`,
              top: styleProps.top,
              left: `${styleProps.left}%`,
              zIndex: styleProps.zIndex,
            }}
          />
        );
      })}

      <button
        onClick={goToNext}
        className="absolute top-1/2 -translate-y-1/2 right-4 z-[99] p-2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label="Next Slide"
      >
        {/* SVG Arrow Right */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
};

export default InteractiveHeroStack;