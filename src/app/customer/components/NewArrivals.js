'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cartSlice';
import Image from 'next/image';
import { GoStarFill } from 'react-icons/go';
import { FiShoppingCart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getSafeImageUrl } from '../../util/imageUtils';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products/newArrivals');
        const res = await response.json();
        const data = res?.data || [];
        setProducts(data);
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    dispatch(addToCart(product));
  };

  const formatPrice = (price) => {
    return price ? Math.round(Number(price)).toLocaleString('en-PK') : '0';
  };

  if (loading || !products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-10 bg-white border-t border-gray-100">
      <div className="container mx-auto max-w-[1536px] px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-6 items-stretch">
          {/* Left Promotional Banner (Liberty Onyx to Sunburst Gold) */}
          <div className="relative rounded-none overflow-hidden bg-gradient-to-br from-[#141311] via-[#241F16] to-[#C53261] text-white p-7 flex flex-col justify-between shadow-md min-h-[360px] group border border-theme-border">
            {/* Background Decorative Graphic */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10">
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-none mb-3 border border-white/20">
                New Formulations
              </span>
              <h3 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight mb-2">
                Pure Radiance & Clean Beauty
              </h3>
              <p className="text-white/80 text-xs font-medium">
                Dermatologist tested, clean luxury cosmetics curated for you
              </p>
            </div>

            <div className="relative z-10 mt-8">
              <button
                onClick={() => router.push('/customer/pages/allproducts')}
                className="bg-white text-gray-900 hover:bg-theme-primary hover:text-white px-6 py-2.5 rounded-none font-black text-xs uppercase tracking-wider transition-all shadow-md group-hover:scale-105"
              >
                Shop Now
              </button>
            </div>
          </div>

          {/* Right Product Grid (up to 5 cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.slice(0, 5).map((product, idx) => {
              const imgUrl = (() => {
                if (product.image) return product.image;
                try {
                  const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                  const img = Array.isArray(parsed) ? parsed[0] : parsed;
                  const url = typeof img === 'string' ? img : img?.url;
                  return getSafeImageUrl(url);
                } catch (e) {
                  return '/placeholder.png';
                }
              })();

              const originalPrice = product.originalPrice || (product.discount ? (product.price / (1 - product.discount / 100)) : null);

              return (
                <div
                  key={product.id || idx}
                  onClick={() => router.push(`/customer/pages/products/${product.slug || product.id}`)}
                  className="bg-white rounded-none border border-gray-200 hover:border-gray-900 hover:shadow-md transition-all p-2.5 sm:p-3 flex flex-col justify-between cursor-pointer group relative"
                >
                  {/* Top image & discount badge */}
                  <div className="relative h-32 sm:h-36 w-full bg-[#F8F9FA] rounded-none mb-2.5 flex items-center justify-center overflow-hidden">
                    {product.discount > 0 && (
                      <span className="absolute top-1.5 left-1.5 z-10 bg-theme-secondary text-white text-[9px] font-black px-1.5 py-0.5 rounded-none shadow-xs">
                        -{Math.round(product.discount)}%
                      </span>
                    )}

                    <Image
                      src={imgUrl}
                      alt={product.name}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />

                    {/* Quick Add Button on Hover */}
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      title="Add to cart"
                      className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-none bg-white shadow-xs border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-theme-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <FiShoppingCart size={13} />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      {product.category?.name || product.category || 'Featured Collection'}
                    </span>
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-theme-primary transition-colors line-clamp-2 h-8 leading-snug mb-1">
                      {product.name}
                    </h4>

                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5 text-theme-primary mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <GoStarFill key={i} size={11} />
                      ))}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className={`text-sm font-black ${originalPrice ? 'text-theme-sale' : 'text-gray-900'}`}>
                        Rs. {formatPrice(product.price || product.retailPrice)}
                      </span>
                      {originalPrice && (
                        <span className="text-[10px] text-gray-400 line-through">
                          Rs. {formatPrice(originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
