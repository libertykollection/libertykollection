'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiClock, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { getSafeImageUrl } from '../../../util/imageUtils';

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    const fetchApiBlogs = async () => {
      try {
        const response = await fetch('/api/blog');
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data) ? data : data?.data || [];
          if (list.length > 0) {
            const mapped = list.map((item) => ({
              id: item.id,
              title: item.title,
              date: item.createdAt
                ? new Date(item.createdAt)
                    .toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                    .toUpperCase()
                : 'RECENT',
              excerpt: item.description
                ? item.description.replace(/<[^>]*>/g, '').substring(0, 140) + '...'
                : 'Discover beauty secrets, formulation deep dives, and expert makeup artistry tips from Gloria Cosmetics.',
              image: item.image
                ? getSafeImageUrl(item.image)
                : 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80',
              slug: item.id,
            }));

            setBlogs(mapped);
          } else {
            setBlogs([]);
          }
        }
      } catch (e) {
        console.error('Failed to fetch blogs from API:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchApiBlogs();
  }, []);

  // Pagination calculation
  const totalPages = Math.ceil(blogs.length / postsPerPage) || 1;
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = blogs.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="bg-[#FBF9F7] min-h-screen text-[#141311]">
      {/* 1. Header & Breadcrumb */}
      <div className="bg-white border-b border-[#F0DCE3] py-8">
        <div className="container mx-auto max-w-[1400px] px-4 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              <Link href="/" className="hover:text-[#141311] transition-colors">
                Home
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-[#141311] font-bold">Beauty Journal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141311]">
              The Beauty Journal & Editorial Chronicles
            </h1>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C53261] flex items-center gap-1.5">
            <HiSparkles size={14} />
            Expert Formulations & Masterclasses
          </span>
        </div>
      </div>

      {/* 2. Main 3-Column Blog Cards Grid */}
      <div className="py-12 sm:py-16">
        <div className="container mx-auto max-w-[1400px] px-4 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-14 h-14 border-2 border-[#F0DCE3] border-t-[#C53261] rounded-none animate-spin mb-4" />
              <p className="text-xs uppercase tracking-widest font-bold text-[#141311]">
                Compiling Journal Chronicles...
              </p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="py-20 text-center bg-white border border-dashed border-[#F0DCE3] p-8">
              <h3 className="text-lg font-serif font-bold text-[#141311] mb-2">No Articles In This Issue</h3>
              <p className="text-xs text-gray-400 font-light">
                Our editorial team is preparing fresh skincare and cosmetic masterclasses. Please check back shortly.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentPosts.map((post, idx) => {
                  const targetUrl = `/customer/pages/blog/${post.id || post.slug}`;
                  return (
                    <article
                      key={post.id || idx}
                      className="group flex flex-col bg-white border border-[#F0DCE3] hover:border-[#C53261] rounded-none transition-all p-5"
                    >
                      {/* Blog Image */}
                      <Link
                        href={targetUrl}
                        className="relative aspect-[16/10] w-full bg-[#FFF5F8] border border-[#F0DCE3]/50 mb-4 block overflow-hidden"
                      >
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          unoptimized
                        />
                      </Link>

                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                        <FiClock size={12} className="text-[#C53261]" />
                        <span>{post.date}</span>
                      </div>

                      {/* Blog Title */}
                      <h2 className="text-base font-serif font-bold text-[#141311] leading-snug group-hover:text-[#C53261] transition-colors mb-2.5 line-clamp-2">
                        <Link href={targetUrl}>{post.title}</Link>
                      </h2>

                      {/* Excerpt */}
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-5 font-light">
                        {post.excerpt}
                      </p>

                      {/* Read More */}
                      <div className="mt-auto pt-3 border-t border-[#F0DCE3]/60">
                        <Link
                          href={targetUrl}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#141311] group-hover:text-[#C53261] transition-colors"
                        >
                          <span>Read Full Story</span>
                          <FiArrowRight size={13} />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Numbered Pagination Bar */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-14 pt-6 border-t border-[#F0DCE3]">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-none flex items-center justify-center text-xs font-bold uppercase tracking-wider transition-all border ${
                        currentPage === page
                          ? 'bg-[#141311] text-white border-[#141311]'
                          : 'bg-white text-[#141311] border-[#F0DCE3] hover:border-[#141311]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
