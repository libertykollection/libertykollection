'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cartSlice';
import Image from 'next/image';
import { FiFilter, FiX, FiDownload, FiShoppingCart } from 'react-icons/fi';
import DigitalCheckoutModal from './DigitalCheckoutModal';
import { getSafeImageUrl } from '../../util/imageUtils';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(12);
  const [loading, setLoading] = useState(true);

  // Filter Data State
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [isDigitalModalOpen, setIsDigitalModalOpen] = useState(false);
  const [selectedDigitalProduct, setSelectedDigitalProduct] = useState(null);

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, catsRes] = await Promise.all([
          axios.get('/api/products/topRated'),
          axios.get('/api/categories'),
        ]);

        const fetchedProducts = (productsRes.data.data || []).map((p) => ({
          ...p,
          images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
        }));

        setProducts(fetchedProducts);
        setCategories(catsRes.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error('FETCH DATA ERROR:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (activeCategory) {
        const prodCatId = product.subcategory?.categoryId || product.subcategory?.category?.id || product.categoryId;
        if (prodCatId != activeCategory) return false;
      }
      return true;
    });
  }, [products, activeCategory]);

  const handleProductClick = (slug) => {
    router.push(`/customer/pages/products/${slug}`);
  };

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    dispatch(addToCart(product));
  };

  const formatPrice = (price) => {
    return price ? Math.round(price).toLocaleString('en-PK') : '0';
  };

  const calculateOriginalPrice = (price, discount) => {
    if (typeof price === 'number' && typeof discount === 'number' && discount > 0) {
      return price / (1 - discount / 100);
    }
    return price;
  };

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto max-w-[1536px] px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-3 border-b border-gray-100 gap-4">
          <div>
            <span className="text-[10px] font-bold text-theme-primary uppercase tracking-[0.2em] block mb-1">
              Gloria Cosmetics • Prestige Beauty Bestsellers
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Prestige Cosmetics & Skincare
            </h2>
          </div>

          {/* Department Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveCategory('')}
              className={`px-3.5 py-1.5 rounded-none text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === ''
                  ? 'bg-theme-dark text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items
            </button>
            {categories.slice(0, 6).map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id.toString())}
                className={`px-3.5 py-1.5 rounded-none text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === c.id.toString()
                    ? 'bg-theme-dark text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-3.5">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-none border border-gray-200 p-3 animate-pulse h-56"></div>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.slice(0, visibleProducts).map((product) => {
              const originalPrice = calculateOriginalPrice(product.price, product.discount);
              const firstImg = product.images?.[0];
              const rawUrl = typeof firstImg === 'string' ? firstImg : firstImg?.url;
              const imgUrl = getSafeImageUrl(rawUrl);

              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.slug)}
                  className="bg-white rounded-none border border-gray-200 hover:border-gray-900 p-2.5 sm:p-3 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group relative"
                >
                  {/* Image with Discount Badge */}
                  <div className="relative h-32 sm:h-36 w-full bg-white mb-2 flex items-center justify-center overflow-hidden rounded-none">
                    {imgUrl ? (
                      <Image
                        fill
                        src={imgUrl}
                        alt={product.name}
                        className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-gray-300 text-xs">No image</div>
                    )}

                    {product.discount > 0 && (
                      <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-none bg-theme-primary text-white font-bold text-[9px] uppercase tracking-wider shadow-xs">
                        -{Math.round(product.discount)}%
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xs sm:text-[13px] font-semibold text-gray-800 line-clamp-2 h-[2.5em] leading-snug group-hover:text-theme-primary transition-colors mb-1.5">
                    {product.name}
                  </h3>

                  {/* Price Row */}
                  <div className="mb-2">
                    <span className="inline-block text-gray-900 font-bold tabular-nums text-xs sm:text-sm">
                      Rs.{formatPrice(product.price)}
                    </span>
                    {product.discount > 0 && (
                      <span className="block text-[10px] text-gray-400 line-through tabular-nums mt-0.5">
                        Rs.{formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Full-Width Action Button */}
                  <button
                    onClick={(e) => {
                      if (product.productType === 'digital') {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedDigitalProduct(product);
                        setIsDigitalModalOpen(true);
                      } else {
                        handleAddToCart(product, e);
                      }
                    }}
                    className="w-full py-1.5 sm:py-2 bg-theme-dark hover:bg-theme-primary text-white font-bold text-[11px] sm:text-xs rounded-none uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    {product.productType === 'digital' ? (
                      <>
                        <FiDownload size={13} /> DOWNLOAD
                      </>
                    ) : (
                      'ADD TO BAG'
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-gray-400 col-span-full py-8 text-center">No products found in this department.</p>
          )}
        </div>

        {/* Load More Button */}
        {visibleProducts < filteredProducts.length && (
          <div className="text-center mt-6">
            <button
              onClick={() => setVisibleProducts((prev) => prev + 12)}
              className="px-6 py-2.5 rounded-none border border-theme-dark text-theme-dark hover:bg-theme-dark hover:text-white text-xs font-bold uppercase tracking-wider transition-all"
            >
              Load More Products
            </button>
          </div>
        )}

        {/* Digital Product Modal */}
        {selectedDigitalProduct && (
          <DigitalCheckoutModal
            isOpen={isDigitalModalOpen}
            onRequestClose={() => setIsDigitalModalOpen(false)}
            product={selectedDigitalProduct}
            onSuccess={() => {
              setIsDigitalModalOpen(false);
              router.push(`/customer/pages/products/${selectedDigitalProduct.slug}`);
            }}
          />
        )}
      </div>
    </section>
  );
};

export default AllProducts;
