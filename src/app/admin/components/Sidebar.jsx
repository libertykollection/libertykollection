'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  FiGrid,
  FiShoppingBag,
  FiTag,
  FiLayers,
  FiBox,
  FiUsers,
  FiPercent,
  FiStar,
  FiImage,
  FiFileText,
  FiHelpCircle,
  FiShare2,
  FiSettings,
  FiLogOut,
  FiExternalLink,
  FiChevronDown,
  FiChevronRight,
  FiPhone,
  FiSliders,
  FiPlusCircle,
  FiActivity
} from 'react-icons/fi';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [openSections, setOpenSections] = useState({
    catalog: true,
    sales: true,
    content: false,
    pages: false,
    settings: false,
  });

  const [pendingCount, setPendingCount] = useState(0);

  // Check auth
  useEffect(() => {
    const token = Cookies.get('token') || localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
    }
  }, [router]);

  // Fetch pending orders count
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const res = await fetch(`/api/orders/pending-count?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          const currentTotal = data.count || 0;
          localStorage.setItem('totalPendingOrders', currentTotal.toString());

          if (pathname?.includes('/admin/pages/orders')) {
            localStorage.setItem('lastSeenOrderCount', currentTotal.toString());
            setPendingCount(0);
          } else {
            const lastSeen = parseInt(localStorage.getItem('lastSeenOrderCount') || '0', 10);
            const badgeCount = Math.max(0, currentTotal - lastSeen);
            setPendingCount(badgeCount);
          }
        }
      } catch (error) {
        console.error('Failed to fetch pending orders count', error);
      }
    };

    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 10000);
    return () => clearInterval(interval);
  }, [pathname]);

  const [brandName, setBrandName] = useState('');

  useEffect(() => {
    fetch('/api/companydetails')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.name) setBrandName(data.name);
      })
      .catch(() => null);
  }, []);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    Cookies.remove('token');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/admin';
  };

  const isActive = (path) => pathname === path;
  const isSectionActive = (paths) => paths.some((p) => pathname?.startsWith(p));

  return (
    <div className="w-[270px] h-screen sticky top-0 flex flex-col bg-[#141311] text-[#E8DCD5] border-r border-[#241720] select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#241720] flex items-center justify-between">
        <Link href="/admin/pages/Main" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-none bg-gradient-to-br from-[#B98C2D] to-[#D2AA2D] flex items-center justify-center text-white shadow-md shadow-[#B98C2D]/20 font-serif font-bold text-lg tracking-wider">
            {brandName ? brandName.substring(0, 2).toUpperCase() : 'AD'}
          </div>
          <div>
            <div className="text-white font-serif font-bold tracking-wider text-base uppercase leading-tight group-hover:text-[#D2AA2D] transition-colors">
              {brandName || 'Admin'}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#D2AA2D]">
              Studio
            </div>
          </div>
        </Link>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#B98C2D]/20 text-[#D2AA2D] border border-[#B98C2D]/30 rounded-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
          Live
        </span>
      </div>

      {/* Navigation Links - Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-[#241720] scrollbar-track-transparent">
        
        {/* SECTION: Overview */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D2AA2D]/60">
            Overview
          </div>
          <Link
            href="/admin/pages/Main"
            className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-medium transition-all ${
              isActive('/admin/pages/Main')
                ? 'bg-[#B98C2D] text-white font-semibold shadow-sm shadow-[#B98C2D]/30 border-l-2 border-[#D2AA2D]'
                : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <FiGrid className={`text-base ${isActive('/admin/pages/Main') ? 'text-white' : 'text-[#D2AA2D]'}`} />
              <span>Dashboard</span>
            </div>
          </Link>
        </div>

        {/* SECTION: Catalog */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('catalog')}
            className="w-full flex items-center justify-between px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D2AA2D]/60 hover:text-[#D2AA2D] transition-colors"
          >
            <span>Catalog</span>
            {openSections.catalog ? <FiChevronDown /> : <FiChevronRight />}
          </button>

          {openSections.catalog && (
            <div className="space-y-1">
              <Link
                href="/admin/pages/Products"
                className={`flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/Products')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiBox className="text-sm text-[#D2AA2D]" />
                  <span>All Products</span>
                </div>
              </Link>

              <Link
                href="/admin/pages/add-product"
                className={`flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/add-product')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiPlusCircle className="text-sm text-[#D2AA2D]" />
                  <span>Add Product</span>
                </div>
              </Link>

              <Link
                href="/admin/pages/categories"
                className={`flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/categories')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiTag className="text-sm text-[#D2AA2D]" />
                  <span>Categories</span>
                </div>
              </Link>

              <Link
                href="/admin/pages/subcategories"
                className={`flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/subcategories')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiLayers className="text-sm text-[#D2AA2D]" />
                  <span>Subcategories</span>
                </div>
              </Link>

              <Link
                href="/admin/pages/size"
                className={`flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/size')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiSliders className="text-sm text-[#D2AA2D]" />
                  <span>Product Sizes</span>
                </div>
              </Link>

              <Link
                href="/admin/pages/color"
                className={`flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/color')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full border border-[#D2AA2D] bg-gradient-to-tr from-pink-400 to-amber-200"></span>
                  <span>Product Colors</span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* SECTION: Sales & Customers */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('sales')}
            className="w-full flex items-center justify-between px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D2AA2D]/60 hover:text-[#D2AA2D] transition-colors"
          >
            <span>Sales & Orders</span>
            {openSections.sales ? <FiChevronDown /> : <FiChevronRight />}
          </button>

          {openSections.sales && (
            <div className="space-y-1">
              <Link
                href="/admin/pages/orders"
                className={`flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/orders')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiShoppingBag className="text-sm text-[#D2AA2D]" />
                  <span>Orders</span>
                </div>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#EF4444] text-white rounded-full">
                    {pendingCount}
                  </span>
                )}
              </Link>

              <Link
                href="/admin/pages/customer"
                className={`flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/customer')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiUsers className="text-sm text-[#D2AA2D]" />
                  <span>Customers</span>
                </div>
              </Link>

              <Link
                href="/admin/pages/coupons"
                className={`flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/coupons')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiPercent className="text-sm text-[#D2AA2D]" />
                  <span>Promo Coupons</span>
                </div>
              </Link>

              <Link
                href="/admin/pages/reviews"
                className={`flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/reviews')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiStar className="text-sm text-[#D2AA2D]" />
                  <span>Customer Reviews</span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* SECTION: Marketing & Content */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('content')}
            className="w-full flex items-center justify-between px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D2AA2D]/60 hover:text-[#D2AA2D] transition-colors"
          >
            <span>Marketing & Media</span>
            {openSections.content ? <FiChevronDown /> : <FiChevronRight />}
          </button>

          {openSections.content && (
            <div className="space-y-1">
              <Link
                href="/admin/pages/slider"
                className={`flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/slider')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiImage className="text-sm text-[#D2AA2D]" />
                  <span>Hero Sliders</span>
                </div>
              </Link>

              <Link
                href="/admin/pages/Blogs"
                className={`flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/Blogs')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiFileText className="text-sm text-[#D2AA2D]" />
                  <span>Blog Articles</span>
                </div>
              </Link>

              <Link
                href="/admin/pages/BlogCategory"
                className={`flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/BlogCategory')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiTag className="text-sm text-[#D2AA2D]" />
                  <span>Blog Categories</span>
                </div>
              </Link>

              <Link
                href="/admin/pages/socialmedia"
                className={`flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/socialmedia')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiShare2 className="text-sm text-[#D2AA2D]" />
                  <span>Social Links</span>
                </div>
              </Link>

              <Link
                href="/admin/pages/addFAQ"
                className={`flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/addFAQ')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiHelpCircle className="text-sm text-[#D2AA2D]" />
                  <span>FAQ Management</span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* SECTION: Legal & Policy Pages */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('pages')}
            className="w-full flex items-center justify-between px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D2AA2D]/60 hover:text-[#D2AA2D] transition-colors"
          >
            <span>Pages & Policies</span>
            {openSections.pages ? <FiChevronDown /> : <FiChevronRight />}
          </button>

          {openSections.pages && (
            <div className="space-y-1">
              <Link
                href="/admin/pages/addAboutUs"
                className={`flex items-center px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/addAboutUs')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <span>About Us Page</span>
              </Link>

              <Link
                href="/admin/pages/addContactUs"
                className={`flex items-center px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/addContactUs')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <span>Contact Us Page</span>
              </Link>

              <Link
                href="/admin/pages/addPrivacyPolicy"
                className={`flex items-center px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/addPrivacyPolicy')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <span>Privacy Policy</span>
              </Link>

              <Link
                href="/admin/pages/addTermsAndConditions"
                className={`flex items-center px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/addTermsAndConditions')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <span>Terms & Conditions</span>
              </Link>

              <Link
                href="/admin/pages/addShippingPolicy"
                className={`flex items-center px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/addShippingPolicy')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <span>Shipping Policy</span>
              </Link>

              <Link
                href="/admin/pages/addReturnAndExchangePolicy"
                className={`flex items-center px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/addReturnAndExchangePolicy')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <span>Returns & Exchanges</span>
              </Link>
            </div>
          )}
        </div>

        {/* SECTION: Store Settings */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('settings')}
            className="w-full flex items-center justify-between px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D2AA2D]/60 hover:text-[#D2AA2D] transition-colors"
          >
            <span>Settings</span>
            {openSections.settings ? <FiChevronDown /> : <FiChevronRight />}
          </button>

          {openSections.settings && (
            <div className="space-y-1">
              <Link
                href="/admin/pages/settings"
                className={`flex items-center px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/settings')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiSettings className="text-sm text-[#D2AA2D]" />
                  <span>General Settings</span>
                </div>
              </Link>

              <Link
                href="/admin/pages/facebook-pixel"
                className={`flex items-center px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/facebook-pixel')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiActivity className="text-sm text-[#D2AA2D]" />
                  <span>Meta Pixel</span>
                </div>
              </Link>

              <Link
                href="/admin/pages/CompanyDetails"
                className={`flex items-center px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/CompanyDetails')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiShoppingBag className="text-sm text-[#D2AA2D]" />
                  <span>Company Details</span>
                </div>
              </Link>

              <Link
                href="/admin/pages/addContactInfo"
                className={`flex items-center px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive('/admin/pages/addContactInfo')
                    ? 'bg-[#B98C2D] text-white font-semibold'
                    : 'text-[#E8DCD5]/80 hover:bg-[#1E131B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiPhone className="text-sm text-[#D2AA2D]" />
                  <span>Contact Info</span>
                </div>
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Profile & Actions */}
      <div className="p-3 border-t border-[#241720] bg-[#0E080C]">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-none bg-[#B98C2D] text-white font-bold flex items-center justify-center text-xs shadow-inner">
              A
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">Administrator</div>
              <div className="text-[10px] text-[#D2AA2D]">Admin Console</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 text-[#E8DCD5]/70 hover:text-[#EF4444] hover:bg-[#1E131B] transition-colors"
          >
            <FiLogOut className="text-sm" />
          </button>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 w-full flex items-center justify-center gap-2 py-2 text-[11px] font-bold tracking-wider uppercase text-[#D2AA2D] hover:text-white bg-[#1E131B] hover:bg-[#B98C2D] transition-all border border-[#241720]"
        >
          <span>View Storefront</span>
          <FiExternalLink className="text-xs" />
        </a>
      </div>
    </div>
  );
}