'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiTruck, FiMessageCircle, FiRefreshCw } from 'react-icons/fi';

const PROMISES = [
  { icon: FiShield, title: '100% Authentic', text: 'Every product is sourced from authorised distributors — never replicas.' },
  { icon: FiTruck, title: 'Express Delivery', text: 'Fast, carefully packed nationwide shipping with cash on delivery.' },
  { icon: FiMessageCircle, title: 'Beauty Advice', text: 'Not sure what suits your skin? Our team will help you choose.' },
  { icon: FiRefreshCw, title: 'Easy Returns', text: 'Hassle-free exchanges on eligible items under our return policy.' },
];

const SpotlightCard = ({ icon: Icon, title, text, index }) => {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onMouseMove={onMove}
      className="group relative p-6 sm:p-7 bg-white border border-theme-border overflow-hidden transition-colors hover:border-theme-primary/50"
      style={{ '--mx': '50%', '--my': '50%' }}
    >
      {/* cursor spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'radial-gradient(260px circle at var(--mx) var(--my), rgba(185,140,45,0.18), transparent 70%)' }}
      />
      <div className="relative">
        <div className="w-12 h-12 flex items-center justify-center bg-theme-light text-theme-primary mb-5 transition-all duration-300 group-hover:bg-theme-primary group-hover:text-white group-hover:-translate-y-1">
          <Icon size={20} />
        </div>
        <h3 className="text-base font-black text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
      </div>
      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-theme-primary group-hover:w-full transition-all duration-500" />
    </motion.div>
  );
};

const BeautyPromise = () => (
  <section className="py-14 sm:py-16 bg-theme-light/50">
    <div className="container mx-auto max-w-[1440px] px-4 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {PROMISES.map((p, i) => (
          <SpotlightCard key={p.title} {...p} index={i} />
        ))}
      </div>
    </div>
  </section>
);

export default BeautyPromise;
