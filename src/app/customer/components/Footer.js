'use client';

import React, { useEffect, useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcPaypal,
  FaCcDiscover,
} from 'react-icons/fa';
import Link from 'next/link';
import axios from "axios";
import Image from 'next/image';
import { getSafeImageUrl } from '../../util/imageUtils';

const Footer = () => {
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    facebook: '',
    instagram: '',
    tiktok: '',
  });

  const [companyName, setCompanyName] = useState('');
  const [companyHeaderImage, setCompanyHeaderImage] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  useEffect(() => {
    async function fetchDetails() {
      try {
        const [compRes, contactRes, socialRes] = await Promise.all([
          fetch('/api/companydetails').then(r => r.ok ? r.json() : null).catch(() => null),
          axios.get('/api/contactinfo').then(r => r.data).catch(() => null),
          fetch('/api/socialfirstrecodlink/2').then(r => r.ok ? r.json() : null).catch(() => null),
        ]);

        if (compRes) {
          if (compRes.name) setCompanyName(compRes.name);
          if (compRes.headerImage) setCompanyHeaderImage(compRes.headerImage);
        }

        if (Array.isArray(contactRes) && contactRes.length > 0) {
          const c = contactRes[0];
          if (c.email) setCompanyEmail(c.email);
          if (c.phoneNumber) setCompanyPhone(c.phoneNumber);
          if (c.address) setCompanyAddress(c.address);
        }

        if (socialRes) {
          setSocialMediaLinks({
            facebook: socialRes.facebook || '',
            instagram: socialRes.instagram || '',
            tiktok: socialRes.tiktok || '',
          });
        }
      } catch (err) {
        console.error('Footer loading error:', err);
      }
    }
    fetchDetails();
  }, []);

  return (
    <footer className="bg-theme-dark text-[#E5DFD0] font-sans border-t border-theme-dark-border">
      {/* Brand Header Banner in Footer */}
      <div className="border-b border-theme-dark-border py-8 px-4 lg:px-8 bg-theme-dark-surface/50">
        <div className="container mx-auto max-w-[1536px] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="bg-white p-2 rounded-none shadow-md inline-block">
              <Image
                src="/gloria_logo.png"
                alt="Gloria Cosmetics"
                width={160}
                height={50}
                className="h-10 w-auto object-contain"
                unoptimized
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Gloria Cosmetics Atelier
              </h3>
              <p className="text-xs text-[#B8AE99] max-w-lg mt-0.5">
                Luxury skincare, radiant complexion makeup, and bespoke fragrance rituals.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-theme-secondary mr-2">
              Follow Us:
            </span>
            {socialMediaLinks.facebook && (
              <a href={socialMediaLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-none bg-white/10 hover:bg-theme-primary text-white flex items-center justify-center transition-colors text-xs">
                <FaFacebookF />
              </a>
            )}
            {socialMediaLinks.instagram && (
              <a href={socialMediaLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-none bg-white/10 hover:bg-theme-primary text-white flex items-center justify-center transition-colors text-xs">
                <FaInstagram />
              </a>
            )}
            {socialMediaLinks.tiktok && (
              <a href={socialMediaLinks.tiktok} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-none bg-white/10 hover:bg-theme-primary text-white flex items-center justify-center transition-colors text-xs">
                <FaTiktok />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 5-Column Grid Main Footer */}
      <div className="container mx-auto max-w-[1536px] px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Col 1: Contact Us */}
          <div>
            <h4 className="text-theme-secondary text-xs sm:text-sm font-black uppercase tracking-[0.16em] mb-5">
              Contact Us
            </h4>
            <div className="space-y-3.5 text-xs sm:text-[13px] text-[#C9BFAB]">
              {companyAddress && (
                <div className="flex items-start gap-2.5">
                  <FaMapMarkerAlt className="text-theme-secondary text-sm mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{companyAddress}</span>
                </div>
              )}
              {companyPhone && (
                <div className="flex items-center gap-2.5">
                  <FaPhoneAlt className="text-theme-secondary text-xs flex-shrink-0" />
                  <a href={`tel:${companyPhone}`} className="hover:text-white transition-colors">
                    {companyPhone}
                  </a>
                </div>
              )}
              {companyEmail && (
                <div className="flex items-center gap-2.5">
                  <FaEnvelope className="text-theme-secondary text-xs flex-shrink-0" />
                  <a href={`mailto:${companyEmail}`} className="hover:text-white transition-colors">
                    {companyEmail}
                  </a>
                </div>
              )}
              {companyPhone && (
                <div className="pt-2">
                  <a
                    href={`https://wa.me/${(companyPhone || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white bg-[#25D366] hover:bg-[#20ba59] font-bold px-3.5 py-2 rounded-none text-xs transition-colors shadow-xs"
                  >
                    <FaWhatsapp className="text-sm" />
                    <span>24/7 WhatsApp Support</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Col 2: User Account */}
          <div>
            <h4 className="text-theme-secondary text-xs sm:text-sm font-black uppercase tracking-[0.16em] mb-5">
              User Account
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-[#C5B4BD]">
              <li>
                <Link href="/customer/pages/profile" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/customer/pages/orders" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  Order History
                </Link>
              </li>
              <li>
                <Link href="/customer/pages/cart" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/customer/pages/checkout" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  Checkout
                </Link>
              </li>
              <li>
                <Link href="/customer/pages/wishlist" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  My Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Information */}
          <div>
            <h4 className="text-theme-secondary text-xs sm:text-sm font-black uppercase tracking-[0.16em] mb-5">
              Information
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-[#C5B4BD]">
              <li>
                <Link href="/customer/pages/aboutus" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/customer/pages/shippingpolicy" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  Delivery Information
                </Link>
              </li>
              <li>
                <Link href="/customer/pages/privacypolicy" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/customer/pages/termsandconditions" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/customer/pages/returnandexchangepolicy" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  Returns & Refunds
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Links */}
          <div>
            <h4 className="text-theme-secondary text-xs sm:text-sm font-black uppercase tracking-[0.16em] mb-5">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-[#C5B4BD]">
              <li>
                <Link href="/customer/pages/allproducts" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  All Beauty Products
                </Link>
              </li>
              <li>
                <Link href="/customer/pages/collections" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  Cosmetics Collections
                </Link>
              </li>
              <li>
                <Link href="/customer/pages/blog" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  Beauty Blog & Guides
                </Link>
              </li>
              <li>
                <Link href="/customer/pages/faq" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/customer/pages/discounted-products" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  Special Promotions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Store Hours & Genuine Guarantee */}
          <div>
            <h4 className="text-theme-secondary text-xs sm:text-sm font-black uppercase tracking-[0.16em] mb-5">
              Store Hours
            </h4>
            <div className="space-y-2.5 text-xs sm:text-[13px] text-[#C5B4BD]">
              <p>
                <strong className="text-white block font-semibold">Customer Advisory:</strong>
                Mon – Sun: 10:00 AM – 11:00 PM
              </p>
              <p className="text-[#9E8B96]">
                Online orders are active 24/7 with swift nationwide delivery.
              </p>
              <div className="pt-2">
                <span className="inline-block text-[11px] font-bold text-theme-secondary bg-theme-secondary/10 border border-theme-secondary/30 px-3 py-1.5 rounded-none shadow-xs">
                  100% Genuine Beauty Guarantee
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Payment Badges */}
      <div className="bg-theme-dark-surface border-t border-theme-dark-border py-5 px-4 lg:px-8">
        <div className="container mx-auto max-w-[1536px] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8E7B86]">
          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()}, <strong className="text-white">{companyName || 'Atelier'}</strong>. All Rights Reserved.
          </p>

          {/* Styled Payment Badges */}
          <div className="flex items-center gap-3 text-2xl text-[#7A6973]">
            <FaCcVisa className="hover:text-theme-secondary transition-colors" title="Visa" />
            <FaCcMastercard className="hover:text-theme-secondary transition-colors" title="Mastercard" />
            <FaCcAmex className="hover:text-theme-secondary transition-colors" title="American Express" />
            <FaCcPaypal className="hover:text-theme-secondary transition-colors" title="PayPal" />
            <FaCcDiscover className="hover:text-theme-secondary transition-colors" title="Discover" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;