'use client';

import React from 'react';
import { FiRefreshCw, FiTruck, FiHeadphones, FiShield } from 'react-icons/fi';

const features = [
  {
    icon: FiShield,
    title: '100% Authentic Beauty',
    description: 'Guaranteed genuine & cruelty-free products',
  },
  {
    icon: FiTruck,
    title: 'Free Express Delivery',
    description: 'Special free shipping on orders over Rs. 3,000',
  },
  {
    icon: FiHeadphones,
    title: '24/7 Beauty Advisory',
    description: 'Friendly beauty consultants round the clock',
  },
  {
    icon: FiRefreshCw,
    title: 'Dermatologist Approved',
    description: 'Hypoallergenic & clinically verified formulas',
  },
];

const Features = () => {
  return (
    <section className="bg-white py-4">
      <div className="container mx-auto max-w-[1536px] px-4 lg:px-8">
        <div className="bg-white rounded-none p-4 sm:p-5 border border-gray-100 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {features.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3.5 ${idx > 0 ? 'sm:pl-5 pt-3 sm:pt-0' : ''}`}
              >
                <div className="w-10 h-10 rounded-none bg-theme-light text-theme-primary flex items-center justify-center flex-shrink-0 text-lg shadow-xs">
                  <item.icon />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
