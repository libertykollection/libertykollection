'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

/**
 * SectionHeader — used across all homepage sections.
 *
 * Props:
 *   eyebrow    — small label above the title (Jost uppercase)
 *   title      — main heading (Cormorant Garamond display serif)
 *   subtitle   — short body paragraph below title (DM Sans)
 *   href       — optional "view all" link target
 *   linkLabel  — text for the link (default "View all")
 *   align      — 'left' | 'center'
 *   dark       — bool, true when on dark background
 *   children   — extra content in the right slot (e.g. tab buttons)
 */
const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
  href,
  linkLabel = 'View all',
  align = 'left',
  dark = false,
  children,
}) => (
  <div
    className={`flex flex-col gap-4 mb-8 sm:mb-12 ${
      align === 'center'
        ? 'items-center text-center'
        : 'md:flex-row md:items-end md:justify-between'
    }`}
  >
    {/* ── Left / center text block ── */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={align === 'center' ? 'max-w-2xl' : ''}
    >
      {/* Eyebrow — Jost caps */}
      {eyebrow && (
        <span
          className="inline-flex items-center gap-3 mb-4"
          style={{
            fontFamily: 'var(--font-ui-stack)',
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'var(--theme-primary)',
          }}
        >
          <span
            className="inline-block w-7 h-px"
            style={{ background: 'var(--theme-primary)' }}
          />
          {eyebrow}
        </span>
      )}

      {/* Heading — Cormorant Garamond display serif */}
      <h2
        style={{
          fontFamily: 'var(--font-display-stack)',
          fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)',
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: '-0.025em',
          color: dark ? '#FFFFFF' : '#1A1118',
        }}
      >
        {title}
      </h2>

      {/* Subtitle — DM Sans body */}
      {subtitle && (
        <p
          className="mt-3"
          style={{
            fontFamily: 'var(--font-sans-stack)',
            fontSize: '0.9rem',
            fontWeight: 300,
            lineHeight: 1.65,
            letterSpacing: '0.01em',
            color: dark ? 'rgba(255,255,255,0.55)' : '#5A4250',
          }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>

    {/* ── Right slot — link and/or children ── */}
    {(children || href) && (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center gap-4 flex-wrap"
      >
        {children}
        {href && (
          <Link
            href={href}
            className="group inline-flex items-center gap-2 transition-colors"
            style={{
              fontFamily: 'var(--font-ui-stack)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: dark ? '#FFFFFF' : '#1A1118',
              borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.4)' : '#1A1118'}`,
              paddingBottom: '3px',
            }}
          >
            {linkLabel}
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={13} />
          </Link>
        )}
      </motion.div>
    )}
  </div>
);

export default SectionHeader;
