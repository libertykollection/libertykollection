'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard, { ProductCardSkeleton } from './ProductCard';
import { useApi } from './homeUtils';

const WhatsNewSection = () => {
  const { data: products, loading: productsLoading } = useApi('/api/products/newArrivals');
  const { data: categories, loading: categoriesLoading } = useApi('/api/categories');

  // Category filter state: 'all' or category slug / id
  const [activeTab, setActiveTab] = useState('all');

  // Build clean tabs list from real DB categories
  const tabs = useMemo(() => {
    const list = [{ id: 'all', label: 'All Products', slug: 'all' }];
    if (Array.isArray(categories)) {
      categories.forEach((cat) => {
        list.push({
          id: cat.slug || String(cat.id),
          label: cat.name,
          slug: cat.slug,
          catId: cat.id,
        });
      });
    }
    return list;
  }, [categories]);

  // Filter products based on activeTab
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    if (activeTab === 'all') return products.slice(0, 8);

    return products
      .filter((p) => {
        const pCatSlug =
          p.subcategory?.category?.slug ||
          p.subcategory?.slug ||
          p.category?.slug;
        const pCatName =
          p.subcategory?.category?.name ||
          p.subcategory?.name ||
          p.category?.name ||
          '';

        const selectedTab = tabs.find((t) => t.id === activeTab);
        if (!selectedTab) return false;

        return (
          pCatSlug === selectedTab.slug ||
          pCatName.toLowerCase().includes(selectedTab.label.toLowerCase()) ||
          selectedTab.label.toLowerCase().includes(pCatName.toLowerCase())
        );
      })
      .slice(0, 8);
  }, [products, activeTab, tabs]);

  // If not loading and no products in database, hide gracefully
  if (!productsLoading && (!products || products.length === 0)) {
    return null;
  }

  return (
    <section className="py-14 sm:py-20 bg-[#FFFDF5] border-b border-[#EAE3D5]/50 overflow-hidden">
      <div className="container mx-auto max-w-[1536px] px-4 lg:px-8">
        {/* Section Heading matching screenshot */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-[34px] font-bold font-display text-[#1F1F1F] tracking-tight">
            Whats New
          </h2>

          {/* Category Tabs Bar (Centered underneath Whats New) */}
          {tabs.length > 1 && (
            <div className="flex items-center justify-center gap-6 sm:gap-10 mt-5 mb-10 sm:mb-12 flex-wrap">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-[11.5px] sm:text-[12.5px] uppercase font-semibold tracking-[0.18em] transition-all relative pb-1 ${
                      isActive
                        ? 'text-[#1F1F1F] font-bold border-b-2 border-[#1F1F1F]'
                        : 'text-[#888888] hover:text-[#1F1F1F] font-medium'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 4-Column Product Grid matching screenshot */}
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7"
            >
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, i) => (
                  <ProductCard key={product.id || i} product={product} index={i} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-sm text-gray-400">
                  No products in this department yet.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
};

export default WhatsNewSection;
