'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FiSearch,
  FiUser,
  FiShoppingCart,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiHeart,
  FiLogOut,
  FiPackage,
  FiPhone,
} from 'react-icons/fi';
import { MdLocationOn } from 'react-icons/md';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { setCart } from '../../store/cartSlice';
import Image from 'next/image';
import { getSafeImageUrl } from '../../util/imageUtils';

const Header = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isMegaDropdownOpen, setIsMegaDropdownOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isFragranceDropdownOpen, setIsFragranceDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [authToken, setAuthToken] = useState(null);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Dynamic Company Details & Contact
  const [companyHeaderImage, setCompanyHeaderImage] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('+92 312 8807795');

  // Search State
  const [searchResults, setSearchResults] = useState([]);
  const [searchCategories, setSearchCategories] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const megaDropdownRef = useRef(null);
  const shopDropdownRef = useRef(null);
  const fragranceDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const [totalQuantityOfItems, setTotalQuantityOfItems] = useState(0);

  // Cart Count
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      const total = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
      setTotalQuantityOfItems(total);
    } else {
      setTotalQuantityOfItems(0);
    }
  }, [cartItems]);

  // Debounced Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const response = await fetch(`/api/products/search/${encodeURIComponent(searchQuery.trim())}`);
          const data = await response.json();
          if (data.status) {
            setSearchResults(data.data || []);
            setSearchCategories(data.categories || []);
          } else {
            setSearchResults([]);
            setSearchCategories([]);
          }
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
          setSearchCategories([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setSearchCategories([]);
      }
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Load initial data
  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const [catRes, subRes, compRes, contactRes] = await Promise.all([
          fetch('/api/categories').then((r) => (r.ok ? r.json() : null)).catch(() => null),
          fetch('/api/subcategories').then((r) => (r.ok ? r.json() : null)).catch(() => null),
          fetch('/api/companydetails').then((r) => (r.ok ? r.json() : null)).catch(() => null),
          fetch('/api/contactinfo').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ]);

        if (catRes?.status && Array.isArray(catRes.data)) {
          setCategories(catRes.data);
        } else if (Array.isArray(catRes)) {
          setCategories(catRes);
        }

        if (subRes?.status && Array.isArray(subRes.data)) {
          setSubcategories(subRes.data);
        } else if (Array.isArray(subRes)) {
          setSubcategories(subRes);
        }

        if (compRes) {
          if (compRes.name) setCompanyName(compRes.name);
          if (compRes.headerImage) setCompanyHeaderImage(compRes.headerImage);
        }

        if (Array.isArray(contactRes) && contactRes.length > 0) {
          if (contactRes[0]?.phoneNumber) setCompanyPhone(contactRes[0].phoneNumber);
        }
      } catch (err) {
        console.error('Header data loading error:', err);
      }
    };

    fetchHeaderData();

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('userName');
    if (token) setAuthToken(token);
    if (role) setUserRole(role);
    if (name) setUserName(name);

    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    dispatch(setCart(storedCart));

    // Outside clicks
    const handleClickOutside = (e) => {
      if (megaDropdownRef.current && !megaDropdownRef.current.contains(e.target) && !e.target.closest('#department-trigger')) {
        setIsMegaDropdownOpen(false);
      }
      if (shopDropdownRef.current && !shopDropdownRef.current.contains(e.target)) {
        setIsShopDropdownOpen(false);
      }
      if (fragranceDropdownRef.current && !fragranceDropdownRef.current.contains(e.target)) {
        setIsFragranceDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target) && !e.target.closest('#profile-trigger')) {
        setIsProfileDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchResults([]);
        setSearchCategories([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dispatch]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      router.push('/');
    } else {
      router.push(`/customer/pages/allproducts?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchResults([]);
      setSearchCategories([]);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    setAuthToken(null);
    setUserRole(null);
    setUserName('');
    setIsProfileDropdownOpen(false);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 transition-all font-sans">
      {/* 1. Main Header Bar (Soft Cashmere Cream & Warm Espresso) */}
      <div className="w-full bg-[#FAF6F4] text-[#141311] py-3 sm:py-3.5 px-4 lg:px-8 border-b border-[#F0DCE3] shadow-xs">
        <div className="container mx-auto flex items-center justify-between gap-4 lg:gap-6 max-w-[1536px]">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-[#141311] hover:text-theme-primary transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>

            {/* Official Gloria Cosmetics Brand Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
              <Image
                src="/gloria_logo.png"
                alt={companyName || "Gloria Cosmetics"}
                width={180}
                height={55}
                className="h-10 sm:h-12 w-auto object-contain cursor-pointer transition-transform hover:scale-[1.02]"
                priority
                unoptimized
              />
            </Link>
          </div>

          {/* Center: Clean Luxury Search Bar with Gloria Gold Accent */}
          <div className="flex-1 max-w-2xl relative hidden md:block" ref={searchContainerRef}>
            <form
              onSubmit={handleSearch}
              className="relative flex items-center bg-white border border-theme-border focus-within:border-theme-primary focus-within:ring-2 focus-within:ring-theme-primary/20 transition-all rounded-none h-11 pl-5 pr-1.5 shadow-xs"
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search makeup, skincare, luxury cosmetics..."
                className="w-full bg-transparent text-theme-dark placeholder-[#9C8F7A] text-xs sm:text-sm py-2 outline-none font-medium"
              />
              <button
                type="submit"
                className="w-8 h-8 sm:w-9 sm:h-9 bg-theme-primary hover:bg-theme-primary-hover text-white rounded-none transition-all flex items-center justify-center shadow-xs flex-shrink-0 cursor-pointer active:scale-95"
                aria-label="Search"
              >
                <FiSearch size={16} className="stroke-[2.5]" />
              </button>
            </form>

            {/* Live Search Suggestion Box */}
            {((searchResults.length > 0 || searchCategories.length > 0) || isSearching) && searchQuery.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white text-gray-900 rounded-none shadow-2xl border border-[#F0DCE3] max-h-[60vh] overflow-y-auto z-50 py-2">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-gray-500 font-medium">Searching beauty products...</div>
                ) : (
                  <>
                    {searchCategories.length > 0 && (
                      <div className="px-3 pb-2 border-b border-[#F0DCE3]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block px-2 py-1">
                          Beauty Categories
                        </span>
                        <div className="flex flex-wrap gap-1.5 px-2">
                          {searchCategories.map((c) => (
                            <Link
                              key={c.id}
                              href={`/customer/pages/category/${c.slug}`}
                              onClick={() => { setSearchResults([]); setSearchCategories([]); }}
                              className="px-2.5 py-1 rounded-none bg-theme-light hover:bg-theme-primary text-gray-900 hover:text-white text-xs font-semibold transition-colors"
                            >
                              {c.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="py-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block px-4 py-1">
                        Products ({searchResults.length})
                      </span>
                      {searchResults.slice(0, 6).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            router.push(`/customer/pages/products/${item.slug}`);
                            setSearchResults([]);
                            setSearchCategories([]);
                          }}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-theme-light/40 cursor-pointer transition-colors"
                        >
                          <div className="w-10 h-10 rounded-none bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                            {item.images && (
                              <Image
                                src={(() => {
                                  try {
                                    const parsed = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
                                    const img = parsed[0];
                                    const url = typeof img === 'string' ? img : img?.url;
                                    return getSafeImageUrl(url);
                                  } catch (e) {
                                    return '/placeholder.png';
                                  }
                                })()}
                                alt={item.name}
                                width={36}
                                height={36}
                                className="object-contain"
                                unoptimized
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                            <span className="text-[11px] text-gray-500 font-medium">
                              Rs. {(item.discount > 0 ? item.price - (item.price * item.discount) / 100 : item.price).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-theme-primary bg-theme-light px-2 py-0.5 rounded-none">
                            View
                          </span>
                        </div>
                      ))}
                    </div>

                    <div
                      onClick={handleSearch}
                      className="p-2.5 text-center text-xs font-bold text-theme-primary hover:bg-theme-light cursor-pointer transition-colors border-t border-[#F0DCE3]"
                    >
                      View All Results &rarr;
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Section: Call For Order + Account + Wishlist + Cart */}
          <div className="flex items-center gap-5 sm:gap-6 flex-shrink-0">
            {/* Call For Order */}
            <div className="hidden xl:flex flex-col text-left leading-tight shrink-0 border-r border-[#F0DCE3] pr-5">
              <span className="text-[11px] text-[#8A7973] font-medium">Call For Order:</span>
              <a
                href={`tel:${companyPhone}`}
                className="text-xs sm:text-[13px] font-bold text-[#141311] hover:text-theme-primary tracking-wide mt-0.5 transition-colors"
              >
                {companyPhone}
              </a>
            </div>

            {/* Log in / Sign Up Link or Account Dropdown */}
            <div className="relative">
              {authToken ? (
                <div
                  id="profile-trigger"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-1.5 cursor-pointer text-[#141311] hover:text-theme-primary transition-colors text-xs font-bold"
                >
                  <FiUser size={16} />
                  <span className="hidden sm:inline-block max-w-[100px] truncate">{userName || 'My Account'}</span>
                  <FiChevronDown size={12} className="text-[#8A7973]" />
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-xs sm:text-[13px] font-bold text-[#141311] hover:text-theme-primary transition-colors whitespace-nowrap"
                >
                  Log in / Sign Up
                </Link>
              )}

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div
                  ref={profileDropdownRef}
                  className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-none shadow-xl border border-[#F0DCE3] py-2 z-50"
                >
                  {userRole === 'ADMIN' ? (
                    <Link
                      href="/admin/pages/Main"
                      className="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-theme-light hover:text-theme-primary"
                    >
                      Admin Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/customer/pages/orders"
                        className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-theme-light hover:text-theme-primary"
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/customer/pages/profile"
                        className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-theme-light hover:text-theme-primary"
                      >
                        Profile Settings
                      </Link>
                    </>
                  )}
                  <div className="border-t border-[#F0DCE3] my-1"></div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                  >
                    <FiLogOut /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist Heart Icon */}
            <Link
              href="/customer/pages/wishlist"
              className="relative p-1 text-[#141311] hover:text-theme-primary transition-colors hidden sm:block"
              aria-label="Wishlist"
            >
              <FiHeart size={21} className="stroke-[2]" />
              <span className="absolute -top-1 -right-2 bg-theme-primary text-white text-[10px] font-black w-4 h-4 rounded-none flex items-center justify-center shadow-xs">
                0
              </span>
            </Link>

            {/* Dusty Rose Cart Button with Espresso Counter */}
            <Link
              href="/customer/pages/cart"
              className="bg-theme-primary hover:bg-theme-primary-hover text-white px-3.5 sm:px-4 py-2 rounded-none flex items-center gap-2 font-bold text-xs sm:text-sm shadow-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <FiShoppingCart size={18} className="stroke-[2.4]" />
              <span className="font-bold">Cart</span>
              <span className="w-5 h-5 rounded-none bg-[#141311] text-white text-[11px] font-black flex items-center justify-center ml-0.5">
                {totalQuantityOfItems}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Search Input Row */}
        <div className="md:hidden mt-3 pt-2">
          <form
            onSubmit={handleSearch}
            className="relative flex items-center bg-white border border-[#F0DCE3] rounded-none h-10 pl-4 pr-1"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cosmetics, skincare..."
              className="w-full bg-transparent text-[#141311] placeholder-[#A4948F] text-xs py-1.5 outline-none font-medium"
            />
            <button
              type="submit"
              className="w-8 h-8 bg-theme-primary text-white rounded-none flex items-center justify-center flex-shrink-0"
            >
              <FiSearch size={14} className="stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>

      {/* 2. Sub-Navigation Bar */}
      <nav className="hidden lg:block bg-white border-b border-theme-border shadow-xs" style={{ fontFamily: 'var(--font-ui-stack)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-dark)' }}>
        <div className="container mx-auto px-4 lg:px-8 max-w-[1536px] flex items-center justify-between min-h-[64px]">
          <div className="flex items-center">
            {/* Shop by Categories Button */}
            <div className="relative" ref={megaDropdownRef}>
              <button
                id="department-trigger"
                onClick={() => setIsMegaDropdownOpen(!isMegaDropdownOpen)}
                className="flex items-center gap-2.5 py-5 text-theme-dark font-black hover:text-theme-primary transition-colors cursor-pointer text-sm"
              >
                <FiMenu size={18} className="stroke-[2.4] text-theme-primary" />
                <span>Shop By Categories</span>
                <FiChevronDown className={`text-[#8C7C68] transition-transform duration-200 ${isMegaDropdownOpen ? 'rotate-180 text-theme-primary' : ''}`} />
              </button>

              {/* Mega Dropdown Menu */}
              {isMegaDropdownOpen && (
                <div className="absolute left-0 top-full w-72 bg-white shadow-2xl rounded-none border border-theme-border py-3 z-50 max-h-[75vh] overflow-y-auto">
                  <div className="px-4 pb-2 mb-2 border-b border-theme-border text-[10px] font-black text-[#8C7C68] uppercase tracking-widest">
                    Beauty Departments
                  </div>
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/customer/pages/category/${cat.slug}`}
                      onClick={() => setIsMegaDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-theme-light hover:text-theme-primary transition-colors"
                    >
                      {cat.imageUrl && (
                        <div className="w-6 h-6 rounded-none overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                          <Image
                            src={getSafeImageUrl(cat.imageUrl)}
                            alt={cat.name}
                            width={24}
                            height={24}
                            className="object-cover w-full h-full"
                            unoptimized
                          />
                        </div>
                      )}
                      <span>{cat.name}</span>
                      <FiChevronRight className="ml-auto text-gray-300 text-xs" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Vertical Divider */}
            <span className="h-6 w-px bg-theme-border mx-6 inline-block"></span>

            {/* Standard Nav Links */}
            <div className="flex items-center space-x-7">
              <Link href="/" className="py-5 text-theme-dark hover:text-theme-primary transition-colors font-bold" style={{ fontFamily: 'var(--font-ui-stack)', fontSize: '0.8125rem', letterSpacing: '0.02em' }}>
                Home
              </Link>

              {/* Shop with Beauty Curated Dropdown */}
              <div
                className="relative"
                ref={shopDropdownRef}
                onMouseEnter={() => setIsShopDropdownOpen(true)}
                onMouseLeave={() => setIsShopDropdownOpen(false)}
              >
                <Link
                  href="/customer/pages/allproducts"
                  className="flex items-center gap-1.5 py-5 text-theme-dark hover:text-theme-primary font-bold transition-colors"
                >
                  <span>Shop</span>
                  <FiChevronDown size={13} className={`text-[#8C7C68] transition-transform duration-200 ${isShopDropdownOpen ? 'rotate-180 text-theme-primary' : ''}`} />
                </Link>

                {isShopDropdownOpen && (
                  <div className="absolute left-0 top-full w-[640px] bg-white shadow-2xl rounded-none border border-theme-border p-6 z-50 grid grid-cols-3 gap-6 animate-in fade-in duration-150">
                    {/* Skincare Column */}
                    <div>
                      <Link
                        href="/customer/pages/allproducts?category=Skincare"
                        onClick={() => setIsShopDropdownOpen(false)}
                        className="text-xs font-bold uppercase tracking-wider text-theme-primary block pb-2 border-b border-theme-border"
                      >
                        Skincare Essentials
                      </Link>
                      <ul className="mt-3 space-y-2 text-xs text-gray-600 font-normal">
                        {['Cleansers & Toners', 'Serums & Essences', 'Moisturizers & Creams', 'Sunscreen SPF50', 'Eye & Lip Care'].map((item) => (
                          <li key={item}>
                            <Link
                              href={`/customer/pages/allproducts?search=${encodeURIComponent(item)}`}
                              onClick={() => setIsShopDropdownOpen(false)}
                              className="hover:text-theme-primary transition-colors inline-block"
                            >
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Makeup Column */}
                    <div>
                      <Link
                        href="/customer/pages/allproducts?category=Makeup"
                        onClick={() => setIsShopDropdownOpen(false)}
                        className="text-xs font-bold uppercase tracking-wider text-theme-primary block pb-2 border-b border-[#F0DCE3]"
                      >
                        Luxe Makeup
                      </Link>
                      <ul className="mt-3 space-y-2 text-xs text-gray-600 font-normal">
                        {['Velvet Lipsticks', 'Foundation & Concealer', 'Blush & Highlighters', 'Mascara & Eyeliners', 'Setting Sprays'].map((item) => (
                          <li key={item}>
                            <Link
                              href={`/customer/pages/allproducts?search=${encodeURIComponent(item)}`}
                              onClick={() => setIsShopDropdownOpen(false)}
                              className="hover:text-theme-primary transition-colors inline-block"
                            >
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Haircare Column */}
                    <div>
                      <Link
                        href="/customer/pages/allproducts?category=Haircare"
                        onClick={() => setIsShopDropdownOpen(false)}
                        className="text-xs font-bold uppercase tracking-wider text-theme-primary block pb-2 border-b border-[#F0DCE3]"
                      >
                        Hair & Body Care
                      </Link>
                      <ul className="mt-3 space-y-2 text-xs text-gray-600 font-normal">
                        {['Botanical Shampoos', 'Nourishing Conditioners', 'Hair Serums & Oils', 'Body Lotions & Scrubs', 'Fragrance Mists'].map((item) => (
                          <li key={item}>
                            <Link
                              href={`/customer/pages/allproducts?search=${encodeURIComponent(item)}`}
                              onClick={() => setIsShopDropdownOpen(false)}
                              className="hover:text-theme-primary transition-colors inline-block"
                            >
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/customer/pages/collections" className="py-5 text-[#141311] hover:text-theme-primary transition-colors font-bold">
                Collections
              </Link>

              {/* Fragrances Dropdown */}
              <div
                className="relative"
                ref={fragranceDropdownRef}
                onMouseEnter={() => setIsFragranceDropdownOpen(true)}
                onMouseLeave={() => setIsFragranceDropdownOpen(false)}
              >
                <Link
                  href="/customer/pages/allproducts?search=fragrance"
                  className="flex items-center gap-1.5 py-5 text-[#141311] hover:text-theme-primary font-bold transition-colors"
                >
                  <span>Fragrances</span>
                  <FiChevronDown size={13} className={`text-[#8A7973] transition-transform duration-200 ${isFragranceDropdownOpen ? 'rotate-180 text-theme-primary' : ''}`} />
                </Link>

                {isFragranceDropdownOpen && (
                  <div className="absolute left-0 top-full w-48 bg-white shadow-2xl rounded-none border border-[#F0DCE3] py-3 z-50 animate-in fade-in duration-150">
                    <ul className="space-y-1 text-xs text-gray-700 font-normal">
                      {['Eau de Parfum', 'Body Mists & Sprays', 'Luxury Floral Scents', 'Warm Vanilla & Amber', 'Travel Minis'].map((item) => (
                        <li key={item}>
                          <Link
                            href={`/customer/pages/allproducts?search=${encodeURIComponent(item)}`}
                            onClick={() => setIsFragranceDropdownOpen(false)}
                            className="block px-4 py-2 hover:bg-theme-light hover:text-theme-primary font-medium transition-colors"
                          >
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Link href="/customer/pages/contactus" className="py-5 text-[#141311] hover:text-theme-primary transition-colors font-bold">
                Contact
              </Link>

              <Link href="/customer/pages/blog" className="py-5 text-[#141311] hover:text-theme-primary transition-colors font-bold">
                Blog
              </Link>

              <Link href="/customer/pages/aboutus" className="py-5 text-[#141311] hover:text-theme-primary transition-colors font-bold">
                About Us
              </Link>
            </div>
          </div>

          {/* Right: Currency & Language Dropdowns */}
          <div className="flex items-center space-x-4 text-xs font-bold text-[#141311]">
            <div className="flex items-center gap-1 cursor-pointer hover:text-theme-primary transition-colors py-5">
              <span>PKR Rs.</span>
              <FiChevronDown size={12} className="text-[#8A7973]" />
            </div>

            <span className="h-4 w-px bg-[#F0DCE3]"></span>

            <div className="flex items-center gap-1 cursor-pointer hover:text-theme-primary transition-colors py-5">
              <span>English</span>
              <FiChevronDown size={12} className="text-[#8A7973]" />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col">
            <div className="p-4 bg-[#FAF6F4] border-b border-[#F0DCE3] text-[#141311] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-[#141311]">
                  Store<span className="text-theme-primary">2u</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-theme-primary bg-theme-light px-2 py-0.5 rounded-none border border-theme-border">
                  BEAUTY
                </span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-gray-500 hover:text-gray-900">
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <Link
                href="/customer/pages/discounted-products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 bg-theme-light text-[#141311] rounded-none font-bold text-sm mb-4 border border-theme-border"
              >
                <span className="w-6 h-6 rounded-none bg-theme-primary text-white flex items-center justify-center text-xs font-black">
                  %
                </span>
                <span>Shop Beauty Deals</span>
              </Link>

              <h4 className="text-[11px] font-bold uppercase text-[#8A7973] tracking-wider mb-2">Departments</h4>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/customer/pages/category/${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-none text-sm font-semibold text-gray-800 hover:bg-theme-light hover:text-theme-primary"
                  >
                    <span>{cat.name}</span>
                    <FiChevronRight className="text-gray-400" />
                  </Link>
                ))}
              </div>

              <div className="border-t border-[#F0DCE3] my-4 pt-4 space-y-2 text-sm font-semibold">
                <Link href="/customer/pages/collections" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 text-gray-700 hover:text-theme-primary">
                  Collections
                </Link>
                <Link href="/customer/pages/blog" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 text-gray-700 hover:text-theme-primary">
                  Beauty Blog
                </Link>
                <Link href="/customer/pages/orders" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 text-gray-700 hover:text-theme-primary">
                  Track My Order
                </Link>
                <Link href="/customer/pages/aboutus" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 text-gray-700 hover:text-theme-primary">
                  About Us
                </Link>
                <Link href="/customer/pages/contactus" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 text-gray-700 hover:text-theme-primary">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
