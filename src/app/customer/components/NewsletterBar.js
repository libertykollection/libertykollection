'use client';

import React, { useState } from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaPinterestP } from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';

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
    <section className="bg-theme-primary py-5 text-white border-t border-white/10">
      <div className="container mx-auto max-w-[1536px] px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
          {/* Left: Newsletter Offer with Envelope Icon */}
          <div className="flex items-center gap-3.5 text-center lg:text-left">
            <div className="w-11 h-11 rounded-none bg-white/20 flex items-center justify-center text-white flex-shrink-0 shadow-inner">
              <FiMail size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                Join Our VIP Beauty Club & Get 15% Off
              </h3>
            </div>
          </div>

          {/* Center: Search / Subscribe Box */}
          <form onSubmit={handleSubmit} className="flex w-full max-w-lg items-center bg-white rounded-none p-1 shadow-sm">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-2 text-xs sm:text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
            />
            <button
              type="submit"
              className="bg-theme-dark hover:bg-black text-white text-xs font-bold uppercase tracking-wider px-6 py-2 rounded-none transition-colors flex-shrink-0 shadow-xs"
            >
              SUBSCRIBE
            </button>
          </form>

          {/* Right: Keep In Touch Social Links */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs font-bold text-white">
              Keep in touch
            </span>
            <div className="flex items-center gap-2">
              <a
                href="#"
                aria-label="Facebook"
                className="w-7 h-7 rounded-none bg-white hover:bg-gray-900 hover:text-white text-gray-800 flex items-center justify-center transition-colors text-xs shadow-xs"
              >
                <FaFacebookF size={12} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-7 h-7 rounded-none bg-white hover:bg-gray-900 hover:text-white text-gray-800 flex items-center justify-center transition-colors text-xs shadow-xs"
              >
                <FaInstagram size={12} />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="w-7 h-7 rounded-none bg-white hover:bg-gray-900 hover:text-white text-gray-800 flex items-center justify-center transition-colors text-xs shadow-xs"
              >
                <FaYoutube size={12} />
              </a>
              <a
                href="#"
                aria-label="Twitter X"
                className="w-7 h-7 rounded-none bg-white hover:bg-gray-900 hover:text-white text-gray-800 flex items-center justify-center transition-colors text-xs shadow-xs"
              >
                <FaTwitter size={12} />
              </a>
              <a
                href="#"
                aria-label="Pinterest"
                className="w-7 h-7 rounded-none bg-white hover:bg-gray-900 hover:text-white text-gray-800 flex items-center justify-center transition-colors text-xs shadow-xs"
              >
                <FaPinterestP size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterBar;
