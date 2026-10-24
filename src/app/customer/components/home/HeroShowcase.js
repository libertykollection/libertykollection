'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import { useApi, parseImages } from './homeUtils';
import { getSafeImageUrl } from '../../../util/imageUtils';

const WORDS = ['Radiance', 'Confidence', 'Glow', 'Elegance'];
const SLIDE_MS = 6000;

/* ── Decorative floating orbs for the no-image hero ── */
const ORBS = [
  { w: 520, h: 520, top: '-15%', left: '-8%',  color: 'rgba(197,50,97,0.18)',   blur: 140, delay: 0 },
  { w: 380, h: 380, top: '50%',  right: '-5%',  color: 'rgba(197,160,89,0.14)', blur: 120, delay: 1.5 },
  { w: 280, h: 280, top: '10%',  right: '20%',  color: 'rgba(197,50,97,0.10)',  blur: 90,  delay: 0.8 },
  { w: 200, h: 200, bottom: '5%',left: '30%',   color: 'rgba(197,160,89,0.12)', blur: 80,  delay: 2.2 },
];

/* ── Floating sparkle dots ── */
const DOTS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  size: Math.random() * 3 + 1.5,
  top:  Math.random() * 90 + 5,
  left: Math.random() * 90 + 5,
  dur:  Math.random() * 4 + 3,
  delay: Math.random() * 4,
  opacity: Math.random() * 0.35 + 0.1,
}));

