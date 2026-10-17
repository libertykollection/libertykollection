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
    <div className="w-full bg-brand-light text-brand-dark py-1.5 px-4 text-xs font-medium border-b border-brand-border transition-all">
      <div className="container mx-auto flex items-center justify-between max-w-[1536px]">
        {/* Left: Express Delivery Notice */}
        <div className="hidden sm:flex items-center space-x-3 text-[11px] font-semibold">
          <span className="flex items-center gap-1.5">
            <FiTruck className="text-brand-primary text-sm" />
            <span>{brandName ? `${brandName} Atelier` : 'Prestige Atelier'} • Express White-Glove Delivery</span>
          </span>
          <span className="text-brand-border">•</span>
          <span className="text-brand-hover">Complimentary Shipping on luxury orders</span>
        </div>

        {/* Center: Welcome Banner */}
        <div className="flex-1 text-center font-bold text-[12px] sm:text-[12px] text-brand-darker tracking-wide font-serif">
          <span>{brandName ? `Welcome To ${brandName}` : 'Welcome To Our Atelier'}</span>
        </div>

        {/* Right: Quick Links */}
        <div className="hidden md:flex items-center space-x-4 text-[11px] font-semibold">
          <Link href="/customer/pages/aboutus" className="hover:text-brand-primary transition-colors">
            About Us
          </Link>
          <span className="text-brand-border">•</span>
          <Link href="/customer/pages/contactus" className="hover:text-brand-primary transition-colors">
            Contact
          </Link>
          <span className="text-brand-border">•</span>
          <Link href="/customer/pages/orders" className="hover:text-brand-primary transition-colors flex items-center gap-1">
            <FiHelpCircle className="text-xs" /> Track Order
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
