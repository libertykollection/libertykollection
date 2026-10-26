'use client';

import React, { useState, useEffect } from 'react';
import { FiPlus, FiMessageCircle, FiHeadphones } from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';
import axios from 'axios';
import Link from 'next/link';

const FaqSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axios.get('/api/faq');
        setFaqs(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    };
    fetchFaqs();
  }, []);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-[#FFFDF5] border-t border-[#EAE3D5]/60 overflow-hidden w-full" aria-label="Frequently Asked Questions">
      {/* Full-width container across entire viewport with luxury padding */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-20">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#77104C] bg-[#F6D0E3]/30 px-4 py-1.5 rounded-full border border-[#77104C]/15 font-display shadow-2xs">
            <BsStars size={13} /> Help & Customer Assurance
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-bold text-[#1A1A1A] font-display tracking-tight mt-3.5 leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-[14.5px] text-[#666666] font-normal mt-3 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about our authentic formulations, nationwide shipping, shade matching, and hassle-free returns.
          </p>
        </div>

        {/* Full-Width Accordion Stack */}
        <div className="w-full space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={faq.id || index}
                className={`w-full rounded-2xl bg-white border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-[#77104C]/40 shadow-md ring-1 ring-[#77104C]/15'
                    : 'border-[#EAE3D5] hover:border-[#77104C]/30 shadow-2xs hover:shadow-xs'
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  className="w-full px-6 sm:px-8 py-5 sm:py-6 text-left flex items-center justify-between gap-4 focus:outline-none group"
                  onClick={() => toggleFAQ(index)}
                >
                  <span
                    className={`text-[15px] sm:text-[17px] font-bold font-display tracking-tight transition-colors duration-200 ${
                      isOpen ? 'text-[#77104C]' : 'text-[#1A1A1A] group-hover:text-[#77104C]'
                    }`}
                  >
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? 'bg-[#77104C] text-white rotate-45 shadow-xs'
                        : 'bg-[#FFFDF5] text-[#77104C] border border-[#EAE3D5] group-hover:bg-[#77104C] group-hover:text-white group-hover:border-[#77104C]'
                    }`}
                  >
                    <FiPlus size={16} />
                  </div>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 sm:px-8 pb-6 sm:pb-7 pt-2 text-[#4A4A4A] text-[13.5px] sm:text-[15px] font-normal leading-[1.8] border-t border-[#F5EFE6]">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full-Width Support & Assistance Banner */}
        <div className="w-full mt-10 sm:mt-12 p-6 sm:p-8 bg-gradient-to-r from-white via-[#FFFDF5] to-white border border-[#EAE3D5] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="text-center md:text-left">
            <h4 className="text-base sm:text-lg font-bold font-display text-[#1A1A1A]">
              Still have questions or need personalized assistance?
            </h4>
            <p className="text-xs sm:text-sm text-[#666666] mt-1 font-normal">
              Our beauty concierge team is available to help with shade recommendations, orders, and inquiries.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/customer/pages/contactus"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] hover:bg-[#77104C] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 shadow-xs hover:scale-105 active:scale-95"
            >
              <FiHeadphones size={15} />
              <span>Contact Support</span>
            </Link>
            <a
              href="https://wa.me/923000000000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 shadow-xs hover:scale-105 active:scale-95"
            >
              <FiMessageCircle size={15} />
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
