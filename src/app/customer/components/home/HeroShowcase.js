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

  // Fallback visual if the admin hasn't uploaded slider banners: real product imagery
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
    <section className="relative bg-theme-dark overflow-hidden" aria-label="Featured beauty collections">
      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] min-h-[640px] sm:min-h-[720px] lg:min-h-[780px] xl:min-h-[840px]">
        {/* Copy panel */}
        <div className="relative z-10 flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-20 py-16 lg:py-24 order-2 lg:order-1">
          {/* soft glow */}
          <div className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-theme-primary/25 blur-[130px]" />
          <div className="pointer-events-none absolute bottom-0 right-0 w-[320px] h-[320px] rounded-full bg-theme-secondary/15 blur-[110px]" />

          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.35em] text-theme-secondary mb-5"
          >
            <span className="w-8 h-px bg-theme-secondary" /> The Beauty Edit
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
                  className="absolute left-0 bg-gradient-to-r from-[#F0CA65] via-theme-secondary to-[#E5BE53] bg-clip-text text-transparent italic"
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
            className="relative mt-5 text-sm sm:text-base text-theme-dark-text/80 max-w-md leading-relaxed"
            style={{ color: 'var(--theme-dark-text)' }}
          >
            Authentic skincare, makeup and fragrances — curated for every skin type and delivered to your door.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative mt-8 flex flex-wrap gap-3"
          >
            <Link
              id="hero-shop-now"
              href="/customer/pages/allproducts"
              className="group inline-flex items-center gap-3 bg-theme-primary hover:bg-white hover:text-theme-dark text-white px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors"
            >
              Shop the collection
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#shop-by-category"
              className="inline-flex items-center gap-2 border border-white/25 hover:border-white text-white px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors"
            >
              Explore categories
            </a>
          </motion.div>

          {/* Live store stats (real counts) */}
          {(products.length > 0 || categories.length > 0) && (
            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="relative mt-10 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 max-w-md"
            >
              {[
                { k: 'Products', v: products.length },
                { k: 'Categories', v: categories.length },
                { k: 'Authentic', v: '100%' },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-white/40">{s.k}</dt>
                  <dd className="text-2xl font-black text-white tabular-nums mt-1">
                    {typeof s.v === 'number' ? <CountUp to={s.v} /> : s.v}
                    {typeof s.v === 'number' && <span className="text-theme-secondary">+</span>}
                  </dd>
                </div>
              ))}
            </motion.dl>
          )}
        </div>

        {/* Visual panel */}
        <div
          ref={ref}
          onMouseMove={onMove}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => {
            setPaused(false);
            mx.set(0);
            my.set(0);
          }}
          className="relative min-h-[420px] sm:min-h-[540px] lg:min-h-full order-1 lg:order-2 overflow-hidden"
        >
          {slidesLoading ? (
            <div className="absolute inset-0 bg-theme-dark-surface animate-pulse" />
          ) : slides.length > 0 ? (
            <>
              <AnimatePresence initial={false}>
                <motion.a
                  key={index}
                  href={slides[index].link}
                  className="absolute inset-0 block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9 }}
                >
                  <motion.div className="absolute -inset-6" style={{ x: tx, y: ty }}>
                    <motion.div
                      className="absolute inset-0"
                      initial={{ scale: 1.12 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: SLIDE_MS / 1000 + 1, ease: 'linear' }}
                    >
                      <Image
                        fill
                        unoptimized
                        priority={index === 0}
                        src={slides[index].image}
                        alt={`Featured collection ${index + 1}`}
                        className="object-cover"
                      />
                    </motion.div>
                  </motion.div>
                </motion.a>
              </AnimatePresence>

              {/* blend into copy panel */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-theme-dark to-transparent hidden lg:block" />

              {slides.length > 1 && (
                <div className="absolute bottom-0 inset-x-0 z-10 flex items-end justify-between gap-4 p-5 sm:p-7">
                  {/* progress segments */}
                  <div className="flex gap-2 flex-1 max-w-xs">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setIndex(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className="relative h-[3px] flex-1 bg-white/30 overflow-hidden"
                      >
                        {i === index && (
                          <motion.span
                            key={`${index}-${paused}`}
                            className="absolute inset-y-0 left-0 bg-white"
                            initial={{ width: '0%' }}
                            animate={{ width: paused ? '0%' : '100%' }}
                            transition={{ duration: paused ? 0 : SLIDE_MS / 1000, ease: 'linear' }}
                          />
                        )}
                        {i < index && <span className="absolute inset-0 bg-white" />}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xs font-bold tabular-nums mr-2">
                      {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                    </span>
                    <button
                      onClick={() => go(-1)}
                      aria-label="Previous slide"
                      className="w-10 h-10 bg-white/15 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-theme-dark transition-colors"
                    >
                      <FiChevronLeft />
                    </button>
                    <button
                      onClick={() => go(1)}
                      aria-label="Next slide"
                      className="w-10 h-10 bg-white/15 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-theme-dark transition-colors"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : collage.length > 0 ? (
            <motion.div className="absolute inset-0 grid grid-cols-2 gap-px bg-theme-dark-border p-px" style={{ x: tx, y: ty }}>
              {collage.map((src, i) => (
                <div key={src + i} className="relative bg-[#FBF8F7]">
                  <Image fill unoptimized src={src} alt="" className="object-contain p-8" />
                </div>
              ))}
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-theme-dark-surface via-[#3A2230] to-theme-primary" />
          )}
        </div>
      </div>
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
