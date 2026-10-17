'use client';

import React from 'react';
import Image from 'next/image';

const CategoryProductSection = ({ categoryImage, products }) => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h3 className="text-[1.5rem] md:text-[2rem] font-black uppercase tracking-tighter">
            Upto 15% Sale!
          </h3>
          <div className="h-1 w-12 bg-orange-500 mt-2 rounded-full"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Side: Category Image */}
          <div className="lg:w-1/3 w-full shrink-0">
            <div className="relative h-[300px] lg:h-[450px] rounded-2xl overflow-hidden shadow-xl group">
              <Image
                fill
                src={categoryImage}
                alt="Category Image"
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <span className="text-white text-lg font-black uppercase tracking-widest">Featured Collection</span>
              </div>
            </div>
          </div>

          {/* Right Side: Product Cards */}
          <div className="lg:w-2/3 w-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <div
                key={index}
                className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 relative cursor-pointer"
              >
                {product.discount && (
                  <div className="absolute z-10 top-2 left-2 bg-[#1E4C2F] text-white text-[8px] font-black px-2 py-0.5 rounded-full">
                    {product.discount}% OFF
                  </div>
                )}
                <div className="relative aspect-square bg-[#F3F4FB] overflow-hidden">
                  <Image
                    fill
                    src={product.imageUrl}
                    alt={product.name}
                    className="object-contain p-4 transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                    loading="lazy"
                  />
                  <button className="absolute bottom-2 right-2 bg-teal-600 text-white h-7 w-7 rounded-full flex justify-center items-center shadow-lg z-10 hover:scale-110 transition-transform">
                    <span className="font-bold text-lg leading-none">+</span>
                  </button>
                </div>
                <div className="p-3 flex flex-col flex-grow">
                  <h4 className="text-gray-800 line-clamp-2 mb-2 leading-tight h-[2.5em] font-bold text-sm">{product.name}</h4>
                  <div className="mt-auto flex flex-col items-start">
                    <p className="text-sm font-black text-black leading-none">Rs.{product.price}</p>
                    {product.discount && (
                      <p className="text-[9px] text-gray-400 line-through font-bold mt-1">Rs.{product.originalPrice}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryProductSection;
