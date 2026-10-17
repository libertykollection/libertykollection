'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { FiTruck, FiClock } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

const ShippingPolicy = () => {
  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicyData = async () => {
      try {
        const response = await axios.get('/api/shippingpolicy');
        if (response.data && response.data.length > 0) {
          setPolicyData(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching Shipping Policy data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyData();
  }, []);

  return (
    <div className="bg-[#FBF9F7] min-h-screen text-[#141311]">
      {/* 1. Header & Breadcrumb */}
      <div className="bg-white border-b border-[#E8DFC8] py-8">
        <div className="container mx-auto max-w-[1200px] px-4 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              <Link href="/" className="hover:text-[#141311] transition-colors">
                Atelier
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-[#141311] font-bold">Courier Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141311]">
              White Glove Shipping & Delivery Policy
            </h1>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#B98C2D] flex items-center gap-1.5">
            <HiSparkles size={14} />
            Nationwide Fulfillment
          </span>
        </div>
      </div>

      {/* 2. Content */}
      <div className="container mx-auto max-w-[1000px] px-4 lg:px-8 py-12 sm:py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 border-2 border-[#E8DFC8] border-t-[#B98C2D] rounded-none animate-spin mb-4" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#141311]">
              Loading Shipping Terms...
            </p>
          </div>
        ) : policyData ? (
          <div className="bg-white p-8 sm:p-14 rounded-none border border-[#E8DFC8] space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-4 text-xs">
              <span className="inline-flex items-center gap-1.5 bg-[#F9F5EC] text-[#B98C2D] border border-[#E8DFC8] px-3 py-1 rounded-none font-bold text-[10px] uppercase tracking-wider">
                <FiTruck size={12} /> Priority White-Glove Dispatch
              </span>
              <span className="flex items-center gap-1 text-gray-400 text-[11px]">
                <FiClock size={12} /> Last Updated: {policyData.updatedAt ? new Date(policyData.updatedAt).toLocaleDateString() : 'Recent'}
              </span>
            </div>

            <div
              dangerouslySetInnerHTML={{ __html: policyData.Text }}
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4 font-light"
            />
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-dashed border-[#E8DFC8] p-8">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Shipping policy details are currently unavailable.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingPolicy;
