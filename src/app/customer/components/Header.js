'use client';



import React, { useState, useEffect, useRef } from 'react';

import {

  FiSearch,

  FiUser,

  FiShoppingBag,

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

import {

  FaInstagram,

  FaFacebookF,

  FaTwitter,

  FaYoutube,

  FaTiktok,

  FaWhatsapp,

} from 'react-icons/fa';

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

  const [isSearchOpen, setIsSearchOpen] = useState(false);



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

  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const [totalQuantityOfItems, setTotalQuantityOfItems] = useState(0);

  const [wishlistCount, setWishlistCount] = useState(0);



  // Cart Count

  useEffect(() => {

    if (cartItems && cartItems.length > 0) {

      const total = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

      setTotalQuantityOfItems(total);

    } else {

      setTotalQuantityOfItems(0);

    }

  }, [cartItems]);



  // Wishlist Count

  useEffect(() => {

    setWishlistCount(wishlistItems?.length || 0);

  }, [wishlistItems]);



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

      {/* ── Liberty Top Bar 1: Dark Social & WhatsApp Bar ── */}

      <div className="w-full bg-[#1E1E1E] text-white py-3.5 px-5 lg:px-10 text-xs font-medium">

        <div className="relative flex items-center justify-between w-full">

          {/* Left: Social Icons */}

          <div className="flex items-center gap-3.5 text-gray-300 text-xs">

            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">

              <FaInstagram size={13} />

            </a>

            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">

              <FaFacebookF size={13} />

            </a>

            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="Twitter">

              <FaTwitter size={13} />

            </a>

            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="YouTube">

              <FaYoutube size={13} />

            </a>

            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="TikTok">

              <FaTiktok size={13} />

            </a>

            <a

              href={`https://wa.me/${(companyPhone || '').replace(/[^0-9]/g, '')}`}

              target="_blank"

              rel="noreferrer"

              className="hover:text-[#25D366] transition-colors"

              aria-label="WhatsApp"

            >

              <FaWhatsapp size={14} className="text-[#25D366]" />

            </a>

          </div>



          {/* Center: WhatsApp Link */}

          {companyPhone ? (

            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-[13px] font-semibold text-white">

              <span className="text-gray-400 font-bold">&lsaquo;</span>

              <FaWhatsapp className="text-[#25D366] text-sm" />

              <a

                href={`https://wa.me/${companyPhone.replace(/[^0-9]/g, '')}`}

                target="_blank"

                rel="noreferrer"

                className="hover:underline tracking-wide"

              >

                Whatsapp Now : {companyPhone}

              </a>

              <span className="text-gray-400 font-bold">&rsaquo;</span>

            </div>

          ) : (

            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-[13px] font-semibold text-white tracking-wide">

              <span>Liberty Kollection • Official Luxury Online Store</span>

            </div>

          )}



          {/* Right: Quick Links */}

          <div className="hidden md:flex items-center space-x-4 text-[11px] text-gray-300 font-medium">

            <Link href="/customer/pages/orders" className="hover:text-white transition-colors">

              Track Order

            </Link>

            <span className="opacity-30">•</span>

            <Link href="/customer/pages/contactus" className="hover:text-white transition-colors">

              Help

            </Link>

          </div>

        </div>

      </div>



      {/* ── Liberty Top Bar 2: Solid Plum Marquee Announcement Bar ── */}

      <div className="w-full bg-[#77104C] text-white py-4 overflow-hidden whitespace-nowrap font-medium">

        <div className="s2u-marquee tracking-normal text-[15px] font-semibold">

          <span className="mx-8">100% Guaranteed Authentic Formulas</span>

          <span className="mx-4 text-[#F6D0E3]">•</span>

          <span className="mx-8">Complimentary Nationwide Express Shipping on Qualifying Luxury Orders</span>

          <span className="mx-4 text-[#F6D0E3]">•</span>

          <span className="mx-8">Liberty Kollection — Your Look, Your Liberty</span>

          <span className="mx-4 text-[#F6D0E3]">•</span>

          <span className="mx-8">Fast & Secure Delivery With White-Glove Packaging</span>

          <span className="mx-4 text-[#F6D0E3]">•</span>

          <span className="mx-8">100% Guaranteed Authentic Formulas</span>

        </div>

      </div>



      {/* ── 1. Liberty Signature Single-Row Main Header Bar ── */}

      <div className="w-full bg-[#F6F3EC] text-[#77104C] py-7 px-5 lg:px-[60px] rounded-b-[22px] relative">

        <div className="flex items-center justify-between gap-4 w-full">

          {/* Left: Mobile Menu Toggle & Authentic Liberty Kollection's Script Logo */}

          <div className="flex items-center gap-3">

            <button

              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}

              className="lg:hidden p-1.5 text-[#222222] hover:text-[#77104C] transition-colors"

              aria-label="Toggle Menu"

            >

              {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}

            </button>



            <Link href="/" className="flex items-center group py-0.5">

              <Image

                src="/liberty-logo-transparent.png"

                alt="Liberty Kollection"

                width={260}

                height={140}

                className="h-16 sm:h-20 lg:h-[88px] w-auto object-contain cursor-pointer transition-transform hover:scale-[1.02] drop-shadow-sm"

                priority

                unoptimized

              />

            </Link>

          </div>



          {/* Center: Single-Row Navigation Menu (Figtree Font) */}

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 whitespace-nowrap text-[15px] font-medium text-[#8B0A52] font-display absolute left-1/2 -translate-x-1/2">

            <Link href="/" className="hover:text-[#77104C] transition-colors">

              Home

            </Link>

            <Link href="/customer/pages/allproducts" className="hover:text-[#77104C] transition-colors">

              Shop All

            </Link>

            {categories && categories.length > 0 ? (

              categories.slice(0, 5).map((cat) => (

                <Link

                  key={cat.id || cat.slug}

                  href={`/customer/pages/category/${cat.slug}`}

                  className="hover:text-[#77104C] transition-colors"

                >

                  {cat.name}

                </Link>

              ))

            ) : (

              <>

                <Link href="/customer/pages/collections" className="hover:text-[#77104C] transition-colors">

                  Collections

                </Link>

                <Link href="/customer/pages/allproducts?filter=new" className="hover:text-[#77104C] transition-colors">

                  New Arrival

                </Link>

                <Link href="/customer/pages/discounted-products" className="hover:text-[#77104C] transition-colors">

                  Sale & Offers

                </Link>

                <Link href="/customer/pages/aboutus" className="hover:text-[#77104C] transition-colors">

                  About Us

                </Link>

              </>

            )}

            <Link href="/customer/pages/contactus" className="hover:text-[#77104C] transition-colors">

              Contact

            </Link>

          </nav>



          {/* Right: Minimalist Icons matching libertykollection.com (Search, User, Cart) */}

          <div className="flex items-center space-x-6 text-[#8B0A52]">

            {/* Search Icon Trigger */}

            <button

              onClick={() => {

                setIsSearchOpen(!isSearchOpen);

                setTimeout(() => searchInputRef.current?.focus(), 100);

              }}

              className="p-1 hover:text-[#77104C] transition-colors cursor-pointer"

              aria-label="Search products"

            >

              <FiSearch size={20} className="stroke-[2.2]" />

            </button>



            {/* User Account / Profile */}

            <div className="relative">

              {authToken ? (

                <button

                  id="profile-trigger"

                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}

                  className="p-1 hover:text-[#77104C] transition-colors cursor-pointer flex items-center"

                  aria-label="Account profile"

                >

                  <FiUser size={20} className="stroke-[2.2]" />

                </button>

              ) : (

                <Link

                  href="/login"

                  className="p-1 hover:text-[#77104C] transition-colors cursor-pointer flex items-center"

                  aria-label="Login or Sign Up"

                >

                  <FiUser size={20} className="stroke-[2.2]" />

                </Link>

              )}



              {/* Profile Dropdown */}

              {isProfileDropdownOpen && (

                <div

                  ref={profileDropdownRef}

                  className="absolute right-0 mt-3 w-48 bg-white text-gray-900 rounded-xl shadow-xl border border-[#EAE3D5] py-2 z-50"

                >

                  {userRole === 'ADMIN' ? (

                    <Link

                      href="/admin/pages/Main"

                      className="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-[#FFFDF5] hover:text-[#77104C]"

                    >

                      Admin Dashboard

                    </Link>

                  ) : (

                    <>

                      <Link

                        href="/customer/pages/orders"

                        className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#FFFDF5] hover:text-[#77104C]"

                      >

                        My Orders

                      </Link>

                      <Link

                        href="/customer/pages/profile"

                        className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#FFFDF5] hover:text-[#77104C]"

                      >

                        Profile Settings

                      </Link>

                    </>

                  )}

                  <div className="border-t border-[#EAE3D5] my-1"></div>

                  <button

                    onClick={handleSignOut}

                    className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-1.5"

                  >

                    <FiLogOut /> Sign Out

                  </button>

                </div>

              )}

            </div>



            {/* Shopping Bag Cart Icon with Plum Badge */}

            <Link

              href="/customer/pages/cart"

              className="relative p-1 hover:text-[#77104C] transition-colors cursor-pointer"

              aria-label="Shopping bag"

            >

              <FiShoppingBag size={21} className="stroke-[2.2]" />

              <span className="absolute -top-1 -right-2 bg-[#77104C] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">

                {totalQuantityOfItems}

              </span>

            </Link>

          </div>

        </div>



        {/* Slide-down Search Bar */}

        {isSearchOpen && (

          <div className="absolute top-full left-0 right-0 bg-[#FFFDF5] border-b border-[#EAE3D5] py-4 px-4 lg:px-8 shadow-md z-40 animate-in fade-in slide-in-from-top-2 duration-150">

            <div className="container mx-auto max-w-2xl" ref={searchContainerRef}>

              <form onSubmit={handleSearch} className="relative flex items-center bg-white border border-[#EAE3D5] rounded-full h-11 pl-5 pr-2 shadow-xs">

                <input

                  ref={searchInputRef}

                  type="text"

                  value={searchQuery}

                  onChange={(e) => setSearchQuery(e.target.value)}

                  placeholder="Search luxury cosmetics, skincare, collections..."

                  className="w-full bg-transparent text-[#222222] placeholder-gray-400 text-xs sm:text-sm py-2 outline-none font-medium"

                />

                <button

                  type="submit"

                  className="w-8 h-8 bg-[#77104C] hover:bg-[#5E0B3C] text-white rounded-full flex items-center justify-center shadow-xs cursor-pointer"

                >

                  <FiSearch size={14} className="stroke-[2.5]" />

                </button>

              </form>



              {/* Suggestions */}

              {((searchResults.length > 0 || searchCategories.length > 0) || isSearching) && searchQuery.length > 0 && (

                <div className="mt-2 bg-white rounded-2xl shadow-xl border border-[#EAE3D5] p-3 max-h-[50vh] overflow-y-auto">

                  {isSearching ? (

                    <div className="p-3 text-center text-xs text-gray-500">Searching products...</div>

                  ) : (

                    searchResults.slice(0, 6).map((item) => (

                      <div

                        key={item.id}

                        onClick={() => {

                          router.push(`/customer/pages/products/${item.slug}`);

                          setIsSearchOpen(false);

                          setSearchResults([]);

                        }}

                        className="flex items-center gap-3 p-2 hover:bg-[#FFFDF5] rounded-xl cursor-pointer"

                      >

                        <div className="text-xs font-semibold text-[#222222]">{item.name}</div>

                        <span className="text-[11px] text-[#ED1C2A] font-bold ml-auto">Rs. {item.price}</span>

                      </div>

                    ))

                  )}

                </div>

              )}

            </div>

          </div>

        )}

      </div>



      {/* Mobile Drawer Menu */}

      {isMobileMenuOpen && (

        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">

          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col">

            <div className="p-4 bg-[#FAF6F4] border-b border-[#F0DCE3] text-[#141311] flex items-center justify-between">

              <div className="flex items-center gap-2">

                <Image

                  src="/liberty-logo-transparent.png"

                  alt="Liberty Kollection"

                  width={180}

                  height={95}

                  className="h-12 sm:h-14 w-auto object-contain"

                  unoptimized

                />

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

                <Link

                  href="/customer/pages/wishlist"

                  onClick={() => setIsMobileMenuOpen(false)}

                  className="flex items-center justify-between p-2 text-gray-700 hover:text-theme-primary"

                >

                  <span>My Vanity Wishlist</span>

                  {wishlistCount > 0 && (

                    <span className="bg-theme-primary text-white text-[10px] font-black px-1.5 py-0.5">

                      {wishlistCount}

                    </span>

                  )}

                </Link>

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

