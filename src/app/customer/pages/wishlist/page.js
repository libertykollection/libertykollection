'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromWishlist, clearWishlist } from '../../../store/wishlistSlice';
import { addToCart } from '../../../store/cartSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FiHeart,
  FiShoppingBag,
  FiTrash2,
  FiChevronRight,
  FiCheck,
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import Features from '../../components/Features';
import { getSafeImageUrl } from '../../../util/imageUtils';

export default function WishlistPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const [hasMounted, setHasMounted] = useState(false);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const resolveItemImage = (item) => {
    if (!item) return '/placeholder.png';
    if (Array.isArray(item.images) && item.images.length > 0) {
      const first = item.images[0];
      const url = typeof first === 'string' ? first : first?.url;
      if (url) return getSafeImageUrl(url);
    }
    if (typeof item.images === 'string') {
      try {
        const parsed = JSON.parse(item.images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0];
          const url = typeof first === 'string' ? first : first?.url;
          if (url) return getSafeImageUrl(url);
        }
      } catch (e) {
        if (item.images.startsWith('http') || item.images.startsWith('/')) {
          return getSafeImageUrl(item.images);
        }
      }
    }
    if (item.image) return getSafeImageUrl(item.image);
    if (item.imageUrl) return getSafeImageUrl(item.imageUrl);
    return '/placeholder.png';
  };

  const getEffectivePrice = (item) => {
    const price = Number(item?.price) || 0;
    const discount = Number(item?.discount) || 0;
    return discount > 0 ? price - (price * discount) / 100 : price;
  };

  const handleAddToCart = (item) => {
    if (item.stock === 0 && item.productType !== 'digital') {
      toast.error('This formulation is currently sold out.');
      return;
    }
    setAddingId(item.id);
    dispatch(addToCart(item));
    toast.success(`"${item.name}" added to shopping bag!`);
    setTimeout(() => {
      setAddingId(null);
    }, 1200);
  };

  const handleRemove = (item) => {
    dispatch(removeFromWishlist(item.id));
    toast.info(`"${item.name}" removed from wishlist.`);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your entire Vanity Wishlist?')) {
      dispatch(clearWishlist());
      toast.info('Vanity Wishlist cleared.');
    }
  };

  const handleMoveAllToBag = () => {
    const inStockItems = wishlistItems.filter(
      (item) => item.stock !== 0 || item.productType === 'digital'
    );
    if (inStockItems.length === 0) {
      toast.info('No available in-stock items to add.');
      return;
    }
    inStockItems.forEach((item) => {
      dispatch(addToCart(item));
    });
    toast.success(`Moved ${inStockItems.length} items to your shopping bag!`);
  };

  // Avoid hydration mismatch by waiting for client mount
  if (!hasMounted) {
    return (
      <div className="bg-[#FBF9F7] min-h-[70vh] flex items-center justify-center py-20 font-sans">
        <div className="w-10 h-10 border-2 border-[#C53261] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#FBF9F7] min-h-screen py-8 font-sans text-[#141311]">
      <ToastContainer position="bottom-right" autoClose={3000} />

      <div className="container mx-auto max-w-[1536px] px-4 lg:px-8">
        {/* Breadcrumb Trail */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-[#8C7A70] py-3 mb-8 border-b border-[#F0DCE3] overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => router.push('/')}
            className="hover:text-[#C53261] transition-colors"
          >
            Home
          </button>
          <FiChevronRight size={13} className="text-[#C5A059]" />
          <button
            onClick={() => router.push('/customer/pages/allproducts')}
            className="hover:text-[#C53261] transition-colors"
          >
            Catalog
          </button>
          <FiChevronRight size={13} className="text-[#C5A059]" />
          <span className="text-[#141311] font-bold">My Vanity Wishlist</span>
        </nav>

        {/* Empty Wishlist State */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white border border-[#F0DCE3] py-20 px-6 sm:px-12 text-center max-w-2xl mx-auto my-12 shadow-xs">
            <div className="w-20 h-20 mx-auto mb-6 bg-[#FFF5F8] text-[#C53261] flex items-center justify-center text-3xl border border-[#F0DCE3]">
              <FiHeart />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141311] mb-3 tracking-tight">
              Your Vanity Wishlist is Empty
            </h1>
            <p className="text-xs sm:text-sm text-[#8C7A70] mb-8 max-w-md mx-auto leading-relaxed">
              Curate your personal collection of coveted beauty essentials, timeless shades, and luxury formulations. Click the heart icon on any product to save it here.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => router.push('/customer/pages/allproducts')}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#141311] hover:bg-[#C53261] text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-xs"
              >
                Explore Luxury Catalog
              </button>
              <button
                onClick={() => router.push('/customer/pages/discounted-products')}
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-[#FFF5F8] text-[#141311] hover:text-[#C53261] border border-[#F0DCE3] font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
              >
                View Beauty Deals
              </button>
            </div>
          </div>
        ) : (
          /* Populated Wishlist State */
          <div>
            {/* Header Banner */}
            <div className="bg-white border border-[#F0DCE3] p-6 sm:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141311] tracking-tight">
                    My Vanity Wishlist
                  </h1>
                  <span className="bg-[#FFF5F8] text-[#C53261] border border-[#F0DCE3] text-xs font-bold px-2.5 py-1">
                    {wishlistItems.length} {wishlistItems.length === 1 ? 'Formulation' : 'Formulations'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#8C7A70]">
                  Your private curation of prestige cosmetics and personal beauty favorites.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleMoveAllToBag}
                  className="px-5 py-2.5 bg-[#141311] hover:bg-[#C53261] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <FiShoppingBag size={14} />
                  <span>Move All to Bag</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2.5 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FiTrash2 size={13} />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
              {wishlistItems.map((item) => {
                const effectivePrice = getEffectivePrice(item);
                const originalPrice = Number(item.price) || 0;
                const hasDiscount = Number(item.discount) > 0;
                const isOutOfStock = item.stock === 0 && item.productType !== 'digital';
                const isAdding = addingId === item.id;
                const categoryLabel =
                  item.subcategory?.name ||
                  item.subcategory?.category?.name ||
                  item.category?.name ||
                  'Cosmetics';
                const imageUrl = resolveItemImage(item);

                return (
                  <div
                    key={item.id}
                    className="group relative bg-white border border-[#F0DCE3] hover:border-[#141311] transition-all duration-300 flex flex-col shadow-xs"
                  >
                    {/* Media Container */}
                    <div className="relative aspect-square w-full bg-[#FFF5F8] overflow-hidden flex items-center justify-center p-6 border-b border-[#F0DCE3]">
                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                        {hasDiscount && (
                          <span className="bg-[#C53261] text-white text-[10px] font-bold tracking-wider px-2 py-0.5 shadow-xs">
                            -{Math.round(item.discount)}% OFF
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="bg-gray-900 text-white text-[10px] font-bold tracking-wider px-2 py-0.5">
                            SOLD OUT
                          </span>
                        )}
                      </div>

                      {/* Remove from Wishlist Heart Button */}
                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        title="Remove from Vanity Wishlist"
                        className="absolute top-2.5 right-2.5 z-10 w-8 h-8 bg-white/95 hover:bg-white text-[#C53261] hover:text-red-600 border border-[#F0DCE3] flex items-center justify-center transition-all shadow-xs cursor-pointer"
                      >
                        <FaHeart size={14} />
                      </button>

                      {/* Product Image */}
                      <Link
                        href={`/customer/pages/products/${item.slug || item.id}`}
                        className="relative w-full h-full flex items-center justify-center"
                      >
                        <Image
                          src={imageUrl}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      </Link>
                    </div>

                    {/* Product Details */}
                    <div className="p-4 flex flex-col flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7A70] mb-1 truncate">
                        {categoryLabel}
                      </span>

                      <Link
                        href={`/customer/pages/products/${item.slug || item.id}`}
                        className="text-xs sm:text-sm font-semibold text-[#141311] hover:text-[#C53261] transition-colors line-clamp-2 min-h-[2.6em] mb-3 leading-snug"
                      >
                        {item.name}
                      </Link>

                      {/* Pricing */}
                      <div className="mt-auto pt-2 flex items-baseline gap-2 mb-4">
                        <span className="text-base font-bold text-[#141311] tabular-nums">
                          Rs. {effectivePrice.toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-[#8C7A70] line-through tabular-nums">
                            Rs. {originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[#F0DCE3]">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          disabled={isOutOfStock}
                          className={`flex-1 h-10 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                            isAdding
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#141311] hover:bg-[#C53261] text-white shadow-xs'
                          }`}
                        >
                          {isAdding ? <FiCheck size={14} /> : <FiShoppingBag size={14} />}
                          <span>{isAdding ? 'Added ✓' : isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          title="Remove item"
                          className="w-10 h-10 flex items-center justify-center border border-[#F0DCE3] text-gray-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Prestige Guarantees */}
        <div className="mt-12">
          <Features />
        </div>
      </div>
    </div>
  );
}
