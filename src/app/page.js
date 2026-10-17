'use client';

import React from 'react';
import Customerlayout from './customer/layout';
import { QuickViewProvider } from './customer/components/home/QuickView';
import HeroShowcase from './customer/components/home/HeroShowcase';
import MarqueeTicker from './customer/components/home/MarqueeTicker';
import CategoryBento from './customer/components/home/CategoryBento';
import ProductTabs from './customer/components/home/ProductTabs';
import DealSpotlight from './customer/components/home/DealSpotlight';
import CategoryRail from './customer/components/home/CategoryRail';
import BeautyPromise from './customer/components/home/BeautyPromise';
import BeautyJournal from './customer/components/home/BeautyJournal';
import FaqSection from './customer/components/FaqSection';

export default function CustomerPage() {
  return (
    <Customerlayout>
      <QuickViewProvider>
        <div className="bg-white">
          {/* 1. Split hero with live slider */}
          <HeroShowcase />

          {/* 2. Scrolling promise ticker */}
          <MarqueeTicker />

          {/* 3. Category bento grid */}
          <CategoryBento />

          {/* 4. Bestsellers / New In / On Sale */}
          <ProductTabs />

          {/* 5. Deal spotlight with countdown */}
          <DealSpotlight />

          {/* 6. Department rail */}
          <CategoryRail />

          {/* 7. Brand promises */}
          <BeautyPromise />

          {/* 8. Latest blog posts */}
          <BeautyJournal />

          {/* 9. FAQs */}
          <FaqSection />
        </div>
      </QuickViewProvider>
    </Customerlayout>
  );
}
