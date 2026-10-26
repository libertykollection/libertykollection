'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaInstagram, FaFacebookSquare, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FiChevronDown, FiArrowRight, FiShield, FiLock } from 'react-icons/fi';
import Link from 'next/link';
import axios from 'axios';

const MENU = [
  { label: 'Privacy Policy', href: '/customer/pages/privacypolicy' },
  { label: 'Terms of Service', href: '/customer/pages/termsandconditions' },
  { label: 'Shipping Policy', href: '/customer/pages/shippingpolicy' },
  { label: 'Refund & Exchange', href: '/customer/pages/returnandexchangepolicy' },
  { label: 'FAQs & Assurance', href: '/customer/pages/faq' },
];

const NAV = [
  ['Home', '/'],
  ['Shop All', '/customer/pages/allproducts'],
  ['Collections', '/customer/pages/collections'],
  ['New Arrivals', '/customer/pages/allproducts?filter=new'],
  ['Special Offers', '/customer/pages/discounted-products'],
  ['My Wishlist', '/customer/pages/wishlist'],
  ['Track Order', '/customer/pages/orders'],
  ['About Us', '/customer/pages/aboutus'],
  ['Contact Us', '/customer/pages/contactus'],
];

const POLICIES = [
  ['Refund Policy', '/customer/pages/returnandexchangepolicy'],
  ['Privacy Policy', '/customer/pages/privacypolicy'],
  ['Terms of Service', '/customer/pages/termsandconditions'],
  ['Shipping Policy', '/customer/pages/shippingpolicy'],
  ['Contact Information', '/customer/pages/contactus'],
];

