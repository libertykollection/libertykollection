'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { FiFilter, FiX, FiPlus, FiChevronRight, FiSearch, FiShoppingCart } from 'react-icons/fi';
import { GoStarFill } from 'react-icons/go';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../../store/cartSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SubcategoryPage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [subcategory, setSubcategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [sortOption, setSortOption] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [tempSortOption, setTempSortOption] = useState("newest");
  const [tempStatusFilter, setTempStatusFilter] = useState("all");

  useEffect(() => {
    const fetchProductsAndSubcategory = async () => {
      setIsLoading(true);
      try {
        const productsResponse = await axios.get('/api/products');
        const prodData = productsResponse.data || [];
        setProducts(prodData);

        const filtered = prodData.filter(product => product.subcategorySlug === slug);
        setFilteredProducts(filtered);

        const subcategoryResponse = await axios.get(`/api/subcatdetail/${slug}`);
        if (subcategoryResponse.data && subcategoryResponse.data.status) {
          setSubcategory(subcategoryResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching subcategory or products data:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductsAndSubcategory();
  }, [slug]);

  const handleProductClick = (productSlug) => {
    router.push(`/customer/pages/products/${productSlug}`);
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 });
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    dispatch(addToCart(product));
    toast.success(`${product.name} added to Vanity Bag`);
  };

  const handleBuyNow = (product, e) => {
    e.stopPropagation();
    dispatch(addToCart(product));
    router.push('/customer/pages/cart');
  };

  useEffect(() => {
    const filtered = products
      .filter(product => {
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
        const matchesSubcategory = product.subcategorySlug === slug;

        const isTopRated = product.rating >= 4.5;
        const isOnSale = product.discount > 0;
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "top-rated" && isTopRated) ||
          (statusFilter === "on-sale" && isOnSale);

        return matchesPrice && matchesSubcategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortOption === "price-asc") return a.price - b.price;
        if (sortOption === "price-desc") return b.price - a.price;
        if (sortOption === "name-asc") return a.name.localeCompare(b.name);
        if (sortOption === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
        return 0;
      });
    setFilteredProducts(filtered);
  }, [minPrice, maxPrice, sortOption, statusFilter, products, slug]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FBF9F7]">
        <ToastContainer position="bottom-right" autoClose={3000} />
        <div className="w-14 h-14 border-2 border-[#F0DCE3] border-t-[#C53261] rounded-none animate-spin mb-4" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#141311]">
          Curating Subcategory Gallery...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#FBF9F7] min-h-screen pb-20 text-[#141311]">
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Header & Breadcrumb */}
      <div className="border-b border-[#F0DCE3] bg-white">
        <div className="container mx-auto max-w-[1536px] px-4 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            <span className="cursor-pointer hover:text-[#141311] transition-colors" onClick={() => router.push('/')}>
                  Home
                </span>
            <span className="text-gray-300">/</span>
            <span className="cursor-pointer hover:text-[#141311] transition-colors" onClick={() => router.push('/customer/pages/allproducts')}>
              Collections
            </span>
            <span className="text-gray-300">/</span>
            <span className="text-[#141311] font-bold">{subcategory?.name || slug}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141311]">
            {subcategory ? subcategory.name : 'Exclusive Tier'}
          </h1>
        </div>
      </div>

      <div className="container mx-auto max-w-[1536px] px-4 lg:px-8 pt-8">
        {/* Filters and Sorting Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-5 sm:p-6 rounded-none border border-[#F0DCE3]">
          {/* Price Filter */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#C53261] rounded-none" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#141311]">Price Spectrum (PKR)</span>
            </div>
            <div className="flex items-center gap-2 bg-[#FFF5F8] px-4 py-2 border border-[#F0DCE3]">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(parseFloat(e.target.value) || 0)}
                className="w-20 bg-transparent text-xs font-bold text-center placeholder:text-gray-300 outline-none"
                placeholder="Min"
              />
              <span className="text-gray-300 font-bold">—</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseFloat(e.target.value) || 0)}
                className="w-24 bg-transparent text-xs font-bold text-center placeholder:text-gray-300 outline-none"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Quick Sort Options (Desktop) & Filter Modal Button */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              {filteredProducts.length} Formulations
            </span>
            <button
              onClick={() => {
                setTempSortOption(sortOption);
                setTempStatusFilter(statusFilter);
                setShowFilters(true);
              }}
              className="flex items-center gap-2 bg-white text-[#141311] px-4 py-2 text-xs font-bold uppercase tracking-wider border border-[#F0DCE3] hover:border-[#141311] transition-colors"
            >
              <FiFilter size={14} />
              <span>Filter & Sort</span>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const discountedPrice = product.discount
                ? product.price - (product.price * product.discount) / 100
                : null;
              return (
                <div
                  key={product.id}
                  className="bg-white border border-[#F0DCE3] hover:border-[#C53261] rounded-none cursor-pointer transition-all flex flex-col justify-between group p-3.5"
                  onClick={() => handleProductClick(product.slug)}
                >
                  <div className="relative aspect-square w-full bg-[#FFF5F8] border border-[#F0DCE3]/50 mb-3 overflow-hidden flex items-center justify-center">
                    {product.discount > 0 && (
                      <div className="absolute top-2 left-2 z-10 bg-[#C53261] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-none">
                        -{product.discount.toFixed(0)}%
                      </div>
                    )}
                    {product.images && product.images.length > 0 ? (
                      <Image
                        fill
                        src={(() => {
                          const img = product.images[0];
                          const url = typeof img === 'string' ? img : img?.url;
                          if (!url) return '/placeholder.png';
                          return url.startsWith('http') || url.startsWith('data:')
                            ? url
                            : `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${url}`;
                        })()}
                        alt={product.name}
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
                        unoptimized
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-gray-300 text-xs font-serif">Gloria Cosmetics</div>
                    )}
                  </div>

                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-0.5 text-[#C53261] mb-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <GoStarFill key={i} size={10} />
                      ))}
                    </div>

                    <h4 className="text-xs font-serif font-bold text-[#141311] group-hover:text-[#C53261] transition-colors line-clamp-2 leading-snug mb-2 h-8 overflow-hidden">
                      {product.name}
                    </h4>

                    <div className="flex items-baseline gap-2 mb-3 mt-auto">
                      {discountedPrice ? (
                        <>
                          <span className="text-sm font-bold text-[#141311]">
                            Rs. {formatPrice(discountedPrice)}
                          </span>
                          <span className="text-[10px] text-gray-400 line-through">
                            Rs. {formatPrice(product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-[#141311]">
                          Rs. {formatPrice(product.price)}
                        </span>
                      )}
                    </div>

                    {/* Quick Buttons */}
                    <div className="grid grid-cols-2 gap-1.5 mt-auto">
                      <button
                        className="border border-[#141311] text-[#141311] text-[9px] font-bold uppercase tracking-wider py-1.5 rounded-none hover:bg-[#141311] hover:text-white transition-all flex items-center justify-center gap-1"
                        onClick={(e) => handleAddToCart(product, e)}
                      >
                        <FiShoppingCart size={11} /> <span>Bag</span>
                      </button>
                      <button
                        className="bg-[#141311] hover:bg-[#2A1B24] text-white text-[9px] font-bold uppercase tracking-wider py-1.5 rounded-none transition-all border border-[#141311]"
                        onClick={(e) => handleBuyNow(product, e)}
                      >
                        Acquire
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center bg-white border border-dashed border-[#F0DCE3] p-8">
              <p className="text-sm font-serif text-[#141311] mb-1">No items found matching criteria.</p>
              <p className="text-xs text-gray-400 font-light">Try expanding your price range or clearing active filters.</p>
            </div>
          )}
        </div>
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
              className="absolute inset-0 bg-black/60"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="absolute left-0 right-0 bottom-0 bg-white border-t border-[#F0DCE3] flex flex-col max-h-[85vh] max-w-xl mx-auto"
            >
              <div className="px-6 py-4 flex items-center justify-between border-b border-[#F0DCE3]">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#141311]">Filters & Refinement</h3>
                <button onClick={() => setShowFilters(false)} className="p-1 text-gray-400 hover:text-black">
                  <FiX size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Sort Order</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "newest", label: "Newest First" },
                      { id: "price-asc", label: "Price: Low to High" },
                      { id: "price-desc", label: "Price: High to Low" },
                      { id: "name-asc", label: "Name: A-Z" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setTempSortOption(opt.id)}
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-none border transition-all ${
                          tempSortOption === opt.id
                            ? "bg-[#141311] text-white border-[#141311]"
                            : "bg-white border-[#F0DCE3] text-gray-700"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "all", label: "All Formulations" },
                      { id: "top-rated", label: "Top Rated" },
                      { id: "on-sale", label: "Privilege Offers" },
                    ].map((status) => (
                      <button
                        key={status.id}
                        onClick={() => setTempStatusFilter(status.id)}
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-none border transition-all ${
                          tempStatusFilter === status.id
                            ? "bg-[#141311] text-white border-[#141311]"
                            : "bg-white border-[#F0DCE3] text-gray-700"
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-[#F0DCE3] flex gap-3">
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-3 border border-[#F0DCE3] text-[10px] font-bold uppercase tracking-widest text-gray-500 rounded-none"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSortOption(tempSortOption);
                    setStatusFilter(tempStatusFilter);
                    setShowFilters(false);
                  }}
                  className="flex-1 py-3 bg-[#141311] text-white text-[10px] font-bold uppercase tracking-widest rounded-none border border-[#141311]"
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

export default SubcategoryPage;
