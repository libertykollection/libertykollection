'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FiShoppingBag, FiCheck } from 'react-icons/fi';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { addToCart } from '../../../store/cartSlice';
import { toggleWishlist } from '../../../store/wishlistSlice';
import { useQuickView } from './QuickView';
import { formatPrice, getOriginalPrice, parseImages, productHref } from './homeUtils';

const ProductCard = ({ product, index = 0, compact = false, showBottomBar = false }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { open } = useQuickView();
  const [added, setAdded] = useState(false);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const inWishlist = wishlistItems.some((item) => item.id === product?.id);

  const images = parseImages(product);
  const primary = images[0];
  const secondary = images[1];
  const original = getOriginalPrice(product);
  const hasDiscount = Boolean(original && product?.discount && product.discount > 0);
  const category =
    product?.subcategory?.category?.name ||
    product?.subcategory?.name ||
    product?.category?.name ||
    'Liberty Kollection';
  const isDigital = product?.productType === 'digital';
  const outOfStock = product?.stock === 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDigital) {
      router.push(productHref(product));
      return;
    }
    dispatch(addToCart(product));
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product));
  };

  const reviewCount = product?.reviews?.length || product?.ratingCount || 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
      className="group relative flex flex-col h-full bg-transparent select-none cursor-pointer"
    >
      <Link href={productHref(product)} className="flex flex-col h-full" aria-label={product?.name}>
        {/* 1. Image Container matching Liberty rounded full-bleed style */}
        <div className="relative w-full aspect-[4/5] rounded-[18px] overflow-hidden bg-[#F8F6F2] transition-all duration-300 group-hover:shadow-md">
          {primary ? (
            <>
              <Image
                fill
                unoptimized
                loading="lazy"
                src={primary}
                alt={product.name}
                className={`object-cover transition-all duration-700 ease-out group-hover:scale-[1.04] ${
                  secondary ? 'group-hover:opacity-0' : ''
                }`}
              />
              {secondary && (
                <Image
                  fill
                  unoptimized
                  loading="lazy"
                  src={secondary}
                  alt=""
                  aria-hidden="true"
                  className="object-cover opacity-0 scale-105 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-100"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-300">
              No image
            </div>
          )}

          {/* 2. Top-Left Sale Badge matching the exact image */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-[#6B0E44] text-white text-[10.5px] font-medium tracking-normal px-2.5 py-0.5 rounded-full shadow-xs">
                Sale
              </span>
            </div>
          )}

          {/* Out of Stock Badge */}
          {outOfStock && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-[#1A1A1A] text-white text-[10px] font-medium tracking-normal px-2.5 py-0.5 rounded-full shadow-xs">
                Sold Out
              </span>
            </div>
          )}

          {/* Wishlist Heart Button (subtle on hover or when active) */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-gray-700 hover:text-[#77104C] transition-all shadow-xs ${
              inWishlist ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {inWishlist ? <FaHeart className="text-[#77104C]" size={12} /> : <FaRegHeart size={12} />}
          </button>

          {/* 3. Add to Cart Button (Bottom bar in catalog grid, or hover drawer in sliders) */}
          {showBottomBar ? (
            <div className="absolute inset-x-0 bottom-0 z-10">
              <button
                type="button"
                onClick={handleAdd}
                disabled={outOfStock && !isDigital}
                aria-label={`Add ${product.name} to cart`}
                className={`w-full h-10 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] disabled:opacity-50 ${
                  added ? 'bg-emerald-600 text-white' : 'bg-[#77104C] hover:bg-[#5E0B3C] text-white shadow-xs'
                }`}
              >
                {added ? <FiCheck size={14} /> : <FiShoppingBag size={13} />}
                <span>{isDigital ? 'Download' : added ? 'Added' : 'Add to cart'}</span>
              </button>
            </div>
          ) : (
            <div className="absolute inset-x-3 bottom-3 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                type="button"
                onClick={handleAdd}
                disabled={outOfStock && !isDigital}
                className={`w-full h-9 flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 ${
                  added ? 'bg-emerald-600 text-white' : 'bg-[#77104C] hover:bg-[#5E0B3C] text-white'
                }`}
              >
                {added ? <FiCheck size={14} /> : <FiShoppingBag size={14} />}
                <span>{isDigital ? 'Download' : added ? 'Added' : 'Add to cart'}</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Product Details - Strictly Left-Aligned matching screenshot */}
        <div className="pt-2.5 pb-1 flex flex-col flex-1 text-left">
          {/* Product Name */}
          <h3 className="text-[13.5px] sm:text-[14.5px] font-semibold text-[#1F1F1F] leading-snug line-clamp-1 group-hover:text-[#77104C] transition-colors">
            {product.name}
          </h3>

          {/* Brand / Subcategory */}
          <span className="text-[11.5px] text-[#767676] font-normal mt-0.5 block truncate">
            {category}
          </span>

          {/* Star Rating & Review Count */}
          <div className="flex items-center gap-0.5 text-[11px] mt-1">
            <span className={reviewCount > 0 ? 'text-[#77104C]' : 'text-[#D4AFBF]'}>
              ★★★★★
            </span>
            <span className="text-[11px] text-[#555555] ml-1.5 font-normal">
              {reviewCount} reviews
            </span>
          </div>

          {/* Price & Discount Row */}
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span className={`text-[13.5px] sm:text-[14.5px] font-bold tabular-nums ${hasDiscount ? 'text-[#C5193B]' : 'text-[#1F1F1F]'}`}>
              Rs.{formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-[11.5px] text-[#999999] line-through tabular-nums ml-0.5">
                  Rs.{formatPrice(original)}
                </span>
                <span className="bg-[#5A0B38] text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded-full ml-1 leading-none">
                  -{Math.round(product.discount)}%
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default ProductCard;

export const ProductCardSkeleton = () => (
  <div className="flex flex-col animate-pulse">
    <div className="w-full aspect-[4/5] rounded-[18px] bg-gray-200/70" />
    <div className="pt-2.5 space-y-1.5 text-left">
      <div className="h-3.5 w-3/4 bg-gray-200/70 rounded" />
      <div className="h-2.5 w-1/2 bg-gray-100 rounded" />
      <div className="h-2.5 w-1/3 bg-gray-100 rounded" />
      <div className="h-3.5 w-2/5 bg-gray-200/70 rounded mt-1" />
    </div>
  </div>
);