const HeroShowcase = () => {
  const { data: slidesRaw, loading: slidesLoading } = useApi('/api/slider');
  const { data: products }   = useApi('/api/products');
  const { data: categories } = useApi('/api/categories');
  const { data: topRated }   = useApi('/api/products/topRated');

  const slides = slidesRaw
    .filter((s) => s.imgurl)
    .map((s) => ({ image: getSafeImageUrl(s.imgurl), link: s.link || '/customer/pages/allproducts' }));

  /* fallback product collage */
  const collage = topRated.flatMap((p) => parseImages(p).slice(0, 1)).slice(0, 6);

  const [index,  setIndex]  = useState(0);
  const [word,   setWord]   = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir,    setDir]    = useState(1); // for slide direction

  /* rotating headline */
  useEffect(() => {
    const t = setInterval(() => setWord((w) => (w + 1) % WORDS.length), 2800);
    return () => clearInterval(t);
  }, []);

  /* auto-advance */
  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const t = setTimeout(() => {
      setDir(1);
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_MS);
    return () => clearTimeout(t);
  }, [index, slides.length, paused]);

  const go = useCallback((d) => {
    if (!slides.length) return;
    setDir(d);
    setIndex((i) => (i + d + slides.length) % slides.length);
  }, [slides.length]);

  /* mouse parallax */
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const tx = useTransform(sx, (v) => v * -20);
  const ty = useTransform(sy, (v) => v * -14);
  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width  - 0.5);
    my.set((e.clientY - r.top)  / r.height - 0.5);
  };

  /* slide transition variants */
  const slideVariants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? '4%' : '-4%' }),
    center: { opacity: 1, x: 0 },
    exit:  (d) => ({ opacity: 0, x: d > 0 ? '-4%' : '4%' }),
  };

  const hasSlides   = slides.length > 0;
  const hasCollage  = collage.length >= 2;

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); mx.set(0); my.set(0); }}
      className="relative overflow-hidden flex items-center"
      style={{
        minHeight: 'clamp(600px, 88vh, 900px)',
        background: hasSlides
          ? '#0e0c0d'
          : 'linear-gradient(135deg, #100D0F 0%, #1B1018 35%, #22121A 60%, #0E0C10 100%)',
      }}
      aria-label="Featured beauty collections"
    >
      {/* ─── Background ─────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden">

        {/* A) Slider images */}
        {slidesLoading ? (
          <div className="absolute inset-0 animate-pulse" style={{ background: 'linear-gradient(135deg,#1a1215,#1c1018)' }} />
        ) : hasSlides ? (
          <AnimatePresence initial={false} custom={dir}>
            <motion.div
              key={index}
              className="absolute inset-0"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.95, ease: [0.32, 0.72, 0, 1] }}
            >
              <motion.div className="absolute -inset-8" style={{ x: tx, y: ty }}>
                <motion.div
                  className="absolute inset-0"
                  initial={{ scale: 1.08 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: SLIDE_MS / 1000 + 1.5, ease: 'linear' }}
                >
                  <Image
                    fill unoptimized
                    priority={index === 0}
                    src={slides[index].image}
                    alt={`Featured collection ${index + 1}`}
                    className="object-cover"
                    style={{ objectPosition: 'center 20%' }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

        ) : hasCollage ? (
          /* B) Product collage mosaic */
          <div className="absolute inset-0 grid gap-1" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            {collage.slice(0, 6).map((src, i) => (
              <div key={src + i} className="relative overflow-hidden">
                <Image fill unoptimized src={src} alt="" className="object-cover scale-110" />
                <div className="absolute inset-0 bg-[#100D0F]/50" />
              </div>
            ))}
          </div>

        ) : (
          /* C) Pure gradient fallback – animated decorative orbs */
          <>
            {ORBS.map((o, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: o.w, height: o.h,
                  top: o.top, left: o.left, right: o.right, bottom: o.bottom,
                  background: o.color,
                  filter: `blur(${o.blur}px)`,
                }}
                animate={{ scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 6 + i, repeat: Infinity, delay: o.delay, ease: 'easeInOut' }}
              />
            ))}

            {/* Decorative grid lines */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: `
                linear-gradient(rgba(197,160,89,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(197,160,89,0.04) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
            }} />

            {/* Floating sparkle dots */}
            {DOTS.map((d) => (
              <motion.div
                key={d.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: d.size, height: d.size,
                  top: `${d.top}%`, left: `${d.left}%`,
                  background: d.id % 3 === 0 ? '#C5A059' : '#C53261',
                  opacity: d.opacity,
                }}
                animate={{ opacity: [d.opacity, d.opacity * 2.5, d.opacity], y: [-6, 6, -6] }}
                transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: 'easeInOut' }}
              />
            ))}
          </>
        )}

        {/* ── Gradient overlays (always on top of bg) ── */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: hasSlides
            ? 'linear-gradient(to right, rgba(14,12,13,0.96) 0%, rgba(14,12,13,0.82) 45%, rgba(14,12,13,0.35) 75%, rgba(14,12,13,0.10) 100%)'
            : 'linear-gradient(to right, rgba(14,12,13,0.55) 0%, rgba(14,12,13,0.15) 100%)',
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(to top, rgba(14,12,13,0.85) 0%, transparent 40%, rgba(14,12,13,0.30) 100%)',
        }} />
      </div>

      {/* ─── Foreground content ─────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 py-24 lg:py-32">
        <div className="max-w-[640px]">

          {/* Eyebrow label */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="flex items-center gap-1.5">
              {[0,1,2].map((i) => (
                <FiStar key={i} size={10} fill="#C5A059" color="#C5A059" />
              ))}
            </span>
            <span className="h-px w-10 bg-gradient-to-r from-[#C5A059] to-transparent" />
            <span className="text-[10.5px] font-bold uppercase tracking-[0.38em] text-[#C5A059]">
              The Beauty Edit
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-[#C5A059] to-transparent" />
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.1 }}
            style={{
              fontFamily: 'var(--font-display-stack)',
              fontSize: 'clamp(2.8rem, 6.5vw, 5rem)',
              fontWeight: 600,
              lineHeight: 1.04,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
            }}
          >
            Reveal Your
            <span className="block relative h-[1.18em] overflow-hidden mt-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={WORDS[word]}
                  initial={{ y: '110%', opacity: 0, rotateX: -15 }}
                  animate={{ y: '0%',   opacity: 1, rotateX: 0 }}
                  exit={  { y: '-110%', opacity: 0, rotateX: 15 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0"
                  style={{
                    fontStyle: 'italic',
                    fontWeight: 500,
                    background: 'linear-gradient(110deg, #F5D778 0%, #C5A059 40%, #E8C96B 70%, #C53261 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {WORDS[word]}.
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>


          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.2 }}
            className="mt-6 text-[15px] sm:text-base leading-relaxed font-light max-w-[440px]"
            style={{ color: 'rgba(240,225,230,0.85)' }}
          >
            Authentic skincare, makeup &amp; fragrances — curated for every skin type and delivered to your door.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              id="hero-shop-now"
              href={slides[index]?.link || '/customer/pages/allproducts'}
              className="group relative inline-flex items-center gap-3 text-white text-[11px] font-bold uppercase tracking-[0.22em] px-9 py-4 overflow-hidden transition-all active:scale-95"
              style={{ background: '#C53261', boxShadow: '0 8px 28px rgba(197,50,97,0.35)' }}
            >
              <span className="relative z-10 flex items-center gap-3">
                Shop the Collection
                <FiArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </span>
              {/* hover shimmer */}
              <motion.span
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)' }}
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.55 }}
              />
            </Link>

            <a
              href="#shop-by-category"
              className="inline-flex items-center gap-2 text-white text-[11px] font-bold uppercase tracking-[0.22em] px-8 py-4 transition-all hover:bg-white/10 active:scale-95"
              style={{ border: '1px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.04)' }}
            >
              Explore Categories
            </a>
          </motion.div>

          {/* Live store stats */}
          {(products.length > 0 || categories.length > 0) && (
            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-11 pt-8 grid grid-cols-3 gap-8 max-w-[380px]"
              style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
            >
              {[
                { k: 'Products',   v: products.length },
                { k: 'Categories', v: categories.length },
                { k: 'Authentic',  v: '100%' },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="text-[9.5px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {s.k}
                  </dt>
                  <dd className="text-[1.75rem] font-black text-white tabular-nums mt-1 leading-none">
                    {typeof s.v === 'number' ? <CountUp to={s.v} /> : s.v}
                    {typeof s.v === 'number' && (
                      <span style={{ color: '#C5A059', fontSize: '1.1rem' }}>+</span>
                    )}
                  </dd>
                </div>
              ))}
            </motion.dl>
          )}
        </div>
      </div>

      {/* ─── Slide controls ─────────────────────────────────────── */}
      {slides.length > 1 && (
        <>
          {/* Left / Right arrow buttons */}
          <button
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center transition-all cursor-pointer group"
            style={{ background: 'rgba(14,12,13,0.55)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          >
            <FiChevronLeft size={20} className="text-white group-hover:text-[#C5A059] transition-colors" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next slide"
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center transition-all cursor-pointer group"
            style={{ background: 'rgba(14,12,13,0.55)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          >
            <FiChevronRight size={20} className="text-white group-hover:text-[#C5A059] transition-colors" />
          </button>

          {/* Bottom progress bar + counter */}
          <div
            className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 sm:px-10 lg:px-16 py-4"
            style={{ background: 'linear-gradient(to top, rgba(14,12,13,0.7) 0%, transparent 100%)' }}
          >
            {/* Thin progress lines */}
            <div className="flex gap-2 items-center">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDir(i > index ? 1 : -1); setIndex(i); }}
                  aria-label={`Go to slide ${i + 1}`}
                  className="relative h-[3px] cursor-pointer overflow-hidden transition-all duration-300"
                  style={{ width: i === index ? 48 : 24, background: 'rgba(255,255,255,0.2)' }}
                >
                  {i === index && (
                    <motion.span
                      key={`${index}-${paused}`}
                      className="absolute inset-y-0 left-0"
                      style={{ background: '#C5A059' }}
                      initial={{ width: '0%' }}
                      animate={{ width: paused ? '0%' : '100%' }}
                      transition={{ duration: paused ? 0 : SLIDE_MS / 1000, ease: 'linear' }}
                    />
                  )}
                  {i < index && (
                    <span className="absolute inset-0" style={{ background: '#C5A059' }} />
                  )}
                </button>
              ))}
            </div>

            {/* Slide counter */}
            <span className="text-[11px] font-mono font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {String(index + 1).padStart(2, '0')}&nbsp;/&nbsp;{String(slides.length).padStart(2, '0')}
            </span>
          </div>
        </>
      )}

      {/* ─── No-slides decorative right panel (only on lg+) ─────── */}
      {!hasSlides && !slidesLoading && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="hidden lg:block absolute right-0 top-0 bottom-0 w-[42%] pointer-events-none overflow-hidden"
        >
          {/* Gold accent vertical line */}
          <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom, transparent, rgba(197,160,89,0.4), transparent)' }} />

          {/* Central decorative ring stack */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[320, 240, 170, 110].map((sz, i) => (
              <motion.div
                key={sz}
                className="absolute rounded-full"
                style={{
                  width: sz, height: sz,
                  border: `1px solid rgba(${i % 2 === 0 ? '197,160,89' : '197,50,97'},${0.12 + i * 0.04})`,
                }}
                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 22 + i * 8, repeat: Infinity, ease: 'linear' }}
              />
            ))}

            {/* Center logo-style glow */}
            <div className="absolute w-16 h-16 rounded-full" style={{
              background: 'radial-gradient(circle, rgba(197,50,97,0.6) 0%, rgba(197,160,89,0.3) 60%, transparent 100%)',
              filter: 'blur(12px)',
            }} />

            {/* Gloria text mark */}
            <div className="absolute text-center">
              <p className="text-[10px] uppercase tracking-[0.45em] font-bold" style={{ color: 'rgba(197,160,89,0.7)' }}>
                Gloria
              </p>
              <p className="text-[8px] uppercase tracking-[0.3em] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Cosmetics
              </p>
            </div>
          </div>

          {/* Floating beauty stat pills */}
          {[
            { label: 'Premium Quality', top: '18%', right: '12%' },
            { label: 'Cruelty Free',    top: '72%', right: '18%' },
            { label: '100% Authentic',  top: '45%', right: '5%'  },
          ].map((pill) => (
            <motion.div
              key={pill.label}
              className="absolute flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                top: pill.top, right: pill.right,
                background: 'rgba(20,16,19,0.75)',
                border: '1px solid rgba(197,160,89,0.25)',
                backdropFilter: 'blur(10px)',
              }}
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 2 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
              <span className="text-[10px] font-semibold tracking-wider whitespace-nowrap" style={{ color: 'rgba(240,225,215,0.85)' }}>
                {pill.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
};

/* ── Animated counter ── */
const CountUp = ({ to, duration = 1400 }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick  = (now) => {
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
