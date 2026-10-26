'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard, { ProductCardSkeleton } from './ProductCard';
import { useApi } from './homeUtils';

const SideHeadingSection = ({
  icon: Icon,
  eyebrow = '✨ Shop More, Pay Less!',
  title = '⚡ Hurry, Limited Time Sale!',
  href = '/customer/pages/allproducts',
  apiUrl = '/api/products/newArrivals',
  isDiscounted = false,
}) => {
  const { data, loading } = useApi(apiUrl);
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const fetched = isDiscounted
    ? [...data].filter((p) => (p.discount || 0) > 0).slice(0, 10)
    : [...data].slice(0, 10);

  // If not loading and no real products exist in database, do not render dummy data
  if (!loading && fetched.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 bg-[#FFFDF5] border-b border-[#EAE3D5]/50 overflow-hidden">
      <div className="container mx-auto max-w-[1536px] px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] xl:grid-cols-[240px_1fr] gap-6 lg:gap-10 items-center">
          {/* Left Column: Side Heading Title Card matching screenshot */}
          <div className="flex flex-col justify-center text-center lg:text-left pr-0 lg:pr-2">
            {Icon && (
              <div className="w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center mx-auto lg:mx-0 mb-3 shadow-xs">
                <Icon size={17} />
              </div>
            )}

            <span className="text-[12px] font-semibold text-[#D97706] tracking-tight flex items-center gap-1 justify-center lg:justify-start mb-0.5">
              {eyebrow}
            </span>

            <h2 className="text-2xl sm:text-[27px] font-bold text-[#1A1A1A] font-display mt-0.5 leading-tight">
              {title}
            </h2>

            <Link
              href={href}
              className="inline-flex items-center justify-center lg:justify-start gap-1 text-[13px] font-medium text-[#77104C] hover:underline transition-colors mt-3 group"
            >
              <span>See More</span>
              <span className="text-sm transition-transform group-hover:translate-x-0.5">&rsaquo;</span>
            </Link>

            {/* Slider Navigation Arrows */}
            <div className="hidden lg:flex items-center gap-2 mt-5">
              <button
                onClick={() => scroll('left')}
                aria-label="Scroll left"
                className="w-8 h-8 rounded-full bg-white border border-[#EAE3D5] text-[#222222] hover:bg-[#77104C] hover:text-white hover:border-[#77104C] flex items-center justify-center transition-all shadow-xs"
              >
                <FiChevronLeft size={15} />
              </button>
              <button
                onClick={() => scroll('right')}
                aria-label="Scroll right"
                className="w-8 h-8 rounded-full bg-white border border-[#EAE3D5] text-[#222222] hover:bg-[#77104C] hover:text-white hover:border-[#77104C] flex items-center justify-center transition-all shadow-xs"
              >
                <FiChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Right Column: Horizontal Product Slider matching screenshot */}
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex gap-5 sm:gap-6 overflow-x-auto scrollbar-hide py-2 scroll-smooth"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[250px] sm:w-[275px] lg:w-[285px] flex-shrink-0"
                  >
                    <ProductCardSkeleton />
                  </div>
                ))
              ) : (
                fetched.map((product, index) => (
                  <div
                    key={product.id || index}
                    className="w-[250px] sm:w-[275px] lg:w-[285px] flex-shrink-0"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <ProductCard product={product} index={index} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SideHeadingSection;
