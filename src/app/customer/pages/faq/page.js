'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FaqSection from '../../components/FaqSection';
import { FiHelpCircle, FiMail, FiPhone } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

const FAQ = () => {
  const [brandName, setBrandName] = useState('');
  const [phone, setPhone] = useState('+92 312 8807795');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('/api/companydetails')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.name) setBrandName(d.name);
      })
      .catch(() => null);

    fetch('/api/contactinfo')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) {
          if (d[0].phoneNumber) setPhone(d[0].phoneNumber);
          if (d[0].email) setEmail(d[0].email);
        }
      })
      .catch(() => null);
  }, []);

  return (
    <div className="bg-[#FBF9F7] min-h-screen text-[#141311]">
      {/* Header & Breadcrumb */}
      <div className="bg-white border-b border-[#F0DCE3] py-8">
        <div className="container mx-auto max-w-[1400px] px-4 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              <Link href="/" className="hover:text-[#141311] transition-colors">
                Home
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-[#141311] font-bold">Client Guidance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141311]">
              Frequently Asked Questions & Answers
            </h1>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C53261] flex items-center gap-1.5">
            <HiSparkles size={14} />
            Concierge Assistance
          </span>
        </div>
      </div>

      <div className="container mx-auto max-w-[1200px] px-4 lg:px-8 py-12 sm:py-16">
        <FaqSection />

        <div className="bg-white p-8 sm:p-10 rounded-none border border-[#F0DCE3] mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h4 className="text-xs font-serif font-bold text-[#141311] uppercase tracking-wider flex items-center gap-2">
              <FiHelpCircle className="text-[#C53261]" /> The Quality Standard
            </h4>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              {brandName ? `${brandName} is` : 'Gloria Cosmetics is'} devoted to providing authentic luxury cosmetic creations, swift white-glove dispatch, and unwavering client satisfaction.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-serif font-bold text-[#141311] uppercase tracking-wider flex items-center gap-2">
              <FiPhone className="text-[#C53261]" /> Direct Concierge Hotline
            </h4>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Need immediate guidance with shade matching or delivery status? Reach our hotline Mon – Sat at{' '}
              <a href={`tel:${phone}`} className="font-bold text-[#141311] hover:text-[#C53261]">
                {phone}
              </a>.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-serif font-bold text-[#141311] uppercase tracking-wider flex items-center gap-2">
              <FiMail className="text-[#C53261]" /> Priority Email Concierge
            </h4>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Send us inquiries any time {email ? (
                <>at <a href={`mailto:${email}`} className="font-bold text-[#141311] hover:text-[#C53261]">{email}</a></>
              ) : (
                <>via our <Link href="/customer/pages/contactus" className="font-bold text-[#141311] hover:text-[#C53261]">Concierge Desk</Link></>
              )}. Our curators reply promptly within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
