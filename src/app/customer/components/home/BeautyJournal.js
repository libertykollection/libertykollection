'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import SectionHeader from './SectionHeader';
import { useApi, stripHtml } from './homeUtils';
import { getSafeImageUrl } from '../../../util/imageUtils';

const BeautyJournal = () => {
  const { data: blogs, loading } = useApi('/api/blog');
  const posts = blogs.slice(0, 3);

  if (loading || posts.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="container mx-auto max-w-[1440px] px-4 lg:px-8">
        <SectionHeader
          eyebrow="The beauty journal"
          title="Tips, guides & rituals"
          subtitle="Expert advice to get the most out of your skincare, makeup and fragrance."
          href="/customer/pages/blog"
          linkLabel="Read the journal"
        />

        <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
          {posts.map((post, i) => {
            const date = post.createdAt
              ? new Date(post.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : null;
            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={`/customer/pages/blog/${post.id}`} className="group block">
                  <div className="relative aspect-[16/11] overflow-hidden bg-theme-light">
                    {post.image && (
                      <Image
                        fill
                        unoptimized
                        loading="lazy"
                        src={getSafeImageUrl(post.image)}
                        alt={post.title}
                        className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-theme-dark/0 group-hover:bg-theme-dark/30 transition-colors duration-500" />
                    {post.category && (
                      <span className="absolute top-3 left-3 bg-white text-theme-dark text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1">
                        {post.category}
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 w-10 h-10 bg-theme-primary text-white flex items-center justify-center translate-y-14 group-hover:translate-y-0 transition-transform duration-300">
                      <FiArrowUpRight />
                    </span>
                  </div>
                  <div className="pt-5">
                    {date && <time className="text-[11px] uppercase tracking-[0.2em] text-gray-400">{date}</time>}
                    <h3 className="mt-2 text-lg font-black text-gray-900 leading-snug line-clamp-2 group-hover:text-theme-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{stripHtml(post.description)}</p>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BeautyJournal;
