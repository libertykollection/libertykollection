'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { FiX, FiMinus, FiPlus, FiShoppingBag, FiCheck, FiArrowRight, FiShield, FiTruck } from 'react-icons/fi';
import { addToCart } from '../../../store/cartSlice';
import { formatPrice, getOriginalPrice, parseImages, productHref, stripHtml } from './homeUtils';

const QuickViewContext = createContext({ open: () => {} });
export const useQuickView = () => useContext(QuickViewContext);

export const QuickViewProvider = ({ children }) => {
  const [product, setProduct] = useState(null);
  const open = useCallback((p) => setProduct(p), []);
  const close = useCallback(() => setProduct(null), []);

  return (
    <QuickViewContext.Provider value={{ open }}>
      {children}
      <AnimatePresence>{product && <QuickViewModal product={product} onClose={close} />}</AnimatePresence>
    </QuickViewContext.Provider>
  );
};

const QuickViewModal = ({ product, onClose }) => {
  const dispatch = useDispatch();
  const images = parseImages(product);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const original = getOriginalPrice(product);
  const description = stripHtml(product.description).slice(0, 260);
  const category = product.subcategory?.category?.name || product.subcategory?.name;
  const outOfStock = product.stock === 0;

  // Close on Escape + lock background scroll
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const handleAdd = () => {
    dispatch(addToCart({ ...product, quantity: qty }));
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.name}`}
    >
      <div className="absolute inset-0 bg-theme-dark/70 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        className="relative bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto grid md:grid-cols-2 shadow-2xl"
        initial={{ y: 40, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
      >
        <button
          id="quickview-close"
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute top-3 right-3 z-20 w-9 h-9 bg-white/90 border border-gray-200 flex items-center justify-center hover:bg-theme-dark hover:text-white transition-colors"
        >
          <FiX size={18} />
        </button>

        {/* Gallery */}
        <div className="bg-theme-light/60 p-5 flex flex-col">
          <div className="relative aspect-square bg-white overflow-hidden">
            <AnimatePresence mode="wait">
              {images[active] && (
                <motion.div
                  key={active}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image fill unoptimized src={images[active]} alt={product.name} className="object-contain p-6" />
                </motion.div>
              )}
            </AnimatePresence>
            {original && (
              <span className="absolute top-3 left-3 bg-theme-primary text-white text-[10px] font-bold tracking-widest uppercase px-2 py-1">
                Save {Math.round(product.discount)}%
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
              {images.slice(0, 6).map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActive(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={`relative w-16 h-16 flex-shrink-0 bg-white border-2 transition-colors ${
                    i === active ? 'border-theme-primary' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image fill unoptimized src={src} alt="" className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-6 sm:p-8 flex flex-col">
          {category && (
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-theme-primary mb-2">{category}</span>
          )}
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight mb-3">{product.name}</h2>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-black text-theme-dark tabular-nums">Rs. {formatPrice(product.price)}</span>
            {original && (
              <span className="text-sm text-gray-400 line-through tabular-nums">Rs. {formatPrice(original)}</span>
            )}
          </div>

          {description && <p className="text-sm text-gray-500 leading-relaxed mb-5">{description}…</p>}

          {product.stock > 0 && product.stock <= 10 && (
            <p className="text-xs font-bold text-theme-primary mb-4">Only {product.stock} left in stock</p>
          )}

          <div className="flex items-stretch gap-2 mb-4">
            <div className="flex items-center border border-gray-300">
              <button
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-12 flex items-center justify-center hover:bg-gray-100"
              >
                <FiMinus size={14} />
              </button>
              <span className="w-10 text-center font-bold tabular-nums">{qty}</span>
              <button
                aria-label="Increase quantity"
                onClick={() => setQty((q) => q + 1)}
                className="w-10 h-12 flex items-center justify-center hover:bg-gray-100"
              >
                <FiPlus size={14} />
              </button>
            </div>
            <button
              id="quickview-add-to-bag"
              onClick={handleAdd}
              disabled={outOfStock}
              className={`flex-1 h-12 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                added ? 'bg-emerald-600 text-white' : 'bg-theme-dark hover:bg-theme-primary text-white'
              }`}
            >
              {added ? <FiCheck size={16} /> : <FiShoppingBag size={16} />}
              {outOfStock ? 'Out of stock' : added ? 'Added to bag' : 'Add to bag'}
            </button>
          </div>

          <Link
            href={productHref(product)}
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-theme-dark hover:text-theme-primary group mb-6"
          >
            View full details <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="mt-auto grid grid-cols-2 gap-3 pt-5 border-t border-gray-100 text-[11px] text-gray-500">
            <span className="flex items-center gap-2"><FiShield className="text-theme-primary" /> 100% authentic</span>
            <span className="flex items-center gap-2"><FiTruck className="text-theme-primary" /> Nationwide delivery</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
