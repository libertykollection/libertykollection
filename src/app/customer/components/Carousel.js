'use client';

import React, { useEffect, useState } from 'react';
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import Image from 'next/image';
import Link from 'next/link';
import { getSafeImageUrl } from '../../util/imageUtils';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function Slider() {
  const [slides, setSlides] = useState([]);

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/slider');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const formattedSlides = data.map(slide => ({
            image: getSafeImageUrl(slide.imgurl),
            link: slide.link || '/customer/pages/allproducts',
          }));
          setSlides(formattedSlides);
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const slideProperties = {
    duration: 4500,
    transitionDuration: 700,
    infinite: true,
    indicators: (i) => (
      <div className="w-4 h-1.5 mx-1 rounded-none bg-white/70 hover:bg-white transition-all cursor-pointer shadow-xs inline-block" />
    ),
    prevArrow: (
      <button
        aria-label="Previous Slide"
        className="w-10 h-10 ml-4 md:ml-8 rounded-none bg-white/95 hover:bg-white text-gray-900 shadow-xl flex items-center justify-center transition-all backdrop-blur-md active:scale-95 z-20"
      >
        <FiChevronLeft size={22} />
      </button>
    ),
    nextArrow: (
      <button
        aria-label="Next Slide"
        className="w-10 h-10 mr-4 md:mr-8 rounded-none bg-white/95 hover:bg-white text-gray-900 shadow-xl flex items-center justify-center transition-all backdrop-blur-md active:scale-95 z-20"
      >
        <FiChevronRight size={22} />
      </button>
    ),
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-theme-dark overflow-hidden">
      <div className="w-full">
        <Slide {...slideProperties}>
          {slides.map((slide, index) => (
            <div key={index} className="relative w-full h-[240px] sm:h-[320px] md:h-[380px] lg:h-[420px]">
              <a href={slide.link} className="block w-full h-full relative cursor-pointer">
                <Image
                  fill
                  src={slide.image}
                  className="w-full h-full object-cover object-center"
                  alt={`Cosmetics Promotion Banner ${index + 1}`}
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  unoptimized
                />
              </a>
            </div>
          ))}
        </Slide>
      </div>
    </div>
  );
}

export default Slider;