const Footer = () => {
  const [social, setSocial] = useState({ facebook: '', instagram: '', tiktok: '', twitter: '' });
  const [phone, setPhone] = useState('');
  const [aboutDesc, setAboutDesc] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [contactRes, socialRes, companyRes] = await Promise.all([
          axios.get('/api/contactinfo').then((r) => r.data).catch(() => null),
          fetch('/api/socialfirstrecodlink/2').then((r) => (r.ok ? r.json() : null)).catch(() => null),
          fetch('/api/companydetails').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ]);
        if (Array.isArray(contactRes) && contactRes[0]) setPhone(contactRes[0].phoneNumber || '');
        if (socialRes) {
          setSocial({
            facebook: socialRes.facebook || '',
            instagram: socialRes.instagram || '',
            tiktok: socialRes.tiktok || '',
            twitter: socialRes.twitter || '',
          });
        }
        if (companyRes?.description) {
          setAboutDesc(companyRes.description);
        }
      } catch (e) {
        console.error('Footer loading error:', e);
      }
    })();
  }, []);

  const icons = [
    social.instagram ? { Icon: FaInstagram, href: social.instagram, label: 'Instagram' } : null,
    social.facebook ? { Icon: FaFacebookSquare, href: social.facebook, label: 'Facebook' } : null,
    social.twitter ? { Icon: FaXTwitter, href: social.twitter, label: 'X' } : null,
    social.tiktok ? { Icon: FaTiktok, href: social.tiktok, label: 'TikTok' } : null,
    phone ? { Icon: FaWhatsapp, href: `https://wa.me/${phone.replace(/[^0-9]/g, '')}`, label: 'WhatsApp' } : null,
  ].filter(Boolean);

  return (
    <footer className="w-full bg-[#FFFDF5] text-[#2D2D2D] font-sans px-6 sm:px-10 lg:px-16 xl:px-24 pt-16 pb-12 border-t border-[#EAE3D5]/70" aria-label="Site footer">
      <div className="w-full max-w-[1680px] mx-auto">
        {/* 4-Column Grid spanning full width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 xl:gap-14">
          {/* Col 1: Brand About */}
          <div>
            <Link href="/" className="inline-block group mb-4" aria-label="Liberty Kollection Home">
              <Image
                src="/liberty-logo-transparent.png"
                alt="Liberty Kollection"
                width={260}
                height={140}
                className="h-16 sm:h-20 lg:h-[86px] w-auto object-contain transition-transform group-hover:scale-[1.02] drop-shadow-sm"
                unoptimized
              />
            </Link>
            <h4 className="font-display text-[13.5px] sm:text-[14.5px] font-bold text-[#1A1A1A] uppercase tracking-[0.16em] mb-3.5 mt-2">
              About Liberty
            </h4>
            <p className="text-[13px] sm:text-[13.5px] text-[#555555] font-normal leading-[1.8] max-w-sm">
              {aboutDesc ||
                'Liberty Kollection is a premier luxury fashion and beauty boutique, delivering verified authentic cosmetics, exquisite bridal jewellery, and transformative skincare essentials.'}
            </p>
            <span className="text-[11.5px] font-bold uppercase tracking-[0.2em] text-[#77104C] mt-3.5 block font-display">
              Your Look, Your Liberty
            </span>
          </div>

          {/* Col 2: Quick Menu Links */}
          <div>
            <h4 className="font-display text-[13.5px] sm:text-[14.5px] font-bold text-[#1A1A1A] uppercase tracking-[0.16em] mb-4 lg:mt-1">
              Customer Support
            </h4>
            <ul className="space-y-3">
              {MENU.map((m, i) => (
                <li key={i}>
                  <Link
                    href={m.href}
                    className="text-[13px] sm:text-[13.5px] text-[#4A4A4A] hover:text-[#77104C] font-normal hover:font-medium transition-all duration-200 inline-block hover:translate-x-1"
                  >
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Customer Care & WhatsApp */}
          <div>
            <h4 className="font-display text-[13.5px] sm:text-[14.5px] font-bold text-[#1A1A1A] uppercase tracking-[0.16em] mb-4 lg:mt-1">
              Concierge Desk
            </h4>
            <p className="text-[13px] sm:text-[13.5px] text-[#555555] font-normal leading-[1.75] max-w-sm mb-4">
              Have questions regarding orders, product authenticity, or custom bridal sets? Our dedicated concierge is available 24/7.
            </p>

            {phone && (
              <div className="mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888] block mb-1">
                  Direct WhatsApp Helpline
                </span>
                <a
                  href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-[13.5px] font-bold text-[#77104C] hover:text-[#5E0B3C] hover:underline transition-colors"
                >
                  <FaWhatsapp className="text-[#25D366]" size={16} />
                  <span>{phone}</span>
                </a>
              </div>
            )}

            {icons.length > 0 && (
              <div className="mt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888] block mb-2">
                  Follow Our Journey
                </span>
                <div className="flex items-center gap-2.5">
                  {icons.map(({ Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="w-9 h-9 rounded-full bg-white border border-[#EAE3D5] text-[#77104C] hover:bg-[#77104C] hover:text-white hover:border-[#77104C] flex items-center justify-center transition-all duration-300 shadow-2xs hover:scale-110"
                    >
                      <Icon size={15} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Col 4: VIP Newsletter Subscription */}
          <div>
            <h4 className="font-display text-[13.5px] sm:text-[14.5px] font-bold text-[#1A1A1A] uppercase tracking-[0.16em] mb-4 lg:mt-1">
              VIP Newsletter
            </h4>
            <p className="text-[13px] sm:text-[13.5px] text-[#555555] font-normal leading-[1.75] mb-4">
              Join our exclusive club for private sale previews, new shade drops, and luxury beauty advice.
            </p>

            {subscribed ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                ✓ Thank you for subscribing! Your VIP welcome gift will arrive shortly.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email) {
                    setSubscribed(true);
                    setEmail('');
                  }
                }}
                className="flex items-center h-[46px] max-w-sm border border-[#D5C7B8] hover:border-[#77104C] focus-within:border-[#77104C] focus-within:ring-2 focus-within:ring-[#77104C]/15 rounded-full overflow-hidden pl-4 pr-1.5 bg-white shadow-2xs transition-all"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  aria-label="Email address for VIP newsletter"
                  className="flex-1 bg-transparent text-[13px] text-[#1A1A1A] placeholder-[#999999] outline-none font-sans"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to VIP newsletter"
                  className="h-[36px] px-4 bg-[#77104C] hover:bg-[#5E0B3C] text-white flex items-center gap-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex-shrink-0 active:scale-95"
                >
                  <span>Join</span>
                  <FiArrowRight size={13} />
                </button>
              </form>
            )}

            <div className="flex items-center gap-2 mt-4 text-[11.5px] text-[#777777]">
              <FiShield className="text-[#77104C]" size={13} />
              <span>100% Secure Checkout & Authentic Formulations</span>
            </div>
          </div>
        </div>

        {/* Full-width Divider Line */}
        <div className="mt-14 mb-8 border-t border-[#EAE3D5] w-full" />

        {/* Secondary Navigation Row: Currency, Language & Catalog Links */}
        <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-6">
          {/* Currency & Language Selectors */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE3D5] text-xs font-semibold text-[#333333] shadow-2xs cursor-pointer hover:border-[#77104C] transition-colors">
              <span>English</span>
              <FiChevronDown size={12} className="text-gray-400" />
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#EAE3D5] text-xs font-semibold text-[#333333] shadow-2xs cursor-pointer hover:border-[#77104C] transition-colors">
              <span className="inline-block w-4 h-3 bg-[#01411C] rounded-[2px]" />
              <span>PKR (₨)</span>
              <FiChevronDown size={12} className="text-gray-400" />
            </div>
          </div>

          {/* Catalog Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-[#555555]">
            {NAV.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="hover:text-[#77104C] font-medium transition-colors hover:underline"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-8 flex flex-col lg:flex-row items-center justify-between text-xs text-[#777777] border-t border-[#EAE3D5]/80 pt-6 gap-4">
          <p className="font-normal text-center lg:text-left">
            © {new Date().getFullYear()}, <strong className="font-semibold text-[#1A1A1A]">Liberty Kollection</strong>. All rights reserved. Crafted for timeless elegance.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-[#555555]">
            <span>Developed by:</span>
            <strong className="font-extrabold text-[#77104C] tracking-wider uppercase font-display">
              RAPIDTECHPRO
            </strong>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {POLICIES.map(([title, link]) => (
              <Link
                key={title}
                href={link}
                className="hover:text-[#77104C] transition-colors"
              >
                {title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
