'use client';

import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FiChevronLeft, FiChevronRight, FiDownload, FiArrowRight } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cartSlice';
import Image from 'next/image';
import DigitalCheckoutModal from './DigitalCheckoutModal';
import { getSafeImageUrl } from '../../util/imageUtils';

const Products = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productIndices, setProductIndices] = useState({});
  const [isDigitalModalOpen, setIsDigitalModalOpen] = useState(false);
  const [selectedDigitalProduct, setSelectedDigitalProduct] = useState(null);

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, subRes, prodRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/subcategories'),
          axios.get('/api/products'),
        ]);

        const cats = Array.isArray(catRes.data?.data) ? catRes.data.data : Array.isArray(catRes.data) ? catRes.data : [];
        const subs = Array.isArray(subRes.data?.data) ? subRes.data.data : Array.isArray(subRes.data) ? subRes.data : [];
        const prods = Array.isArray(prodRes.data) ? prodRes.data : Array.isArray(prodRes.data?.data) ? prodRes.data.data : [];

        setCategories(cats);
        setSubcategories(subs);
        setProducts(prods);

        const initialIndices = {};
        cats.forEach((cat) => {
          initialIndices[cat.slug] = 0;
        });
        setProductIndices(initialIndices);
        setLoading(false);
      } catch (error) {
        console.error('PRODUCTS COMPONENT FETCH ERROR:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const scrollLeft = (categorySlug) => {
    setProductIndices((prev) => {
      const current = prev[categorySlug] || 0;
      return { ...prev, [categorySlug]: Math.max(0, current - 1) };
    });
  };

  const scrollRight = (categorySlug, totalProducts) => {
    setProductIndices((prev) => {
      const current = prev[categorySlug] || 0;
      const maxIndex = Math.max(0, totalProducts - 4);
      return { ...prev, [categorySlug]: Math.min(maxIndex, current + 1) };
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-[1536px] px-4 lg:px-8 py-12">
        <div className="space-y-12">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="h-8 w-64 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-64 bg-gray-100 rounded-xl"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Associate products to each category through subcategories
  const categoriesWithProducts = categories.map((cat) => {
    const catSubSlugs = new Set(
      subcategories
        .filter((sub) => sub.categoryId === cat.id)
        .map((sub) => sub.slug)
    );

    const catProducts = products.filter((p) => catSubSlugs.has(p.subcategorySlug));

    return {
      category: cat,
      products: catProducts,
    };
  }).filter((item) => item.products.length > 0);

  return (
    <div className="space-y-16 bg-white py-8">
      {categoriesWithProducts.map(({ category, products: catProducts }) => {
        const currentIndex = productIndices[category.slug] || 0;
        const visibleProducts = catProducts.slice(currentIndex, currentIndex + 5);

        return (
          <section key={category.slug} className="container mx-auto max-w-[1536px] px-4 lg:px-8">
            {/* Section Header */}
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-none bg-theme-primary"></span>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight capitalize">
                  {category.name}
                </h3>
                <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                  ({catProducts.length} items)
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Scroll arrows */}
                {catProducts.length > 4 && (
                  <div className="hidden md:flex items-center gap-1.5">
                    <button
                      onClick={() => scrollLeft(category.slug)}
                      disabled={currentIndex === 0}
                      className="w-8 h-8 rounded-none border border-gray-200 hover:border-theme-dark hover:text-theme-dark disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors bg-white shadow-xs"
                      aria-label="Previous items"
                    >
                      <FiChevronLeft size={15} />
                    </button>
                    <button
                      onClick={() => scrollRight(category.slug, catProducts.length)}
                      disabled={currentIndex + 4 >= catProducts.length}
                      className="w-8 h-8 rounded-none border border-gray-200 hover:border-theme-dark hover:text-theme-dark disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors bg-white shadow-xs"
                      aria-label="Next items"
                    >
                      <FiChevronRight size={15} />
                    </button>
                  </div>
                )}

                <Link
                  href={`/customer/pages/category/${category.slug}`}
                  className="text-xs font-bold text-theme-dark hover:text-theme-primary flex items-center gap-1"
                >
                  <span>View All</span>
                  <FiArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Split Layout: Department Feature Spotlight Banner + Products Row */}
            <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-4 sm:gap-5 items-stretch">
              {/* Category Feature Spotlight Banner */}
              <div className="hidden lg:flex flex-col justify-between rounded-none overflow-hidden bg-gradient-to-br from-theme-light via-white to-theme-light border border-theme-border p-5 relative group shadow-xs">
                <div className="relative z-10">
                  <span className="text-[9px] font-black uppercase tracking-widest text-theme-primary bg-white px-2 py-0.5 rounded-none border border-theme-primary/20 inline-block mb-2">
                    Cosmetics Department
                  </span>
                  <h4 className="text-lg font-black text-gray-900 leading-tight">
                    {category.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1 font-medium">
                    100% Genuine, authentic and clinically safe formulas
                  </p>
                </div>

                {category.imageUrl && (
                  <div className="relative w-full h-32 my-3 rounded-none overflow-hidden bg-white/70 p-2 border border-theme-border/60">
                    <Image
                      fill
                      src={getSafeImageUrl(category.imageUrl)}
                      alt={category.name}
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                )}

                <Link
                  href={`/customer/pages/category/${category.slug}`}
                  className="relative z-10 w-full py-2.5 text-center bg-theme-dark hover:bg-theme-primary text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors shadow-xs mt-auto"
                >
                  Shop {category.name}
                </Link>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-3.5">
                {visibleProducts.map((product) => {
                  const originalPrice = calculateOriginalPrice(product.price, product.discount);
                  const firstImg = product.images?.[0];
                  const rawUrl = typeof firstImg === 'string' ? firstImg : firstImg?.url;
                  const imgUrl = getSafeImageUrl(rawUrl);

                  return (
                    <div
                      key={product.id}
                      onClick={() => router.push(`/customer/pages/products/${product.slug}`)}
                      className="bg-white rounded-none border border-gray-200 hover:border-gray-900 p-2.5 sm:p-3 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group relative"
                    >
                      {/* Product Image Container */}
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

                        {/* Discount Badge */}
                        {product.discount > 0 && (
                          <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-none bg-theme-primary text-white font-bold text-[9px] uppercase tracking-wider shadow-xs">
                            -{Math.round(product.discount)}%
                          </div>
                        )}
                      </div>

                      {/* Product Title */}
                      <h4 className="text-xs sm:text-[13px] font-semibold text-gray-800 line-clamp-2 h-[2.5em] leading-snug group-hover:text-theme-primary transition-colors mb-1.5">
                        {product.name}
                      </h4>

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
                })}
              </div>
            </div>
          </section>
        );
      })}

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
  );
};

export default Products;
