'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getSafeImageUrl } from '../../util/imageUtils';

const pastelColors = [
  'bg-[#FFF0F5]', // Lavender Blush
  'bg-[#FDF2F4]', // Petal Rose
  'bg-[#FBF5E8]', // Warm Vanilla Glow
  'bg-[#F6EFFB]', // Orchid Silk
  'bg-[#EEF7F2]', // Calming Botanical Mint
  'bg-[#FFF3EC]', // Soft Peach Cream
  'bg-[#FCEBF2]', // Rose Quartz
];

const TopCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/categories');
        setCategories(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error('TOP CATEGORIES FETCH ERROR:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (categorySlug) => {
    router.push(`/customer/pages/category/${categorySlug}`);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto max-w-[1536px] px-4 lg:px-8">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-bold text-theme-primary uppercase tracking-[0.2em] block mb-1">
              Curated Departments
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Shop By Category
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Explore dermatologist tested formulas, everyday cosmetics & luxury skincare
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={scrollLeft}
              className="w-8 h-8 rounded-none border border-gray-200 hover:border-theme-dark hover:text-theme-dark text-gray-600 flex items-center justify-center transition-colors bg-white shadow-xs"
              aria-label="Scroll left"
            >
              <FiChevronLeft size={16} />
            </button>
            <button
              onClick={scrollRight}
              className="w-8 h-8 rounded-none border border-gray-200 hover:border-theme-dark hover:text-theme-dark text-gray-600 flex items-center justify-center transition-colors bg-white shadow-xs"
              aria-label="Scroll right"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Category Cards Row */}
        <div
          ref={scrollContainerRef}
          className="flex items-start gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading ? (
            Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center min-w-[110px] sm:min-w-[130px] animate-pulse">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-none bg-gray-100 mb-2"></div>
                <div className="h-3 w-16 bg-gray-100 rounded-none"></div>
              </div>
            ))
          ) : categories.length > 0 ? (
            categories.map((category, idx) => {
              const bgClass = pastelColors[idx % pastelColors.length];
              return (
                <div
                  key={category.slug || idx}
                  onClick={() => handleCategoryClick(category.slug)}
                  className="flex flex-col items-center min-w-[110px] sm:min-w-[130px] cursor-pointer group text-center flex-shrink-0"
                >
                  {/* Category Image Box */}
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-none ${bgClass} transition-all duration-300 group-hover:shadow-sm p-3 flex items-center justify-center mb-2 relative overflow-hidden border border-gray-200 group-hover:border-theme-primary`}>
                    {category.imageUrl ? (
                      <Image
                        width={100}
                        height={100}
                        src={getSafeImageUrl(category.imageUrl)}
                        alt={category.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs font-black text-gray-500 uppercase">
                        {category.name.substring(0, 3)}
                      </span>
                    )}
                  </div>

                  {/* Category Title */}
                  <span className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-theme-primary transition-colors leading-tight line-clamp-1 max-w-[140px]">
                    {category.name}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-gray-400 italic py-4">No categories found.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default TopCategories;
