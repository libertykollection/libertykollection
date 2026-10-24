'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiCalendar,
  FiClock,
  FiTag,
  FiFacebook,
  FiTwitter,
  FiLinkedin,
  FiCopy,
  FiArrowLeft,
  FiUser,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getSafeImageUrl } from '../../../../util/imageUtils';

const BlogDetailPage = ({ id, initialBlog }) => {
  const [blog, setBlog] = useState(initialBlog || null);
  const [loading, setLoading] = useState(!initialBlog);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (initialBlog) {
      setBlog(initialBlog);
      setLoading(false);
      return;
    }

    if (id) {
      const fetchBlog = async () => {
        try {
          const isNumeric = /^\d+$/.test(String(id));
          if (isNumeric) {
            const response = await fetch(`/api/blog/${id}`);
            if (response.ok) {
              const data = await response.json();
              if (data && data.id) {
                setBlog(data);
                setLoading(false);
                return;
              }
            }
          }
          setBlog(null);
        } catch (error) {
          console.error('Failed to fetch blog:', error);
          setBlog(null);
        } finally {
          setLoading(false);
        }
      };

      fetchBlog();
    }
  }, [id, initialBlog]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await fetch('/api/blog');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data?.data || [];
          const filtered = list
            .filter((b) => String(b.id) !== String(id))
            .slice(0, 3)
            .map((item) => ({
              id: item.id,
              title: item.title,
              date: item.createdAt
                ? new Date(item.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'RECENT',
              image: item.image
                ? getSafeImageUrl(item.image)
                : 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80',
            }));
          setRelatedPosts(filtered);
        }
      } catch (err) {
        console.error('Failed to fetch related blogs:', err);
      }
    };

    fetchRelated();
  }, [id]);

  const calculateReadingTime = (text) => {
    if (!text) return 3;
    const textContent = text.replace(/<[^>]*>/g, '');
    const wordCount = textContent.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'RECENT';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return String(dateString);
    }
  };

  const handleShare = (platform) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = blog?.title || '';

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (platform === 'copy') {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(url);
        toast.success('Story link copied to clipboard!');
      }
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#FBF9F7]">
        <div className="w-14 h-14 border-2 border-[#F0DCE3] border-t-[#C53261] rounded-none animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest font-bold text-[#141311]">
          Loading Journal Story...
        </p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-xl text-center bg-[#FBF9F7]">
        <h2 className="text-2xl font-serif font-bold text-[#141311] mb-3">Article Not Found</h2>
        <p className="text-gray-500 text-xs font-light mb-6">
          The requested chronicle could not be located in our archives.
        </p>
        <Link
          href="/customer/pages/blog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#141311] text-white text-xs font-bold uppercase tracking-widest rounded-none border border-[#141311]"
        >
          <FiArrowLeft /> Return to Journal
        </Link>
      </div>
    );
  }

  const readingTime = calculateReadingTime(blog.description || blog.content || '');
  const imageSrc = blog.image
    ? blog.image.startsWith('http')
      ? blog.image
      : getSafeImageUrl(blog.image)
    : 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&auto=format&fit=crop&q=80';

  return (
    <div className="bg-[#FBF9F7] min-h-screen text-[#141311] pb-24">
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* 1. Breadcrumbs */}
      <div className="bg-white border-b border-[#F0DCE3] py-5">
        <div className="container mx-auto max-w-[1200px] px-4 lg:px-8 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 overflow-hidden">
          <Link href="/" className="hover:text-[#141311] transition-colors shrink-0">
                Home
              </Link>
          <span className="text-gray-300 shrink-0">/</span>
          <Link href="/customer/pages/blog" className="hover:text-[#141311] transition-colors shrink-0">
            Beauty Journal
          </Link>
          <span className="text-gray-300 shrink-0">/</span>
          <span className="text-[#141311] font-bold truncate">{blog.title}</span>
        </div>
      </div>

      {/* 2. Article Header */}
      <article className="container mx-auto max-w-[1000px] px-4 lg:px-8 py-10 sm:py-14">
        {/* Category & Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-widest mb-4">
          <span className="bg-[#FFF5F8] border border-[#F0DCE3] text-[#C53261] px-3 py-1 rounded-none flex items-center gap-1.5 font-bold">
            <FiTag size={12} />
            {blog.category || 'Beauty Guide'}
          </span>
          <span className="text-gray-400 flex items-center gap-1">
            <FiCalendar size={13} className="text-[#C53261]" />
            {formatDate(blog.createdAt || blog.date)}
          </span>
          <span className="text-[#F0DCE3]">•</span>
          <span className="text-gray-400 flex items-center gap-1">
            <FiClock size={13} className="text-[#C53261]" />
            {readingTime} min read
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#141311] leading-tight tracking-tight mb-8">
          {blog.title}
        </h1>

        {/* Author bar */}
        <div className="flex items-center justify-between border-y border-[#F0DCE3] py-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-[#141311] text-white flex items-center justify-center font-bold text-sm">
              <FiUser size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#141311] uppercase tracking-wider">Beauty Editorial</p>
              <p className="text-[11px] text-gray-400 font-light">Official Cosmetics & Fragrance Curators</p>
            </div>
          </div>

          {/* Social Share Icons */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hidden sm:inline-block mr-1">
              Share:
            </span>
            <button
              onClick={() => handleShare('facebook')}
              aria-label="Share on Facebook"
              className="w-8 h-8 rounded-none border border-[#F0DCE3] bg-white text-[#141311] hover:bg-[#141311] hover:text-white flex items-center justify-center transition-colors"
            >
              <FiFacebook size={13} />
            </button>
            <button
              onClick={() => handleShare('twitter')}
              aria-label="Share on Twitter"
              className="w-8 h-8 rounded-none border border-[#F0DCE3] bg-white text-[#141311] hover:bg-[#141311] hover:text-white flex items-center justify-center transition-colors"
            >
              <FiTwitter size={13} />
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              aria-label="Share on LinkedIn"
              className="w-8 h-8 rounded-none border border-[#F0DCE3] bg-white text-[#141311] hover:bg-[#141311] hover:text-white flex items-center justify-center transition-colors"
            >
              <FiLinkedin size={13} />
            </button>
            <button
              onClick={() => handleShare('copy')}
              aria-label="Copy link"
              className="w-8 h-8 rounded-none border border-[#F0DCE3] bg-white text-[#141311] hover:bg-[#141311] hover:text-white flex items-center justify-center transition-colors"
            >
              <FiCopy size={13} />
            </button>
          </div>
        </div>

        {/* Featured Main Image */}
        <div className="relative aspect-[16/9] w-full rounded-none overflow-hidden mb-10 border border-[#F0DCE3] bg-[#FFF5F8]">
          <Image
            src={imageSrc}
            alt={blog.title}
            fill
            priority
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Article Body Content */}
        <div className="bg-white p-8 sm:p-12 border border-[#F0DCE3] mb-10">
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6 font-light">
            {blog.description ? (
              <div
                className="blog-content font-normal text-base leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: blog.description }}
              />
            ) : (
              <p className="text-base text-gray-600">{blog.excerpt}</p>
            )}

            {blog.content && (
              <div
                className="blog-content font-normal text-base leading-relaxed space-y-4 mt-6"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-[#F0DCE3] flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/customer/pages/blog"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#141311] hover:text-[#C53261] transition-colors"
          >
            <FiArrowLeft size={14} /> Back to Journal Chronicles
          </Link>

          <div className="flex items-center gap-2 text-xs text-gray-400 font-light">
            <HiSparkles className="text-[#C53261]" />
            <span>Certified Beauty & Cosmetic Insights</span>
          </div>
        </div>
      </article>

      {/* 3. Related Articles Section */}
      {relatedPosts.length > 0 && (
        <section className="bg-white py-14 border-t border-[#F0DCE3]">
          <div className="container mx-auto max-w-[1200px] px-4 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141311] mb-8 tracking-tight">
              Complementary Reading
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {relatedPosts.map((post) => (
                <article
                  key={post.id}
                  className="group flex flex-col bg-[#FFF5F8] rounded-none p-4 border border-[#F0DCE3] hover:border-[#C53261] transition-all"
                >
                  <Link
                    href={`/customer/pages/blog/${post.id}`}
                    className="relative aspect-[16/10] w-full rounded-none overflow-hidden mb-4 bg-white border border-[#F0DCE3]/50 block"
                  >
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </Link>

                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    <FiClock size={11} className="text-[#C53261]" />
                    <span>{post.date}</span>
                  </div>

                  <h3 className="text-sm font-serif font-bold text-[#141311] leading-snug group-hover:text-[#C53261] transition-colors mb-3 line-clamp-2">
                    <Link href={`/customer/pages/blog/${post.id}`}>{post.title}</Link>
                  </h3>

                  <div className="mt-auto pt-2 border-t border-[#F0DCE3]/60">
                    <Link
                      href={`/customer/pages/blog/${post.id}`}
                      className="text-[11px] font-bold uppercase tracking-widest text-[#141311] group-hover:text-[#C53261] transition-colors inline-block"
                    >
                      Read Chronicle &rarr;
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogDetailPage;
