'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronRight } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

// Curated Luxury Beauty & Cosmetics Collections
const COSMETICS_COLLECTIONS = [
  {
    id: 1,
    name: 'Lip Velvet & Gloss',
    slug: 'lipsticks',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    name: 'Flawless Complexion',
    slug: 'foundation',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    name: 'Artisan Perfumery',
    slug: 'fragrances',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    name: 'Radiant Eye Palette',
    slug: 'eyeshadow',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 5,
    name: 'Glow Serum & Elixirs',
    slug: 'skincare',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 6,
    name: 'Highlighter & Bronzer',
    slug: 'highlighters',
    image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 7,
    name: 'Botanical Cleansers',
    slug: 'cleansers',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 8,
    name: 'Nourishing Face Oils',
    slug: 'face-oils',
    image: 'https://images.unsplash.com/photo-1608248597359-0027787383a8?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 9,
    name: 'Rose Gold Cheek Tints',
    slug: 'blush',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 10,
    name: 'Setting Sprays & Mists',
    slug: 'mists',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 11,
    name: 'Hydrating Night Creams',
    slug: 'night-creams',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 12,
    name: 'Sun Defense UV Radiance',
    slug: 'sunscreen',
    image: 'https://images.unsplash.com/photo-1556228722-d0b74100c436?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 13,
    name: 'Lash Definition Mascara',
    slug: 'mascara',
    image: 'https://images.unsplash.com/photo-1631214500115-598fc2cb8d2d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 14,
    name: 'Velvet Matte Powders',
    slug: 'compacts',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&auto=format&fit=crop&q=80',
  },
];

export default function CollectionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [dbCategories, setDbCategories] = useState([]);
  const itemsPerPage = 14;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data?.status && Array.isArray(data.data)) {
          setDbCategories(data.data);
        }
      } catch (e) {
        console.error('Failed to load DB categories:', e);
      }
    };
    fetchCategories();
  }, []);

  // Display DB categories first if available, otherwise beauty presets
  const displayCollections = dbCategories.length > 0
    ? dbCategories.map((c, i) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image
          ? (c.image.startsWith('http') ? c.image : `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${c.image}`)
          : COSMETICS_COLLECTIONS[i % COSMETICS_COLLECTIONS.length].image,
      }))
    : COSMETICS_COLLECTIONS;

  const totalPages = Math.ceil(displayCollections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCollections = displayCollections.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-[#FBF9F7] min-h-screen text-[#141311]">
      {/* 1. Header & Breadcrumb */}
      <div className="bg-white border-b border-[#E8DFC8] py-8">
        <div className="container mx-auto max-w-[1536px] px-4 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              <Link href="/" className="hover:text-[#141311] transition-colors">
                Atelier
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-[#141311] font-bold">Curated Collections</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141311]">
              Signature Beauty Collections
            </h1>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#B98C2D] flex items-center gap-1.5">
            <HiSparkles size={14} />
            Exclusive Formulations
          </span>
        </div>
      </div>

      {/* 2. Collections Grid */}
      <div className="py-12 sm:py-16">
        <div className="container mx-auto max-w-[1536px] px-4 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-6">
            {currentCollections.map((item) => {
              const targetUrl = `/customer/pages/category/${item.slug}`;

              return (
                <Link
                  key={item.id}
                  href={targetUrl}
                  className="group flex flex-col items-center cursor-pointer text-center bg-white border border-[#E8DFC8] hover:border-[#B98C2D] transition-all p-3"
                >
                  {/* Clean Ivory Box with Centered Cutout Beauty Image */}
                  <div className="w-full aspect-square bg-[#F9F5EC] border border-[#E8DFC8]/50 flex items-center justify-center p-3 relative overflow-hidden mb-3">
                    <div className="relative w-full h-full">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500 ease-out"
                        unoptimized
                      />
                    </div>
                  </div>

                  {/* Centered Collection Name */}
                  <h2 className="text-xs font-serif font-bold text-[#141311] group-hover:text-[#B98C2D] transition-colors text-center leading-snug line-clamp-1 uppercase tracking-wider">
                    {item.name}
                  </h2>
                </Link>
              );
            })}
          </div>

          {/* 3. Numbered Pagination Bar (Sharp Square Luxury Buttons) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-[#E8DFC8]">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-none flex items-center justify-center text-xs font-bold uppercase tracking-wider transition-all border ${
                      currentPage === pageNum
                        ? 'bg-[#141311] text-white border-[#141311]'
                        : 'bg-white text-[#141311] border-[#E8DFC8] hover:border-[#141311]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
