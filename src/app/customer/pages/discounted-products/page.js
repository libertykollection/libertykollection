'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../store/cartSlice';
import Image from 'next/image';
import { FiShoppingCart, FiZap } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { GoStarFill } from 'react-icons/go';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DiscountedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products/discounted');
        setProducts(response.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching discounted products:', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleProductClick = (slug) => {
    router.push(`/customer/pages/products/${slug}`);
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

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 });
  };

  const calculateOriginalPrice = (price, discount) => {
    const p = Number(price) || 0;
    const d = Number(discount) || 0;
    if (d > 0) {
      return p / (1 - d / 100);
    }
    return p;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#FBF9F7]">
        <ToastContainer position="bottom-right" autoClose={3000} />
        <div className="w-14 h-14 border-2 border-[#E8DFC8] border-t-[#B98C2D] rounded-none animate-spin mb-4" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#141311]">
          Gathering Privilege Offers...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#FBF9F7] min-h-screen text-[#141311] pb-20">
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Header & Breadcrumb */}
      <div className="bg-white border-b border-[#E8DFC8] py-8">
        <div className="container mx-auto max-w-[1536px] px-4 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              <span className="cursor-pointer hover:text-[#141311] transition-colors" onClick={() => router.push('/')}>
                Atelier
              </span>
              <span className="text-gray-300">/</span>
              <span className="text-[#141311] font-bold">Privilege Offers</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141311]">
              Exclusive Atelier Promotions & Archive Discounts
            </h1>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#B98C2D] flex items-center gap-1.5">
            <HiSparkles size={14} />
            Limited Quantities Available
          </span>
        </div>
      </div>

      <div className="container mx-auto max-w-[1536px] px-4 lg:px-8 pt-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {products.map((product) => {
            const originalPrice = calculateOriginalPrice(product.price, product.discount);
            return (
              <div
                key={product.id}
                className="group flex flex-col bg-white border border-[#E8DFC8] hover:border-[#B98C2D] rounded-none overflow-hidden transition-all duration-300 cursor-pointer p-3.5"
                onClick={() => handleProductClick(product.slug)}
              >
                <div className="relative aspect-square w-full bg-[#F9F5EC] border border-[#E8DFC8]/50 mb-3 overflow-hidden flex items-center justify-center">
                  {/* Badge */}
                  <div className="absolute top-2 left-2 z-20 bg-[#B98C2D] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-none">
                    {product.discount > 0 ? `-${product.discount.toFixed(0)}% OFF` : 'Privilege'}
                  </div>

                  {product.images?.[0] && (
                    <Image
                      fill
                      src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${product.images[0].url || product.images[0]}`}
                      alt={product.name}
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
                      unoptimized
                    />
                  )}
                </div>

                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[65%]">
                      {product.category?.name || 'Exclusive'}
                    </p>
                    <div className="flex items-center gap-1 text-[#B98C2D] text-xs">
                      <GoStarFill size={10} />
                      <span className="text-[11px] font-bold text-[#141311]">4.9</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-serif font-bold mb-2 line-clamp-2 text-[#141311] group-hover:text-[#B98C2D] transition-colors leading-snug h-8 overflow-hidden">
                    {product.name}
                  </h4>

                  <div className="flex items-baseline gap-2 mt-auto mb-3">
                    <span className="text-sm font-bold text-[#141311]">
                      Rs. {formatPrice(product.price)}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-[10px] text-gray-400 line-through">
                        Rs. {formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>

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
          })}
        </div>
      </div>
    </div>
  );
};

export default DiscountedProducts;
