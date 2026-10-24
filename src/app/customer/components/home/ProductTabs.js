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
    const list = [...current.data];
    if (active === 'sale') list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    return list.slice(0, 10);
  }, [current.data, active]);

  const tab = TABS.find((t) => t.id === active);

  return (
    <section className="py-14 sm:py-20 bg-[#FCF4F7]">
      <div className="container mx-auto max-w-[1440px] px-4 lg:px-8">
        <SectionHeader
          eyebrow="Curated for you"
          title="Shop the most-loved picks"
          subtitle="Hand-selected favourites, fresh arrivals and limited-time offers."
          href={tab.href}
        >
          <div role="tablist" aria-label="Product collections" className="flex border border-gray-200 bg-white">
            {TABS.map((t) => {
              const count = sources[t.id].data.length;
              return (
                <button
                  key={t.id}
                  id={`tab-${t.id}`}
                  role="tab"
                  aria-selected={active === t.id}
                  onClick={() => setActive(t.id)}
                  className={`relative px-4 sm:px-6 py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
                    active === t.id ? 'text-white' : 'text-gray-600 hover:text-theme-dark'
                  }`}
                >
                  {active === t.id && (
                    <motion.span
                      layoutId="product-tab-pill"
                      className="absolute inset-0 bg-theme-dark"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">
                    {t.label}
                    {count > 0 && <span className="ml-1.5 opacity-60 tabular-nums">({count})</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </SectionHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            role="tabpanel"
            aria-labelledby={`tab-${active}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
          >
            {current.loading
              ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : items.length === 0
              ? <p className="col-span-full text-center text-sm text-gray-400 py-12">No products in this collection yet.</p>
              : items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ProductTabs;
