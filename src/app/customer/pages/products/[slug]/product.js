'use client';

import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import DigitalCheckoutModal from '../../../components/DigitalCheckoutModal';
import DownloadProgressModal from '../../../components/DownloadProgressModal';
import Features from '../../../components/Features';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { setCart } from '../../../../store/cartSlice';
import {
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiMaximize2,
  FiChevronRight,
  FiTruck,
  FiShield,
  FiRotateCcw,
  FiZap,
  FiCheck,
  FiEye,
  FiClock,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import {
  FaFacebookF,
  FaTwitter,
  FaWhatsapp,
  FaRegHeart,
  FaHeart,
} from 'react-icons/fa';
import { GoStarFill } from 'react-icons/go';
import Image from 'next/image';
import { getSafeImageUrl } from '../../../../util/imageUtils';

const Modal = dynamic(() => import('react-modal'), {
  ssr: false,
  loading: () => null,
});

const ProductPage = ({ productData }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const prevcart = useSelector((state) => state.cart.items);

  // Core State
  const [product, setProduct] = useState(productData?.product || null);
  const [relatedProducts, setRelatedProducts] = useState(
    productData?.relatedProducts && productData.relatedProducts.length > 0
      ? productData.relatedProducts
      : []
  );
  const [error, setError] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState('Standard (100ml)');
  const [selectedColor, setSelectedColor] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [imgError, setImgError] = useState(false);

  // Review State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [userName, setUserName] = useState(null);

  // Digital Product State
  const isDigital = useMemo(
    () => product?.productType === 'digital' || product?.type === 'digital',
    [product]
  );
  const [isPurchased, setIsPurchased] = useState(false);
  const [isDigitalPaymentOpen, setIsDigitalPaymentOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeDownloadUrl, setActiveDownloadUrl] = useState('');

  // Urgency viewer count (12 to 25)
  const viewerCount = useMemo(() => Math.floor(Math.random() * 14) + 12, [product?.id]);

  useEffect(() => {
    if (productData?.product) {
      setProduct(productData.product);
      if (productData.relatedProducts && productData.relatedProducts.length > 0) {
        setRelatedProducts(productData.relatedProducts);
      } else {
        setRelatedProducts([]);
      }
      if (productData.colors && Array.isArray(productData.colors) && productData.colors.length > 0) {
        setColors(productData.colors);
      }
      if (productData.sizes && Array.isArray(productData.sizes) && productData.sizes.length > 0) {
        setSizes(productData.sizes);
        setSelectedSize(productData.sizes[0]?.name || 'Standard');
      }
      setError(null);
    }
  }, [productData]);

  // Fetch reviews from API
  useEffect(() => {
    if (!product?.id) return;
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`/api/getreviews?productId=${product.id}`);
        if (res.data?.reviews && res.data.reviews.length > 0) {
          setReviews(res.data.reviews);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchReviews();
  }, [product?.id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserName(localStorage.getItem('userName'));
    }
  }, []);

  const getImageUrl = useCallback((url) => {
    if (!url) return '/placeholder-image.png';
    return getSafeImageUrl(url);
  }, []);

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 });

  const calculateOriginalPrice = (price, discount) => {
    const p = Number(price) || 0;
    const d = Number(discount) || 0;
    if (d > 0) {
      return p / (1 - d / 100);
    }
    return p;
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
    setImgError(false);
  };

  const handleQuantityDecrease = () => setQuantity((q) => Math.max(1, q - 1));
  const handleQuantityIncrease = () =>
    setQuantity((q) => (product?.stock ? Math.min(product.stock, q + 1) : q + 1));

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 4.9;
    const sum = reviews.reduce((acc, curr) => acc + (curr.rating || 5), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const createCartItem = () => ({
    id: `${product.id}-${selectedSize || 'def'}-${selectedColor || 'def'}`,
    productId: product.id,
    quantity,
    price: product.price,
    selectedColor,
    selectedSize,
    images: product.images,
    name: product.name,
    discount: product.discount,
    slug: product.slug,
    productType: product.productType || product.type || 'tangible',
    digitalData: product.digitalData || null,
  });

  const handleAddToCart = () => {
    if (product.stock === 0) return toast.error('Out of stock');
    if (sizes.length > 0 && !selectedSize) return toast.error('Please select a size');
    if (colors.length > 0 && !selectedColor) return toast.error('Please select a color');

    const item = createCartItem();
    const newCart = [...prevcart];
    const existIdx = newCart.findIndex(
      (i) =>
        i.productId === item.productId &&
        i.selectedSize === item.selectedSize &&
        i.selectedColor === item.selectedColor
    );

    if (existIdx > -1) newCart[existIdx].quantity += quantity;
    else newCart.push(item);

    dispatch(setCart(newCart));
    if (typeof window !== 'undefined') localStorage.setItem('cart', JSON.stringify(newCart));
    toast.success('Added to Vanity Bag');
    setIsModalOpen(true);
  };

  const handleBuyNow = () => {
    if (isDigital) {
      setIsDigitalPaymentOpen(true);
      return;
    }

    if (product.stock === 0) return toast.error('Out of stock');
    if (sizes.length > 0 && !selectedSize) return toast.error('Please select a size');
    if (colors.length > 0 && !selectedColor) return toast.error('Please select a color');

    const item = createCartItem();
    const newCart = [...prevcart];
    const existIdx = newCart.findIndex(
      (i) =>
        i.productId === item.productId &&
        i.selectedSize === item.selectedSize &&
        i.selectedColor === item.selectedColor
    );

    if (existIdx > -1) newCart[existIdx].quantity += quantity;
    else newCart.push(item);

    dispatch(setCart(newCart));
    if (typeof window !== 'undefined') localStorage.setItem('cart', JSON.stringify(newCart));
    router.push('/customer/pages/cart');
  };

  const handleReviewSubmit = async () => {
    if (!rating) return toast.error('Please select a rating');
    if (!comment) return toast.error('Please write your review comment');

    setReviewLoading(true);
    try {
      const response = await axios.post('/api/reviews', {
        productId: product.id,
        rating,
        comment,
        reviewer: userName || 'Customer',
      });

      if (response.data && response.data.status === 201) {
        toast.success(response.data.message || 'Review submitted successfully!');
        setReviews([
          {
            id: `new-${Date.now()}`,
            reviewer: userName || 'Verified Client',
            rating,
            comment,
            date: 'Just now',
          },
          ...reviews,
        ]);
        setComment('');
        setRating(5);
      } else {
        toast.error('Failed to submit review');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error submitting review. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDownload = () => {
    if (product?.digitalData) {
      try {
        const data =
          typeof product.digitalData === 'string'
            ? JSON.parse(product.digitalData)
            : product.digitalData;
        const fileUrl = data.files?.[0]?.url;
        if (fileUrl) {
          const downloadUrl = fileUrl.startsWith('http')
            ? fileUrl
            : `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${fileUrl}`;
          setActiveDownloadUrl(downloadUrl);
          setIsDownloading(true);
        } else {
          toast.error('Download link not found.');
        }
      } catch (e) {
        console.error('Error parsing digital data', e);
        toast.error('Download error.');
      }
    }
  };

  const onDownloadComplete = () => {
    setIsPurchased(false);
    setIsDownloading(false);
    const proxyUrl = `/api/download?id=${product.id}`;
    window.location.assign(proxyUrl);
  };

  if (!product && loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FBF9F7]">
        <div className="w-16 h-16 border-2 border-[#F0DCE3] border-t-[#C53261] rounded-none animate-spin mb-4" />
        <span className="text-xs uppercase tracking-widest font-bold text-[#141311]">
          Curating Product Experience...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 text-center bg-[#FBF9F7] min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif text-[#141311] mb-4">{error}</h2>
        <button
          onClick={() => router.push('/')}
          className="bg-[#141311] hover:bg-[#2A1B24] text-white px-8 py-3 text-xs font-bold uppercase tracking-widest rounded-none border border-[#141311] transition-colors"
        >
          Return to Products
        </button>
      </div>
    );
  }

  const rawImage = product?.images?.[currentImageIndex]?.url;
  const mainImageUrl = !imgError && rawImage
    ? getImageUrl(rawImage)
    : 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80';

  const originalPrice = calculateOriginalPrice(product?.price, product?.discount);
  const savingsAmount = product?.discount ? originalPrice - product?.price : 0;
  const stockCount = typeof product?.stock === 'number' ? product.stock : 9;
  const stockPercentage = Math.min(100, Math.max(15, (stockCount / 20) * 100));

  return (
    <div className="bg-[#FBF9F7] min-h-screen text-[#141311]">
      <ToastContainer position="bottom-right" autoClose={3000} />

      <div className="container mx-auto max-w-[1536px] px-4 lg:px-10 py-6">
        {/* 1. Sleek Luxury Breadcrumb Trail */}
        <nav className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 py-3 mb-6 border-b border-[#F0DCE3] overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => router.push('/')}
            className="hover:text-[#141311] transition-colors"
          >
            Home
          </button>
          <span className="text-gray-300">/</span>
          <button
            onClick={() => router.push('/customer/pages/allproducts')}
            className="hover:text-[#141311] transition-colors"
          >
            Collections
          </button>
          {product?.subcategory?.category?.name && (
            <>
              <span className="text-gray-300">/</span>
              <button
                onClick={() =>
                  router.push(`/customer/pages/category/${product.subcategory.category.slug}`)
                }
                className="hover:text-[#141311] transition-colors"
              >
                {product.subcategory.category.name}
              </button>
            </>
          )}
          <span className="text-gray-300">/</span>
          <span className="text-[#141311] font-bold truncate max-w-xs sm:max-w-md">
            {product?.name}
          </span>
        </nav>

        {/* 2. Main Two-Column Luxury Product Display */}
        <div className="bg-white rounded-none p-6 sm:p-10 lg:p-12 border border-[#F0DCE3] shadow-none mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* LEFT: Product Gallery (5 cols) */}
            <div className="lg:col-span-6 xl:col-span-5 space-y-4">
              {/* Main Image Viewport with Badges & Zoom */}
              <div className="relative aspect-square w-full bg-[#FFF5F8] rounded-none border border-[#F0DCE3] overflow-hidden flex items-center justify-center group">
                {/* Sale Badge */}
                {product?.discount > 0 && (
                  <div className="absolute top-4 left-4 z-20 bg-[#C53261] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-none shadow-none">
                    -{Math.round(product.discount)}% OFF
                  </div>
                )}

                {/* Floating Wishlist Button */}
                <button
                  onClick={() => setIsWishlist(!isWishlist)}
                  title="Save to Vanity Wishlist"
                  className="absolute top-4 right-4 z-20 w-10 h-10 rounded-none bg-white border border-[#F0DCE3] flex items-center justify-center text-[#141311] hover:text-[#C53261] hover:border-[#C53261] transition-all shadow-none"
                >
                  {isWishlist ? (
                    <FaHeart className="text-[#C53261]" size={16} />
                  ) : (
                    <FaRegHeart size={16} />
                  )}
                </button>

                {/* Fullscreen Quick Preview */}
                <button
                  onClick={() => window.open(mainImageUrl, '_blank')}
                  title="Inspect High-Res Visual"
                  className="absolute bottom-4 right-4 z-20 w-9 h-9 rounded-none bg-white border border-[#F0DCE3] flex items-center justify-center text-[#141311] hover:bg-[#141311] hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <FiMaximize2 size={15} />
                </button>

                {/* Product Image */}
                <Image
                  src={mainImageUrl}
                  alt={product?.name || 'Cosmetic Formulation'}
                  fill
                  priority
                  onError={() => setImgError(true)}
                  className="object-contain p-8 group-hover:scale-105 transition-transform duration-700 ease-out"
                  unoptimized
                />
              </div>

              {/* Thumbnails Row */}
              {product?.images && product.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={() => handleThumbnailClick(idx)}
                      className={`relative w-20 h-20 rounded-none overflow-hidden bg-[#FFF5F8] flex-shrink-0 border transition-all ${
                        currentImageIndex === idx
                          ? 'border-[#C53261] ring-1 ring-[#C53261]'
                          : 'border-[#F0DCE3] hover:border-gray-400'
                      }`}
                    >
                      <Image
                        src={getImageUrl(img.url)}
                        alt={`Product View ${idx + 1}`}
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Product Buy Box & Details (7 cols) */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col space-y-6">
              {/* Category & Status */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#C53261] flex items-center gap-1.5">
                  <HiSparkles size={13} />
                  {product?.subcategory?.category?.name || product?.category?.name || 'Gloria Cosmetics'}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-none bg-emerald-600 animate-pulse" />
                  {stockCount > 0 ? `In Stock (${stockCount} units)` : 'Sold Out'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#141311] leading-tight tracking-tight">
                {product?.name}
              </h1>

              {/* Rating & Reviews + Live Viewers */}
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-[#C53261]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <GoStarFill key={i} size={15} />
                  ))}
                  <span className="text-[#141311] font-bold ml-1.5">{averageRating}</span>
                </div>
                <span className="text-[#F0DCE3]">•</span>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="text-gray-500 hover:text-[#141311] underline font-medium"
                >
                  {reviews.length} Client Reviews
                </button>
                <span className="text-[#F0DCE3]">•</span>
                <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                  <FiEye className="text-[#C53261]" />
                  <span>{viewerCount} admirers viewing currently</span>
                </div>
              </div>

              {/* Price Box */}
              <div className="bg-[#FFF5F8] p-5 sm:p-6 rounded-none border border-[#F0DCE3] flex items-baseline gap-4 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-[#141311] tracking-tight">
                  Rs. {formatPrice(product?.price)}
                </span>
                {product?.discount > 0 && (
                  <>
                    <span className="text-base sm:text-lg text-gray-400 line-through font-medium">
                      Rs. {formatPrice(originalPrice)}
                    </span>
                    <span className="bg-[#C53261]/10 text-[#C53261] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-none border border-[#C53261]/20">
                      Privilege Savings Rs. {formatPrice(savingsAmount)} ({Math.round(product.discount)}% OFF)
                    </span>
                  </>
                )}
              </div>

              {/* Inventory Urgency Bar */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#141311]">
                  <span className="flex items-center gap-1.5 text-[#C53261]">
                    <FiClock />
                    Stock Alert: Only {stockCount} items available
                  </span>
                  <span className="text-gray-400 font-medium">{stockCount} remaining</span>
                </div>
                <div className="w-full h-1.5 bg-[#F0DCE3] rounded-none overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#C5A059] to-[#C53261] rounded-none transition-all duration-700"
                    style={{ width: `${stockPercentage}%` }}
                  />
                </div>
              </div>

              {/* Formulation Overview */}
              <div
                className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3 font-light"
                dangerouslySetInnerHTML={{
                  __html:
                    product?.description ||
                    'Formulated with masterfully selected pigments, skin-conditioning botanicals, and long-lasting adherence. Designed to illuminate natural radiance with effortless grace.',
                }}
              />

              <div className="h-px bg-[#F0DCE3] w-full" />

              {/* Variants: Colors & Sizes */}
              <div className="space-y-5">
                {/* Size / Volume Selector */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#141311] block mb-2.5">
                    Size / Volume: <span className="text-[#C53261] font-bold">{selectedSize}</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {(sizes.length > 0 ? sizes : [{ name: '30ml' }, { name: '50ml' }, { name: '100ml' }]).map(
                      (s, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedSize(s.name)}
                          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-none border transition-all ${
                            selectedSize === s.name
                              ? 'bg-[#141311] text-white border-[#141311]'
                              : 'bg-white text-[#141311] border-[#F0DCE3] hover:border-[#141311]'
                          }`}
                        >
                          {s.name}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Color / Shade Selector */}
                {colors.length > 0 && (
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-[#141311] block mb-2.5">
                      Shade Spectrum: <span className="text-[#C53261] font-bold">{selectedColor || 'Choose Shade'}</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      {colors.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedColor(c.name)}
                          className={`w-9 h-9 rounded-none border transition-all relative ${
                            selectedColor === c.name
                              ? 'ring-2 ring-offset-2 ring-[#141311] border-white scale-105'
                              : 'border-[#F0DCE3] hover:border-black'
                          }`}
                          style={{ backgroundColor: c.hex || '#141311' }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity & CTA Buttons */}
                <div className="space-y-3 pt-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#141311] block">
                    Quantity
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch gap-3">
                    {/* Stepper */}
                    {!isDigital && (
                      <div className="flex items-center justify-between border border-[#F0DCE3] rounded-none w-36 h-12 bg-white px-2">
                        <button
                          onClick={handleQuantityDecrease}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#141311] transition-colors rounded-none hover:bg-[#FFF5F8]"
                        >
                          <FiMinus size={13} />
                        </button>
                        <span className="font-bold text-sm text-[#141311]">{quantity}</span>
                        <button
                          onClick={handleQuantityIncrease}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#141311] transition-colors rounded-none hover:bg-[#FFF5F8]"
                        >
                          <FiPlus size={13} />
                        </button>
                      </div>
                    )}

                    {/* Add to Vanity Bag */}
                    <button
                      onClick={handleAddToCart}
                      disabled={loading || (!isDigital && product?.stock === 0)}
                      className="flex-1 h-12 bg-[#141311] hover:bg-[#2A1B24] text-white text-xs font-bold uppercase tracking-widest rounded-none border border-[#141311] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                    >
                      <FiShoppingBag size={15} />
                      <span>{product?.stock === 0 ? 'Allocated / Sold Out' : 'Add to Vanity Bag'}</span>
                    </button>
                  </div>

                  {/* Acquire Now / Instant Checkout */}
                  {!isPurchased ? (
                    <button
                      onClick={handleBuyNow}
                      disabled={loading || (!isDigital && product?.stock === 0)}
                      className="w-full h-12 bg-[#C53261] hover:bg-[#A8224E] text-white text-xs font-bold uppercase tracking-widest rounded-none border border-[#C53261] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                    >
                      <FiZap size={15} />
                      <span>{isDigital ? 'Download Masterclass' : 'Acquire Now (Instant Checkout)'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleDownload}
                      className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-widest rounded-none transition-all flex items-center justify-center gap-2"
                    >
                      <span>Download Digital License</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Luxury Trust & Assurance Card */}
              <div className="bg-[#FFF5F8] rounded-none border border-[#F0DCE3] p-5 sm:p-6 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-start gap-3 text-gray-700">
                    <FiTruck className="text-[#C53261] text-lg flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#141311] font-bold tracking-tight">White-Glove Delivery</strong>
                      <span className="text-[11px] text-gray-500">Complimentary shipping on orders over Rs. 2,000</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-gray-700">
                    <FiRotateCcw className="text-[#C53261] text-lg flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#141311] font-bold tracking-tight">Complimentary Exchange</strong>
                      <span className="text-[11px] text-gray-500">30-day effortless client satisfaction policy</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-gray-700">
                    <FiShield className="text-[#C53261] text-lg flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#141311] font-bold tracking-tight">Encrypted Concierge Checkout</strong>
                      <span className="text-[11px] text-gray-500">Cash on Delivery & Secure Bank Settlement</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-gray-700">
                    <FiCheck className="text-[#C53261] text-lg flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#141311] font-bold tracking-tight">Guaranteed Authenticity</strong>
                      <span className="text-[11px] text-gray-500">Directly bottled & certified original</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta & Share Info */}
              <div className="pt-2 text-xs text-gray-500 space-y-2 border-t border-[#F0DCE3]">
                {product?.sku && (
                  <p>
                    <span className="font-bold text-[#141311] uppercase tracking-wider text-[11px]">SKU:</span> {product.sku}
                  </p>
                )}
                <p>
                  <span className="font-bold text-[#141311] uppercase tracking-wider text-[11px]">Collection:</span>{' '}
                  <span className="text-[#C53261] font-semibold capitalize">
                    {product?.subcategory?.category?.name || product?.subcategorySlug || 'Exclusive Beauty'}
                  </span>
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <span className="font-bold text-[#141311] uppercase tracking-wider text-[11px]">Share Product:</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        typeof window !== 'undefined' ? window.location.href : ''
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-none border border-[#F0DCE3] bg-white text-[#141311] hover:bg-[#141311] hover:text-white flex items-center justify-center transition-colors"
                    >
                      <FaFacebookF size={11} />
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        product?.name || ''
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-none border border-[#F0DCE3] bg-white text-[#141311] hover:bg-[#141311] hover:text-white flex items-center justify-center transition-colors"
                    >
                      <FaTwitter size={11} />
                    </a>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Check out ${product?.name}: ${
                          typeof window !== 'undefined' ? window.location.href : ''
                        }`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-none border border-[#F0DCE3] bg-white text-[#141311] hover:bg-[#141311] hover:text-white flex items-center justify-center transition-colors"
                    >
                      <FaWhatsapp size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Product Tabs Section (Description, Formulation Specs, Reviews, Shipping) */}
        <div className="bg-white rounded-none p-6 sm:p-10 lg:p-12 border border-[#F0DCE3] shadow-none mb-12">
          {/* Tab Navigation */}
          <div className="flex items-center gap-6 sm:gap-10 border-b border-[#F0DCE3] pb-4 overflow-x-auto scrollbar-hide">
            {[
              { id: 'description', label: 'Formulation & Story' },
              { id: 'specs', label: 'Specifications & Provenance' },
              { id: 'reviews', label: `Client Reviews (${reviews.length})` },
              { id: 'shipping', label: 'White Glove Delivery' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs sm:text-sm font-bold uppercase tracking-widest pb-3 transition-all relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#141311]'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C53261]" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="py-6 sm:py-8">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="prose prose-sm sm:prose max-w-none text-gray-700 leading-relaxed space-y-4">
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      product?.description ||
                      '<p>Experience pure cosmetic refinement. Masterfully blended with notes of pure botanical essences, enriching emollients, and silky textures designed to enhance your signature beauty.</p>',
                  }}
                />
                <div className="bg-[#FFF5F8] p-6 rounded-none border border-[#F0DCE3] mt-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#141311] mb-3 flex items-center gap-2">
                    <HiSparkles className="text-[#C53261]" />
                    Product Specifications & Formulation
                  </h4>
                  <ul className="list-disc list-inside text-xs sm:text-sm text-gray-600 space-y-2">
                    <li>Long-lasting concentration engineered for day-long illumination and flawless performance.</li>
                    <li>Guaranteed 100% genuine formulation sourced directly from authorized luxury labs.</li>
                    <li>Packaged in an elegant keepsake presentation box suitable for gifting or personal collection.</li>
                    <li>Free doorstep delivery across Mandi Bahauddin with rapid priority dispatch nationwide.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Additional Info / Specs Tab */}
            {activeTab === 'specs' && (
              <div className="max-w-2xl">
                <table className="w-full text-xs sm:text-sm text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-[#F0DCE3]">
                      <th className="py-3.5 font-bold uppercase tracking-wider text-[11px] text-[#141311] w-1/3">Creations Name</th>
                      <td className="py-3.5 text-gray-700">{product?.name}</td>
                    </tr>
                    <tr className="border-b border-[#F0DCE3]">
                      <th className="py-3.5 font-bold uppercase tracking-wider text-[11px] text-[#141311]">Archive SKU</th>
                      <td className="py-3.5 text-gray-700 font-mono">{product?.sku || 'S2U-CT-892'}</td>
                    </tr>
                    <tr className="border-b border-[#F0DCE3]">
                      <th className="py-3.5 font-bold uppercase tracking-wider text-[11px] text-[#141311]">Category</th>
                      <td className="py-3.5 text-gray-700 capitalize">
                        {product?.subcategory?.category?.name || product?.subcategorySlug || 'Cosmetics & Beauty'}
                      </td>
                    </tr>
                    <tr className="border-b border-[#F0DCE3]">
                      <th className="py-3.5 font-bold uppercase tracking-wider text-[11px] text-[#141311]">Product Type</th>
                      <td className="py-3.5 text-gray-700 capitalize">
                        {product?.productType || 'Tangible Luxury Cosmetic'}
                      </td>
                    </tr>
                    <tr className="border-b border-[#F0DCE3]">
                      <th className="py-3.5 font-bold uppercase tracking-wider text-[11px] text-[#141311]">Dispatch Protocol</th>
                      <td className="py-3.5 text-emerald-800 font-semibold">
                        Ready for Express White-Glove Dispatch (Within 24 Hours)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Customer Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Score Summary */}
                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 p-6 bg-[#FFF5F8] rounded-none border border-[#F0DCE3]">
                  <div className="text-center">
                    <span className="text-4xl sm:text-5xl font-serif font-bold text-[#141311] block">
                      {averageRating}
                    </span>
                    <div className="flex items-center justify-center gap-0.5 text-[#C53261] my-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <GoStarFill key={i} size={16} />
                      ))}
                    </div>
                    <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                      Based on {reviews.length} authentic evaluations
                    </span>
                  </div>

                  <div className="flex-1 w-full space-y-2 text-xs text-gray-600">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="w-8 font-bold text-[#141311]">{stars} ★</span>
                        <div className="flex-1 h-1.5 bg-[#F0DCE3] rounded-none overflow-hidden">
                          <div
                            className="h-full bg-[#C53261] rounded-none"
                            style={{
                              width: stars === 5 ? '92%' : stars === 4 ? '6%' : '2%',
                            }}
                          />
                        </div>
                        <span className="w-8 text-right font-medium">
                          {stars === 5 ? '92%' : stars === 4 ? '6%' : '2%'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Form */}
                <div className="p-6 bg-[#FFF5F8] rounded-none border border-[#F0DCE3]">
                  <h4 className="font-serif font-bold text-base text-[#141311] mb-3">Add Your Evaluation</h4>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#141311]">Your Rating:</span>
                    <div className="flex gap-1 text-[#C53261]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="text-xl transition-transform hover:scale-110"
                        >
                          {star <= rating ? '★' : '☆'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with the formulation, texture, wear, and finish..."
                    className="w-full p-4 bg-white border border-[#F0DCE3] rounded-none text-xs sm:text-sm outline-none focus:border-[#C53261] transition-colors mb-4"
                  />
                  <button
                    onClick={handleReviewSubmit}
                    disabled={reviewLoading}
                    className="bg-[#141311] hover:bg-[#2A1B24] text-white text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-none border border-[#141311] transition-all disabled:opacity-50"
                  >
                    {reviewLoading ? 'Submitting...' : 'Publish Evaluation'}
                  </button>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="p-10 text-center bg-[#FFF5F8] rounded-none border border-dashed border-[#F0DCE3]">
                      <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                        No client evaluations recorded yet. Be the first to grace this creation.
                      </p>
                    </div>
                  ) : (
                    reviews.map((r, i) => (
                      <div key={r.id || i} className="p-5 bg-white rounded-none border border-[#F0DCE3]">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-bold text-xs uppercase tracking-wider text-[#141311]">
                            {r.reviewer || r.name || 'Verified Beauty Client'}
                          </h5>
                          <div className="flex items-center text-[#C53261] text-xs">
                            {Array.from({ length: r.rating || 5 }).map((_, idx) => (
                              <GoStarFill key={idx} size={13} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
                          {r.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Shipping & Delivery Tab */}
            {activeTab === 'shipping' && (
              <div className="space-y-4 text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl">
                <p>
                  <strong className="text-[#141311] font-bold">Priority Mandi Bahauddin & Nationwide Dispatch:</strong> Orders are
                  carefully wrapped in signature archival packaging and dispatched within 24 hours from
                  our centralized boutique hub. Expected transit time: 2 to 4 business days.
                </p>
                <p>
                  <strong className="text-[#141311] font-bold">Complimentary Shipping Privileges:</strong> Every order exceeding Rs.
                  2,000 automatically enjoys zero shipping charges nationwide.
                </p>
                <p>
                  <strong className="text-[#141311] font-bold">30-Day Satisfaction Assurance:</strong> If the formulation does not
                  delight your senses, our concierge team will gladly arrange a prompt exchange or full
                  refund within 30 days of receipt.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Luxury Trust Features Bar */}
        <div className="mb-12">
          <Features />
        </div>

        {/* 5. Related Products Section ("You May Also Admire") */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#F0DCE3]">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#141311] tracking-tight">
                You May Also Admire
              </h3>
              <button
                onClick={() => router.push('/customer/pages/allproducts')}
                className="text-xs font-bold uppercase tracking-widest text-[#C53261] hover:underline"
              >
                View Full Collection
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedProducts.slice(0, 5).map((rp, idx) => {
                const img = rp.image || rp.images?.[0];
                const rawUrl = typeof img === 'string' ? img : img?.url;
                const imgUrl = getImageUrl(rawUrl);

                return (
                  <div
                    key={rp.id || idx}
                    onClick={() => router.push(`/customer/pages/products/${rp.slug || rp.id}`)}
                    className="bg-white rounded-none border border-[#F0DCE3] hover:border-[#C53261] transition-all p-4 flex flex-col justify-between cursor-pointer group"
                  >
                    <div className="relative aspect-square w-full bg-[#FFF5F8] rounded-none mb-3.5 flex items-center justify-center overflow-hidden border border-[#F0DCE3]/50">
                      {rp.discount > 0 && (
                        <span className="absolute top-2 left-2 z-10 bg-[#C53261] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none">
                          -{Math.round(rp.discount)}%
                        </span>
                      )}

                      <Image
                        src={imgUrl}
                        alt={rp.name}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                        {rp.category || rp.subcategory?.name || 'Exclusive'}
                      </span>
                      <h4 className="text-xs font-serif font-bold text-[#141311] group-hover:text-[#C53261] transition-colors line-clamp-2 h-8 leading-snug mb-1">
                        {rp.name}
                      </h4>
                      <div className="flex items-center gap-0.5 text-[#C53261] mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <GoStarFill key={i} size={11} />
                        ))}
                      </div>
                      <div className="text-sm font-bold text-[#141311]">
                        Rs. {formatPrice(rp.price)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal: Added to Vanity Bag Notification */}
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            contentLabel="Bag Confirmation"
            ariaHideApp={false}
            style={{
              overlay: { zIndex: 10000, backgroundColor: 'rgba(18, 11, 16, 0.65)' },
              content: {
                zIndex: 10001,
                margin: 'auto',
                width: 'fit-content',
                maxWidth: '92vw',
                padding: '32px',
                borderRadius: '0px',
                border: '1px solid #F0DCE3',
                background: '#FFFFFF',
              },
            }}
          >
            <div className="flex flex-col items-center p-2 text-center max-w-sm">
              <div className="w-12 h-12 rounded-none bg-[#FFF5F8] border border-[#F0DCE3] text-[#C53261] flex items-center justify-center mb-4">
                <FiCheck size={22} />
              </div>
              <h2 className="text-lg font-serif font-bold text-[#141311] mb-1.5 uppercase tracking-wide">
                Added to Vanity Bag
              </h2>
              <p className="text-xs text-gray-500 mb-6 font-light leading-relaxed">
                <strong className="text-[#141311] font-semibold">{product?.name}</strong> has been placed into your personal beauty bag.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-5 py-3 border border-[#F0DCE3] text-[#141311] text-[11px] font-bold uppercase tracking-widest rounded-none hover:border-black transition-colors"
                >
                  Continue Browsing
                </button>
                <button
                  onClick={() => router.push('/customer/pages/cart')}
                  className="flex-1 px-5 py-3 bg-[#141311] hover:bg-[#2A1B24] text-white text-[11px] font-bold uppercase tracking-widest rounded-none transition-colors"
                >
                  View Vanity Bag
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Digital Product Modals */}
        {isDigitalPaymentOpen && product && (
          <DigitalCheckoutModal
            isOpen={isDigitalPaymentOpen}
            onRequestClose={() => setIsDigitalPaymentOpen(false)}
            product={product}
            onSuccess={() => {
              setIsPurchased(true);
              setIsDigitalPaymentOpen(false);
            }}
          />
        )}

        <DownloadProgressModal
          isOpen={isDownloading}
          onRequestClose={() => setIsDownloading(false)}
          fileName={product?.name}
          onComplete={onDownloadComplete}
        />
      </div>
    </div>
  );
};

export default memo(ProductPage);
