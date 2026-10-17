'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { FiEye, FiShoppingBag, FiCheck } from 'react-icons/fi';
import { addToCart } from '../../../store/cartSlice';
import { useQuickView } from './QuickView';
import { formatPrice, getOriginalPrice, parseImages, productHref } from './homeUtils';

const ProductCard = ({ product, index = 0, compact = false }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { open } = useQuickView();
  const [added, setAdded] = useState(false);

  const images = parseImages(product);
  const primary = images[0];
  const secondary = images[1];
  const original = getOriginalPrice(product);
  const category = product.subcategory?.name || product.subcategory?.category?.name;
  const isDigital = product.productType === 'digital';
  const outOfStock = product.stock === 0;

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

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    open(product);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.05 }}
      className="group relative bg-white border border-gray-200 hover:border-theme-dark transition-colors duration-300 flex flex-col h-full"
    >
      <Link href={productHref(product)} className="flex flex-col h-full" aria-label={product.name}>
        {/* Media */}
        <div className={`relative w-full overflow-hidden bg-[#FBF8F7] ${compact ? 'aspect-[4/4]' : 'aspect-[4/5]'}`}>
          {primary ? (
            <>
              <Image
                fill
                unoptimized
                loading="lazy"
                src={primary}
                alt={product.name}
                className={`object-contain p-4 transition-all duration-700 ease-out group-hover:scale-[1.06] ${
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
                  className="object-contain p-4 opacity-0 scale-105 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-100"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-300">No image</div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {original && (
              <span className="bg-theme-primary text-white text-[10px] font-bold tracking-wider px-2 py-0.5">
                -{Math.round(product.discount)}%
              </span>
            )}
            {outOfStock && (
              <span className="bg-gray-900/80 text-white text-[10px] font-bold tracking-wider px-2 py-0.5">SOLD OUT</span>
            )}
          </div>

          {/* Hover actions */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <button
              type="button"
              onClick={handleQuickView}
              aria-label={`Quick view ${product.name}`}
              className="w-12 h-11 flex items-center justify-center bg-white border-t border-r border-gray-200 text-theme-dark hover:bg-theme-light transition-colors"
            >
              <FiEye size={16} />
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={outOfStock && !isDigital}
              className={`flex-1 h-11 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 ${
                added ? 'bg-emerald-600 text-white' : 'bg-theme-dark text-white hover:bg-theme-primary'
              }`}
            >
              {added ? <FiCheck size={14} /> : <FiShoppingBag size={14} />}
              {isDigital ? 'View' : added ? 'Added' : 'Add to bag'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          {category && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-1 line-clamp-1">
              {category}
            </span>
          )}
          <h3 className="text-[13px] sm:text-sm font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2.6em] group-hover:text-theme-primary transition-colors">
            {product.name}
          </h3>
          <div className="mt-auto pt-2 flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-black text-theme-dark tabular-nums">
              Rs. {formatPrice(product.price)}
            </span>
            {original && (
              <span className="text-[11px] text-gray-400 line-through tabular-nums">Rs. {formatPrice(original)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Mobile add button (hover actions are hidden on touch) */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock && !isDigital}
        className="md:hidden mx-3 mb-3 h-9 text-[11px] font-bold uppercase tracking-widest bg-theme-dark text-white disabled:opacity-50"
      >
        {isDigital ? 'View' : added ? 'Added ✓' : 'Add to bag'}
      </button>
    </motion.article>
  );
};

export default ProductCard;

export const ProductCardSkeleton = () => (
  <div className="border border-gray-100 animate-pulse">
    <div className="aspect-[4/5] bg-gray-100" />
    <div className="p-4 space-y-2">
      <div className="h-2 w-16 bg-gray-100" />
      <div className="h-3 w-full bg-gray-100" />
      <div className="h-3 w-2/3 bg-gray-100" />
      <div className="h-4 w-20 bg-gray-200 mt-3" />
    </div>
  </div>
);
