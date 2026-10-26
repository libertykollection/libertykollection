'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApi } from './homeUtils';
import { getSafeImageUrl } from '../../../util/imageUtils';
import { FiArrowRight } from 'react-icons/fi';

const LibertyHero = () => {
  const { data } = useApi('/api/slider');
  const dbSlides = (data || [])
    .filter((s) => s.imgurl)
    .map((s) => ({ image: getSafeImageUrl(s.imgurl), link: s.link || '/customer/pages/allproducts' }));

  const defaultSlides = [
    { image: '/sliders/liberty-hero.jpg', link: '/customer/pages/allproducts' },
    { image: '/sliders/slider1.jpg', link: '/customer/pages/allproducts' },
    { image: '/sliders/slider2.jpg', link: '/customer/pages/allproducts' },
  ];
  const slides = dbSlides.length > 0 ? dbSlides : defaultSlides;

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="bg-[#FFFDF5] px-4 sm:px-5 pt-2 pb-8" aria-label="Featured collections">
      <div className="relative w-full overflow-hidden rounded-[22px] aspect-[1376/768] max-h-[calc(100vh-140px)] min-h-[320px] bg-[#E8E2D6] shadow-sm">
        {slides.map((s, i) => (
          <Link
            key={s.image + i}
            href={s.link}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <Image
              fill
              unoptimized
              priority={i === 0}
              src={s.image}
              alt={`Featured collection ${i + 1}`}
              className="object-cover object-top"
            />
          </Link>
        ))}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  i === index ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LibertyHero;
