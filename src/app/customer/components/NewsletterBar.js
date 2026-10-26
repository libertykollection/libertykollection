'use client';

import React, { useState } from 'react';

const NewsletterBar = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="bg-[#FFFDF5] pt-24 pb-24 text-center px-4">
      <p className="text-[11px] uppercase tracking-wide text-[#555] font-sans">Newsletter</p>
      <h2 className="mt-3 text-[26px] font-medium text-[#222] font-display">Subscribe</h2>
      <p className="mt-4 text-[13px] text-[#444]">
        Invite customers to subscribe for early sale access, new in, promotions, and more.
      </p>
      {subscribed ? (
        <p className="mt-8 text-sm font-semibold text-[#77104C]">Thank you for subscribing!</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex items-center justify-center gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            aria-label="Email address"
            className="w-[250px] sm:w-[330px] h-[46px] px-4 rounded-xl bg-[#AD4A81] text-[#4a0b2e] placeholder-[#5a1138] text-xs outline-none"
          />
          <button
            type="submit"
            className="h-[46px] px-6 rounded-xl bg-[#77104C] hover:bg-[#5E0B3C] text-white text-xs font-semibold transition-colors"
          >
            Subscribe
          </button>
        </form>
      )}
    </section>
  );
};

export default NewsletterBar;
