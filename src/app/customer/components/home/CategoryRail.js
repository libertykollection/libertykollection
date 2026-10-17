'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import SectionHeader from './SectionHeader';
import ProductCard, { ProductCardSkeleton } from './ProductCard';
import { useApi } from './homeUtils';

const CategoryRail = () => {
  const { data: categories, loading: lc } = useApi('/api/categories');
  const { data: subcategories, loading: ls } = useApi('/api/subcategories');
  const { data: products, loading: lp } = useApi('/api/products');
  const loading = lc || ls || lp;

  // Map every category to its products (via subcategory slug)
  const groups = useMemo(() => {
    return categories
      .map((cat) => {
        const slugs = new Set(subcategories.filter((s) => s.categoryId === cat.id).map((s) => s.slug));
        return { cat, items: products.filter((p) => slugs.has(p.subcategorySlug)) };
      })
      .filter((g) => g.items.length > 0)
      .sort((a, b) => b.items.length - a.items.length);
  }, [categories, subcategories, products]);

  const [activeId, setActiveId] = useState(null);
  const active = groups.find((g) => g.cat.id === activeId) || groups[0];

  const railRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateScroll = () => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 1);
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  };

  useEffect(() => {
    railRef.current?.scrollTo({ left: 0 });
    const t = setTimeout(updateScroll, 50);
    return () => clearTimeout(t);
  }, [active?.cat.id]);

  const scrollBy = (dir) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  // Mouse drag-to-scroll (desktop)
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const onDown = (e) => {
    drag.current = { down: true, x: e.pageX, left: railRef.current.scrollLeft, moved: false };
  };
  const onMove = (e) => {
    if (!drag.current.down) return;
    const dx = e.pageX - drag.current.x;
    if (Math.abs(dx) > 5) drag.current.moved = true;
    railRef.current.scrollLeft = drag.current.left - dx;
  };
  const onUp = () => (drag.current.down = false);
  const onClickCapture = (e) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  if (!loading && groups.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 bg-white overflow-hidden">
      <div className="container mx-auto max-w-[1440px] px-4 lg:px-8">
        <SectionHeader
          eyebrow="Shop the edit"
          title="Explore by department"
          subtitle="Switch departments and swipe through the full line-up."
          href={active ? `/customer/pages/category/${active.cat.slug}` : undefined}
          linkLabel={active ? `Shop all ${active.cat.name}` : 'View all'}
        />

        {/* Department pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-6">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 w-28 bg-gray-100 animate-pulse flex-shrink-0" />)
            : groups.map((g) => {
                const isActive = g.cat.id === active?.cat.id;
                return (
                  <button
                    key={g.cat.id}
                    onClick={() => setActiveId(g.cat.id)}
                    className={`relative flex-shrink-0 px-5 h-10 text-xs font-bold uppercase tracking-[0.15em] border transition-colors ${
                      isActive ? 'border-theme-primary text-white' : 'border-gray-200 text-gray-600 hover:border-theme-dark hover:text-theme-dark'
                    }`}
                  >
                    {isActive && (
                      <motion.span layoutId="rail-pill" className="absolute inset-0 bg-theme-primary" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                    )}
                    <span className="relative z-10">
                      {g.cat.name} <span className="opacity-60 tabular-nums">· {g.items.length}</span>
                    </span>
                  </button>
                );
              })}
        </div>

        {/* Rail */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={active?.cat.id || 'loading'}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
            >
              <div
                ref={railRef}
                onScroll={updateScroll}
                onMouseDown={onDown}
                onMouseMove={onMove}
                onMouseUp={onUp}
                onMouseLeave={onUp}
                onClickCapture={onClickCapture}
                className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
                style={{ scrollbarWidth: 'none' }}
              >
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="snap-start flex-shrink-0 w-[46%] sm:w-[31%] lg:w-[23%] xl:w-[19%]">
                        <ProductCardSkeleton />
                      </div>
                    ))
                  : active.items.slice(0, 16).map((p, i) => (
                      <div key={p.id} className="snap-start flex-shrink-0 w-[46%] sm:w-[31%] lg:w-[23%] xl:w-[19%]">
                        <ProductCard product={p} index={i} />
                      </div>
                    ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-[2px] bg-gray-200 relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-theme-dark"
              animate={{ width: `${Math.max(8, progress * 100)}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scrollBy(-1)}
              disabled={!canPrev}
              aria-label="Scroll products left"
              className="w-11 h-11 border border-gray-300 flex items-center justify-center hover:bg-theme-dark hover:text-white hover:border-theme-dark transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <FiChevronLeft />
            </button>
            <button
              onClick={() => scrollBy(1)}
              disabled={!canNext}
              aria-label="Scroll products right"
              className="w-11 h-11 border border-gray-300 flex items-center justify-center hover:bg-theme-dark hover:text-white hover:border-theme-dark transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryRail;
