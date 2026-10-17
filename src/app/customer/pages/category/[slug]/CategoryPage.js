'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FiChevronRight, FiSearch, FiShoppingCart, FiChevronDown, FiMaximize2, FiShoppingBag, FiFilter, FiX, FiPlus } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { GoStarFill } from 'react-icons/go';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../../store/cartSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CategoryPage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [categoryData, setCategoryData] = useState(null);
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tempSortOption, setTempSortOption] = useState("newest");
  const [tempStatusFilter, setTempStatusFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes, subRes, recRes] = await Promise.all([
          axios.get(`/api/categories`),
          axios.get(`/api/products`),
          axios.get(`/api/subcategories`),
          axios.get(`/api/products/topRated`)
        ]);

        const categories = catRes.data.data || [];
        const currentCategory = categories.find(c => c.slug === slug);

        if (currentCategory) {
          setCategoryData(currentCategory);

          const allSubcategories = subRes.data.data || [];
          const categorySubcategories = allSubcategories.filter(s => s.categoryId === currentCategory.id);
          setSubcategories(categorySubcategories);

          const subcategorySlugs = categorySubcategories.map(s => s.slug);
          const allProducts = prodRes.data || [];
          const categoryProducts = allProducts.filter(p => subcategorySlugs.includes(p.subcategorySlug));
          setProducts(categoryProducts);
        }
        setRecommendations((recRes.data.data || []).slice(0, 4));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK').format(price || 0);
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

  const handleProductClick = (productSlug) => {
    router.push(`/customer/pages/products/${productSlug}`);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF9F7]">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="w-14 h-14 border-2 border-[#E8DFC8] border-t-[#B98C2D] rounded-none animate-spin mb-4" />
      <span className="text-[11px] font-bold uppercase tracking-widest text-[#141311]">
        Loading Atelier Collection...
      </span>
    </div>
  );

  if (!categoryData) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF9F7] px-4">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <h2 className="text-xl font-serif text-[#141311] mb-3">Category Not Found</h2>
      <button
        onClick={() => router.push('/')}
        className="px-6 py-2.5 bg-[#141311] text-white text-xs font-bold uppercase tracking-widest rounded-none border border-[#141311]"
      >
        Return to Atelier
      </button>
    </div>
  );

  const filteredProductsList = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const subcategory = subcategories.find(s => s.id === activeSubcategory);
      const matchesSubcategory = !activeSubcategory || p.subcategorySlug === subcategory?.slug;

      const isTopRated = p.rating >= 4.5;
      const isOnSale = p.discount > 0;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "top-rated" && isTopRated) ||
        (statusFilter === "on-sale" && isOnSale);

      return matchesSearch && matchesSubcategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOption === "price-asc") return a.price - b.price;
      if (sortOption === "price-desc") return b.price - a.price;
      if (sortOption === "name-asc") return a.name.localeCompare(b.name);
      if (sortOption === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  return (
    <div className="bg-[#FBF9F7] min-h-screen pb-20 text-[#141311]">
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Navigation Breadcrumb & Search Header */}
      <div className="border-b border-[#E8DFC8] bg-white">
        <div className="container mx-auto max-w-[1536px] px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <span className="cursor-pointer hover:text-[#141311] transition-colors" onClick={() => router.push('/')}>
                  Atelier
                </span>
                <span className="text-gray-300">/</span>
                <span className="cursor-pointer hover:text-[#141311] transition-colors" onClick={() => router.push('/customer/pages/allproducts')}>
                  Collections
                </span>
                <span className="text-gray-300">/</span>
                <span className="text-[#141311] font-bold truncate max-w-[200px] sm:max-w-none">{categoryData.name}</span>
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => {
                  setTempSortOption(sortOption);
                  setTempStatusFilter(statusFilter);
                  setShowFilters(true);
                }}
                className="md:hidden flex items-center justify-center bg-white text-[#141311] w-10 h-10 rounded-none border border-[#E8DFC8] transition-colors"
              >
                <FiFilter size={16} />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <p className="hidden md:block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Displaying <span className="text-[#141311] font-bold">{filteredProductsList.length}</span> Creations
              </p>
              <div className="relative group w-full md:w-auto">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="SEARCH IN THIS COLLECTION..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#F9F5EC] border border-[#E8DFC8] rounded-none py-2.5 pl-10 pr-4 text-xs font-medium tracking-wide focus:border-[#B98C2D] transition-all outline-none w-full md:w-[280px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-[1536px] px-4 lg:px-8 mt-8 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
        {/* Sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block md:col-span-3 space-y-6`}>
          <div className="bg-white border border-[#E8DFC8] rounded-none p-6 sticky top-28">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 pb-3 border-b border-[#E8DFC8] flex items-center gap-2 text-[#141311]">
              <span className="w-1.5 h-1.5 bg-[#B98C2D] rounded-none" />
              Department Tiers
            </h3>

            <div className="space-y-1.5">
              <div
                className={`group flex items-center justify-between p-3 rounded-none cursor-pointer border transition-all ${
                  !activeSubcategory
                    ? 'bg-[#F9F5EC] border-[#B98C2D] text-[#141311] font-bold'
                    : 'bg-white border-transparent hover:bg-[#F9F5EC] text-gray-600'
                }`}
                onClick={() => setActiveSubcategory(null)}
              >
                <span className="text-xs uppercase tracking-wider">All Formulations</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-none ${
                    !activeSubcategory ? 'bg-[#141311] text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {products.length}
                </span>
              </div>

              {subcategories.map((sub) => (
                <div
                  key={sub.id}
                  className={`group flex items-center justify-between p-3 rounded-none cursor-pointer border transition-all ${
                    activeSubcategory === sub.id
                      ? 'bg-[#F9F5EC] border-[#B98C2D] text-[#141311] font-bold'
                      : 'bg-white border-transparent hover:bg-[#F9F5EC] text-gray-600'
                  }`}
                  onClick={() => setActiveSubcategory(sub.id)}
                >
                  <span className="text-xs uppercase tracking-wider">{sub.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-none ${
                      activeSubcategory === sub.id ? 'bg-[#141311] text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {products.filter((p) => p.subCategoryId === sub.id).length}
                  </span>
                </div>
              ))}
            </div>

            {/* Atelier Assurance Box */}
            <div className="mt-8 pt-6 border-t border-[#E8DFC8]">
              <div className="bg-[#F9F5EC] border border-[#E8DFC8] text-[#141311] p-5">
                <span className="text-[9px] font-bold text-white bg-[#B98C2D] px-2 py-0.5 rounded-none uppercase tracking-widest mb-2.5 inline-block">
                  Atelier Guarantee
                </span>
                <h4 className="text-sm font-serif font-bold mb-1.5 uppercase tracking-wide">100% Authentic Beauty</h4>
                <p className="text-[11px] text-gray-500 mb-3 font-light leading-relaxed">
                  Certified genuine formulations direct from luxury cosmetic houses and laboratories.
                </p>
                <button
                  onClick={() => router.push('/customer/pages/allproducts')}
                  className="text-[#141311] text-[10px] font-bold uppercase tracking-widest border-b border-[#141311] pb-0.5 hover:text-[#B98C2D] hover:border-[#B98C2D] transition-all"
                >
                  Explore All Collections &rarr;
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="md:col-span-9">
          {filteredProductsList.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProductsList.map((product) => {
                const originalPrice = product.price / (1 - (product.discount || 0) / 100);
                return (
                  <div
                    key={product.id}
                    className="group flex flex-col bg-white border border-[#E8DFC8] hover:border-[#B98C2D] rounded-none overflow-hidden transition-all duration-300 cursor-pointer"
                    onClick={() => handleProductClick(product.slug)}
                  >
                    <div className="relative aspect-square bg-[#F9F5EC] overflow-hidden rounded-none border-b border-[#E8DFC8]/60">
                      {product.images?.[0] && (
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
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-700 ease-out"
                          unoptimized
                          loading="lazy"
                        />
                      )}
                      {product.discount > 0 && (
                        <div className="absolute top-2 left-2 bg-[#B98C2D] text-white text-[9px] font-bold px-2 py-0.5 rounded-none uppercase tracking-widest">
                          -{product.discount.toFixed(0)}%
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-0.5 text-[#B98C2D]">
                          <GoStarFill size={11} />
                          <GoStarFill size={11} />
                          <GoStarFill size={11} />
                          <GoStarFill size={11} />
                          <GoStarFill size={11} />
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          Authentic
                        </span>
                      </div>
                      <h4 className="mb-2 line-clamp-2 text-xs sm:text-[13px] font-serif font-bold text-[#141311] group-hover:text-[#B98C2D] transition-colors leading-snug h-[2.8em] overflow-hidden">
                        {product.name}
                      </h4>

                      {/* Price Row */}
                      <div className="flex items-baseline gap-2 mt-auto mb-3.5">
                        <span className="text-sm sm:text-base font-bold text-[#141311]">
                          Rs. {formatPrice(product.price)}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-[10px] text-gray-400 line-through">
                            Rs. {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2 mt-auto">
                        <button
                          className="border border-[#141311] text-[#141311] text-[10px] font-bold uppercase tracking-wider py-2 rounded-none hover:bg-[#141311] hover:text-white transition-all flex items-center justify-center gap-1.5"
                          onClick={(e) => handleAddToCart(product, e)}
                        >
                          <FiShoppingCart size={11} /> <span>Bag</span>
                        </button>
                        <button
                          className="bg-[#141311] hover:bg-[#2A1B24] text-white text-[10px] font-bold uppercase tracking-wider py-2 rounded-none transition-all border border-[#141311]"
                          onClick={(e) => handleBuyNow(product, e)}
                        >
                          Acquire
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center bg-white rounded-none border border-dashed border-[#E8DFC8] p-8">
              <h3 className="text-lg font-serif font-bold text-[#141311] mb-2">No Formulations In This Collection</h3>
              <p className="text-xs text-gray-400 font-light">
                Our atelier curators are currently crafting new arrivals. Please explore our other beauty collections.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="mt-24 pt-16 border-t border-[#E8DFC8] px-4 max-w-[1536px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <span className="text-[10px] font-bold text-[#B98C2D] uppercase tracking-widest block mb-1">
                Atelier Handpicked
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold uppercase tracking-tight text-[#141311]">
                Explore Recommendations
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {recommendations.map((p) => (
              <div
                key={p.id}
                className="group cursor-pointer bg-white border border-[#E8DFC8] hover:border-[#B98C2D] p-4 rounded-none transition-all"
                onClick={() => handleProductClick(p.slug)}
              >
                <div className="relative aspect-square rounded-none overflow-hidden bg-[#F9F5EC] border border-[#E8DFC8]/50 mb-3">
                  {p.images?.[0] && (
                    <Image
                      fill
                      src={
                        p.images[0].url?.startsWith('http') || p.images[0].url?.startsWith('data:')
                          ? p.images[0].url
                          : `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${p.images[0].url || p.images[0]}`
                      }
                      alt={p.name}
                      className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                      loading="lazy"
                    />
                  )}
                </div>
                <h4 className="text-xs font-serif font-bold truncate group-hover:text-[#B98C2D] transition-colors uppercase tracking-wide mb-1 text-[#141311]">
                  {p.name}
                </h4>
                <p className="text-sm font-bold text-[#141311]">Rs. {formatPrice(p.price)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter Section */}
      <div className="mt-24 max-w-[1536px] px-4 mx-auto">
        <div className="bg-[#F9F5EC] border border-[#E8DFC8] rounded-none p-8 md:p-14 text-center">
          <div className="max-w-xl mx-auto">
            <span className="text-[10px] font-bold text-[#B98C2D] uppercase tracking-widest block mb-2">
              Privileged Access
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#141311] mb-3 uppercase tracking-tight">
              Join the Velvet Circle
            </h3>
            <p className="text-gray-500 mb-8 text-xs font-light leading-relaxed">
              Receive bespoke beauty recommendations, private release notices, and VIP invitations directly in your inbox.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="ENTER YOUR EMAIL..."
                className="flex-1 bg-white border border-[#E8DFC8] rounded-none py-3 px-4 text-xs tracking-wider focus:border-[#B98C2D] transition-all outline-none"
              />
              <button className="bg-[#141311] hover:bg-[#2A1B24] text-white px-8 py-3 rounded-none font-bold text-xs uppercase tracking-widest transition-all border border-[#141311]">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal for Mobile */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-[60] md:hidden">
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
              className="absolute left-0 right-0 bottom-0 bg-white rounded-none border-t border-[#E8DFC8] flex flex-col max-h-[85vh]"
            >
              <div className="px-6 py-4 flex items-center justify-between border-b border-[#E8DFC8]">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#141311]">Filter Formulations</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 text-gray-400 hover:text-black transition-colors"
                >
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
                            : "bg-white border-[#E8DFC8] text-gray-700"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Product Distinction</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "all", label: "All Items" },
                      { id: "top-rated", label: "Top Rated" },
                      { id: "on-sale", label: "Privilege Offers" },
                    ].map((status) => (
                      <button
                        key={status.id}
                        onClick={() => setTempStatusFilter(status.id)}
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-none border transition-all ${
                          tempStatusFilter === status.id
                            ? "bg-[#141311] text-white border-[#141311]"
                            : "bg-white border-[#E8DFC8] text-gray-700"
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-[#E8DFC8] flex gap-3">
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-3 border border-[#E8DFC8] text-[10px] font-bold uppercase tracking-widest text-gray-500 rounded-none"
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

export default CategoryPage;
