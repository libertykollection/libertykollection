'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiFilter,
  FiX,
  FiSearch,
  FiChevronDown,
  FiShield,
  FiTruck,
  FiCheck,
} from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';
import ProductCard from '../../../components/home/ProductCard';
import { QuickViewProvider } from '../../../components/home/QuickView';

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest Arrivals' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'discount', label: 'Biggest Discount' },
  { id: 'name-asc', label: 'Name: A to Z' },
];

const STATUS_FILTERS = [
  { id: 'all', label: 'All Items' },
  { id: 'on-sale', label: '⚡ Sale Offers' },
  { id: 'top-rated', label: '★ Highly Rated' },
];

const SubcategoryPage = () => {
  const { slug } = useParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [subcategory, setSubcategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchProductsAndSubcategory = async () => {
      setIsLoading(true);
      try {
        const [prodRes, subRes] = await Promise.all([
          axios.get('/api/products').catch(() => ({ data: [] })),
          axios.get(`/api/subcatdetail/${slug}`).catch(() => ({ data: null })),
        ]);

        const prodData = Array.isArray(prodRes.data) ? prodRes.data : [];
        setProducts(prodData);

        if (subRes.data && subRes.data.status && subRes.data.data) {
          setSubcategory(subRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching subcategory or products data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductsAndSubcategory();
  }, [slug]);

  // Filter & sort products for this subcategory
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSubcat =
          p.subcategorySlug === slug ||
          p.subCategoryId === subcategory?.id ||
          p.subcategory?.slug === slug;

        const matchesSearch =
          !searchQuery.trim() ||
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const isTopRated = (p.rating || 0) >= 4.5 || (p.reviews?.length || 0) > 0;
        const isOnSale = (p.discount || 0) > 0;
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'top-rated' && isTopRated) ||
          (statusFilter === 'on-sale' && isOnSale);

        return matchesSubcat && matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortOption === 'price-asc') return (a.price || 0) - (b.price || 0);
        if (sortOption === 'price-desc') return (b.price || 0) - (a.price || 0);
        if (sortOption === 'discount') return (b.discount || 0) - (a.discount || 0);
        if (sortOption === 'name-asc') return (a.name || '').localeCompare(b.name || '');
        if (sortOption === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        return 0;
      });
  }, [products, slug, subcategory, searchQuery, statusFilter, sortOption]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FFFDF5]">
        <div className="w-12 h-12 border-3 border-[#77104C]/20 border-t-[#77104C] rounded-full animate-spin mb-4" />
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#77104C] font-display">
          Curating Collection...
        </span>
      </div>
    );
  }

  const subName = subcategory?.name || (slug ? slug.replace(/-/g, ' ') : 'Collection');
  const parentCategory = subcategory?.category;

  return (
    <QuickViewProvider>
      <div className="bg-[#FFFDF5] min-h-screen pb-24 text-[#1A1A1A]">
        {/* 1. Subcategory Hero Banner */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#77104C] via-[#5C0C3A] to-[#360522] text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-12">
          <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#AD4A81]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#F6D0E3]/10 blur-3xl" />

          <div className="relative z-10 max-w-[1536px] mx-auto">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#F6D0E3]/90 font-medium mb-6 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="text-[#F6D0E3]/40">/</span>
              {parentCategory && (
                <>
                  <Link
                    href={`/customer/pages/category/${parentCategory.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {parentCategory.name}
                  </Link>
                  <span className="text-[#F6D0E3]/40">/</span>
                </>
              )}
              <span className="text-white font-semibold capitalize truncate max-w-[240px] sm:max-w-none">
                {subName}
              </span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold uppercase tracking-[0.2em] text-[#F6D0E3] mb-4">
              <BsStars size={12} />
              <span>Curated Sub-Collection</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight leading-tight max-w-4xl text-white capitalize">
              {subName}
            </h1>

            <p className="text-sm sm:text-base text-white/85 max-w-2xl mt-4 font-light leading-relaxed">
              Explore authentic luxury beauty formulations in {subName}, tested for performance, elegance, and all-day radiance.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6 sm:gap-10 text-xs text-white/90 font-medium pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <FiShield className="text-[#F6D0E3]" size={15} />
                <span>100% Genuine Formulations</span>
              </div>
              <div className="flex items-center gap-2">
                <FiTruck className="text-[#F6D0E3]" size={15} />
                <span>Fast Dispatch Nationwide</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{filteredProducts.length} Items Available</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Controls & Search Bar */}
        <div className="max-w-[1536px] mx-auto px-4 lg:px-8 pt-8 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search input */}
            <div className="relative w-full md:w-[320px]">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder={`Search in ${subName}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-9 rounded-full bg-white border border-[#EAE3D5] text-xs font-medium text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#77104C] focus:ring-2 focus:ring-[#77104C]/15 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>

            {/* Filter pills & Sorting */}
            <div className="flex items-center gap-3 flex-wrap justify-between md:justify-end">
              <div className="flex items-center gap-1.5 p-1 bg-white border border-[#EAE3D5] rounded-full shadow-2xs">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                      statusFilter === f.id
                        ? 'bg-[#77104C] text-white shadow-2xs'
                        : 'text-gray-600 hover:text-[#77104C]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="h-10 pl-4 pr-9 rounded-full bg-white border border-[#EAE3D5] text-xs font-semibold text-[#333333] shadow-2xs appearance-none focus:outline-none focus:border-[#77104C] cursor-pointer hover:border-gray-400 transition-colors"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown
                  size={13}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowMobileFilters(true)}
                className="md:hidden flex items-center gap-1.5 h-10 px-4 rounded-full bg-white border border-[#EAE3D5] text-xs font-bold text-[#1A1A1A] shadow-2xs"
              >
                <FiFilter size={14} />
                <span>Filters</span>
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-[#777777]">
            <p>
              Showing <strong className="text-[#1A1A1A] font-semibold">{filteredProducts.length}</strong> creations
            </p>

            {(searchQuery || statusFilter !== 'all' || sortOption !== 'newest') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setSortOption('newest');
                }}
                className="text-[#77104C] font-semibold hover:underline flex items-center gap-1"
              >
                <span>Reset Filters</span>
                <FiX size={12} />
              </button>
            )}
          </div>
        </div>

        {/* 3. Products Grid */}
        <main className="max-w-[1536px] mx-auto px-4 lg:px-8 mt-2">
          {filteredProducts.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7"
            >
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id || index}
                  product={product}
                  index={index}
                  showBottomBar={true}
                />
              ))}
            </motion.div>
          ) : (
            <div className="py-20 text-center bg-white rounded-2xl border border-[#EAE3D5] p-8 max-w-xl mx-auto shadow-xs">
              <span className="text-4xl block mb-3">🔍</span>
              <h3 className="text-lg font-bold font-display text-[#1A1A1A] mb-2">
                No Products Found
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
                We could not locate any formulations matching your search or filters in this sub-collection.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="px-6 py-2.5 bg-[#77104C] hover:bg-[#5E0B3C] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-xs"
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </QuickViewProvider>
  );
};

export default SubcategoryPage;
