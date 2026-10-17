'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiMail, FiSend } from 'react-icons/fi';

export default function Subscribe() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call - replace with actual subscription endpoint
    setTimeout(() => {
      toast.success('Thank you for subscribing!');
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="bg-white text-gray-900 py-12 md:py-16 px-4 mt-8 border-t border-gray-100">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-6">
            <FiMail className="w-6 h-6 text-gray-900" />
          </div>
          <h3 className="text-2xl md:text-4xl font-extrabold mb-3 tracking-tight text-gray-900">
            Join Our Newsletter
          </h3>
          <p className="text-xs md:text-sm text-gray-500 max-w-lg mx-auto leading-relaxed uppercase tracking-widest font-bold">
            Stay Updated with the latest Trends & Exclusive Offers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiMail className="w-4 h-4 text-gray-300" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 text-sm text-gray-900 rounded-sm focus:outline-none focus:ring-1 focus:ring-black transition-all"
                required
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-orange-500 text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              {!isSubmitting && <FiSend className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-center text-gray-400 text-[10px] mt-4 uppercase tracking-[0.2em]">
            No Spam. Just Style.
          </p>
        </form>
      </div>
    </div>
  );
}
