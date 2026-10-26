'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

const BANNERS = [
  {
    id: 'eyes',
    title: 'Smokey & Dramatic Eyes',
    tag: 'Eye Artistry',
    image: '/banners/promo_1.png',
    fallbackImage: '/products/eyeshadow.jpg',
    href: '/customer/pages/allproducts?category=makeup-complexion',
  },
  {
    id: 'complexion',
    title: 'Flawless Complexion Base',
    tag: 'Skin Perfecting',
    image: '/banners/promo_2.png',
    fallbackImage: '/products/foundation.jpg',
    href: '/customer/pages/allproducts?category=makeup-complexion',
  },
  {
    id: 'illuminators',
    title: 'Radiant Glow & Illuminators',
    tag: 'Bridal Radiance',
    image: '/banners/promo_3.png',
    fallbackImage: '/products/powder.jpg',
    href: '/customer/pages/allproducts?category=makeup-complexion',
  },
  {
    id: 'foundations',
    title: 'Luxury Liquid Foundations',
    tag: 'Velvet Coverage',
    image: '/banners/promo_4.png',
    fallbackImage: '/products/cream.jpg',
    href: '/customer/pages/allproducts?category=makeup-complexion',
  },
  {
    id: 'serums',
    title: 'Youth Essence Serums',
    tag: 'Botanical Actives',
    image: '/banners/promo_5.png',
    fallbackImage: '/products/serum.jpg',
    href: '/customer/pages/allproducts?category=skincare-serums',
  },
  {
    id: 'lips',
    title: 'Plump Velvet Lip Glaze',
    tag: 'Signature Lips',
    image: '/banners/promo_6.png',
    fallbackImage: '/products/lipgloss.jpg',
    href: '/customer/pages/allproducts?category=makeup-complexion',
  },
];

const PromoBanners = () => {
  return (
    <section className="py-12 sm:py-16 bg-[#FFFDF5] border-b border-[#EAE3D5]/50 overflow-hidden" aria-label="Signature visual promotions">
      <div className="container mx-auto max-w-[1536px] px-4 lg:px-8">
        {/* 3x2 Lifestyle Promotional Banners Grid matching exact screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {BANNERS.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <Link
                href={banner.href}
                className="group relative block w-full aspect-[4/3] sm:aspect-[1.15/1] rounded-[18px] overflow-hidden bg-[#1A1A1A] shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Background Image */}
                <Image
                  fill
                  unoptimized
                  src={banner.image}
                  alt={banner.title}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => {
                    // graceful fallback if custom cropped slice is missing
                    e.currentTarget.src = banner.fallbackImage;
                  }}
                />

                {/* Subtle contrast gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                {/* Signature Plum Bottom Action Bar matching exact screenshot */}
                <div className="absolute inset-x-0 bottom-0 bg-[#77104C] group-hover:bg-[#5E0B3C] text-white py-2.5 px-4 flex items-center justify-between transition-colors shadow-sm">
                  <span className="text-[12px] sm:text-[13px] font-bold tracking-wide uppercase truncate pr-2">
                    {banner.title}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:text-[#77104C] transition-all">
                    <FiArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanners;
