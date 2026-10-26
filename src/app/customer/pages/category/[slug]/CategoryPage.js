'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiChevronRight,
  FiSearch,
  FiChevronDown,
  FiFilter,
  FiX,
  FiShield,
  FiTruck,
  FiHeadphones,
  FiCheck,
} from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';
import ProductCard, { ProductCardSkeleton } from '../../../components/home/ProductCard';
import { QuickViewProvider } from '../../../components/home/QuickView';
import { formatPrice } from '../../../components/home/homeUtils';

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

const CategoryPage = ({ categoryData: initialCategory = null }) => {
  const { slug } = useParams();
  const router = useRouter();

  const [categoryData, setCategoryData] = useState(initialCategory);
  const [allCategories, setAllCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(!initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [sortOption, setSortOption] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!categoryData) setLoading(true);
        const [catRes, prodRes, subRes] = await Promise.all([
          axios.get('/api/categories').catch(() => ({ data: { data: [] } })),
          axios.get('/api/products').catch(() => ({ data: [] })),
          axios.get('/api/subcategories').catch(() => ({ data: { data: [] } })),
        ]);

        const cats = Array.isArray(catRes.data?.data) ? catRes.data.data : [];
        setAllCategories(cats);

        const currentCategory = initialCategory || categoryData || cats.find((c) => c.slug === slug);

        if (currentCategory) {
          setCategoryData(currentCategory);

          const allSubcategories = Array.isArray(subRes.data?.data) ? subRes.data.data : [];
          const categorySubcategories = allSubcategories.filter((s) => s.categoryId === currentCategory.id);
          setSubcategories(categorySubcategories);

          const subcategorySlugs = categorySubcategories.map((s) => s.slug);
          const rawProducts = Array.isArray(prodRes.data) ? prodRes.data : [];

          // Robust category-product association
          const matchedProducts = rawProducts.filter((p) => {
            if (p.categoryId === currentCategory.id) return true;
            if (p.subcategory?.category?.id === currentCategory.id) return true;
            if (p.subcategory?.categoryId === currentCategory.id) return true;
            if (p.subcategory?.category?.slug === currentCategory.slug) return true;
            if (p.subcategorySlug && subcategorySlugs.includes(p.subcategorySlug)) return true;
            if (categorySubcategories.some((s) => s.id === p.subCategoryId)) return true;
            return false;
          });

          setProducts(matchedProducts);
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  // Filtered & sorted products list
  const filteredProductsList = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          !searchQuery.trim() ||
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const subcategory = subcategories.find((s) => s.id === activeSubcategory);
        const matchesSubcategory =
          !activeSubcategory ||
          p.subCategoryId === activeSubcategory ||
          p.subcategorySlug === subcategory?.slug ||
          p.subcategory?.id === activeSubcategory;

        const isTopRated = (p.rating || 0) >= 4.5 || (p.reviews?.length || 0) > 0;
        const isOnSale = (p.discount || 0) > 0;
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'top-rated' && isTopRated) ||
          (statusFilter === 'on-sale' && isOnSale);

        return matchesSearch && matchesSubcategory && matchesStatus;
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
  }, [products, searchQuery, activeSubcategory, statusFilter, sortOption, subcategories]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FFFDF5]">
        <div className="w-12 h-12 border-3 border-[#77104C]/20 border-t-[#77104C] rounded-full animate-spin mb-4" />
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#77104C] font-display">
          Curating Collection...
        </span>
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FFFDF5] px-4 text-center">
        <span className="text-3xl mb-3">✨</span>
        <h2 className="text-2xl font-bold font-display text-[#1A1A1A] mb-2">Category Not Found</h2>
        <p className="text-sm text-gray-500 max-w-md mb-6">
          The requested beauty department could not be located. Explore our signature catalog for verified collections.
        </p>
        <Link
          href="/customer/pages/allproducts"
          className="px-7 py-3.5 bg-[#77104C] hover:bg-[#5E0B3C] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-md"
        >
          Explore All Collections
        </Link>
      </div>
    );
  }

  // Related sibling categories for navigation
  const otherCategories = allCategories.filter((c) => c.slug !== slug);

  return (
    <QuickViewProvider>
      <div className="bg-[#FFFDF5] min-h-screen pb-24 text-[#1A1A1A]">
        {/* 1. Luxury Category Hero Banner */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#77104C] via-[#5C0C3A] to-[#360522] text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-12">
          {/* Subtle background glow effects */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#AD4A81]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#F6D0E3]/10 blur-3xl" />

          {/* Optional subtle background image blending */}
          {categoryData.imageUrl && (
            <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none">
              <Image
                fill
                priority
                unoptimized
                src={categoryData.imageUrl}
                alt=""
                className="object-cover"
              />
            </div>
          )}

          <div className="relative z-10 max-w-[1536px] mx-auto">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#F6D0E3]/90 font-medium mb-6 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="text-[#F6D0E3]/40">/</span>
              <Link href="/customer/pages/allproducts" className="hover:text-white transition-colors">
                Departments
              </Link>
              <span className="text-[#F6D0E3]/40">/</span>
              <span className="text-white font-semibold truncate max-w-[240px] sm:max-w-none">
                {categoryData.name}
              </span>
            </nav>

            {/* Department Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold uppercase tracking-[0.2em] text-[#F6D0E3] mb-4">
              <BsStars size={12} />
              <span>Signature Beauty Department</span>
            </div>

            {/* Category Title & Description */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight leading-tight max-w-4xl text-white">
              {categoryData.name}
            </h1>

            <p className="text-sm sm:text-base text-white/85 max-w-2xl mt-4 font-light leading-relaxed">
              {categoryData.meta_description ||
                `Explore our verified range of authentic ${categoryData.name} formulations crafted with luxury botanical essences and precision craftsmanship.`}
            </p>

            {/* Trust Points Strip */}
            <div className="mt-8 flex flex-wrap items-center gap-6 sm:gap-10 text-xs text-white/90 font-medium pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <FiShield className="text-[#F6D0E3]" size={15} />
                <span>100% Authentic Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <FiTruck className="text-[#F6D0E3]" size={15} />
                <span>Express Nationwide Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{filteredProductsList.length} Curated Items In Stock</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Subcategory Navigation Pills Bar */}
        {subcategories.length > 0 && (
          <div className="border-b border-[#EAE3D5]/70 bg-white sticky top-0 z-30 shadow-2xs">
            <div className="max-w-[1536px] mx-auto px-4 lg:px-8 py-3.5 flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <span className="text-xs font-bold uppercase tracking-wider text-[#888888] mr-2 shrink-0 hidden sm:inline">
                Sub-Collections:
              </span>

              {/* All Items Pill */}
              <button
                type="button"
                onClick={() => setActiveSubcategory(null)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  !activeSubcategory
                    ? 'bg-[#77104C] text-white shadow-xs'
                    : 'bg-[#FFFDF5] text-[#555555] hover:text-[#77104C] border border-[#EAE3D5] hover:border-[#77104C]/40'
                }`}
              >
                <span>All Formulations</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    !activeSubcategory ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {products.length}
                </span>
              </button>

              {/* Specific Subcategory Pills */}
              {subcategories.map((sub) => {
                const subCount = products.filter(
                  (p) =>
                    p.subCategoryId === sub.id ||
                    p.subcategorySlug === sub.slug ||
                    p.subcategory?.id === sub.id
                ).length;

                const isCurrent = activeSubcategory === sub.id;

                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setActiveSubcategory(sub.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-[#77104C] text-white shadow-xs'
                        : 'bg-[#FFFDF5] text-[#555555] hover:text-[#77104C] border border-[#EAE3D5] hover:border-[#77104C]/40'
                    }`}
                  >
                    <span>{sub.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isCurrent ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {subCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Filter, Search & Sorting Controls Bar */}
        <div className="max-w-[1536px] mx-auto px-4 lg:px-8 pt-8 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search input in this category */}
            <div className="relative w-full md:w-[320px]">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder={`Search in ${categoryData.name}...`}
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
              {/* Status Pills */}
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

              {/* Sort Dropdown */}
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

              {/* Mobile Filter Sheet Button */}
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

          {/* Active filter counter & reset */}
          <div className="mt-4 flex items-center justify-between text-xs text-[#777777]">
            <p>
              Showing <strong className="text-[#1A1A1A] font-semibold">{filteredProductsList.length}</strong> creations
              {activeSubcategory && (
                <span> in <span className="text-[#77104C] font-semibold">{subcategories.find((s) => s.id === activeSubcategory)?.name}</span></span>
              )}
            </p>

            {(searchQuery || activeSubcategory || statusFilter !== 'all' || sortOption !== 'newest') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveSubcategory(null);
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

        {/* 4. Products Grid */}
        <main className="max-w-[1536px] mx-auto px-4 lg:px-8 mt-2">
          {filteredProductsList.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7"
            >
              {filteredProductsList.map((product, index) => (
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
                No Formulations Found
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
                We could not find any products matching your specific filters in {categoryData.name}. Try adjusting your search query or subcategory filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveSubcategory(null);
                  setStatusFilter('all');
                }}
                className="px-6 py-2.5 bg-[#77104C] hover:bg-[#5E0B3C] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-xs"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>

        {/* 5. Explore Other Beauty Departments */}
        {otherCategories.length > 0 && (
          <section className="max-w-[1536px] mx-auto px-4 lg:px-8 mt-20 pt-16 border-t border-[#EAE3D5]/70">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#77104C] font-display">
                Complete Your Beauty Ritual
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#1A1A1A] mt-1.5">
                Explore Other Departments
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {otherCategories.slice(0, 3).map((other) => (
                <Link
                  key={other.id}
                  href={`/customer/pages/category/${other.slug}`}
                  className="group relative block aspect-[16/9] sm:aspect-[2/1] rounded-2xl overflow-hidden bg-gradient-to-br from-[#77104C] to-[#360522] shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {other.imageUrl && (
                    <Image
                      fill
                      unoptimized
                      src={other.imageUrl}
                      alt={other.name}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-50 group-hover:opacity-40"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end text-white">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#F6D0E3]">
                      Department
                    </span>
                    <h3 className="text-xl font-bold font-display leading-tight group-hover:text-[#F6D0E3] transition-colors mt-0.5">
                      {other.name}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-1 mt-1 font-light">
                      {other.meta_description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 6. Mobile Filter Modal */}
        <AnimatePresence>
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileFilters(false)}
                className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="relative bg-white rounded-t-3xl border-t border-[#EAE3D5] p-6 max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#1A1A1A]">
                    Filter & Refine
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1.5 text-gray-500 hover:text-black rounded-full hover:bg-gray-100"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                {/* Sort Option */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-3">
                    Sort Order
                  </h4>
                  <div className="space-y-1.5">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSortOption(opt.id)}
                        className={`w-full px-4 py-2.5 text-xs font-semibold rounded-xl text-left flex items-center justify-between transition-colors ${
                          sortOption === opt.id
                            ? 'bg-[#77104C] text-white font-bold'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {sortOption === opt.id && <FiCheck size={14} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subcategories */}
                {subcategories.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-3">
                      Sub-Category
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveSubcategory(null)}
                        className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                          !activeSubcategory
                            ? 'bg-[#77104C] text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        All ({products.length})
                      </button>
                      {subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setActiveSubcategory(sub.id)}
                          className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                            activeSubcategory === sub.id
                              ? 'bg-[#77104C] text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full py-3.5 bg-[#77104C] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md"
                  >
                    Show {filteredProductsList.length} Results
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </QuickViewProvider>
  );
};

export default CategoryPage;
