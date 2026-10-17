'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { FiShoppingBag, FiCheck, FiEye, FiArrowRight } from 'react-icons/fi';
import { addToCart } from '../../../store/cartSlice';
import { useQuickView } from './QuickView';
import SectionHeader from './SectionHeader';
import { useApi, parseImages, formatPrice, getOriginalPrice, productHref, stripHtml } from './homeUtils';

// Countdown to local midnight — "today's offers" refresh window
const useMidnightCountdown = () => {
  const calc = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(24, 0, 0, 0);
    const diff = Math.max(0, end - now);
    return {
      h: Math.floor(diff / 3.6e6),
      m: Math.floor((diff % 3.6e6) / 6e4),
      s: Math.floor((diff % 6e4) / 1000),
    };
  };
  const [t, setT] = useState(null);
  useEffect(() => {
    setT(calc());
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
};

const TimeBox = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-white/5 border border-white/15 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="text-xl sm:text-2xl font-black text-white tabular-nums"
        >
          {String(value).padStart(2, '0')}
        </motion.span>
      </AnimatePresence>
    </div>
    <span className="mt-1.5 text-[9px] uppercase tracking-[0.25em] text-white/40">{label}</span>
  </div>
);

const DealSpotlight = () => {
  const { data, loading } = useApi('/api/products/discounted');
  const dispatch = useDispatch();
  const { open } = useQuickView();
  const countdown = useMidnightCountdown();

  const deals = useMemo(
    () =>
      [...data]
        .filter((p) => parseImages(p).length > 0)
        .sort((a, b) => (b.discount || 0) - (a.discount || 0))
        .slice(0, 5),
    [data]
  );

  const [selected, setSelected] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => setImgIdx(0), [selected]);

  if (loading || deals.length === 0) return null;

  const deal = deals[Math.min(selected, deals.length - 1)];
  const images = parseImages(deal);
  const original = getOriginalPrice(deal);
  const saved = original ? original - deal.price : 0;

  const handleAdd = () => {
    dispatch(addToCart(deal));
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <section className="relative py-14 sm:py-20 bg-theme-dark overflow-hidden">
      <div className="pointer-events-none absolute -right-40 top-10 w-[520px] h-[520px] rounded-full bg-theme-primary/20 blur-[140px]" />
      <div className="pointer-events-none absolute -left-20 bottom-0 w-[360px] h-[360px] rounded-full bg-theme-secondary/10 blur-[120px]" />

      <div className="relative container mx-auto max-w-[1440px] px-4 lg:px-8">
        <SectionHeader
          dark
          eyebrow="Limited-time offers"
          title="Deal spotlight"
          subtitle="Our biggest savings right now — tap any offer to preview it."
          href="/customer/pages/discounted-products"
          linkLabel="All offers"
        />

        <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.75fr)] gap-6 lg:gap-8 items-stretch">
          {/* Gallery */}
          <div className="bg-[#FBF8F7] relative flex flex-col">
            <div className="relative aspect-square">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${deal.id}-${imgIdx}`}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                >
                  <Image fill unoptimized src={images[imgIdx] || images[0]} alt={deal.name} className="object-contain p-8 sm:p-12" />
                </motion.div>
              </AnimatePresence>
              <motion.div
                key={deal.id}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="absolute top-4 left-4 w-20 h-20 bg-theme-primary text-white flex flex-col items-center justify-center"
              >
                <span className="text-2xl font-black leading-none">{Math.round(deal.discount)}%</span>
                <span className="text-[9px] font-bold uppercase tracking-widest">Off</span>
              </motion.div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 border-t border-gray-200 overflow-x-auto no-scrollbar">
                {images.slice(0, 5).map((src, i) => (
                  <button
                    key={src + i}
                    onMouseEnter={() => setImgIdx(i)}
                    onClick={() => setImgIdx(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`relative w-14 h-14 bg-white border-2 flex-shrink-0 ${i === imgIdx ? 'border-theme-primary' : 'border-transparent'}`}
                  >
                    <Image fill unoptimized src={src} alt="" className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col justify-center text-white"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-theme-secondary mb-3">Today&apos;s featured deal</span>
              <h3 className="text-2xl sm:text-3xl font-black leading-tight mb-4">{deal.name}</h3>
              {deal.description && (
                <p className="text-sm text-white/60 leading-relaxed mb-6 line-clamp-3">{stripHtml(deal.description)}</p>
              )}

              <div className="flex items-end gap-4 mb-2">
                <span className="text-4xl font-black tabular-nums">Rs. {formatPrice(deal.price)}</span>
                {original && <span className="text-lg text-white/40 line-through tabular-nums mb-1">Rs. {formatPrice(original)}</span>}
              </div>
              {saved > 0 && (
                <span className="inline-block self-start bg-theme-secondary/20 text-theme-secondary text-xs font-bold px-3 py-1 mb-6">
                  You save Rs. {formatPrice(saved)}
                </span>
              )}

              {countdown && (
                <div className="mb-7">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-3">Today&apos;s offers refresh in</p>
                  <div className="flex gap-2">
                    <TimeBox value={countdown.h} label="Hrs" />
                    <TimeBox value={countdown.m} label="Min" />
                    <TimeBox value={countdown.s} label="Sec" />
                  </div>
                </div>
              )}

              {deal.stock > 0 && deal.stock <= 20 && (
                <div className="mb-6 max-w-sm">
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="text-white/60">Hurry — limited stock</span>
                    <span className="font-bold text-theme-secondary">{deal.stock} left</span>
                  </div>
                  <div className="h-1 bg-white/10">
                    <motion.div
                      className="h-full bg-gradient-to-r from-theme-primary to-theme-secondary"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(8, (deal.stock / 20) * 100)}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  id="deal-add-to-bag"
                  onClick={handleAdd}
                  disabled={deal.stock === 0}
                  className={`flex-1 sm:flex-none sm:px-10 h-12 inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors disabled:opacity-40 ${
                    added ? 'bg-emerald-600' : 'bg-theme-primary hover:bg-white hover:text-theme-dark'
                  }`}
                >
                  {added ? <FiCheck /> : <FiShoppingBag />} {deal.stock === 0 ? 'Sold out' : added ? 'Added' : 'Add to bag'}
                </button>
                <button
                  onClick={() => open(deal)}
                  aria-label="Quick view deal"
                  className="w-12 h-12 border border-white/25 hover:border-white flex items-center justify-center transition-colors"
                >
                  <FiEye />
                </button>
                <Link
                  href={productHref(deal)}
                  aria-label="Open deal page"
                  className="w-12 h-12 border border-white/25 hover:border-white flex items-center justify-center transition-colors"
                >
                  <FiArrowRight />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Deal selector */}
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible no-scrollbar">
            {deals.map((d, i) => {
              const img = parseImages(d)[0];
              const isActive = i === selected;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelected(i)}
                  className={`group relative flex items-center gap-3 p-2.5 text-left min-w-[240px] lg:min-w-0 border transition-all ${
                    isActive ? 'bg-white/10 border-theme-secondary' : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  {isActive && <motion.span layoutId="deal-active-bar" className="absolute left-0 top-0 bottom-0 w-[3px] bg-theme-secondary" />}
                  <div className="relative w-16 h-16 bg-[#FBF8F7] flex-shrink-0">
                    {img && <Image fill unoptimized src={img} alt="" className="object-contain p-1.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">{d.name}</p>
                    <p className="mt-1 text-xs">
                      <span className="font-black text-white tabular-nums">Rs. {formatPrice(d.price)}</span>
                      <span className="ml-2 text-theme-secondary font-bold">-{Math.round(d.discount)}%</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DealSpotlight;
