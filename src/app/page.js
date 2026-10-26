'use client';

import React from 'react';
import Customerlayout from './customer/layout';
import { QuickViewProvider } from './customer/components/home/QuickView';
import HeroShowcase from './customer/components/home/HeroShowcase';
import SideHeadingSection from './customer/components/home/SideHeadingSection';
import PromoBanners from './customer/components/home/PromoBanners';
import WhatsNewSection from './customer/components/home/WhatsNewSection';
import ProductTabs from './customer/components/home/ProductTabs';
import DealSpotlight from './customer/components/home/DealSpotlight';
import CategoryBento from './customer/components/home/CategoryBento';
import BeautyPromise from './customer/components/home/BeautyPromise';
import FaqSection from './customer/components/FaqSection';
import { FiPercent } from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';

export default function CustomerPage() {
  return (
    <Customerlayout>
      <QuickViewProvider>
        <div className="bg-[#FFFDF5]">
          {/* 1. Hero Banner Slider */}
          <HeroShowcase />

          {/* 2. Signature Section: Just Launched (Side-heading + Slider) */}
          <SideHeadingSection
            icon={BsStars}
            eyebrow="✨ Freshly Launched"
            title="⚡ Just Launched"
            href="/customer/pages/allproducts?filter=new"
            apiUrl="/api/products/newArrivals"
          />

          {/* 3. Signature Section: Hurry, Limited Time Sale! (Side-heading + Slider matching uploaded design) */}
          <SideHeadingSection
            icon={FiPercent}
            eyebrow="✨ Shop More, Pay Less!"
            title="⚡ Hurry, Limited Time Sale!"
            href="/customer/pages/discounted-products"
            apiUrl="/api/products/discounted"
            isDiscounted={true}
          />

          {/* 4. Liberty Signature "Whats New" Tabbed Section matching exact screenshot */}
          <WhatsNewSection />

          {/* 5. Signature Promotional 3x2 Photographic Banners */}
          <PromoBanners />

          {/* 6. Extensive Product Catalog Showcase with Plum Bottom Action Bars */}
          <ProductTabs />

          {/* 7. Spotlight Deal of the Day with Countdown Timer */}
          <DealSpotlight />

          {/* 7. Category Bento Grid with Rounded Luxury Cards */}
          <CategoryBento />

          {/* 8. Brand Beauty Promises (Fast shipping, Authentic, 24/7 Support) */}
          <BeautyPromise />

          {/* 9. Frequently Asked Questions */}
          <FaqSection />
        </div>
      </QuickViewProvider>
    </Customerlayout>
  );
}
