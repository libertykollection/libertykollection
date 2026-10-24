'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import {
  FiExternalLink,
  FiBell,
  FiPlus,
  FiLogOut,
  FiUser,
  FiChevronDown,
  FiShield,
  FiSearch
} from 'react-icons/fi';

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = Cookies.get('token') || localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push('/admin');
    }
  }, [router]);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const res = await fetch(`/api/orders/pending-count?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.count || 0);
        }
      } catch (err) {
        console.error('Header fetch count err', err);
      }
    };
    fetchPendingOrders();
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setMenuOpen(false);
    window.location.href = '/admin';
  };

  if (!isAuthenticated) return null;

  // Format today's date
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  // Derive page title from path
  let pageTitle = 'Dashboard Overview';
  if (pathname?.includes('/Products')) pageTitle = 'Product Inventory';
  else if (pathname?.includes('/add-product')) pageTitle = 'Add New Product';
  else if (pathname?.includes('/orders')) pageTitle = 'Order Management';
  else if (pathname?.includes('/customer')) pageTitle = 'Customer Directory';
  else if (pathname?.includes('/categories')) pageTitle = 'Product Categories';
  else if (pathname?.includes('/coupons')) pageTitle = 'Promotions & Coupons';
  else if (pathname?.includes('/slider')) pageTitle = 'Hero Sliders';
  else if (pathname?.includes('/Blogs')) pageTitle = 'Beauty Journal & Blogs';
  else if (pathname?.includes('/reviews')) pageTitle = 'Customer Reviews';
  else if (pathname?.includes('/settings')) pageTitle = 'Store Settings';

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-[#F0DCE3] shadow-xs">
      <div className="h-16 px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Page Title & Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#8C7A70] uppercase tracking-wider">
            <span>Admin Console</span>
            <span>/</span>
            <span className="text-[#C53261]">{pageTitle}</span>
          </div>
          <h1 className="text-lg font-serif font-bold text-[#141311] leading-none mt-1">
            {pageTitle}
          </h1>
        </div>

        {/* Right: Date, Storefront Link, Quick Actions, Profile */}
        <div className="flex items-center gap-3">
          {/* Today's Date */}
          <div className="hidden md:flex items-center text-xs text-[#6B5E55] bg-[#F8F5F2] px-3 py-1.5 border border-[#F0DCE3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C53261] mr-2"></span>
            {todayFormatted}
          </div>

          {/* View Live Store */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#141311] bg-white border border-[#F0DCE3] hover:border-[#C53261] hover:text-[#C53261] transition-all"
          >
            <span>Live Store</span>
            <FiExternalLink className="text-xs" />
          </a>

          {/* Quick Add Product */}
          <Link
            href="/admin/pages/add-product"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#141311] hover:bg-[#C53261] transition-all shadow-xs"
          >
            <FiPlus className="text-sm" />
            <span className="hidden sm:inline">New Product</span>
          </Link>

          {/* Notifications / Orders Bell */}
          <Link
            href="/admin/pages/orders"
            title="View Orders"
            className="relative p-2 text-[#6B5E55] hover:text-[#141311] hover:bg-[#F8F5F2] border border-[#F0DCE3] transition-colors"
          >
            <FiBell className="text-base" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#EF4444] text-[9px] font-bold text-white shadow-xs">
                {pendingCount}
              </span>
            )}
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 p-1 pl-2 text-left hover:bg-[#F8F5F2] border border-transparent hover:border-[#F0DCE3] transition-all"
            >
              <div className="w-7 h-7 bg-[#141311] text-[#C5A059] font-bold flex items-center justify-center text-xs">
                A
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-[#141311] leading-tight">Admin</div>
                <div className="text-[10px] text-[#8C7A70] leading-none">Super Admin</div>
              </div>
              <FiChevronDown className="text-xs text-[#8C7A70] ml-1" />
            </button>

            {/* Menu Popover */}
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white border border-[#F0DCE3] shadow-xl py-1 z-40">
                  <div className="px-4 py-3 border-b border-[#F0DCE3] bg-[#F8F5F2]">
                    <p className="text-xs font-bold text-[#141311]">Super Administrator</p>
                    <p className="text-[11px] text-[#8C7A70] truncate">Admin Console</p>
                  </div>

                  <Link
                    href="/admin/pages/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#3A2E35] hover:bg-[#F8F5F2] hover:text-[#C53261] transition-colors"
                  >
                    <FiShield className="text-sm" />
                    <span>Store Settings</span>
                  </Link>

                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#3A2E35] hover:bg-[#F8F5F2] hover:text-[#C53261] transition-colors"
                  >
                    <FiExternalLink className="text-sm" />
                    <span>View Storefront</span>
                  </a>

                  <div className="border-t border-[#F0DCE3] my-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#EF4444] hover:bg-red-50 transition-colors text-left font-semibold"
                  >
                    <FiLogOut className="text-sm" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}