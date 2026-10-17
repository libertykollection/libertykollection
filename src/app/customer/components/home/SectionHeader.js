'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

const SectionHeader = ({ eyebrow, title, subtitle, href, linkLabel = 'View all', align = 'left', dark = false, children }) => (
  <div
    className={`flex flex-col gap-4 mb-8 sm:mb-10 ${
      align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'
    }`}
  >
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={align === 'center' ? 'max-w-2xl' : ''}
    >
      {eyebrow && (
        <span
          className={`inline-flex items-center gap-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] mb-3 ${
            dark ? 'text-theme-secondary' : 'text-theme-primary'
          }`}
        >
          <span className={`w-6 h-px ${dark ? 'bg-theme-secondary' : 'bg-theme-primary'}`} />
          {eyebrow}
        </span>
      )}
      <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h2>
      {subtitle && <p className={`mt-2 text-sm ${dark ? 'text-white/60' : 'text-gray-500'}`}>{subtitle}</p>}
    </motion.div>

    {(children || href) && (
      <div className="flex items-center gap-4 flex-wrap">
        {children}
        {href && (
          <Link
            href={href}
            className={`group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border-b pb-1 transition-colors ${
              dark
                ? 'text-white border-white/40 hover:border-theme-secondary hover:text-theme-secondary'
                : 'text-theme-dark border-theme-dark hover:text-theme-primary hover:border-theme-primary'
            }`}
          >
            {linkLabel}
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    )}
  </div>
);

export default SectionHeader;
