'use client';

import React from 'react';
import { FiShield, FiTruck, FiHeart, FiRefreshCw, FiStar, FiFeather } from 'react-icons/fi';

const ITEMS = [
  { icon: FiShield, text: '100% Authentic Brands' },
  { icon: FiTruck, text: 'Nationwide Express Delivery' },
  { icon: FiHeart, text: 'Cruelty-Free Picks' },
  { icon: FiRefreshCw, text: 'Easy Returns & Exchanges' },
  { icon: FiStar, text: 'Dermatologist-Tested Formulas' },
  { icon: FiFeather, text: 'Cash On Delivery Available' },
];

const MarqueeTicker = () => {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div className="relative bg-theme-primary text-white overflow-hidden border-y border-theme-primary-dark/40 group" aria-label="Store promises">
      <div className="flex w-max s2u-marquee group-hover:[animation-play-state:paused]">
        {[0, 1].map((dup) => (
          <ul key={dup} className="flex items-center shrink-0" aria-hidden={dup === 1}>
            {loop.map(({ icon: Icon, text }, i) => (
              <li key={`${dup}-${i}`} className="flex items-center gap-3 px-8 py-3 whitespace-nowrap">
                <Icon size={14} className="text-white/80" />
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em]">{text}</span>
                <span className="ml-8 text-white/50">✦</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
};

export default MarqueeTicker;
