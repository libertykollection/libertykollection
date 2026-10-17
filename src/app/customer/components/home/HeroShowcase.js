'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useApi, parseImages } from './homeUtils';
import { getSafeImageUrl } from '../../../util/imageUtils';

const WORDS = ['Radiance', 'Confidence', 'Glow', 'Elegance'];
const SLIDE_MS = 6000;

const HeroShowcase = () => {
  const { data: slidesRaw, loading: slidesLoading } = useApi('/api/slider');
  const { data: products } = useApi('/api/products');
  const { data: categories } = useApi('/api/categories');
  const { data: topRated } = useApi('/api/products/topRated');

  const slides = slidesRaw
    .filter((s) => s.imgurl)
    .map((s) => ({ image: getSafeImageUrl(s.imgurl), link: s.link || '/customer/pages/allproducts' }));

  // Fallback visual if no slides exist
  const collage = topRated.flatMap((p) => parseImages(p).slice(0, 1)).slice(0, 4);

  const [index, setIndex] = useState(0);
  const [word, setWord] = useState(0);
  const [paused, setPaused] = useState(false);

  // Rotating headline word
  useEffect(() => {
    const t = setInterval(() => setWord((w) => (w + 1) % WORDS.length), 2600);
    return () => clearInterval(t);
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [index, slides.length, paused]);

  const go = useCallback(
    (dir) => slides.length && setIndex((i) => (i + dir + slides.length) % slides.length),
    [slides.length]
  );

  // Mouse parallax
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 20 });
  const sy = useSpring(my, { stiffness: 80, damping: 20 });
  const tx = useTransform(sx, (v) => v * -18);
  const ty = useTransform(sy, (v) => v * -12);
  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        mx.set(0);
        my.set(0);
      }}
      className="relative bg-[#141311] overflow-hidden min-h-[640px] sm:min-h-[720px] lg:min-h-[780px] xl:min-h-[840px] flex items-center"
      aria-label="Featured beauty collections"
    >
      {/* 1. Full-Width Background Slider Imagery */}
      <div className="absolute inset-0 overflow-hidden">
        {slidesLoading ? (
          <div className="absolute inset-0 bg-[#1A1815] animate-pulse" />
        ) : slides.length > 0 ? (
          <AnimatePresence initial={false}>
            <motion.div
              key={index}
              className="absolute inset-0 block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
            >
              <motion.div className="absolute -inset-6" style={{ x: tx, y: ty }}>
                <motion.div
                  className="absolute inset-0"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: SLIDE_MS / 1000 + 1, ease: 'linear' }}
                >
                  <Image
                    fill
                    unoptimized
                    priority={index === 0}
                    src={slides[index].image}
                    alt={`Featured collection ${index + 1}`}
                    className="object-cover object-center lg:object-right"
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        ) : collage.length > 0 ? (
          <div className="absolute inset-0 grid grid-cols-2 opacity-30">
            {collage.map((src, i) => (
              <div key={src + i} className="relative">
                <Image fill unoptimized src={src} alt="" className="object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#141311] via-[#2A2318] to-[#141311]" />
        )}

        {/* 2. Transparent Luxury Overlays: Soft dark transparent on the left, fully transparent on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141311]/95 via-[#141311]/75 via-40% to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141311]/90 via-transparent to-[#141311]/40 pointer-events-none" />
        
        {/* Soft Gold Ambient Glows */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#B98C2D]/20 blur-[130px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-[360px] h-[360px] rounded-full bg-[#D2AA2D]/15 blur-[120px]" />
      </div>

      {/* 3. Foreground Content with Transparent Background */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 py-20 lg:py-28">
        <div className="max-w-2xl backdrop-blur-[2px] bg-[#141311]/30 p-4 sm:p-8 rounded-none border border-white/5 shadow-2xl">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.35em] text-[#D2AA2D] mb-5"
          >
            <span className="w-8 h-px bg-[#D2AA2D]" /> The Beauty Edit
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative text-4xl sm:text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight"
          >
            Reveal Your
            <span className="block h-[1.15em] overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.span
                  key={WORDS[word]}
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  exit={{ y: '-100%', opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 bg-gradient-to-r from-[#F0CA65] via-[#D2AA2D] to-[#E5BE53] bg-clip-text text-transparent italic"
                >
                  {WORDS[word]}.
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mt-5 text-sm sm:text-base text-[#E5DFD0]/90 max-w-lg leading-relaxed font-light"
          >
            Authentic skincare, makeup and fragrances — curated for every skin type and delivered to your door.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative mt-8 flex flex-wrap items-center gap-4"
          >
            <Link
              id="hero-shop-now"
              href={slides[index]?.link || '/customer/pages/allproducts'}
              className="group inline-flex items-center gap-3 bg-[#B98C2D] hover:bg-white hover:text-[#141311] text-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-lg shadow-[#B98C2D]/20 active:scale-95"
            >
              Shop the collection
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#shop-by-category"
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-all backdrop-blur-md bg-white/5 hover:bg-white/10"
            >
              Explore categories
            </a>
          </motion.div>

          {/* Live store stats */}
          {(products.length > 0 || categories.length > 0) && (
            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="relative mt-10 pt-7 border-t border-white/15 grid grid-cols-3 gap-6 max-w-md"
            >
              {[
                { k: 'Products', v: products.length },
                { k: 'Categories', v: categories.length },
                { k: 'Authentic', v: '100%' },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-white/50">{s.k}</dt>
                  <dd className="text-2xl font-black text-white tabular-nums mt-1">
                    {typeof s.v === 'number' ? <CountUp to={s.v} /> : s.v}
                    {typeof s.v === 'number' && <span className="text-[#D2AA2D]">+</span>}
                  </dd>
                </div>
              ))}
            </motion.dl>
          )}
        </div>
      </div>

      {/* 4. Controls & Pagination overlay */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 right-6 sm:right-10 lg:right-16 z-20 flex items-center gap-4 bg-[#141311]/70 backdrop-blur-md px-4 py-2 border border-white/10">
          {/* Progress bar */}
          <div className="hidden sm:flex gap-1.5 w-28">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="relative h-[2.5px] flex-1 bg-white/20 overflow-hidden cursor-pointer"
              >
                {i === index && (
                  <motion.span
                    key={`${index}-${paused}`}
                    className="absolute inset-y-0 left-0 bg-[#D2AA2D]"
                    initial={{ width: '0%' }}
                    animate={{ width: paused ? '0%' : '100%' }}
                    transition={{ duration: paused ? 0 : SLIDE_MS / 1000, ease: 'linear' }}
                  />
                )}
                {i < index && <span className="absolute inset-0 bg-[#D2AA2D]" />}
              </button>
            ))}
          </div>

          {/* Slide counter */}
          <span className="text-white text-xs font-mono font-bold tracking-wider">
            {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </span>

          {/* Navigation arrows */}
          <div className="flex items-center gap-1.5 border-l border-white/15 pl-3">
            <button
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="w-8 h-8 rounded-none bg-white/10 hover:bg-[#B98C2D] text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <FiChevronLeft size={16} />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next slide"
              className="w-8 h-8 rounded-none bg-white/10 hover:bg-[#B98C2D] text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

// Animated number that counts up once when mounted
const CountUp = ({ to, duration = 1200 }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <>{n}</>;
};

export default HeroShowcase;
