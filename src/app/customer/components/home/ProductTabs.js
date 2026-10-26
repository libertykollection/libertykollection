'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SectionHeader from './SectionHeader';
import ProductCard, { ProductCardSkeleton } from './ProductCard';
import { useApi } from './homeUtils';

const TABS = [
  { id: 'best', label: 'Bestsellers', url: '/api/products/topRated', href: '/customer/pages/allproducts' },
  { id: 'new', label: 'New In', url: '/api/products/newArrivals', href: '/customer/pages/allproducts' },
  { id: 'sale', label: 'On Sale', url: '/api/products/discounted', href: '/customer/pages/discounted-products' },
];

const ProductTabs = () => {
  const [active, setActive] = useState('best');
  const best = useApi(TABS[0].url);
  const fresh = useApi(TABS[1].url);
  const sale = useApi(TABS[2].url);

  const sources = { best, new: fresh, sale };
  const current = sources[active];

  const items = useMemo(() => {
    let list = [...current.data];
    if (active === 'sale') list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    return list.slice(0, 10);
  }, [current.data, active]);

  const hasAnyData = best.data.length > 0 || fresh.data.length > 0 || sale.data.length > 0;
  const anyLoading = best.loading || fresh.loading || sale.loading;

  // Don't render empty section with fake data if no products exist
  if (!anyLoading && !hasAnyData) {
    return null;
  }

  const tab = TABS.find((t) => t.id === active);

  return (
    <section className="py-14 sm:py-20 bg-[#FFFDF5] border-b border-[#EAE3D5]/50 overflow-hidden">
      <div className="container mx-auto max-w-[1536px] px-4 lg:px-8">
        <SectionHeader
          eyebrow="✨ Freshly Launched & Curated"
          title="Most-Loved Beauty Essentials"
          subtitle="Explore trending cosmetics, verified skincare, and exclusive deals."
          href={tab.href}
        >
          <div role="tablist" aria-label="Product collections" className="flex border border-[#EAE3D5] bg-white rounded-full p-1 shadow-xs">
            {TABS.map((t) => (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                role="tab"
                aria-selected={active === t.id}
                onClick={() => setActive(t.id)}
                className={`relative px-4 sm:px-6 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${
                  active === t.id ? 'text-white' : 'text-gray-700 hover:text-[#77104C]'
                }`}
              >
                {active === t.id && (
                  <motion.span
                    layoutId="active-product-tab"
                    className="absolute inset-0 bg-[#77104C] rounded-full shadow-xs"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            ))}
          </div>
        </SectionHeader>

        {current.loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7"
            >
              {items.map((product, i) => (
                <ProductCard key={product.id || i} product={product} index={i} showBottomBar={true} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
};

export default ProductTabs;
