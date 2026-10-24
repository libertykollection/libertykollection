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
  IconButton
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
  Print as PrintIcon
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
    </Box>
  );
};

export default AdminOrdersPage;