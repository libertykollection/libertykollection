'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../store/cartSlice';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FiChevronRight,
  FiSearch,
  FiShoppingCart,
  FiFilter,
  FiX,
  FiPlus,
  FiShoppingBag,
  FiCheck,
} from 'react-icons/fi';
import { GoStarFill } from 'react-icons/go';
import { getSafeImageUrl } from '../../../util/imageUtils';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tempSortOption, setTempSortOption] = useState('newest');
  const [tempStatusFilter, setTempStatusFilter] = useState('all');
  const dispatch = useDispatch();
  const router = useRouter();

  const fetchProducts = useCallback(async (query) => {
    setLoading(true);
    try {
      const url = query
        ? `/api/products/search/${encodeURIComponent(query)}`
        : `/api/products`;

      const response = await axios.get(url);
      const data = query ? response.data.data : response.data;

      const fetchedProducts = (data || []).map((product) => ({
        ...product,
        images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
      }));

      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('search') || '';
      setSearchQuery(query);
      fetchProducts(query);
    };

    handleRouteChange();
  }, [fetchProducts]);

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    dispatch(addToCart(product));
  };

  const handleBuyNow = (product, e) => {
    if (e) e.stopPropagation();
    dispatch(addToCart(product));
    router.push('/customer/pages/cart');
  };

  const handleProductClick = (slug) => {
    router.push(`/customer/pages/products/${slug}`);
  };

  const formatPrice = (price) => {
    return price ? price.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0';
  };

  const calculateOriginalPrice = (price, discount) => {
    if (typeof price === 'number' && typeof discount === 'number' && discount > 0) {
      return price / (1 - discount / 100);
    }
    return price;
  };

  const displayProducts = products
    .filter((p) => {
      const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const isTopRated = p.rating >= 4.5;
      const isOnSale = p.discount > 0;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'top-rated' && isTopRated) ||
        (statusFilter === 'on-sale' && isOnSale);

      if (activeFilter === 'Sale') return matchesSearch && matchesStatus && isOnSale;
      if (activeFilter === 'Best Seller' || activeFilter === 'Popularity') return matchesSearch && matchesStatus && isTopRated;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
      if (sortOption === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  return (
    <div className="bg-[#FBF9F7] min-h-screen text-[#141311]">
      {/* Top Loading Progress Bar */}
      {loading && (
        <div
          tabIndex={-1}
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 99999,
            pointerEvents: 'none',
          }}
        >
          <div className="s2u-progress-bar-primary" />
        </div>
      )}

      {/* Hero Header Section */}
      <div className="bg-white border-b border-theme-border py-12 px-4 md:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[#8C7C68] mb-4">
            <span className="cursor-pointer hover:text-theme-primary transition-colors" onClick={() => router.push('/')}>
              Store
            </span>
            <FiChevronRight className="text-xs" />
            <span className="text-theme-dark font-bold">Liberty Kollection Catalog</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-black text-theme-dark tracking-tight">
                Prestige Cosmetics & Skincare Catalog
              </h1>
              <p className="text-xs text-[#8C7C68] mt-1 tracking-wide">
                Bespoke foundations, velvet lipsticks, botanical serums, and masterclass beauty formulations
              </p>
            </div>

            {/* Search Input */}
            <div className="flex w-full lg:w-auto items-center bg-theme-light border border-theme-border px-4 py-2 transition-all focus-within:border-theme-primary group">
              <FiSearch className="text-[#8C7C68] mr-3 shrink-0 group-focus-within:text-theme-primary transition-colors" />
              <input
                type="text"
                placeholder="Search shades, formulas, skincare..."
                className="bg-transparent border-none focus:ring-0 text-xs py-1.5 w-full lg:w-72 font-medium placeholder:text-[#A89890] outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="bg-theme-dark text-white px-5 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-theme-primary transition-colors shrink-0"
                onClick={() => fetchProducts(searchQuery)}
              >
                Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 py-10">
        {/* Filters Bar */}
        <div className="flex items-center justify-between gap-3 mb-10 overflow-x-auto pb-2 border-b border-[#F0DCE3]">
          <div className="flex items-center gap-2">
            {['All', 'New Release', 'Popularity', 'Best Seller', 'Sale'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                  activeFilter === filter
                    ? 'bg-[#141311] text-white border-[#141311]'
                    : 'bg-white text-[#8C7A70] border-[#F0DCE3] hover:border-[#C53261] hover:text-[#141311]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setTempSortOption(sortOption);
              setTempStatusFilter(statusFilter);
              setShowFilters(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-theme-border text-theme-dark text-[11px] font-bold uppercase tracking-wider hover:border-theme-primary hover:text-theme-primary transition-all shrink-0"
          >
            <FiFilter />
            <span className="hidden sm:inline">Refine ({sortOption})</span>
          </button>
        </div>

        {/* Product Grid */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => {
              const originalPrice = calculateOriginalPrice(product.price, product.discount);
              const img = product.images?.[0];
              const rawUrl = typeof img === 'string' ? img : img?.url || img?.name;
              const imageUrl = rawUrl ? getSafeImageUrl(rawUrl) : null;

              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-white border border-theme-border overflow-hidden transition-all duration-300 cursor-pointer hover:border-theme-primary shadow-xs"
                  onClick={() => handleProductClick(product.slug)}
                >
                  {/* Image Square */}
                  <div className="relative aspect-square bg-theme-light overflow-hidden">
                    {/* Discount Badge */}
                    {product.discount > 0 && (
                      <div className="absolute top-2.5 left-2.5 z-20 bg-theme-primary text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
                        {product.discount.toFixed(0)}% OFF
                      </div>
                    )}

                    {imageUrl ? (
                      <Image
                        fill
                        src={imageUrl}
                        alt={product.name}
                        className="object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                        unoptimized
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-theme-primary">
                        <FiShoppingBag size={28} />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-[10px] font-bold text-[#8C7C68] uppercase tracking-widest truncate max-w-[65%]">
                        {product.category?.name || 'Liberty Kollection'}
                      </p>
                      <div className="flex items-center gap-1 text-theme-primary text-[10px] font-bold">
                        <GoStarFill size={11} />
                        <span>{product.rating || '4.9'}</span>
                      </div>
                    </div>

                    <h2 className="text-xs sm:text-sm font-serif font-medium text-theme-dark line-clamp-2 leading-snug h-[2.6em] mb-2 group-hover:text-theme-primary transition-colors">
                      {product.name}
                    </h2>

                    <div className="flex items-baseline gap-2 mt-auto mb-3">
                      <span className="text-sm sm:text-base font-bold text-theme-dark">
                        {formatPrice(product.price)} PKR
                      </span>
                      {product.discount > 0 && (
                        <span className="text-[10px] text-[#A89890] line-through">
                          {formatPrice(originalPrice)} PKR
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-theme-border">
                      <button
                        className="border border-theme-dark text-theme-dark text-[10px] font-bold uppercase tracking-wider py-2 hover:bg-theme-light transition-all flex items-center justify-center gap-1"
                        onClick={(e) => handleAddToCart(product, e)}
                      >
                        <FiShoppingCart size={11} />
                        <span>Add</span>
                      </button>
                      <button
                        className="bg-theme-dark text-white text-[10px] font-bold uppercase tracking-wider py-2 hover:bg-theme-primary transition-all"
                        onClick={(e) => handleBuyNow(product, e)}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center bg-white border border-theme-border p-8">
            <FiShoppingBag className="mx-auto text-4xl text-theme-primary mb-3" />
            <p className="text-sm font-serif text-theme-dark">No products found matching &ldquo;{searchQuery}&rdquo;</p>
            <button
              className="mt-4 text-theme-primary text-xs font-bold uppercase tracking-widest hover:underline"
              onClick={() => {
                setSearchQuery('');
                fetchProducts('');
              }}
            >
              Clear Search Query
            </button>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-[60]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white shadow-2xl flex flex-col"
            >
              <div className="px-6 py-5 flex items-center justify-between border-b border-theme-border">
                <h3 className="text-base font-serif text-theme-dark font-bold">Refine Catalog</h3>
                <button onClick={() => setShowFilters(false)} className="text-[#8C7C68] hover:text-theme-dark">
                  <FiX size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#8C7C68] mb-3">
                    Sort Order
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'newest', label: 'Newest Arrivals' },
                      { id: 'price-asc', label: 'Price: Low to High' },
                      { id: 'price-desc', label: 'Price: High to Low' },
                      { id: 'name-asc', label: 'Alphabetical: A-Z' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setTempSortOption(opt.id)}
                        className={`text-left px-4 py-2.5 text-xs font-medium border flex items-center justify-between transition-all ${
                          tempSortOption === opt.id
                            ? 'bg-theme-dark text-white border-theme-dark'
                            : 'bg-white text-theme-dark border-theme-border hover:border-theme-primary'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {tempSortOption === opt.id && <FiCheck size={14} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#8C7C68] mb-3">
                    Collection Status
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'all', label: 'All Catalog Items' },
                      { id: 'top-rated', label: 'Top Rated Formulations' },
                      { id: 'on-sale', label: 'Special Promotional Markdown' },
                    ].map((status) => (
                      <button
                        key={status.id}
                        onClick={() => setTempStatusFilter(status.id)}
                        className={`text-left px-4 py-2.5 text-xs font-medium border flex items-center justify-between transition-all ${
                          tempStatusFilter === status.id
                            ? 'bg-theme-dark text-white border-theme-dark'
                            : 'bg-white text-theme-dark border-theme-border hover:border-theme-primary'
                        }`}
                      >
                        <span>{status.label}</span>
                        {tempStatusFilter === status.id && <FiCheck size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-theme-border flex gap-3">
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-3 border border-theme-border text-xs font-bold uppercase tracking-wider text-[#8C7C68] hover:bg-theme-light"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSortOption(tempSortOption);
                    setStatusFilter(tempStatusFilter);
                    setShowFilters(false);
                  }}
                  className="flex-1 py-3 bg-theme-dark text-white text-xs font-bold uppercase tracking-wider hover:bg-theme-primary transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllProducts;
