'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FiLock, FiTruck, FiCreditCard, FiHelpCircle, FiCheck } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrderInfoPage = () => {
  const [shippingAddress, setShippingAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('Standard');
  const [paymentMethod, setPaymentMethod] = useState('Cash On Delivery');
  const [orderId, setOrderId] = useState(null);
  const router = useRouter();

  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();
    if (!shippingAddress.trim()) {
      toast.error('Please enter your shipping address');
      return;
    }

    const orderInfo = {
      shippingAddress,
      deliveryMethod,
      paymentMethod,
      orderId,
    };

    try {
      await axios.post('/api/orderInfo', orderInfo);
      toast.success('Acquisition information updated successfully!');
      router.push('/customer/pages/cart');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to submit order info. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F7] text-[#141311] py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="bottom-right" autoClose={3000} />

      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#C53261] mb-1">
            <FiLock size={12} />
            <span>Encrypted Concierge Protocol</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold uppercase tracking-tight text-[#141311]">
            Delivery & Settlement Details
          </h1>
          <p className="mt-1 text-xs text-gray-500 font-light">
            Please confirm your destination address and preferred white-glove courier protocol.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Form Section */}
          <form className="w-full lg:w-2/3 space-y-6" onSubmit={handlePlaceOrder}>
            {/* Shipping Details Card */}
            <div className="bg-white rounded-none border border-[#F0DCE3] p-6 sm:p-8">
              <div className="pb-4 mb-6 border-b border-[#F0DCE3] flex items-center space-x-3">
                <span className="w-1.5 h-5 bg-[#C53261] rounded-none" />
                <h2 className="text-base font-serif font-bold uppercase tracking-wider text-[#141311]">
                  1. Shipping Destination
                </h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-2 flex flex-col">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                    Full Street Address, City & Postal Code
                  </label>
                  <textarea
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your complete doorstep delivery address..."
                    className="w-full p-4 bg-[#FFF5F8] border border-[#F0DCE3] rounded-none focus:bg-white focus:border-[#C53261] transition-all outline-none resize-none text-xs text-[#141311]"
                    required
                  />
                </div>

                <div className="space-y-2 flex flex-col">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                    Courier Tier
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'Standard', label: 'Standard White Glove', time: '3-4 Business Days' },
                      { id: 'Express', label: 'Priority Courier', time: '24-48 Hours Express' },
                    ].map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setDeliveryMethod(m.id)}
                        className={`cursor-pointer p-4 rounded-none border transition-all flex flex-col justify-center ${
                          deliveryMethod === m.id
                            ? 'border-[#141311] bg-[#FFF5F8] text-[#141311]'
                            : 'border-[#F0DCE3] bg-white text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider">{m.label}</span>
                          {deliveryMethod === m.id && <FiCheck className="text-[#C53261]" size={14} />}
                        </div>
                        <span className="text-[10px] text-gray-400">{m.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-none border border-[#F0DCE3] p-6 sm:p-8">
              <div className="pb-4 mb-6 border-b border-[#F0DCE3] flex items-center space-x-3">
                <span className="w-1.5 h-5 bg-[#C53261] rounded-none" />
                <h2 className="text-base font-serif font-bold uppercase tracking-wider text-[#141311]">
                  2. Settlement Selection
                </h2>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'Cash On Delivery', desc: 'Settle in cash upon physical inspection of your parcel' },
                  { id: 'Bank Transfer / Raast', desc: 'Instant bank transfer with automated invoice receipt' },
                  { id: 'PayPal / Card', desc: 'Secure debit / credit card encrypted transaction' },
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`cursor-pointer flex items-center justify-between p-4 rounded-none border transition-all ${
                      paymentMethod === m.id
                        ? 'border-[#141311] bg-[#FFF5F8]'
                        : 'border-[#F0DCE3] bg-white hover:border-gray-400'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#141311] block">
                        {m.id}
                      </span>
                      <span className="text-[11px] text-gray-400 font-light">{m.desc}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-none border flex items-center justify-center ${
                        paymentMethod === m.id ? 'border-[#141311] bg-[#141311]' : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === m.id && <div className="w-1.5 h-1.5 bg-white" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>

          {/* Sidebar / Summary Section */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white rounded-none border border-[#F0DCE3] p-6 sm:p-8 sticky top-24">
              <h2 className="text-lg font-serif font-bold uppercase tracking-wider text-[#141311] mb-6 pb-3 border-b border-[#F0DCE3]">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 text-xs">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Courier Delivery</span>
                  <span className="font-bold text-[#141311]">
                    {deliveryMethod === 'Express' ? 'Rs. 500' : 'COMPLIMENTARY'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Settlement Channel</span>
                  <span className="font-bold text-[#141311]">{paymentMethod}</span>
                </div>
                <div className="h-px bg-[#F0DCE3]" />
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400">Security</span>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest">
                    256-Bit SSL Encrypted
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full py-4 bg-[#141311] hover:bg-[#2A1B24] text-white rounded-none font-bold uppercase tracking-widest text-xs border border-[#141311] transition-all"
              >
                Confirm & Continue
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-[10px] uppercase tracking-widest">
                <FiLock size={12} />
                <span>Protected by Gloria Authenticity Guarantee</span>
              </div>
            </div>

            {/* Assistance Box */}
            <div className="bg-[#FFF5F8] border border-[#F0DCE3] p-6 text-[#141311]">
              <div className="flex items-center gap-2 mb-2 text-[#C53261]">
                <FiHelpCircle size={16} />
                <h3 className="font-serif font-bold text-sm uppercase tracking-wide text-[#141311]">
                  Client Concierge
                </h3>
              </div>
              <p className="text-gray-500 text-xs font-light mb-4 leading-relaxed">
                Need guidance with shade selection or delivery scheduling? Our concierge is at your service.
              </p>
              <button
                onClick={() => router.push('/customer/pages/contactus')}
                className="w-full py-2.5 border border-[#141311] text-[#141311] text-[10px] font-bold uppercase tracking-widest hover:bg-[#141311] hover:text-white transition-all rounded-none"
              >
                Contact Concierge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInfoPage;
