'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CustomerLayout from './customer/layout';
import { FiHome, FiSearch, FiArrowLeft, FiShoppingBag, FiStar, FiHeart } from 'react-icons/fi';

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/customer/pages/allproducts?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/customer/pages/allproducts');
    }
  };

  const popularCategories = [
    { name: 'Lipsticks & Tints', href: '/customer/pages/allproducts?search=lip' },
    { name: 'Glow Serums', href: '/customer/pages/allproducts?search=serum' },
    { name: 'Face & Blushes', href: '/customer/pages/allproducts?search=blush' },
    { name: 'Eyeshadow Palettes', href: '/customer/pages/allproducts?search=palette' },
    { name: 'Facial Tools & Rollers', href: '/customer/pages/allproducts?search=quartz' },
  ];

  return (
    <CustomerLayout>
      <div className="min-h-[75vh] flex items-center justify-center bg-gradient-to-b from-[#FFF5F8] via-white to-white py-16 px-4 relative overflow-hidden">
        {/* Subtle decorative glowing background orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-theme-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-theme-secondary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-2xl text-center relative z-10">
          {/* Star & Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-theme-light border border-theme-border text-theme-primary text-xs font-bold uppercase tracking-widest shadow-sm mb-6 animate-pulse">
            <FiStar className="text-theme-secondary fill-theme-secondary" />
            <span>Beauty Vault • 404 Error</span>
          </div>

          {/* Large Gradient 404 Headline */}
          <h1 className="text-7xl sm:text-9xl font-black tracking-tight leading-none bg-gradient-to-r from-theme-primary via-[#BE185D] to-theme-secondary bg-clip-text text-transparent select-none drop-shadow-sm">
            404
          </h1>

          {/* Headline and Description */}
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-4 mb-3">
            This Page Has Vanished From Our Vanity
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-lg mx-auto font-medium leading-relaxed mb-8">
            The beauty item or page you are looking for might have been moved, renamed, or is temporarily tucked away in our private reserve.
          </p>

          {/* Quick Search In 404 */}
          <div className="max-w-md mx-auto mb-8">
            <form onSubmit={handleSearch} className="relative flex items-center bg-white rounded-full p-1.5 shadow-md border border-gray-200 focus-within:border-theme-primary transition-all">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search beauty, skincare, or products..."
                className="w-full bg-transparent px-4 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-full bg-theme-primary hover:bg-theme-primary-hover text-white flex items-center justify-center transition-colors shadow-sm flex-shrink-0 cursor-pointer"
                aria-label="Search"
              >
                <FiSearch size={16} className="stroke-[2.5]" />
              </button>
            </form>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-theme-primary hover:bg-theme-primary-hover text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-7 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
            >
              <FiHome size={16} />
              <span>Back To Home</span>
            </Link>

            <Link
              href="/customer/pages/allproducts"
              className="inline-flex items-center gap-2 bg-white hover:bg-theme-light text-gray-800 hover:text-theme-primary border border-gray-200 text-xs sm:text-sm font-bold uppercase tracking-wider px-7 py-3.5 rounded-full transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:scale-95"
            >
              <FiShoppingBag size={16} />
              <span>Explore Collection</span>
            </Link>
          </div>

          {/* Quick Links / Popular Recommendations */}
          <div className="pt-6 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-3">
              Popular Beauty Categories
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {popularCategories.map((cat, idx) => (
                <Link
                  key={idx}
                  href={cat.href}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-theme-primary hover:text-white text-gray-700 border border-gray-200 hover:border-theme-primary transition-colors shadow-2xs"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
