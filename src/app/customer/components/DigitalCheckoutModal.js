'use client';
import React, { useState, useEffect } from 'react';
import DownloadProgressModal from './DownloadProgressModal';
import { FiX, FiCheck } from 'react-icons/fi';
import Modal from 'react-modal';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ThreeDots } from 'react-loader-spinner';
import { jwtDecode } from 'jwt-decode';

const DigitalCheckoutModal = ({ isOpen, onRequestClose, product, onSuccess }) => {
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState('');

    // Load PayPal Script
    useEffect(() => {
        if (!isOpen) return;

        const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb';
        const scriptId = 'paypal-sdk-script';

        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
            script.async = true;
            script.onload = () => setIsScriptLoaded(true);
            script.onerror = () => toast.error('PayPal SDK failed to load.');
            document.body.appendChild(script);
        } else if (window.paypal) {
            setIsScriptLoaded(true);
        }
    }, [isOpen]);

    // Fetch User Info
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    setLoading(true);
                    const res = await axios.get(`/api/users/${decoded.id}`);
                    if (res.data) {
                        setUserEmail(res.data.email || '');
                        setUserName(res.data.name || '');
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            }
        };
        if (isOpen) fetchUser();
    }, [isOpen]);

    const handlePayPalRender = () => {
        if (!window.paypal) return;

        // cleanup
        const container = document.getElementById('paypal-digital-container');
        if (!container) return;
        container.innerHTML = '';

        window.paypal.Buttons({
            fundingSource: window.paypal.FUNDING.CARD,
            createOrder: (data, actions) => {
                const price = product.discount
                    ? product.price - (product.price * product.discount / 100)
                    : product.price;

                return actions.order.create({
                    purchase_units: [{
                        amount: { value: price.toFixed(2) },
                        description: `Digital Download: ${product.name}`
                    }]
                });
            },
            onApprove: async (data, actions) => {
                try {
                    const details = await actions.order.capture();
                    await createOrderInBackend(details);
                } catch (err) {
                    console.error(err);
                    toast.error("Payment captured but order creation failed.");
                }
            },
            onError: (err) => {
                console.error(err);
                toast.error('PayPal transaction failed.');
            }
        }).render('#paypal-digital-container');
    };

    useEffect(() => {
        if (isScriptLoaded && isOpen && !purchaseSuccess) {
            handlePayPalRender();
        }
    }, [isScriptLoaded, isOpen, purchaseSuccess]);

    const [isDownloading, setIsDownloading] = useState(false);
    const [activeUrl, setActiveUrl] = useState('');

    const triggerDownload = (url) => {
        setActiveUrl(url);
        setIsDownloading(true);
    };

    const handleDownloadComplete = () => {
        setIsDownloading(false);
        const filename = product.name || 'download';
        const proxyUrl = `/api/download?id=${product.id}`;
        window.location.assign(proxyUrl);

        // Optionally close the checkout modal after some time
        setTimeout(() => {
            onRequestClose();
            onSuccess(); // Ensure state updates on parent
        }, 1500);
    };

    const createOrderInBackend = async (paymentDetails) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            let userId = null;
            if (token) {
                const decoded = jwtDecode(token);
                userId = decoded.id;
            }

            const price = product.discount
                ? product.price - (product.price * product.discount / 100)
                : product.price;

            const orderData = {
                userId: userId,
                shippingAddress: {
                    recipientName: userName || paymentDetails.payer.name.given_name,
                    email: userEmail || paymentDetails.payer.email_address,
                    streetAddress: 'Digital Delivery',
                    city: 'Internet',
                    country: 'Cyberspace',
                    phoneNumber: '0000000000'
                },
                paymentMethod: 'PayPal',
                paymentId: paymentDetails.id,
                items: [{
                    productId: product.id,
                    quantity: 1,
                    price: price,
                    product: { name: product.name },
                    selectedColor: null,
                    selectedSize: null
                }],
                total: price,
                netTotal: price,
                tax: 0,
                deliveryCharge: 0,
                extraDeliveryCharge: 0,
                discount: 0
            };

            await axios.post('/api/orders', orderData);

            // Prepare Auto Download
            let dUrl = '';
            if (product?.digitalData) {
                const data = typeof product.digitalData === 'string' ? JSON.parse(product.digitalData) : product.digitalData;
                const fileUrl = data.files?.[0]?.url;
                if (fileUrl) {
                    dUrl = fileUrl.startsWith('http') ? fileUrl : `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${fileUrl}`;
                    setDownloadUrl(dUrl);
                }
            }

            setPurchaseSuccess(true);
            if (dUrl) {
                setTimeout(() => triggerDownload(dUrl), 500); // Try auto-download
            }
            onSuccess();

        } catch (error) {
            console.error('Order creation error:', error);
            toast.error('Failed to record order. Please contact support.');
            setLoading(false); // Only stop loading on error, keep loading true on success until UI switches? No, setPurchaseSuccess handles UI.
        } finally {
            if (!purchaseSuccess) setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Digital Checkout"
            ariaHideApp={false}
            style={{
                overlay: { zIndex: 10000, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
                content: {
                    zIndex: 10001, margin: 'auto', width: '90%', maxWidth: '500px',
                    height: 'fit-content', maxHeight: '90vh', padding: '0',
                    borderRadius: '24px', border: 'none', background: '#fff'
                }
            }}
        >
            <div className="p-6 relative">
                <button
                    onClick={onRequestClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <FiX size={20} />
                </button>

                {purchaseSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-500">
                            <FiCheck size={40} />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Payment Successful!</h2>
                        <p className="text-gray-500 text-sm mb-8 px-8">
                            Your payment has been processed. Your download should start automatically.
                        </p>

                        {downloadUrl ? (
                            <button
                                onClick={() => triggerDownload(downloadUrl)}
                                className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Now
                            </button>
                        ) : (
                            <p className="text-red-500 font-bold">Download link not available. Please contact support.</p>
                        )}

                        <button
                            onClick={onRequestClose}
                            className="mt-6 text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-black"
                        >
                            Close Window
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-black uppercase tracking-tight mb-2">Secure Checkout</h2>
                        <p className="text-gray-500 text-sm mb-6">Complete your purchase to download instantly.</p>

                        {/* Product Summary */}
                        <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex gap-4 items-center">
                            {product.images?.[0] && (
                                <div className="w-16 h-16 bg-white rounded-xl p-2 border border-gray-100 relative">
                                    <img
                                        src={(() => {
                                            const img = product.images[0];
                                            const url = typeof img === 'string' ? img : img?.url;
                                            if (!url) return '/placeholder.png';
                                            return url.startsWith('http')
                                                ? url
                                                : `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${url}`;
                                        })()}
                                        className="w-full h-full object-contain"
                                        alt={product.name}
                                        loading="lazy"
                                    />
                                </div>
                            )}
                            <div>
                                <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{product.name}</h4>
                                <p className="text-orange-600 font-black">
                                    Rs.{product.discount
                                        ? (product.price - (product.price * product.discount / 100)).toLocaleString()
                                        : product.price.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* PayPal Button Container */}
                        <div className="min-h-[150px] relative">
                            {!isScriptLoaded && (
                                <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
                                    <ThreeDots color="#f97316" height={40} width={40} />
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Secure Payment...</span>
                                </div>
                            )}
                            <div id="paypal-digital-container" className="mt-2"></div>
                        </div>

                        {loading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-3xl">
                                <ThreeDots color="#f97316" height={50} width={50} />
                                <p className="mt-4 font-bold text-gray-800 animate-pulse">Processing Transaction...</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <DownloadProgressModal
                isOpen={isDownloading}
                onRequestClose={() => setIsDownloading(false)}
                fileName={product.name}
                onComplete={handleDownloadComplete}
            />
        </Modal>
    );
};

export default DigitalCheckoutModal;
