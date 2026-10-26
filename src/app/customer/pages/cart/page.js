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
  FiUploadCloud,
  FiCheckCircle,
  FiFileText,
  FiEye,
} from 'react-icons/fi';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal, FaUniversity } from 'react-icons/fa';
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
  const [storeSettings, setStoreSettings] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual Pre-Payment State & Receipt Proof
  const [manualPayment, setManualPayment] = useState({
    transactionId: '',
    amount: '',
    receiptFile: null,
    receiptUrl: '',
    bankName: 'Meezan Bank',
    senderNote: '',
  });
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  const handleReceiptFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    setManualPayment((prev) => ({ ...prev, receiptFile: file }));

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  };

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

    // Fetch dynamic store transactional settings (Delivery Charge, Tax, COD fees)
    const fetchStoreSettings = async () => {
      try {
        const res = await axios.get('/api/settings');
        if (res.data) {
          setStoreSettings(res.data);
          const dc = Number(res.data.deliveryCharge);
          if (!isNaN(dc)) setDeliveryCharge(dc);
          const tr = Number(res.data.taxPercentage);
          if (!isNaN(tr)) setTaxRate(tr / 100);
          const codFee = Number(res.data.other1);
          if (!isNaN(codFee) && paymentMethod === 'Cash on Delivery') {
            setExtraDeliveryCharge(codFee);
          }
        }
      } catch (err) {
        console.error('Error fetching store settings:', err);
      }
    };
    fetchStoreSettings();
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

  // PayPal Buttons integration
  useEffect(() => {
    if (!isReadyForPayment || paymentMethod !== 'Credit Card' || !isScriptLoaded) return;

    const container = document.getElementById('paypal-button-container');
    if (typeof window !== 'undefined' && window.paypal && container) {
      container.innerHTML = '';
      const finalTotal = calculateFinalTotal();
      const priceInUSD = (finalTotal / 280).toFixed(2);

      try {
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  description: 'Liberty Kollection Order',
                  amount: {
                    currency_code: 'USD',
                    value: Number(priceInUSD) > 0 ? priceInUSD : '1.00',
                  },
                },
              ],
            });
          },
          onApprove: async (data, actions) => {
            return actions.order.capture().then(async (details) => {
              await executeOrderPlacement(details);
            });
          },
          onError: (err) => {
            console.error('PayPal Checkout Error:', err);
            toast.error('Payment processing failed');
          },
        }).render('#paypal-button-container');
      } catch (err) {
        console.error('Error rendering PayPal Buttons:', err);
      }
    }
  }, [isReadyForPayment, paymentMethod, isScriptLoaded, subtotal, discount, deliveryCharge, extraDeliveryCharge]);

  // Recalculate Subtotal & Standard Delivery Charge
  useEffect(() => {
    const calculatedSubtotal = cart.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return acc + price * qty;
    }, 0);

    setSubtotal(calculatedSubtotal);

    const standardDelivery = storeSettings?.deliveryCharge !== undefined ? Number(storeSettings.deliveryCharge) : 200;

    // Complimentary delivery for orders over Rs. 2,000 or if vanity bag is empty
    if (calculatedSubtotal >= 2000 || calculatedSubtotal === 0) {
      setDeliveryCharge(0);
    } else {
      setDeliveryCharge(standardDelivery);
    }
  }, [cart, storeSettings]);

  // Adjust COD fee when payment method changes
  useEffect(() => {
    if (paymentMethod === 'Cash on Delivery' && storeSettings?.other1) {
      setExtraDeliveryCharge(Number(storeSettings.other1) || 0);
    } else {
      setExtraDeliveryCharge(0);
    }
  }, [paymentMethod, storeSettings]);

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

    if (paymentMethod === 'Manual Payment') {
      if (!manualPayment.transactionId.trim()) {
        toast.error('Please enter the Transaction ID / Reference Number.');
        return;
      }
      if (!manualPayment.receiptFile && !manualPayment.receiptUrl) {
        toast.error('Please upload your payment receipt or transfer screenshot.');
        return;
      }

      let uploadedReceiptUrl = manualPayment.receiptUrl;
      if (manualPayment.receiptFile) {
        setIsUploadingReceipt(true);
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', manualPayment.receiptFile);
          const uploadRes = await axios.post('/api/upload', uploadFormData);
          uploadedReceiptUrl = uploadRes.data?.url || '';
          if (!uploadedReceiptUrl) {
            throw new Error('No receipt URL returned');
          }
        } catch (uploadErr) {
          console.error('Receipt upload failed:', uploadErr);
          toast.error('Failed to upload payment receipt image. Please try again.');
          setIsUploadingReceipt(false);
          return;
        } finally {
          setIsUploadingReceipt(false);
        }
      }

      const finalTotal = calculateFinalTotal();
      const manualDetails = {
        type: 'manual_payment',
        transactionId: manualPayment.transactionId.trim(),
        amount: Number(manualPayment.amount) || finalTotal,
        receiptUrl: uploadedReceiptUrl,
        bankName: manualPayment.bankName || 'Direct Bank Transfer',
        senderNote: manualPayment.senderNote || '',
        submittedAt: new Date().toISOString()
      };

      await executeOrderPlacement(manualDetails);
      return;
    }

    await executeOrderPlacement();
  };

  const executeOrderPlacement = async (paymentDetails = null) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const finalTotal = calculateFinalTotal();

      const orderDetails = {
        userId: await getUserId(),
        shippingAddress,
        paymentMethod,
        paymentId: paymentDetails?.id || null,
        paymentInfo: paymentDetails || null,
        items: cart.map((item) => {
          let rawId = item.productId !== undefined && item.productId !== null ? item.productId : item.id;
          if (typeof rawId === 'string' && rawId.includes('-')) {
            rawId = rawId.split('-')[0];
          }
          const productId = parseInt(rawId, 10);
          return {
            productId: !isNaN(productId) ? productId : (item.productId || item.id),
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
            selectedColor: item.selectedColor || null,
            selectedSize: item.selectedSize || null,
            product: { name: item.name },
          };
        }),
        total: finalTotal,
        discount,
        tax: Number((subtotal - discount) * taxRate) || 0,
        netTotal: finalTotal,
        deliveryCharge: isDigitalOnly ? 0 : deliveryCharge,
        extraDeliveryCharge: Number(extraDeliveryCharge) || 0,
        couponCode,
      };

      const response = await axios.post('/api/orders', orderDetails);
      const placedOrder = response.data?.data;
      setConfirmedOrder(placedOrder || null);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserId = async () => {
    const rawUserId = localStorage.getItem('userId');
    if (rawUserId && !isNaN(parseInt(rawUserId))) return parseInt(rawUserId);

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
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

  // Order Placed Successfully Screen
  if (confirmedOrder) {
    return (
      <div className="bg-[#FBF9F7] min-h-[85vh] py-16 font-sans text-[#141311]">
        <ToastContainer position="bottom-right" autoClose={3000} />
        <div className="container mx-auto max-w-2xl px-4 text-center">
          {/* Success Badge */}
          <div className="w-20 h-20 mx-auto mb-6 bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] flex items-center justify-center text-4xl shadow-sm">
            ✓
          </div>

          <span className="inline-block px-3 py-1 bg-[#FFF5F8] text-[#C53261] border border-[#F0DCE3] text-[11px] font-bold uppercase tracking-widest mb-3">
            Acquisition Confirmed
          </span>

          <h1 className="text-2xl sm:text-4xl font-serif font-medium text-[#141311] mb-2 tracking-tight">
            The Order is Placed Successfully!
          </h1>
          <p className="text-xs sm:text-sm text-[#8C7A70] mb-8 max-w-md mx-auto leading-relaxed">
            Thank you for shopping with Liberty Kollection. Your order has been registered and our atelier is preparing your luxury cosmetics formulation for dispatch.
          </p>

          {/* Order Details Card */}
          <div className="bg-white border border-[#F0DCE3] p-6 sm:p-8 text-left mb-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#F0DCE3] gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A70] block">
                  Order Reference
                </span>
                <span className="text-lg font-mono font-bold text-[#141311]">
                  #{confirmedOrder.id || 'Confirmed'}
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A70] block">
                  Status
                </span>
                <span className="inline-block px-2.5 py-0.5 bg-[#FFF5F8] border border-[#F0DCE3] text-[#C53261] text-xs font-bold uppercase tracking-wider">
                  {confirmedOrder.status || 'PENDING'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="font-bold text-[#8C7A70] uppercase tracking-wider block mb-1">
                  Recipient & Contact
                </span>
                <p className="font-semibold text-[#141311]">{confirmedOrder.recipientName || shippingAddress.recipientName}</p>
                <p className="text-gray-500">{confirmedOrder.phoneNumber || shippingAddress.phoneNumber}</p>
                <p className="text-gray-500">{confirmedOrder.email || shippingAddress.email}</p>
              </div>

              <div>
                <span className="font-bold text-[#8C7A70] uppercase tracking-wider block mb-1">
                  Delivery Destination
                </span>
                <p className="text-[#141311]">
                  {confirmedOrder.streetAddress || shippingAddress.streetAddress}
                </p>
                <p className="text-gray-500">
                  {[confirmedOrder.city || shippingAddress.city, confirmedOrder.country || 'Pakistan'].filter(Boolean).join(', ')}
                </p>
              </div>

              <div>
                <span className="font-bold text-[#8C7A70] uppercase tracking-wider block mb-1">
                  Payment Method
                </span>
                <p className="text-[#141311] font-semibold">
                  {confirmedOrder.paymentMethod || paymentMethod}
                </p>
                {(confirmedOrder.paymentMethod === 'Manual Payment' || paymentMethod === 'Manual Payment') && (
                  <span className="text-[10px] text-[#166534] font-semibold block mt-0.5">
                    ✓ Payment proof receipt submitted
                  </span>
                )}
              </div>

              <div>
                <span className="font-bold text-[#8C7A70] uppercase tracking-wider block mb-1">
                  Net Settlement
                </span>
                <p className="text-base font-bold text-[#C53261]">
                  Rs. {formatPrice(confirmedOrder.netTotal || confirmedOrder.total)}
                </p>
              </div>
            </div>

            {(confirmedOrder.paymentMethod === 'Manual Payment' || paymentMethod === 'Manual Payment') && (
              <div className="mt-4 p-3.5 bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] flex items-start gap-2.5">
                <FiCheckCircle className="text-base flex-shrink-0 mt-0.5 text-[#16A34A]" />
                <div>
                  <span className="font-bold block">Pre-Payment Proof Received</span>
                  <span className="text-[11px] text-[#14532D] leading-relaxed">
                    Transaction ID <strong>{manualPayment.transactionId || 'Submitted'}</strong> has been registered with your order. Our team will verify the payment receipt and dispatch your cosmetic atelier package.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => router.push(`/customer/pages/orders`)}
              className="w-full sm:w-auto px-8 py-4 bg-[#141311] hover:bg-[#C53261] text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
            >
              Track in My Orders
            </button>
            <button
              onClick={() => router.push('/customer/pages/allproducts')}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-[#FFF5F8] text-[#141311] hover:text-[#C53261] border border-[#F0DCE3] font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart State
  if (cart.length === 0) {
    return (
      <div className="bg-[#FBF9F7] min-h-[75vh] flex items-center justify-center py-16 font-sans">
        <ToastContainer position="bottom-right" autoClose={3000} />
        <div className="container mx-auto max-w-xl px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#FFF5F8] text-[#C53261] flex items-center justify-center text-3xl border border-[#F0DCE3]">
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
            className="bg-[#141311] hover:bg-[#C53261] text-white font-bold text-xs uppercase tracking-widest px-8 py-4 transition-all"
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
        <nav className="flex items-center gap-2 text-xs font-semibold text-[#8C7A70] py-3 mb-8 border-b border-[#F0DCE3] overflow-x-auto whitespace-nowrap">
          <button onClick={() => router.push('/')} className="hover:text-[#C53261] transition-colors">
            Home
          </button>
          <FiChevronRight size={13} className="text-[#C5A059]" />
          <button
            onClick={() => router.push('/customer/pages/allproducts')}
            className="hover:text-[#C53261] transition-colors"
          >
            Catalog
          </button>
          <FiChevronRight size={13} className="text-[#C5A059]" />
          <span className="text-[#141311] font-bold">Shopping Bag & Checkout</span>
        </nav>

        {/* Main Two-Column Cart Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* LEFT COLUMN: Items List & Customer Form (7 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* Cart Items Card */}
            <div className="bg-white p-6 sm:p-8 border border-[#F0DCE3]">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#F0DCE3]">
                <h3 className="text-lg sm:text-xl font-serif font-medium text-[#141311] tracking-tight">
                  Shopping Bag ({cart.reduce((a, b) => a + (b.quantity || 1), 0)} items)
                </h3>
                <button
                  onClick={() => router.push('/customer/pages/allproducts')}
                  className="text-xs font-bold text-[#C53261] hover:underline uppercase tracking-wider"
                >
                  + Add More Products
                </button>
              </div>

              {/* Items Table/List */}
              <div className="divide-y divide-[#F0DCE3]">
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
                          className="relative w-20 h-20 bg-[#FFF5F8] border border-[#F0DCE3] overflow-hidden flex-shrink-0 flex items-center justify-center p-2 group-hover:border-[#C53261] transition-colors"
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
                            className="text-xs sm:text-sm font-serif font-medium text-[#141311] hover:text-[#C53261] transition-colors line-clamp-2 leading-snug"
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
                        <div className="flex items-center border border-[#F0DCE3] bg-white px-2 h-10 w-28 justify-between">
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#8C7A70] hover:text-[#141311] hover:bg-[#FFF5F8] transition-colors"
                          >
                            <FiMinus size={12} />
                          </button>
                          <span className="text-xs font-bold text-[#141311]">{item.quantity}</span>
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#8C7A70] hover:text-[#141311] hover:bg-[#FFF5F8] transition-colors"
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
            <div className="bg-white p-6 sm:p-8 border border-[#F0DCE3] space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0DCE3]">
                <h4 className="text-lg font-serif font-medium text-[#141311] tracking-tight">
                  {isDigitalOnly ? 'Client Information' : 'Delivery & Courier Details'}
                </h4>
                <span className="text-xs text-[#8C7A70] font-medium uppercase tracking-wider">Step 1 of 2</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider block mb-1.5">
                    Full Name <span className="text-[#C53261]">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A70]" />
                    <input
                      type="text"
                      name="recipientName"
                      placeholder="e.g. Eleanor Vance"
                      value={shippingAddress.recipientName}
                      onChange={handleInputChange}
                      className={`w-full bg-[#FBF9F7] border py-3 pl-10 pr-4 text-xs sm:text-sm outline-none transition-all ${
                        formErrors.recipientName
                          ? 'border-[#D32F2F] bg-[#FFF5F8]'
                          : 'border-[#F0DCE3] focus:border-[#C53261] focus:bg-white'
                      }`}
                    />
                  </div>
                  {formErrors.recipientName && (
                    <span className="text-[11px] text-[#D32F2F] mt-1 block font-medium">Please enter your recipient name</span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider block mb-1.5">
                    Email Address <span className="text-[#C53261]">*</span>
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A70]" />
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. name@example.com"
                      value={shippingAddress.email}
                      onChange={handleInputChange}
                      className={`w-full bg-[#FBF9F7] border py-3 pl-10 pr-4 text-xs sm:text-sm outline-none transition-all ${
                        formErrors.email || formErrors.emailInvalid
                          ? 'border-[#D32F2F] bg-[#FFF5F8]'
                          : 'border-[#F0DCE3] focus:border-[#C53261] focus:bg-white'
                      }`}
                    />
                  </div>
                  {formErrors.email && (
                    <span className="text-[11px] text-[#D32F2F] mt-1 block font-medium">Please enter your email</span>
                  )}
                  {formErrors.emailInvalid && (
                    <span className="text-[11px] text-[#D32F2F] mt-1 block font-medium">Please enter a valid email address</span>
                  )}
                </div>

                {!isDigitalOnly && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider block mb-1.5">
                        Phone Number <span className="text-[#C53261]">*</span>
                      </label>
                      <div className="relative">
                        <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A70]" />
                        <input
                          type="tel"
                          name="phoneNumber"
                          placeholder="+92 3XX XXXXXXX"
                          value={shippingAddress.phoneNumber}
                          onChange={handleInputChange}
                          className={`w-full bg-[#FBF9F7] border py-3 pl-10 pr-4 text-xs sm:text-sm outline-none transition-all ${
                            formErrors.phoneNumber
                              ? 'border-[#D32F2F] bg-[#FFF5F8]'
                              : 'border-[#F0DCE3] focus:border-[#C53261] focus:bg-white'
                          }`}
                        />
                      </div>
                      {formErrors.phoneNumber && (
                        <span className="text-[11px] text-[#D32F2F] mt-1 block font-medium">Please enter a valid mobile number</span>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider block mb-1.5">
                        City <span className="text-[#C53261]">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        placeholder="e.g. Lahore, Karachi, Islamabad"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        className={`w-full bg-[#FBF9F7] border py-3 px-4 text-xs sm:text-sm outline-none transition-all ${
                          formErrors.city
                            ? 'border-[#D32F2F] bg-[#FFF5F8]'
                            : 'border-[#F0DCE3] focus:border-[#C53261] focus:bg-white'
                        }`}
                      />
                      {formErrors.city && (
                        <span className="text-[11px] text-[#D32F2F] mt-1 block font-medium">Please enter delivery destination city</span>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider block mb-1.5">
                        Complete Street Address & Apartment <span className="text-[#C53261]">*</span>
                      </label>
                      <div className="relative">
                        <FiHome className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A70]" />
                        <input
                          type="text"
                          name="streetAddress"
                          placeholder="House/Plot #, Street, Block, Area"
                          value={shippingAddress.streetAddress}
                          onChange={handleInputChange}
                          className={`w-full bg-[#FBF9F7] border py-3 pl-10 pr-4 text-xs sm:text-sm outline-none transition-all ${
                            formErrors.streetAddress
                              ? 'border-[#D32F2F] bg-[#FFF5F8]'
                              : 'border-[#F0DCE3] focus:border-[#C53261] focus:bg-white'
                          }`}
                        />
                      </div>
                      {formErrors.streetAddress && (
                        <span className="text-[11px] text-[#D32F2F] mt-1 block font-medium">Please enter complete street delivery address</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment Method Selection Card */}
            <div className="bg-white p-6 sm:p-8 border border-[#F0DCE3] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0DCE3]">
                <h4 className="text-lg font-serif font-medium text-[#141311] tracking-tight">Payment Selection</h4>
                <span className="text-xs text-[#8C7A70] font-medium uppercase tracking-wider">Step 2 of 2</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Cash on Delivery */}
                <label
                  className={`flex flex-col justify-between p-4 cursor-pointer border transition-all ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-[#141311] bg-[#FFF5F8]'
                      : 'border-[#F0DCE3] hover:border-[#C5A059]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={() => {
                        setPaymentMethod('Cash on Delivery');
                        setIsReadyForPayment(false);
                      }}
                      className="accent-[#141311] w-4 h-4 mt-0.5"
                    />
                    <FiTruck className="text-[#C53261] text-lg" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block text-[#141311]">
                      Cash on Delivery
                    </span>
                    <span className="text-[11px] text-[#8C7A70] block mt-0.5">Pay upon courier arrival</span>
                  </div>
                </label>

                {/* 2. Manual Payment / Bank Transfer */}
                <label
                  className={`flex flex-col justify-between p-4 cursor-pointer border transition-all ${
                    paymentMethod === 'Manual Payment'
                      ? 'border-[#141311] bg-[#FFF5F8]'
                      : 'border-[#F0DCE3] hover:border-[#C5A059]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'Manual Payment'}
                      onChange={() => {
                        setPaymentMethod('Manual Payment');
                        setIsReadyForPayment(false);
                        if (!manualPayment.amount) {
                          setManualPayment((prev) => ({ ...prev, amount: Math.round(calculateFinalTotal()) }));
                        }
                      }}
                      className="accent-[#141311] w-4 h-4 mt-0.5"
                    />
                    <FaUniversity className="text-[#C53261] text-lg" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block text-[#141311]">
                      Bank / Manual
                    </span>
                    <span className="text-[11px] text-[#8C7A70] block mt-0.5">Upload receipt proof</span>
                  </div>
                </label>

                {/* 3. Online Card / PayPal */}
                <label
                  className={`flex flex-col justify-between p-4 cursor-pointer border transition-all ${
                    paymentMethod === 'Credit Card'
                      ? 'border-[#141311] bg-[#FFF5F8]'
                      : 'border-[#F0DCE3] hover:border-[#C5A059]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'Credit Card'}
                      onChange={() => setPaymentMethod('Credit Card')}
                      className="accent-[#141311] w-4 h-4 mt-0.5"
                    />
                    <FiCreditCard className="text-[#C53261] text-lg" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block text-[#141311]">
                      Card / PayPal
                    </span>
                    <span className="text-[11px] text-[#8C7A70] block mt-0.5">Instant checkout</span>
                  </div>
                </label>
              </div>

              {/* Manual Payment Details & Receipt Upload Box */}
              {paymentMethod === 'Manual Payment' && (
                <div className="mt-4 p-5 bg-[#FAF8F6] border border-[#EAD7DF] space-y-4 animate-fade-in">
                  <div className="flex items-start gap-3 p-3.5 bg-white border border-[#F0DCE3]">
                    <FaUniversity className="text-[#C53261] text-xl mt-0.5 flex-shrink-0" />
                    <div className="text-xs space-y-1.5 w-full">
                      <div className="flex items-center justify-between">
                        <span className="font-bold uppercase tracking-wider text-[#141311]">
                          Liberty Kollection Settlement Account
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#C53261] bg-[#FFF5F8] px-2 py-0.5 border border-[#F0DCE3]">
                          Pre-Payment Proof
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8C7A70]">
                        Transfer the net payable amount and enter your Transaction Reference & Receipt Image below.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1.5 border-t border-[#F0DCE3]">
                        <div><span className="font-semibold text-[#8C7A70]">Bank:</span> <span className="font-bold text-[#141311]">Meezan Bank</span></div>
                        <div><span className="font-semibold text-[#8C7A70]">Account Title:</span> <span className="font-bold text-[#141311]">Liberty Kollection Official</span></div>
                        <div><span className="font-semibold text-[#8C7A70]">Account / IBAN:</span> <span className="font-mono font-bold text-[#141311]">PK42MEZN0001234567890123</span></div>
                        <div><span className="font-semibold text-[#8C7A70]">JazzCash / EasyPaisa:</span> <span className="font-mono font-bold text-[#141311]">0300-1234567</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Transaction ID */}
                    <div>
                      <label className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider block mb-1">
                        Transaction ID / Reference # <span className="text-[#C53261]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TRX-98421098 or 20491823"
                        value={manualPayment.transactionId}
                        onChange={(e) => setManualPayment((prev) => ({ ...prev, transactionId: e.target.value }))}
                        className="w-full bg-white border border-[#F0DCE3] py-2.5 px-3 text-xs sm:text-sm font-mono outline-none focus:border-[#C53261]"
                        required
                      />
                    </div>

                    {/* Paid Amount */}
                    <div>
                      <label className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider block mb-1">
                        Transferred Amount (PKR) <span className="text-[#C53261]">*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 2450"
                        value={manualPayment.amount || Math.round(calculateFinalTotal())}
                        onChange={(e) => setManualPayment((prev) => ({ ...prev, amount: e.target.value }))}
                        className="w-full bg-white border border-[#F0DCE3] py-2.5 px-3 text-xs sm:text-sm font-semibold outline-none focus:border-[#C53261]"
                        required
                      />
                    </div>

                    {/* Bank / Transfer Channel */}
                    <div>
                      <label className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider block mb-1">
                        Transfer Channel
                      </label>
                      <select
                        value={manualPayment.bankName}
                        onChange={(e) => setManualPayment((prev) => ({ ...prev, bankName: e.target.value }))}
                        className="w-full bg-white border border-[#F0DCE3] py-2.5 px-3 text-xs outline-none focus:border-[#C53261]"
                      >
                        <option value="Meezan Bank">Meezan Bank</option>
                        <option value="HBL (Habib Bank Limited)">HBL (Habib Bank Limited)</option>
                        <option value="JazzCash">JazzCash</option>
                        <option value="EasyPaisa">EasyPaisa</option>
                        <option value="Bank Alfalah">Bank Alfalah</option>
                        <option value="Standard Chartered">Standard Chartered</option>
                        <option value="Other Bank">Other Bank / RAAST</option>
                      </select>
                    </div>

                    {/* Sender Notes / Account Name */}
                    <div>
                      <label className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider block mb-1">
                        Sender Account Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Waqas Umar"
                        value={manualPayment.senderNote}
                        onChange={(e) => setManualPayment((prev) => ({ ...prev, senderNote: e.target.value }))}
                        className="w-full bg-white border border-[#F0DCE3] py-2.5 px-3 text-xs outline-none focus:border-[#C53261]"
                      />
                    </div>
                  </div>

                  {/* Receipt Upload Dropzone */}
                  <div>
                    <label className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider block mb-1.5">
                      Upload Payment Receipt / Transfer Screenshot <span className="text-[#C53261]">*</span>
                    </label>

                    {receiptPreview ? (
                      <div className="p-3 bg-white border border-[#F0DCE3] flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 relative border border-[#F0DCE3] overflow-hidden flex-shrink-0 bg-[#FBF9F7]">
                            <img
                              src={receiptPreview}
                              alt="Receipt Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#166534]">
                              <FiCheckCircle />
                              <span>Receipt Proof Attached</span>
                            </div>
                            <span className="text-[11px] text-[#8C7A70] block truncate max-w-[200px] sm:max-w-xs">
                              {manualPayment.receiptFile ? manualPayment.receiptFile.name : 'Uploaded receipt'}
                            </span>
                            <span className="text-[10px] text-[#8C7A70]">
                              {manualPayment.receiptFile ? `${(manualPayment.receiptFile.size / 1024).toFixed(1)} KB` : ''}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setManualPayment((prev) => ({ ...prev, receiptFile: null, receiptUrl: '' }));
                            setReceiptPreview(null);
                          }}
                          className="text-xs font-bold uppercase tracking-wider text-[#C53261] hover:underline px-2 py-1"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-[#E0CBD4] hover:border-[#C53261] bg-white p-5 flex flex-col items-center justify-center cursor-pointer transition-all text-center">
                        <FiUploadCloud className="text-[#C53261] text-2xl mb-1.5" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#141311]">
                          Click to Browse or Drag Receipt Proof
                        </span>
                        <span className="text-[11px] text-[#8C7A70] mt-0.5">
                          Supports JPG, PNG, WEBP, or PDF (Max 10MB)
                        </span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleReceiptFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {isReadyForPayment && paymentMethod === 'Credit Card' && (
                <div id="paypal-button-container" className="mt-4 pt-4 border-t border-[#F0DCE3]" />
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary Card (5 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-6 space-y-4">
            <div className="bg-white p-6 sm:p-7 border border-[#F0DCE3] space-y-5">
              <h4 className="text-lg font-serif font-medium text-[#141311] tracking-tight pb-3 border-b border-[#F0DCE3]">
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
                    className="w-full bg-[#FBF9F7] border border-[#F0DCE3] py-2.5 pl-9 pr-3 text-xs uppercase tracking-wider font-semibold focus:border-[#C53261] outline-none"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  className="bg-[#141311] hover:bg-[#C53261] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 transition-all"
                >
                  Apply
                </button>
              </div>
              {couponMessage && (
                <p className="text-[11px] font-bold text-[#2E7D32]">{couponMessage}</p>
              )}

              {/* Price Calculation Breakdown */}
              <div className="space-y-3 text-xs sm:text-sm text-[#8C7A70] pt-2 border-t border-[#F0DCE3]">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#141311]">Rs. {formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center text-[#C53261] font-bold">
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

                {extraDeliveryCharge > 0 && (
                  <div className="flex justify-between items-center text-xs text-[#8C7A70]">
                    <span>Cash on Delivery Surcharge</span>
                    <span className="font-bold text-[#141311]">Rs. {formatPrice(extraDeliveryCharge)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-[#F0DCE3] text-base sm:text-lg font-serif font-medium text-[#141311]">
                  <span>Total Amount</span>
                  <span className="text-[#C53261] font-sans font-bold">Rs. {formatPrice(calculateFinalTotal())}</span>
                </div>
              </div>

              {/* Action Button */}
              {!isReadyForPayment && (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full bg-[#141311] hover:bg-[#C53261] disabled:bg-gray-400 text-white font-bold text-xs uppercase tracking-widest py-4 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <FiLock size={15} />
                  <span>
                    {isSubmitting
                      ? 'Processing Order...'
                      : paymentMethod === 'Credit Card'
                      ? 'Proceed to Payment'
                      : 'Confirm Order'}
                  </span>
                </button>
              )}

              {/* Trust & Safe Payment Icons */}
              <div className="pt-2 border-t border-[#F0DCE3] space-y-2 text-center">
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
            overlay: { zIndex: 10000, backgroundColor: 'rgba(18, 11, 16, 0.65)', backdropFilter: 'blur(4px)' },
            content: {
              zIndex: 10001,
              margin: 'auto',
              width: 'fit-content',
              maxWidth: '92vw',
              padding: '36px 32px',
              borderRadius: '0px',
              border: '1px solid #F0DCE3',
              backgroundColor: '#fff',
            },
          }}
        >
          <div className="flex flex-col items-center text-center max-w-sm">
            <div className="w-14 h-14 bg-[#FFF5F8] text-[#C53261] flex items-center justify-center text-2xl mb-4 border border-[#F0DCE3]">
              ✓
            </div>
            <h3 className="text-xl font-serif font-medium text-[#141311] mb-1">Order Placed Successfully!</h3>
            {confirmedOrder?.id && (
              <div className="my-2 px-3 py-1 bg-[#FBF9F7] border border-[#F0DCE3] text-xs font-mono font-bold text-[#141311]">
                Order Reference: #{confirmedOrder.id}
              </div>
            )}
            <p className="text-xs text-[#8C7A70] leading-relaxed mb-6">
              Thank you for your order with Liberty Kollection. A confirmation email has been dispatched to your inbox.
            </p>
            <div className="w-full space-y-2.5">
              {confirmedOrder?.id && (
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    router.push(`/generatereceipt/${confirmedOrder.id}`);
                  }}
                  className="w-full bg-[#141311] hover:bg-[#C53261] text-white font-bold text-xs uppercase tracking-wider py-3.5 transition-all flex items-center justify-center gap-2"
                >
                  View Order Receipt
                </button>
              )}
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  router.push('/customer/pages/orders');
                }}
                className="w-full bg-white hover:bg-[#FFF5F8] text-[#141311] hover:text-[#C53261] border border-[#F0DCE3] font-bold text-xs uppercase tracking-wider py-3 transition-all"
              >
                Track In My Orders
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  router.push('/customer/pages/allproducts');
                }}
                className="w-full text-[#8C7A70] hover:text-[#141311] font-semibold text-xs py-2 transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CartPage;
