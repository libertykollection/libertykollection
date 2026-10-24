'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

// MUI Imports
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Divider,
  Grid,
  Chip,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  ArrowBackIos as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  LocalShipping as ShippingIcon,
  LocationOn as MapPinIcon,
  CheckCircle as SuccessIcon,
  CreditCard as PaymentIcon,
  Inventory as InventoryIcon,
  Print as PrintIcon,
  ReceiptLong as ReceiptIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenInNewIcon,
  VerifiedUser as VerifiedIcon,
  CloudUpload as CloudUploadIcon,
  ZoomIn as ZoomInIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '0px',
    backgroundColor: '#fff',
    fontSize: '0.875rem',
    '& fieldset': {
      borderColor: '#F0DCE3',
    },
    '&:hover fieldset': {
      borderColor: '#C5A059',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#C53261',
      borderWidth: '1px',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    color: '#8C7A70',
    '&.Mui-focused': {
      color: '#C53261',
    },
  },
};

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')) return url;
  return `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${url}`;
};

const AdminOrdersPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`/api/orders/${id}`);
        const orderData = response.data;
        setOrder(orderData);
        setSelectedStatus(orderData.status);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to fetch order details');
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleStatusChange = async () => {
    if (!selectedStatus) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/orders/${id}`, {
        id,
        status: selectedStatus,
      });
      if (response.status === 200) {
        setOrder((prevOrder) => ({ ...prevOrder, status: selectedStatus }));
      } else {
        setError('Failed to update status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [copiedTrx, setCopiedTrx] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const handleCopyTrx = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedTrx(true);
    setTimeout(() => setCopiedTrx(false), 2500);
  };

  const handleApprovePayment = async () => {
    setLoading(true);
    try {
      const response = await axios.put(`/api/orders/${id}`, {
        id,
        status: 'PAID',
      });
      if (response.status === 200) {
        setOrder((prev) => ({ ...prev, status: 'PAID' }));
        setSelectedStatus('PAID');
      }
    } catch (err) {
      console.error('Error approving payment:', err);
      setError('Failed to approve payment status');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReceipt(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post('/api/upload', formData);
      const uploadedUrl = res.data?.url;
      if (uploadedUrl) {
        let currentInfo = {};
        if (order.paymentInfo) {
          try {
            currentInfo = typeof order.paymentInfo === 'string' ? JSON.parse(order.paymentInfo) : order.paymentInfo;
          } catch (err) {
            currentInfo = {};
          }
        }
        const updatedInfo = {
          ...currentInfo,
          receiptUrl: uploadedUrl,
          type: currentInfo?.type || 'manual_payment',
          uploadedByAdmin: true,
          updatedAt: new Date().toISOString()
        };
        await axios.put(`/api/orders/${id}`, {
          id,
          paymentInfo: updatedInfo,
        });
        setOrder((prev) => ({ ...prev, paymentInfo: JSON.stringify(updatedInfo) }));
      }
    } catch (err) {
      console.error('Admin receipt upload failed:', err);
      setError('Failed to upload receipt');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/shipping', {
        email: order.email,
        orderId: order.id,
        shippingMethod: order.shippingMethod,
        shippingTerms: order.shippingTerms,
        shipmentDate: order.shipmentDate,
        deliveryDate: order.deliveryDate,
      });
      if (response.status === 200) {
        setOrder((prevOrder) => ({
          ...prevOrder,
          shippingMethod: order.shippingMethod,
          shippingTerms: order.shippingTerms,
          shipmentDate: order.shipmentDate,
          deliveryDate: order.deliveryDate,
        }));
      } else {
        setError('Failed to update shipping information. Please try again.');
      }
    } catch (error) {
      console.error('Error updating shipping information:', error);
      setError('Failed to update shipping information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', zIndex: 9999 }}>
        <Box className="s2u-progress-bar-primary" sx={{ height: '100%', bgcolor: '#C53261' }} />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box sx={{ p: 4, bgcolor: '#FBF9F7', minHeight: '100vh', textAlign: 'center' }}>
        <Typography color="error" sx={{ fontWeight: 700 }}>{error || 'Order record not found.'}</Typography>
        <Button onClick={() => router.back()} sx={{ mt: 2, color: '#141311', borderRadius: '0px' }}>Go Back</Button>
      </Box>
    );
  }

  // Calculate order amounts directly from order data
  const subtotal = order.orderItems?.reduce((acc, item) => acc + item.quantity * item.price, 0) || 0;
  const subtotalLessDiscount = subtotal - (order.discount ?? 0);
  const totalTax = order.tax ?? 0;
  const total =
    subtotalLessDiscount +
    totalTax +
    (order.deliveryCharge ?? 0) +
    (order.extraDeliveryCharge ?? 0) +
    (order.otherCharges ?? 0);

  // Extract Payment Proof & Manual Payment Details
  let paymentData = null;
  if (order.paymentInfo) {
    try {
      paymentData = typeof order.paymentInfo === 'string' ? JSON.parse(order.paymentInfo) : order.paymentInfo;
    } catch (e) {
      paymentData = { raw: order.paymentInfo };
    }
  }

  const receiptUrl = paymentData?.receiptUrl || paymentData?.receipt || paymentData?.image || null;
  const transactionId = paymentData?.transactionId || paymentData?.id || paymentData?.trxId || order.paymentId || null;
  const paidAmount = paymentData?.amount !== undefined ? paymentData?.amount : null;
  const bankName = paymentData?.bankName || null;
  const senderNote = paymentData?.senderNote || null;
  const submittedAt = paymentData?.submittedAt || null;

  return (
    <Box sx={{ bgcolor: '#FBF9F7', minHeight: '100vh', p: { xs: 2.5, md: 4 } }}>
      {/* Top Header & Navigation */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => router.back()}
            sx={{
              borderRadius: '0px',
              bgcolor: '#fff',
              color: '#141311',
              border: '1px solid #F0DCE3',
              p: 1.25,
              '&:hover': { bgcolor: '#141311', color: '#fff' }
            }}
          >
            <ArrowBackIcon sx={{ fontSize: '0.9rem', ml: 0.5 }} />
          </IconButton>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: '0.15em', fontWeight: 700, color: '#C53261', display: 'block', mb: 0.2 }}>
              Admin Console • Order Details
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif', letterSpacing: '-0.02em' }}>
              Order #{order.id}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => window.print()}
            startIcon={<PrintIcon />}
            sx={{
              borderRadius: '0px',
              borderColor: '#F0DCE3',
              color: '#141311',
              bgcolor: '#fff',
              px: 3,
              py: 1,
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              '&:hover': { borderColor: '#C53261', bgcolor: '#FBF9F7' }
            }}
          >
            Print Packing Slip
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
        {/* Main Details Card */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: '0px',
            border: '1px solid #F0DCE3',
            bgcolor: '#fff'
          }}
        >
          <Grid container spacing={3.5}>
            {/* General Information Section */}
            <Grid item xs={12} lg={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ p: 1, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261', display: 'flex' }}>
                  <CalendarIcon sx={{ fontSize: '1.25rem' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#141311', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  General Information
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#8C7A70', fontWeight: 700, minWidth: '110px', fontSize: '0.85rem' }}>
                    Date Created:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#141311', fontWeight: 600, fontSize: '0.85rem' }}>
                    {new Date(order.createdAt).toLocaleString('en-US', {
                      dateStyle: 'long',
                      timeStyle: 'short'
                    })}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#8C7A70', fontWeight: 700, minWidth: '110px', fontSize: '0.85rem' }}>
                    Fulfillment Status:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 150, ...inputStyles }}>
                      <Select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              borderRadius: '0px',
                              border: '1px solid #F0DCE3',
                              '& .MuiMenuItem-root': { fontSize: '0.85rem' }
                            }
                          }
                        }}
                      >
                        <MenuItem value="PENDING">Pending Action</MenuItem>
                        <MenuItem value="PAID">Paid / Confirmed</MenuItem>
                        <MenuItem value="SHIPPED">Shipped via Courier</MenuItem>
                        <MenuItem value="COMPLETED">Delivered & Closed</MenuItem>
                        <MenuItem value="CANCELLED">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      onClick={handleStatusChange}
                      disabled={loading || !selectedStatus || selectedStatus === order.status}
                      sx={{
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderRadius: '0px',
                        bgcolor: '#141311',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        px: 2.5,
                        py: 0.9,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#2A1824', boxShadow: 'none' }
                      }}
                    >
                      Update
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#8C7A70', fontWeight: 700, minWidth: '110px', fontSize: '0.85rem' }}>
                    Customer:
                  </Typography>
                  <Chip
                    icon={<PersonIcon sx={{ fontSize: '1rem !important', color: '#C53261' }} />}
                    label={order.user?.name || `Customer ID: ${order.userId || 'Guest'}`}
                    size="small"
                    sx={{
                      borderRadius: '0px',
                      bgcolor: '#FBF9F7',
                      border: '1px solid #F0DCE3',
                      fontWeight: 700,
                      color: '#141311',
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#8C7A70', fontWeight: 700, minWidth: '110px', fontSize: '0.85rem' }}>
                    Payment Method:
                  </Typography>
                  <Chip
                    label={order.paymentMethod || 'Cash on Delivery (COD)'}
                    size="small"
                    sx={{
                      borderRadius: '0px',
                      bgcolor: '#FBF9F7',
                      border: '1px solid #F0DCE3',
                      fontWeight: 700,
                      color: '#141311',
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Shipping Address Section */}
            <Grid item xs={12} lg={6}>
              <Box
                sx={{
                  bgcolor: '#FBF9F7',
                  borderRadius: '0px',
                  border: '1px solid #F0DCE3',
                  p: 3,
                  height: '100%'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <Box sx={{ p: 1, bgcolor: '#fff', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261', display: 'flex' }}>
                    <MapPinIcon sx={{ fontSize: '1.25rem' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#141311', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Customer Shipping Address
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <MapPinIcon sx={{ color: '#C5A059', fontSize: '1.25rem', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#141311', fontWeight: 700, mb: 0.5, fontSize: '0.85rem' }}>
                        Delivery Destination
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#8C7A70', lineHeight: 1.6, fontSize: '0.85rem' }}>
                        {order.streetAddress || order.address || 'Standard Address'}{order.apartmentSuite && `, ${order.apartmentSuite}`}, {order.city || 'Karachi'}, {order.state || 'Sindh'} {order.zip || ''}, {order.country || 'Pakistan'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <EmailIcon sx={{ color: '#C5A059', fontSize: '1.25rem', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#141311', fontWeight: 700, mb: 0.5, fontSize: '0.85rem' }}>
                        Contact Channel
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#C53261', fontWeight: 600, fontSize: '0.85rem' }}>
                        {order.email || order.user?.email || 'N/A'} {order.phone && `• ${order.phone}`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Section: Payment Settlement & Receipt Proof */}
          <Box sx={{ mt: 5, pt: 4, borderTop: '1px solid #F0DCE3' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261', display: 'flex' }}>
                  <ReceiptIcon sx={{ fontSize: '1.25rem' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#141311', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Payment Proof & Settlement Details
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8C7A70', fontSize: '0.75rem' }}>
                    Verify manual transaction receipt, pre-payment proof, and reference ID
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {order.status === 'PAID' || order.status === 'CONFIRMED' ? (
                  <Chip
                    icon={<VerifiedIcon sx={{ fontSize: '1rem !important', color: '#166534' }} />}
                    label="Payment Verified & Approved"
                    size="small"
                    sx={{
                      borderRadius: '0px',
                      bgcolor: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      fontWeight: 800,
                      color: '#166534',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase'
                    }}
                  />
                ) : (
                  <Chip
                    label="Payment Verification Pending"
                    size="small"
                    sx={{
                      borderRadius: '0px',
                      bgcolor: '#FFF5F8',
                      border: '1px solid #F0DCE3',
                      fontWeight: 800,
                      color: '#C53261',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase'
                    }}
                  />
                )}

                {order.status === 'PENDING' && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleApprovePayment}
                    startIcon={<SuccessIcon sx={{ fontSize: '1rem' }} />}
                    sx={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      borderRadius: '0px',
                      bgcolor: '#166534',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      px: 2,
                      py: 0.7,
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#14532D', boxShadow: 'none' }
                    }}
                  >
                    Approve Payment
                  </Button>
                )}
              </Box>
            </Box>

            <Grid container spacing={3}>
              {/* Payment Attributes Box */}
              <Grid item xs={12} md={7}>
                <Box
                  sx={{
                    bgcolor: '#FBF9F7',
                    border: '1px solid #F0DCE3',
                    p: 3,
                    borderRadius: '0px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 2.5
                  }}
                >
                  <Grid container spacing={2}>
                    {/* Transaction ID */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.5 }}>
                        Transaction ID / Reference #
                      </Typography>
                      {transactionId ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#fff', border: '1px solid #F0DCE3', px: 1.5, py: 1 }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#141311', fontSize: '0.9rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {transactionId}
                          </Typography>
                          <Tooltip title={copiedTrx ? "Copied!" : "Copy Reference"}>
                            <IconButton size="small" onClick={() => handleCopyTrx(transactionId)} sx={{ color: '#C53261' }}>
                              <CopyIcon sx={{ fontSize: '1rem' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#8C7A70', fontStyle: 'italic', bgcolor: '#fff', border: '1px solid #F0DCE3', p: 1 }}>
                          Not Provided (Standard COD)
                        </Typography>
                      )}
                    </Grid>

                    {/* Paid Amount */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.5 }}>
                        Declared Paid Amount
                      </Typography>
                      <Box sx={{ bgcolor: '#fff', border: '1px solid #F0DCE3', px: 1.5, py: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#C53261', fontSize: '0.9rem' }}>
                          {paidAmount !== null ? `${Number(paidAmount).toLocaleString()} PKR` : `${(order.netTotal || order.total).toLocaleString()} PKR (Payable)`}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Payment Method / Channel */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.5 }}>
                        Payment Method & Channel
                      </Typography>
                      <Box sx={{ bgcolor: '#fff', border: '1px solid #F0DCE3', px: 1.5, py: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.85rem' }}>
                          {order.paymentMethod || 'Manual Payment'}
                        </Typography>
                        {bankName && (
                          <Typography variant="caption" sx={{ color: '#8C7A70', display: 'block' }}>
                            Channel: {bankName}
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    {/* Sender Details / Timestamp */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.5 }}>
                        Sender Notes & Date
                      </Typography>
                      <Box sx={{ bgcolor: '#fff', border: '1px solid #F0DCE3', px: 1.5, py: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#141311', fontSize: '0.8rem' }}>
                          {senderNote || 'Standard Checkout Submission'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#8C7A70', display: 'block' }}>
                          {submittedAt ? new Date(submittedAt).toLocaleString() : new Date(order.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Manual Admin Receipt Upload / Replace Button */}
                  <Box sx={{ pt: 1.5, borderTop: '1px solid #F0DCE3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ color: '#8C7A70' }}>
                      Admin proof management: Upload or update customer bank slip
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      component="label"
                      disabled={uploadingReceipt}
                      startIcon={<CloudUploadIcon sx={{ fontSize: '1rem' }} />}
                      sx={{
                        textTransform: 'uppercase',
                        borderRadius: '0px',
                        borderColor: '#F0DCE3',
                        color: '#141311',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        '&:hover': { borderColor: '#C53261', bgcolor: '#fff' }
                      }}
                    >
                      {uploadingReceipt ? 'Uploading...' : (receiptUrl ? 'Replace Receipt' : 'Attach Receipt')}
                      <input type="file" hidden accept="image/*,application/pdf" onChange={handleAdminReceiptUpload} />
                    </Button>
                  </Box>
                </Box>
              </Grid>

              {/* Receipt Image Proof Card */}
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    bgcolor: '#fff',
                    border: '1px solid #F0DCE3',
                    p: 2.5,
                    borderRadius: '0px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1.5 }}>
                    Proof of Payment Receipt Document
                  </Typography>

                  {receiptUrl ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <Box
                        onClick={() => setIsReceiptModalOpen(true)}
                        sx={{
                          position: 'relative',
                          width: '100%',
                          height: 220,
                          bgcolor: '#FBF9F7',
                          border: '1px solid #F0DCE3',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          '&:hover .zoom-overlay': { opacity: 1 }
                        }}
                      >
                        <Image
                          src={getImageUrl(receiptUrl)}
                          alt="Payment Receipt"
                          fill
                          style={{ objectFit: 'contain' }}
                          unoptimized
                        />
                        <Box
                          className="zoom-overlay"
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            bgcolor: 'rgba(20, 19, 17, 0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            color: '#fff',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em'
                          }}
                        >
                          <ZoomInIcon sx={{ fontSize: '1.4rem' }} />
                          <span>Click to Inspect Full Size</span>
                        </Box>
                      </Box>

                      <Box sx={{ mt: 2, display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setIsReceiptModalOpen(true)}
                          startIcon={<ZoomInIcon sx={{ fontSize: '0.9rem' }} />}
                          sx={{
                            textTransform: 'uppercase',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            borderRadius: '0px',
                            borderColor: '#F0DCE3',
                            color: '#141311',
                            '&:hover': { borderColor: '#C53261', bgcolor: '#FBF9F7' }
                          }}
                        >
                          View Full Image
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          component="a"
                          href={getImageUrl(receiptUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<OpenInNewIcon sx={{ fontSize: '0.9rem' }} />}
                          sx={{
                            textTransform: 'uppercase',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            borderRadius: '0px',
                            borderColor: '#F0DCE3',
                            color: '#C53261',
                            '&:hover': { borderColor: '#C53261', bgcolor: '#FFF5F8' }
                          }}
                        >
                          Open in Tab
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        flex: 1,
                        border: '1px dashed #E0CBD4',
                        bgcolor: '#FBF9F7',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 4,
                        textAlign: 'center',
                        gap: 1.5
                      }}
                    >
                      <ReceiptIcon sx={{ fontSize: 36, color: '#C5A059' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311' }}>
                          No Receipt Image Uploaded
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#8C7A70', display: 'block', maxWidth: 220, mx: 'auto', mt: 0.5 }}>
                          Customer selected {order.paymentMethod || 'Cash on Delivery'}. If proof is received, use Attach Receipt button.
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Shipping Information & Tracking Form */}
          <Box sx={{ mt: 5, pt: 4, borderTop: '1px solid #F0DCE3' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={{ p: 1, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261', display: 'flex' }}>
                <ShippingIcon sx={{ fontSize: '1.25rem' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#141311', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Courier Dispatch & Tracking
              </Typography>
            </Box>

            <form onSubmit={handleShippingSubmit}>
              <Grid container spacing={2.5}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Courier Service"
                    placeholder="e.g. TCS, Leopards, Trax, DHL"
                    value={order.shippingMethod || ''}
                    onChange={(e) => setOrder((prevOrder) => ({ ...prevOrder, shippingMethod: e.target.value }))}
                    sx={inputStyles}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tracking Number / Consignment ID"
                    placeholder="e.g. TRK-98421482"
                    value={order.shippingTerms || ''}
                    onChange={(e) => setOrder((prevOrder) => ({ ...prevOrder, shippingTerms: e.target.value }))}
                    sx={inputStyles}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Shipment Date"
                    type="date"
                    value={order.shipmentDate ? new Date(order.shipmentDate).toISOString().substr(0, 10) : ''}
                    onChange={(e) =>
                      setOrder((prevOrder) => ({
                        ...prevOrder,
                        shipmentDate: e.target.value,
                      }))
                    }
                    InputLabelProps={{ shrink: true }}
                    sx={inputStyles}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Estimated Delivery Date"
                    type="date"
                    value={order.deliveryDate ? new Date(order.deliveryDate).toISOString().substr(0, 10) : ''}
                    onChange={(e) =>
                      setOrder((prevOrder) => ({
                        ...prevOrder,
                        deliveryDate: e.target.value,
                      }))
                    }
                    InputLabelProps={{ shrink: true }}
                    sx={inputStyles}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SuccessIcon />}
                  sx={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    borderRadius: '0px',
                    bgcolor: '#141311',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    px: 3.5,
                    py: 1.2,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#2A1824', boxShadow: 'none' }
                  }}
                >
                  Save Shipping & Tracking
                </Button>
              </Box>
            </form>
          </Box>

          {/* Line Items Table */}
          <Box sx={{ mt: 5, pt: 4, borderTop: '1px solid #F0DCE3' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#141311', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 2.5 }}>
              Purchased Cosmetics Products ({order.orderItems?.length || 0})
            </Typography>
            <TableContainer sx={{ border: '1px solid #F0DCE3', borderRadius: '0px', overflowX: 'auto', mb: 3 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#FBF9F7' }}>
                    <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #F0DCE3' }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #F0DCE3' }}>Shade & Details</TableCell>
                    <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #F0DCE3' }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #F0DCE3' }}>Unit Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #F0DCE3' }}>Line Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.orderItems?.map((item, idx) => (
                    <TableRow key={item.id || idx} sx={{ bgcolor: idx % 2 === 0 ? '#fff' : '#FAF8F6', borderBottom: '1px solid #F0DCE3' }}>
                      <TableCell sx={{ borderBottom: '1px solid #F0DCE3' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {item.product && item.product.images && item.product.images.length > 0 ? (
                            <Box sx={{
                              position: 'relative',
                              width: 52,
                              height: 52,
                              borderRadius: '0px',
                              overflow: 'hidden',
                              border: '1px solid #F0DCE3',
                              flexShrink: 0,
                              bgcolor: '#FBF9F7'
                            }}>
                              <Image
                                fill
                                src={getImageUrl(item.product.images[0].url)}
                                alt={item.product.name}
                                style={{ objectFit: 'cover' }}
                                unoptimized={item.product.images[0].url?.includes('rapidtechpro.com')}
                              />
                            </Box>
                          ) : (
                            <Box sx={{
                              width: 52,
                              height: 52,
                              bgcolor: '#FBF9F7',
                              border: '1px solid #F0DCE3',
                              borderRadius: '0px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#C5A059',
                              flexShrink: 0
                            }}>
                              <InventoryIcon sx={{ fontSize: '1.2rem' }} />
                            </Box>
                          )}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.85rem' }}>
                              {item.product ? item.product.name : 'Cosmetics Item'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#8C7A70', fontSize: '0.75rem' }}>
                              SKU / ID: #{item.productId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #F0DCE3' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {item.selectedColor && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 10, height: 10, borderRadius: '0px', bgcolor: item.selectedColor }} />
                              <Typography variant="caption" sx={{ color: '#141311', fontWeight: 600 }}>{item.selectedColor}</Typography>
                            </Box>
                          )}
                          {item.selectedSize && (
                            <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600 }}>Volume: {item.selectedSize}</Typography>
                          )}
                          {!item.selectedColor && !item.selectedSize && (
                            <Typography variant="caption" sx={{ color: '#8C7A70' }}>Standard formulation</Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #F0DCE3' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311' }}>
                          × {item.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #F0DCE3' }}>
                        <Typography variant="body2" sx={{ color: '#8C7A70', fontWeight: 600 }}>
                          {item.price?.toLocaleString()} PKR
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ borderBottom: '1px solid #F0DCE3' }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#141311' }}>
                          {(item.quantity * item.price).toLocaleString()} PKR
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Order Financial Breakdown */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Box
              sx={{
                width: { xs: '100%', md: '440px' },
                bgcolor: '#FBF9F7',
                p: 3,
                borderRadius: '0px',
                border: '1px solid #F0DCE3',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#8C7A70', fontSize: '0.85rem' }}>Subtotal</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.85rem' }}>
                  {subtotal.toLocaleString()} PKR
                </Typography>
              </Box>

              {order.discount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#C53261', fontSize: '0.85rem' }}>Coupon / Discount</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#C53261', fontSize: '0.85rem' }}>
                    - {order.discount.toLocaleString()} PKR
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#8C7A70', fontSize: '0.85rem' }}>Delivery & Handling</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.85rem' }}>
                  {((order.deliveryCharge ?? 0) + (order.extraDeliveryCharge ?? 0)).toLocaleString()} PKR
                </Typography>
              </Box>

              {order.tax > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#8C7A70', fontSize: '0.85rem' }}>Tax / Duty</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.85rem' }}>
                    {order.tax.toLocaleString()} PKR
                  </Typography>
                </Box>
              )}

              <Box sx={{
                mt: 1.5,
                p: 2,
                bgcolor: '#141311',
                borderRadius: '0px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#fff'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PaymentIcon sx={{ color: '#C53261', fontSize: '1.25rem' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#C5A059', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                      Grand Total Payable
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>
                      Invoice Balance
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', fontFamily: 'serif' }}>
                  {Math.round(total).toLocaleString()} PKR
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* High-Resolution Receipt Proof Inspection Lightbox Modal */}
      <Dialog
        open={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '0px', border: '1px solid #F0DCE3', overflow: 'hidden' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid #F0DCE3' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ReceiptIcon sx={{ color: '#C53261' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Order #{order?.id} • Payment Proof Receipt
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setIsReceiptModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, bgcolor: '#141311', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 450 }}>
          {receiptUrl && (
            <img
              src={getImageUrl(receiptUrl)}
              alt={`Receipt Order #${order?.id}`}
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #F0DCE3', bgcolor: '#FBF9F7', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" sx={{ color: '#8C7A70', fontFamily: 'monospace' }}>
            Reference: {transactionId || 'N/A'} • Amount: {paidAmount !== null ? `${Number(paidAmount).toLocaleString()} PKR` : `${(order.netTotal || order.total).toLocaleString()} PKR`}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              component="a"
              href={getImageUrl(receiptUrl)}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="small"
              sx={{ borderRadius: '0px', borderColor: '#F0DCE3', color: '#141311', fontWeight: 700 }}
            >
              Open Original
            </Button>
            <Button
              onClick={() => setIsReceiptModalOpen(false)}
              variant="contained"
              size="small"
              sx={{ borderRadius: '0px', bgcolor: '#141311', color: '#fff', fontWeight: 700 }}
            >
              Close
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminOrdersPage;