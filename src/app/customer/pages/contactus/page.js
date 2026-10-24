'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiHome, FiPhone, FiMail, FiInfo, FiSend } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    comment: '',
  });
  const [loading, setLoading] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [contactInfo, setContactInfo] = useState({
    address: 'Mandi Bahauddin, Punjab, Pakistan',
    phone: '+92 312 8807795',
    email: '',
    storeInfo: 'Monday – Saturday: 10:00 AM – 8:00 PM PKT',
  });

  useEffect(() => {
    const fetchContactDetails = async () => {
      try {
        const [res, compRes] = await Promise.all([
          axios.get('/api/contactinfo').catch(() => null),
          fetch('/api/companydetails').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ]);
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const c = res.data[0];
          setContactInfo((prev) => ({
            ...prev,
            address: c.address || prev.address,
            phone: c.phoneNumber || prev.phone,
            email: c.email || prev.email,
          }));
        }
        if (compRes?.name) {
          setBrandName(compRes.name);
        }
      } catch (err) {
        console.error('Error fetching contact info:', err);
      }
    };
    fetchContactDetails();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.comment.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.comment,
        }),
      });

      if (response.ok) {
        toast.success('Your message has been delivered to our concierge.');
        setFormData({ name: '', email: '', phone: '', comment: '' });
      } else {
        toast.error('Failed to dispatch inquiry. Please try again.');
      }
    } catch (err) {
      toast.error('Error dispatching message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FBF9F7] min-h-screen text-[#141311]">
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* 1. Header & Breadcrumb */}
      <div className="bg-white border-b border-[#F0DCE3] py-8">
        <div className="container mx-auto max-w-[1400px] px-4 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              <Link href="/" className="hover:text-[#141311] transition-colors">
                Home
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-[#141311] font-bold">Client Concierge</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141311]">
              Contact {brandName ? `${brandName} Concierge` : 'Client Concierge'}
            </h1>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C53261] flex items-center gap-1.5">
            <HiSparkles size={14} />
            Dedicated Consultation & Assistance
          </span>
        </div>
      </div>

      {/* 2. Main 2-Column Section */}
      <div className="py-12 sm:py-16">
        <div className="container mx-auto max-w-[1400px] px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT CARD: Contact Form */}
            <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-none border border-[#F0DCE3] p-6 sm:p-12">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C53261] block mb-1">
                Direct Inquiry
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141311] mb-6 tracking-tight">
                Send Us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Ayesha Khan"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#FFF5F8] border border-[#F0DCE3] rounded-none text-xs text-[#141311] outline-none focus:border-[#C53261] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="ayesha@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#FFF5F8] border border-[#F0DCE3] rounded-none text-xs text-[#141311] outline-none focus:border-[#C53261] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#FFF5F8] border border-[#F0DCE3] rounded-none text-xs text-[#141311] outline-none focus:border-[#C53261] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Your Message or Consultation Request *
                  </label>
                  <textarea
                    name="comment"
                    required
                    rows={6}
                    placeholder="Tell us how our beauty specialists can assist you..."
                    value={formData.comment}
                    onChange={handleChange}
                    className="w-full p-4 bg-[#FFF5F8] border border-[#F0DCE3] rounded-none text-xs text-[#141311] outline-none focus:border-[#C53261] transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#141311] hover:bg-[#2A1B24] text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-none border border-[#141311] transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <FiSend size={13} />
                    <span>{loading ? 'Dispatching...' : 'Dispatch Message'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT CARD: Concierge Coordinates */}
            <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-none border border-[#F0DCE3] p-6 sm:p-10 space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C53261] block mb-1">
                Store Location
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141311] mb-6 tracking-tight">
                Our Coordinates
              </h2>

              <div className="space-y-6 text-xs sm:text-sm">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-none bg-[#FFF5F8] border border-[#F0DCE3] text-[#C53261] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiHome size={15} />
                  </div>
                  <div>
                    <strong className="block text-xs font-bold uppercase tracking-wider text-[#141311] mb-1">
                      Boutique Hub:
                    </strong>
                    <p className="text-gray-500 font-light leading-relaxed">{contactInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-none bg-[#FFF5F8] border border-[#F0DCE3] text-[#C53261] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiPhone size={15} />
                  </div>
                  <div>
                    <strong className="block text-xs font-bold uppercase tracking-wider text-[#141311] mb-1">
                      Direct Concierge Line:
                    </strong>
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="text-gray-700 font-mono hover:text-[#C53261] transition-colors"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-none bg-[#FFF5F8] border border-[#F0DCE3] text-[#C53261] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiMail size={15} />
                  </div>
                  <div>
                    <strong className="block text-xs font-bold uppercase tracking-wider text-[#141311] mb-1">
                      Concierge Email:
                    </strong>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-gray-700 hover:text-[#C53261] transition-colors"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-none bg-[#FFF5F8] border border-[#F0DCE3] text-[#C53261] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiInfo size={15} />
                  </div>
                  <div>
                    <strong className="block text-xs font-bold uppercase tracking-wider text-[#141311] mb-1">
                      Concierge Hours:
                    </strong>
                    <p className="text-gray-500 font-light leading-relaxed">{contactInfo.storeInfo}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Full-Width Embedded Map */}
      <div className="w-full border-t border-[#F0DCE3] overflow-hidden">
        <iframe
          title="Store Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d107147.28828854497!2d73.41164924376375!3d32.58474249339235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391f7c0fb2ef0a2d%3A0xe74e98f480cb4a14!2sMandi%20Bahauddin%2C%20Punjab!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-[360px] sm:h-[400px] grayscale-[15%]"
        />
      </div>
    </div>
  );
};

export default ContactUsPage;
