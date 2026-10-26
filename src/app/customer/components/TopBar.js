'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiTruck, FiHelpCircle } from 'react-icons/fi';

const TopBar = () => {
  const [brandName, setBrandName] = useState('');

  useEffect(() => {
    fetch('/api/companydetails')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.name) {
          setBrandName(data.name);
        }
      })
      .catch(() => null);
  }, []);

  return (
    <div className="w-full bg-theme-primary text-theme-primary-contrast py-2 px-4 text-xs font-medium transition-all shadow-xs">
      <div className="container mx-auto flex items-center justify-between max-w-[1536px]">
        {/* Left: Express Delivery Notice */}
        <div className="hidden sm:flex items-center space-x-3 text-[11px] font-medium tracking-wide">
          <span className="flex items-center gap-1.5">
            <FiTruck className="text-[#F6D0E3] text-sm" />
            <span>{brandName ? `${brandName}` : 'Liberty Kollection'} • Nationwide Delivery</span>
          </span>
          <span className="opacity-40">•</span>
          <span className="text-[#F6D0E3]">Complimentary Shipping on special orders</span>
        </div>

        {/* Center: Welcome Banner */}
        <div className="flex-1 text-center font-semibold text-[11px] sm:text-[12px] tracking-wider uppercase font-display">
          <span>{brandName ? `Welcome To ${brandName}` : 'Welcome To Liberty Kollection'}</span>
        </div>

        {/* Right: Quick Links */}
        <div className="hidden md:flex items-center space-x-4 text-[11px] font-medium">
          <Link href="/customer/pages/aboutus" className="hover:text-[#F6D0E3] transition-colors">
            About Us
          </Link>
          <span className="opacity-40">•</span>
          <Link href="/customer/pages/contactus" className="hover:text-[#F6D0E3] transition-colors">
            Contact
          </Link>
          <span className="opacity-40">•</span>
          <Link href="/customer/pages/orders" className="hover:text-[#F6D0E3] transition-colors flex items-center gap-1">
            <FiHelpCircle className="text-xs" /> Track Order
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
