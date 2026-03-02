// src/modules/home/components/HomeHeroSection.tsx
import React from 'react';
import HeroCarousel from './HeroCarousel';
import SubHeroCarousel from './SubHeroCarousel';
import { HeroRightSidebar } from './HeroRightSidebar';
import { HERO_SLIDES, SUB_HERO_SLIDES } from '../data/heroData';

const HomeHeroSection = () => {
  return (
    <section className="w-full bg-gray-50 mb-8">
      <div className="container mx-auto px-4 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* --- CỘT TRÁI (8 phần) --- */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* [FIX] Xóa toàn bộ rounded-[4px], overflow-hidden, shadow ở đây.
                Chỉ giữ lại kích thước layout. */}
            <div className="w-full relative h-[calc(100vh-376px)] min-h-[300px] max-h-[600px]">
              <HeroCarousel slides={HERO_SLIDES} autoPlayInterval={4000} />
            </div>

            {/* SUB CAROUSEL */}
            <div className="h-[100px] w-full rounded-[4px] overflow-hidden shadow-sm flex-shrink-0">
              <SubHeroCarousel slides={SUB_HERO_SLIDES} autoPlayInterval={6000} />
            </div>
          </div>

          {/* --- CỘT PHẢI (4 phần) --- */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="flex flex-col gap-4 h-[calc(100vh-260px)] min-h-[416px] max-h-[716px]">
              <HeroRightSidebar />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeHeroSection;