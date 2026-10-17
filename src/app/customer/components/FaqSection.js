'use client';
import React, { useState, useEffect } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import axios from 'axios';

const FaqSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axios.get('/api/faq');
        setFaqs(response.data);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    };
    fetchFaqs();
  }, []);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index); // Toggle logic
  };

  return (
    <section className="py-14 sm:py-20 bg-neutral-50/60 border-t border-neutral-100">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-theme-primary bg-theme-light px-3 py-1 rounded-none border border-theme-border shadow-xs">
            Help & Assurance
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight mt-3">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-2">
            Quick answers to help you navigate, order, and shop with complete confidence
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={faq.id || index}
                className={`border rounded-none bg-white transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'shadow-md border-theme-primary/40'
                    : 'border-neutral-200/70 hover:border-neutral-300'
                }`}
              >
                <button
                  className="w-full px-5 py-3.5 sm:py-4 text-left flex items-center justify-between focus:outline-none"
                  onClick={() => toggleFAQ(index)}
                >
                  <span
                    className={`text-sm sm:text-base font-bold tracking-tight transition-colors ${
                      isOpen ? 'text-neutral-900' : 'text-neutral-700 hover:text-neutral-900'
                    }`}
                  >
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-none flex items-center justify-center shrink-0 ml-4 transition-all duration-200 ${
                      isOpen
                        ? 'bg-theme-primary text-white'
                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                    }`}
                  >
                    {isOpen ? <FiX size={15} /> : <FiPlus size={15} />}
                  </div>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 pb-5 pt-1 text-neutral-600 text-xs sm:text-sm font-normal leading-relaxed border-t border-neutral-100">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}

          {faqs.length === 0 && (
            <div className="py-6 text-center text-neutral-400 italic">No FAQs available at the moment.</div>
          )}
        </div>

        {/* Support Card */}
        <div className="mt-8 p-5 sm:p-6 bg-white border border-neutral-200/80 rounded-none flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-neutral-900">Still have questions?</h4>
            <p className="text-xs text-neutral-500 mt-1">Our customer service team is always available to help you with your order.</p>
          </div>
          <a
            href="/customer/pages/contactus"
            className="px-5 py-2.5 bg-neutral-900 hover:bg-theme-primary text-white text-xs font-bold uppercase tracking-wider rounded-none transition-all duration-300 whitespace-nowrap shadow-xs hover:scale-105 active:scale-95"
          >
            Contact Support &rarr;
          </a>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
