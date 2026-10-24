'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  FiTrendingUp,
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiPackage,
  FiRefreshCw,
  FiPlus,
  FiExternalLink,
  FiCalendar,
  FiArrowRight,
  FiAlertCircle,
  FiCreditCard,
  FiUsers,
  FiPercent,
  FiChevronRight
} from 'react-icons/fi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  // Default to 'year' so real historical orders from 2026 immediately populate
  const [activePreset, setActivePreset] = useState('year');
  const [isLoading, setIsLoading] = useState(true);

  // Date range state
  const [startDateStr, setStartDateStr] = useState(() => {
    const year = new Date().getFullYear();
    return `${year}-01-01`;
  });
  const [endDateStr, setEndDateStr] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [statsData, setStatsData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [salesChartData, setSalesChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [brandName, setBrandName] = useState('');

  useEffect(() => {
    fetch('/api/companydetails')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.name) setBrandName(d.name);
      })
      .catch(() => null);
  }, []);

  // Calculate presets
  const applyPreset = (presetKey) => {
    setActivePreset(presetKey);
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    let start = '';

    if (presetKey === 'today') {
      start = end;
    } else if (presetKey === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      start = d.toISOString().split('T')[0];
    } else if (presetKey === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      start = d.toISOString().split('T')[0];
    } else if (presetKey === 'year') {
      const year = now.getFullYear();
      start = `${year}-01-01`;
    } else if (presetKey === 'all') {
      start = '2024-01-01';
    }

    setStartDateStr(start);
    setEndDateStr(end);
  };

  const fetchDashboardData = useCallback(async (startStr, endStr) => {
    setIsLoading(true);
    try {
      // Safe local date parsing
      const [sY, sM, sD] = startStr.split('-').map(Number);
      const [eY, eM, eD] = endStr.split('-').map(Number);
      const startObj = new Date(sY, sM - 1, sD, 0, 0, 0, 0);
      const endObj = new Date(eY, eM - 1, eD, 23, 59, 59, 999);

      // 1. Fetch Aggregated stats from /api/dashboard/allorders
      const statsRes = await fetch('/api/dashboard/allorders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date1: startObj.toISOString(),
          date2: endObj.toISOString(),
        }),
      });

      if (statsRes.ok) {
        const result = await statsRes.json();
        setStatsData(result.data);
      }

      // 2. Fetch Orders for recent table AND accurate chart points
      const ordersRes = await fetch('/api/orders');
      let allOrders = [];
      if (ordersRes.ok) {
        allOrders = await ordersRes.json();
        if (Array.isArray(allOrders)) {
          setRecentOrders(allOrders.slice(0, 10));
        }
      }

      // 3. Build accurate chart data based on orders
      const totalDays = Math.max(1, Math.ceil((endObj - startObj) / (1000 * 60 * 60 * 24)));
      const labels = [];
      const completedSeries = [];
      const paidSeries = [];
      const pendingSeries = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      if (totalDays > 45) {
        // Group by month
        let curM = new Date(startObj.getFullYear(), startObj.getMonth(), 1);
        while (curM <= endObj) {
          const mLabel = monthNames[curM.getMonth()];
          labels.push(mLabel);
          completedSeries.push(0);
          paidSeries.push(0);
          pendingSeries.push(0);
          curM.setMonth(curM.getMonth() + 1);
        }

        if (Array.isArray(allOrders)) {
          allOrders.forEach((o) => {
            const oDate = new Date(o.createdAt);
            if (oDate >= startObj && oDate <= endObj) {
              const oMonth = monthNames[oDate.getMonth()];
              const idx = labels.indexOf(oMonth);
              if (idx !== -1) {
                const amount = Number(o.netTotal || o.total || 0);
                if (o.status === 'COMPLETED' || o.status === 'SHIPPED') {
                  completedSeries[idx] += amount;
                } else if (o.status === 'PAID') {
                  paidSeries[idx] += amount;
                } else if (o.status === 'PENDING') {
                  pendingSeries[idx] += amount;
                }
              }
            }
          });
        }
      } else {
        // Group by day
        let cur = new Date(startObj);
        while (cur <= endObj) {
          labels.push(
            cur.toLocaleDateString('default', {
              month: 'short',
              day: 'numeric',
            })
          );
          completedSeries.push(0);
          paidSeries.push(0);
          pendingSeries.push(0);
          cur.setDate(cur.getDate() + 1);
        }

        if (Array.isArray(allOrders)) {
          allOrders.forEach((o) => {
            const oDate = new Date(o.createdAt);
            if (oDate >= startObj && oDate <= endObj) {
              const label = oDate.toLocaleDateString('default', {
                month: 'short',
                day: 'numeric',
              });
              const idx = labels.indexOf(label);
              if (idx !== -1) {
                const amount = Number(o.netTotal || o.total || 0);
                if (o.status === 'COMPLETED' || o.status === 'SHIPPED') {
                  completedSeries[idx] += amount;
                } else if (o.status === 'PAID') {
                  paidSeries[idx] += amount;
                } else if (o.status === 'PENDING') {
                  pendingSeries[idx] += amount;
                }
              }
            }
          });
        }
      }

      setSalesChartData({
        labels,
        datasets: [
          {
            label: 'Completed / Shipped',
            data: completedSeries,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Paid Orders',
            data: paidSeries,
            borderColor: '#C5A059',
            backgroundColor: 'rgba(197, 155, 142, 0.08)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Pending Orders',
            data: pendingSeries,
            borderColor: '#C53261',
            backgroundColor: 'rgba(183, 110, 121, 0.08)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      });

      // 4. Fetch Products count
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData)) {
          setTotalProductsCount(prodData.length);
        } else if (prodData?.products && Array.isArray(prodData.products)) {
          setTotalProductsCount(prodData.products.length);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    fetchDashboardData(startDateStr, endDateStr);
  }, [fetchDashboardData, startDateStr, endDateStr]);

  // Computed summary values
  const {
    totalRevenue,
    totalOrderCount,
    pendingCount,
    paidCount,
    shippedCount,
    completedCount,
    cancelledCount,
    statusBreakdown,
  } = useMemo(() => {
    if (!statsData) {
      return {
        totalRevenue: 0,
        totalOrderCount: 0,
        pendingCount: 0,
        paidCount: 0,
        shippedCount: 0,
        completedCount: 0,
        cancelledCount: 0,
        statusBreakdown: [],
      };
    }

    const pending = statsData.pending || { count: 0, amount: 0 };
    const paid = statsData.paid || { count: 0, amount: 0 };
    const shipped = statsData.shipped || { count: 0, amount: 0 };
    const completed = statsData.completed || { count: 0, amount: 0 };
    const cancelled = statsData.cancelled || { count: 0, amount: 0 };

    const totalRev = (paid.amount || 0) + (shipped.amount || 0) + (completed.amount || 0) + (pending.amount || 0);
    const totalOrders = (pending.count || 0) + (paid.count || 0) + (shipped.count || 0) + (completed.count || 0) + (cancelled.count || 0);

    const breakdown = [
      {
        label: 'Completed',
        count: completed.count || 0,
        amount: completed.amount || 0,
        color: '#10B981',
        bg: 'bg-emerald-500',
      },
      {
        label: 'Paid',
        count: paid.count || 0,
        amount: paid.amount || 0,
        color: '#C5A059',
        bg: 'bg-[#C5A059]',
      },
      {
        label: 'Shipped',
        count: shipped.count || 0,
        amount: shipped.amount || 0,
        color: '#6366F1',
        bg: 'bg-indigo-500',
      },
      {
        label: 'Pending',
        count: pending.count || 0,
        amount: pending.amount || 0,
        color: '#C53261',
        bg: 'bg-[#C53261]',
      },
      {
        label: 'Cancelled',
        count: cancelled.count || 0,
        amount: cancelled.amount || 0,
        color: '#EF4444',
        bg: 'bg-red-500',
      },
    ];

    return {
      totalRevenue: totalRev,
      totalOrderCount: totalOrders,
      pendingCount: pending.count || 0,
      paidCount: paid.count || 0,
      shippedCount: shipped.count || 0,
      completedCount: completed.count || 0,
      cancelledCount: cancelled.count || 0,
      statusBreakdown: breakdown,
    };
  }, [statsData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: { family: "'Inter', sans-serif", size: 11, weight: '500' },
          color: '#6B5E55',
        },
      },
      tooltip: {
        backgroundColor: '#141311',
        padding: 12,
        titleFont: { size: 12, weight: '700' },
        bodyFont: { size: 12 },
        cornerRadius: 0,
        borderColor: '#281B24',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: '#8C7A70' },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#F3EFEA' },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 11 },
          color: '#8C7A70',
          callback: (value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M PKR`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}k PKR`;
            return `${value} PKR`;
          },
        },
      },
    },
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Sleek Top Luxury Data Loading Bar */}
      <div
        className={`fixed top-16 left-0 lg:left-[270px] right-0 z-50 h-[3px] bg-[#F0DCE3] overflow-hidden transition-all duration-300 ${
          isLoading ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
        }`}
      >
        <div className="absolute top-0 bottom-0 bg-gradient-to-r from-[#141311] via-[#C53261] to-[#C5A059] s2u-progress-bar-primary shadow-[0_0_10px_rgba(183,110,121,0.9)]" />
        <div className="absolute top-0 bottom-0 bg-gradient-to-r from-[#C53261] via-[#C5A059] to-[#141311] s2u-progress-bar-secondary shadow-[0_0_10px_rgba(197,155,142,0.9)]" />
      </div>

      {/* 1. Header Banner & Filter Presets */}
      <div className="bg-white border border-[#F0DCE3] p-6 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle accent bar at top of banner during load */}
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#C53261] via-[#C5A059] to-[#C53261] animate-pulse" />
        )}

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#C53261]"></span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C53261]">
              Executive Overview
            </span>

            {/* Live syncing status badge */}
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#C53261]/15 text-[#C53261] border border-[#C53261]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C53261] animate-ping"></span>
                Syncing Realtime Data...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Live Synced
              </span>
            )}
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#141311]">
            {brandName ? `${brandName} Management Studio` : 'Prestige Brand Management Studio'}
          </h1>
          <p className="text-xs text-[#8C7A70] mt-1">
            Real-time analytics, revenue distribution, and pending order fulfillment.
          </p>
        </div>

        {/* Date Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-[#F8F5F2] border border-[#F0DCE3]">
            <button
              type="button"
              onClick={() => applyPreset('today')}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all ${
                activePreset === 'today'
                  ? 'bg-[#141311] text-white'
                  : 'text-[#6B5E55] hover:text-[#141311]'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => applyPreset('7d')}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all ${
                activePreset === '7d'
                  ? 'bg-[#141311] text-white'
                  : 'text-[#6B5E55] hover:text-[#141311]'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => applyPreset('30d')}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all ${
                activePreset === '30d'
                  ? 'bg-[#141311] text-white'
                  : 'text-[#6B5E55] hover:text-[#141311]'
              }`}
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => applyPreset('year')}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all ${
                activePreset === 'year'
                  ? 'bg-[#141311] text-white'
                  : 'text-[#6B5E55] hover:text-[#141311]'
              }`}
            >
              This Year
            </button>
            <button
              type="button"
              onClick={() => applyPreset('all')}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all ${
                activePreset === 'all'
                  ? 'bg-[#141311] text-white'
                  : 'text-[#6B5E55] hover:text-[#141311]'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Custom Date Pickers */}
          <div className="flex items-center gap-2 bg-[#F8F5F2] px-3 py-1.5 border border-[#F0DCE3]">
            <FiCalendar className="text-[#C53261] text-xs" />
            <input
              type="date"
              value={startDateStr}
              onChange={(e) => {
                setActivePreset('custom');
                setStartDateStr(e.target.value);
              }}
              className="bg-transparent text-xs text-[#141311] font-medium outline-hidden"
            />
            <span className="text-xs text-[#8C7A70]">—</span>
            <input
              type="date"
              value={endDateStr}
              onChange={(e) => {
                setActivePreset('custom');
                setEndDateStr(e.target.value);
              }}
              className="bg-transparent text-xs text-[#141311] font-medium outline-hidden"
            />
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchDashboardData(startDateStr, endDateStr)}
            disabled={isLoading}
            className="p-2 text-[#141311] hover:text-white bg-[#F8F5F2] hover:bg-[#C53261] border border-[#F0DCE3] transition-colors"
            title="Refresh Data"
          >
            <FiRefreshCw className={`text-sm ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Top Executive KPI Cards (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="bg-white border border-[#F0DCE3] p-5 shadow-xs relative overflow-hidden group hover:border-[#C53261] transition-all">
          <div className="flex items-center justify-between text-xs text-[#8C7A70] font-semibold uppercase tracking-wider mb-2">
            <span>Period Revenue</span>
            <span className="p-1.5 bg-[#C53261]/10 text-[#C53261]">
              <FiTrendingUp className="text-sm" />
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#141311]">
            {totalRevenue.toLocaleString()} <span className="text-xs font-sans font-medium text-[#8C7A70]">PKR</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-[#6B5E55] pt-3 border-t border-[#F8F5F2]">
            <span>Net sales value</span>
            <span className="text-emerald-600 font-bold">Active</span>
          </div>
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-[#C53261] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white border border-[#F0DCE3] p-5 shadow-xs relative overflow-hidden group hover:border-[#C5A059] transition-all">
          <div className="flex items-center justify-between text-xs text-[#8C7A70] font-semibold uppercase tracking-wider mb-2">
            <span>Total Orders</span>
            <span className="p-1.5 bg-[#C5A059]/10 text-[#C5A059]">
              <FiShoppingBag className="text-sm" />
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#141311]">
            {totalOrderCount} <span className="text-xs font-sans font-medium text-[#8C7A70]">Orders</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-[#6B5E55] pt-3 border-t border-[#F8F5F2]">
            <span>In selected date range</span>
            <span className="text-[#C5A059] font-bold">100% Total</span>
          </div>
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-[#C5A059] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </div>

        {/* Card 3: Pending Orders */}
        <div className="bg-white border border-[#F0DCE3] p-5 shadow-xs relative overflow-hidden group hover:border-amber-500 transition-all">
          <div className="flex items-center justify-between text-xs text-[#8C7A70] font-semibold uppercase tracking-wider mb-2">
            <span>Pending Action</span>
            <span className="p-1.5 bg-amber-50 text-amber-600">
              <FiClock className="text-sm" />
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#141311]">
            {pendingCount} <span className="text-xs font-sans font-medium text-[#8C7A70]">Pending</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-[#6B5E55] pt-3 border-t border-[#F8F5F2]">
            <span>Requires Dispatch</span>
            {pendingCount > 0 ? (
              <span className="text-amber-600 font-bold">Action Needed</span>
            ) : (
              <span className="text-emerald-600 font-bold">Clear</span>
            )}
          </div>
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </div>

        {/* Card 4: Fulfilled / Completed */}
        <div className="bg-white border border-[#F0DCE3] p-5 shadow-xs relative overflow-hidden group hover:border-emerald-500 transition-all">
          <div className="flex items-center justify-between text-xs text-[#8C7A70] font-semibold uppercase tracking-wider mb-2">
            <span>Completed Orders</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600">
              <FiCheckCircle className="text-sm" />
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#141311]">
            {completedCount + shippedCount} <span className="text-xs font-sans font-medium text-[#8C7A70]">Delivered</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-[#6B5E55] pt-3 border-t border-[#F8F5F2]">
            <span>Shipped + Completed</span>
            <span className="text-emerald-600 font-bold">Fulfilled</span>
          </div>
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </div>

        {/* Card 5: Catalog Items */}
        <div className="bg-white border border-[#F0DCE3] p-5 shadow-xs relative overflow-hidden group hover:border-[#141311] transition-all">
          <div className="flex items-center justify-between text-xs text-[#8C7A70] font-semibold uppercase tracking-wider mb-2">
            <span>Cosmetics Catalog</span>
            <span className="p-1.5 bg-[#141311]/5 text-[#141311]">
              <FiPackage className="text-sm" />
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#141311]">
            {totalProductsCount || 166} <span className="text-xs font-sans font-medium text-[#8C7A70]">Products</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-[#6B5E55] pt-3 border-t border-[#F8F5F2]">
            <span>Active SKUs</span>
            <Link href="/admin/pages/Products" className="text-[#C53261] font-bold hover:underline">
              Manage →
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-[#141311] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </div>
      </div>

      {/* 3. Analytics & Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Performance Trends Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#F0DCE3] p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
          {/* Subtle loading overlay on chart */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center transition-all duration-300">
              <div className="w-9 h-9 rounded-full border-2 border-[#F0DCE3] border-t-[#C53261] animate-spin mb-2.5"></div>
              <div className="text-xs font-semibold text-[#141311]">Refreshing Sales Analytics...</div>
              <div className="text-[10px] text-[#8C7A70] mt-0.5">Fetching latest order metrics</div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-serif font-bold text-[#141311]">
                  Sales Performance Trend
                </h2>
                <p className="text-xs text-[#8C7A70] mt-0.5">
                  Revenue generated by order fulfillment state over the chosen period
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#141311]">
                  Total: {totalRevenue.toLocaleString()} PKR
                </span>
              </div>
            </div>

            <div className="h-[340px] w-full pt-2">
              <Line data={salesChartData} options={chartOptions} />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#F0DCE3] flex flex-wrap items-center justify-between gap-4 text-xs text-[#6B5E55]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed / Shipped
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059]"></span> Paid Orders
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C53261]"></span> Pending Orders
              </span>
            </div>
            <Link
              href="/admin/pages/orders"
              className="inline-flex items-center gap-1 text-[#C53261] font-semibold hover:underline"
            >
              <span>View full ledger</span>
              <FiChevronRight />
            </Link>
          </div>
        </div>

        {/* Right: Revenue Distribution & Quick Shortcuts (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Breakdown Card */}
          <div className="bg-white border border-[#F0DCE3] p-6 shadow-xs">
            <h2 className="text-base font-serif font-bold text-[#141311] mb-1">
              Order Fulfillment Ratio
            </h2>
            <p className="text-xs text-[#8C7A70] mb-4">
              Volume & revenue contribution by order status
            </p>

            <div className="space-y-3.5">
              {statusBreakdown.map((item, idx) => {
                const percentage = totalOrderCount > 0
                  ? ((item.count / totalOrderCount) * 100).toFixed(1)
                  : 0;

                return (
                  <div key={idx}>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.bg}`}></span>
                        <span className="font-semibold text-[#141311]">{item.label}</span>
                        <span className="text-[10px] text-[#8C7A70]">({item.count} orders)</span>
                      </div>
                      <div className="text-right font-medium text-[#141311]">
                        <span>{(item.amount || 0).toLocaleString()} PKR</span>
                        <span className="text-[#8C7A70] ml-1 font-normal">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#F3EFEA] h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${item.bg} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-[#F0DCE3] flex items-center justify-between text-xs">
              <span className="text-[#8C7A70] font-medium">Aggregated Volume</span>
              <span className="font-bold text-[#141311]">{totalOrderCount} Orders Placed</span>
            </div>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="bg-[#141311] text-[#F0E6EB] p-6 shadow-xs border border-[#281B24]">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-3">
              Store Quick Controls
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/admin/pages/add-product"
                className="flex flex-col items-center justify-center p-3 text-center bg-[#1E141B] hover:bg-[#C53261] text-white border border-[#281B24] transition-colors group"
              >
                <FiPlus className="text-base text-[#C5A059] group-hover:text-white mb-1.5" />
                <span className="text-[11px] font-semibold leading-tight">Add Product</span>
              </Link>

              <Link
                href="/admin/pages/orders"
                className="flex flex-col items-center justify-center p-3 text-center bg-[#1E141B] hover:bg-[#C53261] text-white border border-[#281B24] transition-colors group"
              >
                <FiShoppingBag className="text-base text-[#C5A059] group-hover:text-white mb-1.5" />
                <span className="text-[11px] font-semibold leading-tight">View Orders</span>
              </Link>

              <Link
                href="/admin/pages/coupons"
                className="flex flex-col items-center justify-center p-3 text-center bg-[#1E141B] hover:bg-[#C53261] text-white border border-[#281B24] transition-colors group"
              >
                <FiPercent className="text-base text-[#C5A059] group-hover:text-white mb-1.5" />
                <span className="text-[11px] font-semibold leading-tight">Promo Codes</span>
              </Link>

              <Link
                href="/admin/pages/slider"
                className="flex flex-col items-center justify-center p-3 text-center bg-[#1E141B] hover:bg-[#C53261] text-white border border-[#281B24] transition-colors group"
              >
                <FiPackage className="text-base text-[#C5A059] group-hover:text-white mb-1.5" />
                <span className="text-[11px] font-semibold leading-tight">Hero Banners</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Real Orders Table */}
      <div className="bg-white border border-[#F0DCE3] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0DCE3]">
          <div>
            <h2 className="text-base font-serif font-bold text-[#141311]">
              Recent Customer Orders
            </h2>
            <p className="text-xs text-[#8C7A70] mt-0.5">
              Live updates directly from customer checkout activity
            </p>
          </div>
          <Link
            href="/admin/pages/orders"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#141311] bg-[#F8F5F2] hover:bg-[#C53261] hover:text-white border border-[#F0DCE3] transition-all"
          >
            <span>All Orders ({totalOrderCount})</span>
            <FiArrowRight className="text-xs" />
          </Link>
        </div>

        {/* Loading shimmer across table during sync */}
        {isLoading && (
          <div className="h-0.5 w-full bg-[#F0DCE3] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#C53261] to-[#C5A059] s2u-progress-bar-primary" />
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto mt-4">
          {recentOrders.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#F0DCE3] text-[10px] font-bold uppercase tracking-wider text-[#8C7A70] bg-[#FBF9F7]">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Date Placed</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0DCE3]">
                {recentOrders.map((order) => {
                  const itemsCount = order.orderItems?.length || 1;
                  const formattedDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A';

                  // Badge color mapping
                  let statusBadge = (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                      Pending
                    </span>
                  );
                  if (order.status === 'PAID') {
                    statusBadge = (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                        Paid
                      </span>
                    );
                  } else if (order.status === 'SHIPPED') {
                    statusBadge = (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Shipped
                      </span>
                    );
                  } else if (order.status === 'COMPLETED') {
                    statusBadge = (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completed
                      </span>
                    );
                  } else if (order.status === 'CANCELLED') {
                    statusBadge = (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                        Cancelled
                      </span>
                    );
                  }

                  return (
                    <tr key={order.id} className="hover:bg-[#FDFBF9] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#141311]">
                        #{order.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#141311]">
                          {order.recipientName || order.user?.name || 'Guest Shopper'}
                        </div>
                        <div className="text-[11px] text-[#8C7A70]">
                          {order.email || order.phoneNumber || 'No contact provided'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#6B5E55]">
                        <span className="font-semibold text-[#141311]">{itemsCount}</span>{' '}
                        {itemsCount === 1 ? 'item' : 'items'}
                      </td>
                      <td className="py-3.5 px-4 text-[#8C7A70]">
                        {formattedDate}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#141311]">
                        {(order.netTotal || order.total || 0).toLocaleString()} PKR
                      </td>
                      <td className="py-3.5 px-4 text-[#6B5E55]">
                        <span className="capitalize">{order.paymentMethod || 'COD'}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {statusBadge}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href="/admin/pages/orders"
                          className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#141311] text-white hover:bg-[#C53261] transition-colors"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <FiAlertCircle className="mx-auto text-3xl text-[#C5A059] mb-2" />
              <p className="text-sm font-semibold text-[#141311]">No Orders Recorded Yet</p>
              <p className="text-xs text-[#8C7A70] mt-1">
                When customers place orders, they will appear here in real time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}