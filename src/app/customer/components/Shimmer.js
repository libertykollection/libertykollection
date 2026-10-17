'use client';

import React from 'react';

/**
 * Base Shimmer Component
 * Provides a shimmer loading effect
 */
export const Shimmer = ({ className = '', style = {} }) => {
  return (
    <div
      className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] ${className}`}
      style={{
        animation: 'shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
};

/**
 * Product Card Shimmer
 */
export const ProductCardShimmer = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Image shimmer */}
      <Shimmer className="w-full h-48" />
      
      {/* Content shimmer */}
      <div className="p-4 space-y-3">
        <Shimmer className="h-4 w-3/4 rounded" />
        <Shimmer className="h-4 w-1/2 rounded" />
        <div className="flex items-center gap-2">
          <Shimmer className="h-6 w-20 rounded" />
          <Shimmer className="h-6 w-16 rounded" />
        </div>
      </div>
    </div>
  );
};

/**
 * Category Card Shimmer
 */
export const CategoryCardShimmer = () => {
  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden p-4 text-center min-h-[240px]">
      {/* Image shimmer */}
      <Shimmer className="w-full h-40 mb-2 rounded-md" />
      
      {/* Text shimmer */}
      <Shimmer className="h-6 w-3/4 mx-auto mb-2 rounded" />
      <Shimmer className="h-4 w-1/2 mx-auto rounded" />
    </div>
  );
};

/**
 * Blog Card Shimmer
 */
export const BlogCardShimmer = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Image shimmer */}
      <Shimmer className="w-full h-56" />
      
      {/* Content shimmer */}
      <div className="p-6 space-y-3">
        <div className="flex items-center gap-3">
          <Shimmer className="h-3 w-20 rounded-full" />
          <Shimmer className="h-3 w-16 rounded-full" />
        </div>
        <Shimmer className="h-3 w-24 rounded-full" />
        <Shimmer className="h-6 w-full rounded" />
        <Shimmer className="h-6 w-5/6 rounded" />
        <div className="space-y-2">
          <Shimmer className="h-4 w-full rounded" />
          <Shimmer className="h-4 w-full rounded" />
          <Shimmer className="h-4 w-3/4 rounded" />
        </div>
        <Shimmer className="h-4 w-24 rounded" />
      </div>
    </div>
  );
};

/**
 * Table Row Shimmer
 */
export const TableRowShimmer = ({ columns = 5 }) => {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-4 py-3">
          <Shimmer className="h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  );
};

/**
 * Grid Shimmer - Generic grid of shimmer items
 */
export const GridShimmer = ({ 
  ItemComponent, 
  count = 6, 
  className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
}) => {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <ItemComponent key={index} />
      ))}
    </div>
  );
};

// CSS animation will be added via global CSS or inline styles

export default Shimmer;

