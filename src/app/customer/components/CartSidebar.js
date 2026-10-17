'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { setCart } from '../../store/cartSlice'; // Adjust path if needed
import { toast } from 'react-toastify';

const CartSidebar = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.items);

    const getImageUrl = (url) => {
        if (!url) return '/placeholder-image.png';
        if (url.startsWith('http')) return url;
        const baseUrl = process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL || '';
        return baseUrl ? `${baseUrl}/${url}` : url;
    };

    const updateQuantity = (productId, selectedSize, selectedColor, newQuantity) => {
        if (newQuantity < 1) return;
        const newCart = cartItems.map(item => {
            if (item.productId === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor) {
                return { ...item, quantity: newQuantity };
            }
            return item;
        });
        dispatch(setCart(newCart));
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const removeItem = (productId, selectedSize, selectedColor) => {
        const newCart = cartItems.filter(item =>
            !(item.productId === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor)
        );
        dispatch(setCart(newCart));
        localStorage.setItem('cart', JSON.stringify(newCart));
        toast.info("Item removed from cart");
    };

    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-[85vw] max-w-md bg-white shadow-2xl z-[70] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
                            <div>
                                <div className="w-8 h-1 bg-brand-primary rounded-full mb-2"></div>
                                <h3 className="text-xl font-bold text-gray-900">Your Cart</h3>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <FiX size={24} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                                    <span className="text-5xl">🛒</span>
                                    <p className="font-medium">Your cart is empty</p>
                                    <button onClick={onClose} className="text-brand-primary font-bold hover:underline">Start Shopping</button>
                                </div>
                            ) : (
                                cartItems.map((item, idx) => (
                                    <div key={`${item.productId}-${idx}`} className="flex gap-4">
                                        {/* Image */}
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                                            <Image
                                                src={getImageUrl(item.images?.[0]?.url)}
                                                alt={item.name}
                                                fill
                                                className="object-contain p-1"
                                                loading="lazy"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 leading-tight mb-1 pr-2">{item.name}</h3>
                                                    <p className="text-[10px] text-gray-500">{item.selectedSize !== 'def' && `Size: ${item.selectedSize}`} {item.selectedColor !== 'def' && `• ${item.selectedColor}`}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.productId, item.selectedSize, item.selectedColor)}
                                                    className="bg-[#FF4D4F] text-white p-1.5 rounded-md hover:bg-red-600 transition-colors shadow-sm"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>

                                            <div className="flex items-end justify-between mt-2">
                                                <span className="font-bold text-gray-900 text-sm">Rs.{item.price.toLocaleString()}</span>

                                                {/* Quantity Control */}
                                                <div className="flex items-center bg-gray-100 rounded-lg h-8 px-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity - 1)}
                                                        className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-black"
                                                    >
                                                        <FiMinus size={12} />
                                                    </button>
                                                    <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity + 1)}
                                                        className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-black"
                                                    >
                                                        <FiPlus size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                            <div className="p-5 border-t border-gray-100 bg-white space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 font-medium">Subtotal:</span>
                                    <span className="text-xl font-extrabold text-gray-900">Rs.{subtotal.toLocaleString()}</span>
                                </div>

                                <Link
                                    href="/customer/pages/cart"
                                    onClick={onClose}
                                    className="block w-full bg-brand-primary text-white text-center py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-brand-primary/25 hover:bg-brand-hover transition-colors"
                                >
                                    View Cart
                                </Link>
                                <div className="text-center text-[10px] text-gray-400">
                                    Free shipping on orders over Rs.5000
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartSidebar;
