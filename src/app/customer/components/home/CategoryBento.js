'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import SectionHeader from './SectionHeader';
import { useApi } from './homeUtils';
import { getSafeImageUrl } from '../../../util/imageUtils';

const TINTS = ['#F9F5EC', '#F6F0DF', '#FBF8F1', '#F4EDE0', '#F8F3E8', '#F5EEDC', '#FAF6EE', '#F3EBD8'];

const CategoryBento = () => {
  const { data: categories, loading } = useApi('/api/categories');
  const { data: subcategories } = useApi('/api/subcategories');

  const subCount = (catId) => subcategories.filter((s) => s.categoryId === catId).length;
  const list = categories.slice(0, 8);

  return (
    <section id="shop-by-category" className="py-14 sm:py-20 bg-white scroll-mt-24">
      <div className="container mx-auto max-w-[1440px] px-4 lg:px-8">
        <SectionHeader
          eyebrow="Shop by category"
          title="Find your beauty ritual"
          subtitle="From everyday essentials to indulgent treats — explore every department."
          href="/customer/pages/collections"
          linkLabel="All collections"
        />

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 auto-rows-[160px] sm:auto-rows-[200px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`bg-gray-100 animate-pulse ${i === 0 ? 'col-span-2 row-span-2' : ''}`} />
            ))}
          </div>
        ) : list.length === 0 ? (
          <p className="text-sm text-gray-400">No categories available yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 auto-rows-[160px] sm:auto-rows-[200px] grid-flow-dense">
            {list.map((cat, i) => {
              const featured = i === 0;
              const wide = i === 3 || i === 6;
              const count = subCount(cat.id);
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className={`${featured ? 'col-span-2 row-span-2' : wide ? 'col-span-2' : ''}`}
                >
                  <Link
                    href={`/customer/pages/category/${cat.slug}`}
                    className="group relative block w-full h-full overflow-hidden"
                    style={{ backgroundColor: TINTS[i % TINTS.length] }}
                  >
                    {cat.imageUrl && (
                      <Image
                        fill
                        unoptimized
                        loading="lazy"
                        src={getSafeImageUrl(cat.imageUrl)}
                        alt={cat.name}
                        className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                      />
                    )}
                    {/* gradient for legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-theme-dark/85 via-theme-dark/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />

                    {/* arrow badge */}
                    <span className="absolute top-3 right-3 w-9 h-9 bg-white text-theme-dark flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-300">
                      <FiArrowUpRight />
                    </span>

                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                      {count > 0 && (
                        <span className="block text-[10px] font-bold uppercase tracking-[0.25em] text-theme-secondary mb-1 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          {count} collection{count > 1 ? 's' : ''}
                        </span>
                      )}
                      <h3 className={`font-black text-white leading-tight ${featured ? 'text-2xl sm:text-4xl' : 'text-base sm:text-lg'}`}>
                        {cat.name}
                      </h3>
                      <span className="mt-2 inline-block h-[2px] w-8 bg-theme-secondary group-hover:w-20 transition-all duration-500" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryBento;
