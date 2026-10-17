'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { FiCheckCircle, FiShield, FiTruck, FiHeadphones } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

const AboutUsPage = () => {
  const [aboutData, setAboutData] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const [response, compRes] = await Promise.all([
          axios.get('/api/aboutus').catch(() => ({ data: [] })),
          fetch('/api/companydetails').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ]);
        if (response.data && response.data.length > 0) {
          setAboutData(response.data[0]);
        }
        if (compRes?.name) {
          setBrandName(compRes.name);
        }
      } catch (error) {
        console.error('Error fetching About Us data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  return (
    <div className="bg-[#FBF9F7] min-h-screen text-[#141311]">
      {/* 1. Header & Breadcrumbs */}
      <div className="bg-white border-b border-[#E8DFC8] py-8">
        <div className="container mx-auto max-w-[1400px] px-4 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              <Link href="/" className="hover:text-[#141311] transition-colors">
                Atelier
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-[#141311] font-bold">About Our House</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141311]">
              The Story of {brandName ? `${brandName} Atelier` : 'Our Atelier'}
            </h1>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#B98C2D] flex items-center gap-1.5">
            <HiSparkles size={14} />
            Pure Beauty & Masterful Craftsmanship
          </span>
        </div>
      </div>

      {/* 2. Main Content Container */}
      <div className="container mx-auto max-w-[1200px] px-4 lg:px-8 py-12 sm:py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 border-2 border-[#E8DFC8] border-t-[#B98C2D] rounded-none animate-spin mb-4" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#141311]">
              Unveiling Atelier Story...
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Title & Description */}
            <div className="bg-white p-8 sm:p-14 border border-[#E8DFC8] text-center max-w-3xl mx-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B98C2D] block mb-2">
                Our Heritage & Mission
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#141311] mb-5 tracking-tight">
                {aboutData?.Title || 'Devoted to Authentic Radiance and Timeless Cosmetics'}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed">
                {aboutData?.description ||
                  (brandName
                    ? `${brandName} was created to bring genuine international cosmetic formulations, niche artisan fragrances, and dermatologically verified skincare right to your vanity with speed, authenticity, and unmatched customer care.`
                    : 'Our atelier was created to bring genuine international cosmetic formulations, niche artisan fragrances, and dermatologically verified skincare right to your vanity with speed, authenticity, and unmatched customer care.')}
              </p>
            </div>

            {/* Core Values 4-Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 sm:p-8 rounded-none border border-[#E8DFC8] flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[#F9F5EC] border border-[#E8DFC8] text-[#B98C2D] flex items-center justify-center mb-4">
                  <FiCheckCircle size={22} />
                </div>
                <h4 className="text-xs font-serif font-bold text-[#141311] uppercase tracking-wider mb-1.5">
                  100% Certified Authentic
                </h4>
                <p className="text-xs text-gray-500 font-light leading-relaxed">
                  Guaranteed genuine formulations direct from certified labs and licensed boutique distributors.
                </p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-none border border-[#E8DFC8] flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[#F9F5EC] border border-[#E8DFC8] text-[#B98C2D] flex items-center justify-center mb-4">
                  <FiTruck size={22} />
                </div>
                <h4 className="text-xs font-serif font-bold text-[#141311] uppercase tracking-wider mb-1.5">
                  White Glove Delivery
                </h4>
                <p className="text-xs text-gray-500 font-light leading-relaxed">
                  Expedited doorstep dispatch across Mandi Bahauddin and nationwide with real-time tracking.
                </p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-none border border-[#E8DFC8] flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[#F9F5EC] border border-[#E8DFC8] text-[#B98C2D] flex items-center justify-center mb-4">
                  <FiShield size={22} />
                </div>
                <h4 className="text-xs font-serif font-bold text-[#141311] uppercase tracking-wider mb-1.5">
                  Encrypted Checkout
                </h4>
                <p className="text-xs text-gray-500 font-light leading-relaxed">
                  Military-grade encrypted bank and cash on delivery security with full buyer purchase protection.
                </p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-none border border-[#E8DFC8] flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[#F9F5EC] border border-[#E8DFC8] text-[#B98C2D] flex items-center justify-center mb-4">
                  <FiHeadphones size={22} />
                </div>
                <h4 className="text-xs font-serif font-bold text-[#141311] uppercase tracking-wider mb-1.5">
                  Dedicated Concierge
                </h4>
                <p className="text-xs text-gray-500 font-light leading-relaxed">
                  Personalized cosmetic consultation, shade matching, and 24/7 client care assistance.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutUsPage;
