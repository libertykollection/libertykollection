'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import {
  FiPlus,
  FiMinus,
  FiX,
  FiUser,
  FiHome,
  FiPhone,
  FiMail,
  FiTag,
  FiCreditCard,
  FiTrash2,
  FiChevronRight,
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiLock,
} from 'react-icons/fi';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal } from 'react-icons/fa';
import { removeFromCart, updateQuantity, setCart } from '../../../store/cartSlice';
import Image from 'next/image';
import { jwtDecode } from 'jwt-decode';
import Modal from 'react-modal';
import Features from '../../components/Features';
import { getSafeImageUrl } from '../../../util/imageUtils';

const CartPage = () => {
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [extraDeliveryCharge, setExtraDeliveryCharge] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isReadyForPayment, setIsReadyForPayment] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isMixedCartModalOpen, setIsMixedCartModalOpen] = useState(false);
  const [digitalItemsToDownload, setDigitalItemsToDownload] = useState([]);

  const cart = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    recipientName: '',
    streetAddress: '',
    apartmentSuite: '',
    city: '',
    state: '',
    zip: '',
    country: 'Pakistan',
    phoneNumber: '+92',
    email: '',
  });

  useEffect(() => {
    setHasMounted(true);
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);

    // PayPal SDK init
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb';
    const scriptId = 'paypal-sdk-script';

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
      };
      document.body.appendChild(script);
    } else if (window.paypal) {
      setIsScriptLoaded(true);
    }
  }, []);

  // Pre-fill user details if logged in
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isAuthenticated) {
        const userId = await getUserId();
        if (userId) {
          try {
            const response = await axios.get(`/api/users/${userId}`);
            const user = response.data;
            if (user) {
              setShippingAddress((prev) => ({
                ...prev,
                recipientName: user.name || prev.recipientName,
                email: user.email || prev.email,
                phoneNumber: user.phoneno || prev.phoneNumber,
                city: user.city || prev.city,
              }));
            }
          } catch (e) {
            console.error('Error fetching user', e);
          }
        }
      }
    };
    fetchUserDetails();
  }, [isAuthenticated]);

  // Recalculate Subtotal
  useEffect(() => {
    const calculatedSubtotal = cart.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return acc + price * qty;
    }, 0);

    setSubtotal(calculatedSubtotal);

    // Free delivery for orders over Rs. 2,000
    if (calculatedSubtotal >= 2000 || calculatedSubtotal === 0) {
      setDeliveryCharge(0);
    } else {
      setDeliveryCharge(150);
    }
  }, [cart]);

  const hasDigital = useMemo(
    () => cart.some((i) => i.productType === 'digital' || i.type === 'digital'),
    [cart]
  );
  const isDigitalOnly = useMemo(
    () =>
      cart.length > 0 &&
      cart.every((i) => i.productType === 'digital' || i.type === 'digital'),
    [cart]
  );
  const isMixedCart = useMemo(
    () =>
      cart.some((i) => i.productType === 'digital' || i.type === 'digital') &&
      cart.some((i) => i.productType !== 'digital' && i.type !== 'digital'),
    [cart]
  );

  const calculateFinalTotal = () => {
    const base = subtotal - discount;
    const totalWithTax = base + base * taxRate;
    return Math.max(0, totalWithTax + (isDigitalOnly ? 0 : deliveryCharge) + extraDeliveryCharge);
  };

  const validateForm = () => {
    const errors = {};
    if (!shippingAddress.recipientName.trim()) errors.recipientName = true;
    if (!shippingAddress.email.trim()) errors.email = true;
    else if (!/\S+@\S+\.\S+/.test(shippingAddress.email)) errors.emailInvalid = true;

    if (!isDigitalOnly) {
      if (!shippingAddress.phoneNumber.trim() || shippingAddress.phoneNumber === '+92')
        errors.phoneNumber = true;
      if (!shippingAddress.streetAddress.trim()) errors.streetAddress = true;
      if (!shippingAddress.city.trim()) errors.city = true;
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fill in all required shipping fields.');
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const updateItemQuantity = (itemId, quantity) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ id: itemId, quantity }));
  };

  const handleRemoveFromCart = (itemId) => {
    dispatch(removeFromCart({ id: itemId }));
    toast.success('Removed from cart');
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const response = await axios.post('/api/coupons/validate', { code: couponCode });
      if (response.data.valid) {
        const discountAmount = (subtotal * response.data.discountPercentage) / 100;
        setDiscount(discountAmount);
        setCouponMessage(`Discount of ${response.data.discountPercentage}% applied!`);
        toast.success(`Coupon applied: -Rs. ${Math.round(discountAmount).toLocaleString()}`);
      } else {
        setDiscount(0);
        setCouponMessage(response.data.message || 'Invalid coupon code');
        toast.error('Invalid coupon code');
      }
    } catch (error) {
      setDiscount(0);
      setCouponMessage('Invalid coupon code');
      toast.error('Coupon code could not be applied');
    }
  };

  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    if (paymentMethod === 'Credit Card') {
      setIsReadyForPayment(true);
      toast.info('Please complete payment via PayPal below.');
      return;
    }

    await executeOrderPlacement();
  };

  const executeOrderPlacement = async () => {
    try {
      const finalTotal = calculateFinalTotal();

      const orderDetails = {
        userId: await getUserId(),
        shippingAddress,
        paymentMethod,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
          selectedColor: item.selectedColor || null,
          selectedSize: item.selectedSize || null,
          product: { name: item.name },
        })),
        total: finalTotal,
        discount,
        tax: Number((subtotal - discount) * taxRate) || 0,
        netTotal: finalTotal,
        deliveryCharge: isDigitalOnly ? 0 : deliveryCharge,
        extraDeliveryCharge: Number(extraDeliveryCharge) || 0,
        couponCode,
      };

      const response = await axios.post('/api/orders', orderDetails);
      setIsModalOpen(true);
      localStorage.removeItem('cart');
      dispatch(setCart([]));
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Order error:', error);
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to place order.';
      toast.error(`Order failed: ${errMsg}`);
    }
  };

  const getUserId = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp > Date.now() / 1000) return decoded.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const formatPrice = (p) => Number(p || 0).toLocaleString('en-PK');

  if (!hasMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-bold text-gray-400">
        Loading Cart...
      </div>
    );
  }

  // Empty Cart State
  if (cart.length === 0) {
    return (
      <div className="bg-[#FBF9F7] min-h-[75vh] flex items-center justify-center py-16 font-sans">
        <div className="container mx-auto max-w-xl px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#F9F5EC] text-[#B98C2D] flex items-center justify-center text-3xl border border-[#E8DFC8]">
            <FiShoppingBag />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#141311] mb-2 tracking-tight">
            Your Shopping Bag is Empty
          </h2>
          <p className="text-xs sm:text-sm text-[#8C7A70] mb-8 max-w-md mx-auto leading-relaxed">
            Your vanity bag has no cosmetics added yet. Explore our curated collections and prestige formulations.
          </p>
          <button
            onClick={() => router.push('/customer/pages/allproducts')}
            className="bg-[#141311] hover:bg-[#B98C2D] text-white font-bold text-xs uppercase tracking-widest px-8 py-4 transition-all"
          >
            Explore Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FBF9F7] min-h-screen py-8 font-sans text-[#141311]">
      <ToastContainer position="bottom-right" autoClose={3000} />

      <div className="container mx-auto max-w-[1536px] px-4 lg:px-8">
        {/* Breadcrumb Trail */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-[#8C7A70] py-3 mb-8 border-b border-[#E8DFC8] overflow-x-auto whitespace-nowrap">
          <button onClick={() => router.push('/')} className="hover:text-[#B98C2D] transition-colors">
            Home
          </button>
          <FiChevronRight size={13} className="text-[#D2AA2D]" />
          <button
            onClick={() => router.push('/customer/pages/allproducts')}
            className="hover:text-[#B98C2D] transition-colors"
          >
            Catalog
          </button>
          <FiChevronRight size={13} className="text-[#D2AA2D]" />
          <span className="text-[#141311] font-bold">Shopping Bag & Checkout</span>
        </nav>

        {/* Main Two-Column Cart Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* LEFT COLUMN: Items List & Customer Form (7 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* Cart Items Card */}
            <div className="bg-white p-6 sm:p-8 border border-[#E8DFC8]">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E8DFC8]">
                <h3 className="text-lg sm:text-xl font-serif font-medium text-[#141311] tracking-tight">
                  Shopping Bag ({cart.reduce((a, b) => a + (b.quantity || 1), 0)} items)
                </h3>
                <button
                  onClick={() => router.push('/customer/pages/allproducts')}
                  className="text-xs font-bold text-[#B98C2D] hover:underline uppercase tracking-wider"
                >
                  + Add More Products
                </button>
              </div>

              {/* Items Table/List */}
              <div className="divide-y divide-[#E8DFC8]">
                {cart.map((item, idx) => {
                  const img = item.images?.[0];
                  const rawUrl = typeof img === 'string' ? img : img?.url;
                  const imgUrl = getSafeImageUrl(rawUrl);

                  return (
                    <div
                      key={item.id || idx}
                      className="py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Link
                          href={`/customer/pages/products/${item.slug || ''}`}
                          className="relative w-20 h-20 bg-[#F9F5EC] border border-[#E8DFC8] overflow-hidden flex-shrink-0 flex items-center justify-center p-2 group-hover:border-[#B98C2D] transition-colors"
                        >
                          <Image
                            src={imgUrl || '/placeholder.png'}
                            alt={item.name}
                            fill
                            className="object-contain p-2"
                            unoptimized
                          />
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/customer/pages/products/${item.slug || ''}`}
                            className="text-xs sm:text-sm font-serif font-medium text-[#141311] hover:text-[#B98C2D] transition-colors line-clamp-2 leading-snug"
                          >
                            {item.name}
                          </Link>
                          {(item.selectedSize || item.selectedColor) && (
                            <p className="text-[11px] text-[#8C7A70] mt-1">
                              {item.selectedSize && `Volume: ${item.selectedSize}`}
                              {item.selectedSize && item.selectedColor && ' • '}
                              {item.selectedColor && `Shade: ${item.selectedColor}`}
                            </p>
                          )}
                          <p className="text-xs font-bold text-[#141311] mt-1 sm:hidden">
                            Rs. {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Stepper & Price & Delete */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        {/* Stepper */}
                        <div className="flex items-center border border-[#E8DFC8] bg-white px-2 h-10 w-28 justify-between">
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#8C7A70] hover:text-[#141311] hover:bg-[#F9F5EC] transition-colors"
                          >
                            <FiMinus size={12} />
                          </button>
                          <span className="text-xs font-bold text-[#141311]">{item.quantity}</span>
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#8C7A70] hover:text-[#141311] hover:bg-[#F9F5EC] transition-colors"
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right min-w-[90px]">
                          <span className="text-sm font-bold text-[#141311] block">
                            Rs. {formatPrice(item.price * item.quantity)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[10px] text-[#8C7A70]">
                              Rs. {formatPrice(item.price)} each
                            </span>
                          )}
                        </div>

                        {/* Remove Action */}
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="w-8 h-8 text-[#8C7A70] hover:text-[#D32F2F] hover:bg-[#FDEDED] flex items-center justify-center transition-colors"
                          title="Remove item"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping & Delivery Form Card */}
            <div className="bg-white p-6 sm:p-8 border border-[#E8DFC8] space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
                <h4 className="text-lg font-serif font-medium text-[#141311] tracking-tight">
                  {isDigitalOnly ? 'Client Information' : 'Delivery & Courier Details'}
                </h4>
                <span className="text-xs text-[#8C7A70] font-medium uppercase tracking-wider">Step 1 of 2</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider block mb-1.5">
                    Full Name <span className="text-[#B98C2D]">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A70]" />
                    <input
                      type="text"
                      name="recipientName"
                      placeholder="e.g. Eleanor Vance"
                      value={shippingAddress.recipientName}
                      onChange={handleInputChange}
                      className="w-full bg-[#FBF9F7] border border-[#E8DFC8] py-3 pl-10 pr-4 text-xs sm:text-sm focus:border-[#B98C2D] focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider block mb-1.5">
                    Email Address <span className="text-[#B98C2D]">*</span>
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A70]" />
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. name@example.com"
                      value={shippingAddress.email}
                      onChange={handleInputChange}
                      className="w-full bg-[#FBF9F7] border border-[#E8DFC8] py-3 pl-10 pr-4 text-xs sm:text-sm focus:border-[#B98C2D] focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                {!isDigitalOnly && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider block mb-1.5">
                        Phone Number <span className="text-[#B98C2D]">*</span>
                      </label>
                      <div className="relative">
                        <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A70]" />
                        <input
                          type="tel"
                          name="phoneNumber"
                          placeholder="+92 3XX XXXXXXX"
                          value={shippingAddress.phoneNumber}
                          onChange={handleInputChange}
                          className="w-full bg-[#FBF9F7] border border-[#E8DFC8] py-3 pl-10 pr-4 text-xs sm:text-sm focus:border-[#B98C2D] focus:bg-white outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider block mb-1.5">
                        City <span className="text-[#B98C2D]">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        placeholder="e.g. Lahore, Karachi, Islamabad"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        className="w-full bg-[#FBF9F7] border border-[#E8DFC8] py-3 px-4 text-xs sm:text-sm focus:border-[#B98C2D] focus:bg-white outline-none transition-all"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider block mb-1.5">
                        Complete Street Address & Apartment <span className="text-[#B98C2D]">*</span>
                      </label>
                      <div className="relative">
                        <FiHome className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A70]" />
                        <input
                          type="text"
                          name="streetAddress"
                          placeholder="House/Plot #, Street, Block, Area"
                          value={shippingAddress.streetAddress}
                          onChange={handleInputChange}
                          className="w-full bg-[#FBF9F7] border border-[#E8DFC8] py-3 pl-10 pr-4 text-xs sm:text-sm focus:border-[#B98C2D] focus:bg-white outline-none transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment Method Selection Card */}
            <div className="bg-white p-6 sm:p-8 border border-[#E8DFC8] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
                <h4 className="text-lg font-serif font-medium text-[#141311] tracking-tight">Payment Selection</h4>
                <span className="text-xs text-[#8C7A70] font-medium uppercase tracking-wider">Step 2 of 2</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`flex items-center justify-between p-4 cursor-pointer border transition-all ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-[#141311] bg-[#F9F5EC]'
                      : 'border-[#E8DFC8] hover:border-[#D2AA2D]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={() => setPaymentMethod('Cash on Delivery')}
                      className="accent-[#141311] w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider block text-[#141311]">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-[11px] text-[#8C7A70]">Pay upon courier arrival</span>
                    </div>
                  </div>
                  <FiTruck className="text-[#B98C2D] text-xl" />
                </label>

                <label
                  className={`flex items-center justify-between p-4 cursor-pointer border transition-all ${
                    paymentMethod === 'Credit Card'
                      ? 'border-[#141311] bg-[#F9F5EC]'
                      : 'border-[#E8DFC8] hover:border-[#D2AA2D]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'Credit Card'}
                      onChange={() => setPaymentMethod('Credit Card')}
                      className="accent-[#141311] w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider block text-[#141311]">
                        Online Card / PayPal
                      </span>
                      <span className="text-[11px] text-[#8C7A70]">Encrypted instant settlement</span>
                    </div>
                  </div>
                  <FiCreditCard className="text-[#B98C2D] text-xl" />
                </label>
              </div>

              {isReadyForPayment && paymentMethod === 'Credit Card' && (
                <div id="paypal-button-container" className="mt-4 pt-4 border-t border-[#E8DFC8]" />
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary Card (5 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-6 space-y-4">
            <div className="bg-white p-6 sm:p-7 border border-[#E8DFC8] space-y-5">
              <h4 className="text-lg font-serif font-medium text-[#141311] tracking-tight pb-3 border-b border-[#E8DFC8]">
                Order Summary
              </h4>

              {/* Coupon Form */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FiTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A70]" />
                  <input
                    type="text"
                    placeholder="PROMO CODE"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-[#FBF9F7] border border-[#E8DFC8] py-2.5 pl-9 pr-3 text-xs uppercase tracking-wider font-semibold focus:border-[#B98C2D] outline-none"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  className="bg-[#141311] hover:bg-[#B98C2D] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 transition-all"
                >
                  Apply
                </button>
              </div>
              {couponMessage && (
                <p className="text-[11px] font-bold text-[#2E7D32]">{couponMessage}</p>
              )}

              {/* Price Calculation Breakdown */}
              <div className="space-y-3 text-xs sm:text-sm text-[#8C7A70] pt-2 border-t border-[#E8DFC8]">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#141311]">Rs. {formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center text-[#B98C2D] font-bold">
                    <span>Voucher Discount</span>
                    <span>-Rs. {formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Standard Shipping</span>
                  <span className="font-bold text-[#141311]">
                    {deliveryCharge === 0 ? (
                      <span className="text-[#2E7D32] font-bold">COMPLIMENTARY</span>
                    ) : (
                      `Rs. ${formatPrice(deliveryCharge)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#E8DFC8] text-base sm:text-lg font-serif font-medium text-[#141311]">
                  <span>Total Amount</span>
                  <span className="text-[#B98C2D] font-sans font-bold">Rs. {formatPrice(calculateFinalTotal())}</span>
                </div>
              </div>

              {/* Action Button */}
              {!isReadyForPayment && (
                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-[#141311] hover:bg-[#B98C2D] text-white font-bold text-xs uppercase tracking-widest py-4 transition-all flex items-center justify-center gap-2"
                >
                  <FiLock size={15} />
                  <span>
                    {paymentMethod === 'Credit Card' ? 'Proceed to Payment' : 'Confirm Order'}
                  </span>
                </button>
              )}

              {/* Trust & Safe Payment Icons */}
              <div className="pt-2 border-t border-[#E8DFC8] space-y-2 text-center">
                <span className="text-[10px] font-bold text-[#8C7A70] uppercase tracking-wider block">
                  Encrypted & Secure Transaction Guarantee
                </span>
                <div className="flex items-center justify-center gap-3 text-2xl text-[#8C7A70]">
                  <FaCcVisa className="hover:text-[#141311] transition-colors" />
                  <FaCcMastercard className="hover:text-[#141311] transition-colors" />
                  <FaCcAmex className="hover:text-[#141311] transition-colors" />
                  <FaCcPaypal className="hover:text-[#141311] transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <Features />
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => {
            setIsModalOpen(false);
            router.push('/');
          }}
          contentLabel="Order Placed"
          ariaHideApp={false}
          style={{
            overlay: { zIndex: 10000, backgroundColor: 'rgba(18, 11, 16, 0.6)' },
            content: {
              zIndex: 10001,
              margin: 'auto',
              width: 'fit-content',
              maxWidth: '92vw',
              padding: '32px',
              borderRadius: '0px',
              border: '1px solid #E8DFC8',
              backgroundColor: '#fff',
            },
          }}
        >
          <div className="flex flex-col items-center text-center max-w-sm">
            <div className="w-14 h-14 bg-[#F9F5EC] text-[#B98C2D] flex items-center justify-center text-2xl mb-4 border border-[#E8DFC8]">
              ✓
            </div>
            <h3 className="text-xl font-serif font-medium text-[#141311] mb-2">Order Confirmed</h3>
            <p className="text-xs text-[#8C7A70] leading-relaxed mb-6">
              Thank you for choosing our Atelier. Your luxury cosmetics order has been registered and is being prepared with white-glove packaging.
            </p>
            <button
              onClick={() => {
                setIsModalOpen(false);
                router.push('/');
              }}
              className="w-full bg-[#141311] hover:bg-[#B98C2D] text-white font-bold text-xs uppercase tracking-wider py-3.5 transition-all"
            >
              Return to Boutique
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CartPage;
