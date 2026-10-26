'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { EyeIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { FiPackage, FiTruck, FiClock, FiCheck, FiShoppingBag, FiDownload } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getSafeImageUrl } from '../../../util/imageUtils';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.info('Please sign in to view your order archive');
        router.push('/customer/pages/login');
        return;
      }

      try {
        const response = await axios.get('/api/orders/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch your order archive');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || selectedOrder.status === 'SHIPPED' || selectedOrder.status === 'CANCELLED') return;

    try {
      setLoading(true);
      const response = await axios.put(`/api/orders/${selectedOrder.id}`, {
        id: selectedOrder.id,
        status: 'CANCELLED',
      });

      if (response.status === 200) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => (order.id === selectedOrder.id ? { ...order, status: 'CANCELLED' } : order))
        );
        setSelectedOrder((prevOrder) => ({ ...prevOrder, status: 'CANCELLED' }));
        setIsConfirmModalOpen(false);
        setIsSuccessModalOpen(true);
      } else {
        toast.error('Failed to cancel order. Please try again.');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      toast.error('Failed to cancel order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = () => {
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setIsModalOpen(false);
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#FBF9F7]">
        <ToastContainer position="bottom-right" autoClose={3000} />
        <div className="w-14 h-14 border-2 border-[#F0DCE3] border-t-[#C53261] rounded-none animate-spin mb-4" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#141311]">
          Retrieving Orders...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#FBF9F7] px-4">
        <ToastContainer position="bottom-right" autoClose={3000} />
        <h2 className="text-xl font-serif text-[#141311] mb-3">{error}</h2>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2.5 bg-[#141311] text-white text-xs font-bold uppercase tracking-widest rounded-none border border-[#141311]"
        >
          Return to Store
        </button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'COMPLETED' || s === 'DELIVERED') {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (s === 'SHIPPED') {
      return 'bg-blue-50 text-blue-800 border-blue-200';
    }
    if (s === 'PAID') {
      return 'bg-purple-50 text-purple-800 border-purple-200';
    }
    if (s === 'CANCELLED') {
      return 'bg-rose-50 text-rose-800 border-rose-200';
    }
    return 'bg-[#FFF5F8] text-amber-800 border-amber-200';
  };

  return (
    <div className="bg-[#FBF9F7] min-h-screen text-[#141311] pb-24">
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Header */}
      <div className="bg-white border-b border-[#F0DCE3] py-8">
        <div className="container mx-auto max-w-[1536px] px-4 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              <span className="cursor-pointer hover:text-[#141311] transition-colors" onClick={() => router.push('/')}>
                  Home
                </span>
              <span className="text-gray-300">/</span>
              <span className="text-[#141311] font-bold">Client Account</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141311]">
              My Orders & Purchases
            </h1>
          </div>
          <button
            onClick={() => router.push('/customer/pages/allproducts')}
            className="self-start md:self-auto px-5 py-2.5 bg-[#141311] hover:bg-[#2A1B24] text-white text-xs font-bold uppercase tracking-widest rounded-none border border-[#141311] transition-all"
          >
            Explore Catalog
          </button>
        </div>
      </div>

      <div className="container mx-auto max-w-[1536px] px-4 lg:px-8 pt-8">
        <div className="bg-white border border-[#F0DCE3] rounded-none">
          {orders.length === 0 ? (
            <div className="p-16 text-center">
              <FiPackage size={40} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-serif font-bold text-[#141311] mb-2">No Acquisitions Found</h3>
              <p className="text-xs text-gray-400 mb-6 font-light">
                You have not placed any orders yet. Discover our latest beauty formulations.
              </p>
              <button
                onClick={() => router.push('/customer/pages/allproducts')}
                className="px-6 py-3 bg-[#141311] text-white text-xs font-bold uppercase tracking-widest rounded-none border border-[#141311]"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FFF5F8] border-b border-[#F0DCE3] text-[10px] font-bold uppercase tracking-widest text-[#141311]">
                  <tr>
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Dispatch Status</th>
                    <th className="px-6 py-4">Creations Ordered</th>
                    <th className="px-6 py-4 text-right">Settlement Total</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0DCE3]">
                  {orders.map((order) => {
                    const subtotal = order.orderItems?.reduce((acc, item) => acc + item.quantity * item.price, 0) || 0;
                    const subtotalLessDiscount = subtotal - (order.discount ?? 0);
                    const totalTax = subtotalLessDiscount * (order.tax ?? 0);
                    const total =
                      subtotalLessDiscount +
                      totalTax +
                      (order.deliveryCharge ?? 0) +
                      (order.extraDeliveryCharge ?? 0);

                    return (
                      <tr key={order.id} className="hover:bg-[#FFF5F8]/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-[#141311] whitespace-nowrap">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString('en-PK', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-none border ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 max-w-xs truncate">
                          {order.orderItems?.map((item) => item.product?.name).filter(Boolean).join(', ') || 'Cosmetics Item'}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-[#141311] whitespace-nowrap">
                          Rs. {formatPrice(total)}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#141311] text-[#141311] hover:bg-[#141311] hover:text-white text-[11px] font-bold uppercase tracking-wider rounded-none transition-all"
                          >
                            <EyeIcon className="h-3.5 w-3.5" />
                            <span>Invoice</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details / Invoice Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-white rounded-none border border-[#F0DCE3] shadow-2xl max-w-3xl h-[90vh] w-full flex flex-col">
            <div className="px-6 py-5 border-b border-[#F0DCE3] flex justify-between items-center bg-[#FFF5F8]">
              <div>
                <span className="text-[10px] font-bold text-[#C53261] uppercase tracking-widest block mb-0.5">
                  Official Invoice
                </span>
                <h2 className="text-lg font-serif font-bold text-[#141311]">
                  Acquisition #{selectedOrder.id}
                </h2>
              </div>
              <button onClick={handleCloseModal} className="p-1 text-gray-400 hover:text-black transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Order Status & Confirmation Banner */}
              {selectedOrder.status === 'CANCELLED' ? (
                <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center flex-shrink-0">
                    <XMarkIcon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-[#991B1B]">
                      Order Cancelled
                    </h3>
                    <p className="text-xs text-[#B91C1C] mt-0.5 leading-relaxed">
                      Acquisition #{selectedOrder.id} has been cancelled. If you need any assistance, please contact our support team.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-[#15803D]">
                        The Order is Placed Successfully!
                      </h3>
                      <span className="px-2 py-0.5 bg-[#DCFCE7] text-[#15803D] text-[10px] font-bold uppercase tracking-wider">
                        Order #{selectedOrder.id} Confirmed
                      </span>
                    </div>
                    <p className="text-xs text-[#166534] mt-0.5 leading-relaxed">
                      Thank you for your order with Liberty Kollection. Your order has been placed and is currently being prepared with white-glove packaging for delivery.
                    </p>
                  </div>
                </div>
              )}

              {/* Top metadata pill row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#FFF5F8] border border-[#F0DCE3] text-xs">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-gray-400">Status</span>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-none border ${getStatusBadge(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-gray-400">Order Placed</span>
                  <span className="font-bold text-[#141311] mt-1 block">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-gray-400">Shipping Mode</span>
                  <span className="font-bold text-[#141311] mt-1 block capitalize">
                    {selectedOrder.shippingMethod || 'Standard Express'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-gray-400">Estimated Delivery</span>
                  <span className="font-bold text-[#141311] mt-1 block">
                    {selectedOrder.deliveryDate
                      ? new Date(selectedOrder.deliveryDate).toLocaleDateString()
                      : '2-4 Business Days'}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#141311] mb-3 pb-2 border-b border-[#F0DCE3]">
                  Curated Items
                </h3>
                <div className="divide-y divide-[#F0DCE3]">
                  {selectedOrder.orderItems?.map((item) => (
                    <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#FFF5F8] border border-[#F0DCE3] relative flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {(() => {
                            const img = item.product?.images?.[0];
                            const rawUrl = typeof img === 'string' ? img : img?.url;
                            const imgUrl = getSafeImageUrl(rawUrl);
                            if (imgUrl) {
                              return (
                                <Image
                                  src={imgUrl}
                                  alt={item.product?.name || 'Item'}
                                  fill
                                  className="object-contain p-1.5"
                                  unoptimized
                                />
                              );
                            }
                            return <FiShoppingBag className="text-gray-300 text-xl" />;
                          })()}
                        </div>

                        <div>
                          <h4 className="text-xs font-serif font-bold text-[#141311]">
                            {item.product?.name}
                          </h4>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Qty: <strong className="text-[#141311]">{item.quantity}</strong>
                            {item.selectedSize && ` • Size: ${item.selectedSize}`}
                            {item.selectedColor && ` • Shade: ${item.selectedColor}`}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-[#141311]">
                          Rs. {formatPrice(item.price * item.quantity)}
                        </p>
                        {item.product?.productType === 'digital' && (
                          <button
                            onClick={() => (window.location.href = `/api/download?id=${item.product.id}`)}
                            className="mt-1 inline-flex items-center gap-1 bg-[#141311] text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-none"
                          >
                            <FiDownload size={11} /> Download
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settlement Summary */}
              {(() => {
                const subtotal =
                  selectedOrder.orderItems?.reduce((acc, item) => acc + item.quantity * item.price, 0) || 0;
                const subtotalLessDiscount = subtotal - (selectedOrder.discount ?? 0);
                const totalTax = subtotalLessDiscount * (selectedOrder.tax ?? 0);
                const total =
                  subtotalLessDiscount +
                  totalTax +
                  (selectedOrder.deliveryCharge ?? 0) +
                  (selectedOrder.extraDeliveryCharge ?? 0);

                return (
                  <div className="bg-[#FFF5F8] border border-[#F0DCE3] p-5 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-bold text-[#141311]">Rs. {formatPrice(subtotalLessDiscount)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-[#C53261]">
                        <span>Privilege Discount</span>
                        <span className="font-bold">-Rs. {formatPrice(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>White-Glove Delivery Charges</span>
                      <span className="font-bold text-[#141311]">
                        Rs. {formatPrice(selectedOrder.deliveryCharge ?? 0)}
                      </span>
                    </div>
                    {selectedOrder.extraDeliveryCharge > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Cash On Delivery Surcharge</span>
                        <span className="font-bold text-[#141311]">
                          Rs. {formatPrice(selectedOrder.extraDeliveryCharge)}
                        </span>
                      </div>
                    )}
                    <div className="h-px bg-[#F0DCE3] my-2" />
                    <div className="flex justify-between text-base font-serif font-bold text-[#141311]">
                      <span>Grand Total</span>
                      <span>Rs. {formatPrice(total)}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Cancel Button */}
              {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'PAID') && (
                <div className="pt-2">
                  <button
                    onClick={handleConfirmCancel}
                    className="px-6 py-2.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold uppercase tracking-widest rounded-none border border-rose-700 transition-colors"
                  >
                    Request Order Cancellation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-white p-6 rounded-none border border-[#F0DCE3] max-w-sm w-full">
            <h3 className="text-base font-serif font-bold text-[#141311] mb-2">Cancel Acquisition?</h3>
            <p className="text-xs text-gray-500 mb-6 font-light">
              Are you sure you wish to cancel this order? This action cannot be reversed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 border border-[#F0DCE3] text-[#141311] text-xs font-bold uppercase tracking-wider rounded-none"
              >
                No, Keep
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-none border border-rose-700"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-white p-6 rounded-none border border-[#F0DCE3] max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
              <CheckCircleIcon className="h-6 w-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-[#141311] mb-2">Order Cancelled</h3>
            <p className="text-xs text-gray-500 mb-6 font-light">
              Your acquisition has been cancelled successfully.
            </p>
            <button
              onClick={closeSuccessModal}
              className="w-full py-2.5 bg-[#141311] text-white text-xs font-bold uppercase tracking-widest rounded-none"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
