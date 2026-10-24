'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// MUI Imports
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TablePagination,
  Chip,
  Avatar,
  Divider,
  InputAdornment,
  Grid,
  Stack,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Inventory as InventoryIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  ShoppingBag as ShoppingBagIcon,
  AttachMoney as MoneyIcon,
  HourglassEmpty as PendingIcon,
  CheckCircleOutline as CompletedIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon
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

// Luxury Cosmetics Status Style Helper
const getStatusStyles = (status) => {
  const s = status?.toLowerCase() || '';
  if (s.includes('pending')) {
    return { bgcolor: '#FBF9F7', color: '#C53261', border: '1px solid #F0DCE3' };
  }
  if (s.includes('confirmed') || s.includes('paid')) {
    return { bgcolor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' };
  }
  if (s.includes('shipped')) {
    return { bgcolor: '#F5F3FF', color: '#6B21A8', border: '1px solid #DDD6FE' };
  }
  if (s.includes('completed')) {
    return { bgcolor: '#141311', color: '#fff', border: '1px solid #141311' };
  }
  if (s.includes('cancelled')) {
    return { bgcolor: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' };
  }
  return { bgcolor: '#FBF9F7', color: '#8C7A70', border: '1px solid #F0DCE3' };
};

// Payment Method Helper
const getPaymentMethodStyles = (method) => {
  const m = method?.toLowerCase() || '';
  if (m.includes('bank')) return { color: '#6B21A8', bgcolor: '#F5F3FF', border: '1px solid #E9D5FF' };
  if (m.includes('cod') || m.includes('cash')) return { color: '#166534', bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' };
  if (m.includes('card') || m.includes('stripe') || m.includes('paypal')) return { color: '#C53261', bgcolor: '#FBF9F7', border: '1px solid #F0DCE3' };
  return { color: '#8C7A70', bgcolor: '#FBF9F7', border: '1px solid #F0DCE3' };
};

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')) return url;
  return `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${url}`;
};

const FilterableTable = ({ data = [], fetchData }) => {
  const [filter, setFilter] = useState('');
  const [statusTab, setStatusTab] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [newItem, setNewItem] = useState({
    id: null,
    userId: '',
    total: '',
    status: 'PENDING',
    orderItems: [],
    image: null,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const router = useRouter();

  // Compute status counts
  const counts = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return {
      all: list.length,
      pending: list.filter(o => o.status?.toUpperCase() === 'PENDING').length,
      paid: list.filter(o => ['PAID', 'CONFIRMED'].includes(o.status?.toUpperCase())).length,
      shipped: list.filter(o => o.status?.toUpperCase() === 'SHIPPED').length,
      completed: list.filter(o => o.status?.toUpperCase() === 'COMPLETED').length,
      cancelled: list.filter(o => o.status?.toUpperCase() === 'CANCELLED').length,
    };
  }, [data]);

  // Total gross revenue
  const totalRevenue = useMemo(() => {
    if (!Array.isArray(data)) return 0;
    return data.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);
  }, [data]);

  // Filtered orders based on Tab and Search query
  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .filter((item) => {
        // Tab filter
        if (statusTab === 'PENDING' && item.status?.toUpperCase() !== 'PENDING') return false;
        if (statusTab === 'PAID' && !['PAID', 'CONFIRMED'].includes(item.status?.toUpperCase())) return false;
        if (statusTab === 'SHIPPED' && item.status?.toUpperCase() !== 'SHIPPED') return false;
        if (statusTab === 'COMPLETED' && item.status?.toUpperCase() !== 'COMPLETED') return false;
        if (statusTab === 'CANCELLED' && item.status?.toUpperCase() !== 'CANCELLED') return false;

        // Search text
        if (!filter.trim()) return true;
        const term = filter.toLowerCase();
        return (
          String(item.id).toLowerCase().includes(term) ||
          (item.user?.name && item.user.name.toLowerCase().includes(term)) ||
          (item.recipientName && item.recipientName.toLowerCase().includes(term)) ||
          (item.email && item.email.toLowerCase().includes(term)) ||
          (item.paymentMethod && item.paymentMethod.toLowerCase().includes(term)) ||
          (item.status && item.status.toLowerCase().includes(term))
        );
      })
      .sort((a, b) => b.id - a.id);
  }, [data, filter, statusTab]);

  const handleRowClick = (id) => {
    router.push(`/admin/pages/orders/${id}`);
  };

  const handleAddNewItem = async () => {
    setIsFetching(true);
    try {
      let uploadedReceiptUrl = '';
      if (newItem.image) {
        const uploadData = new FormData();
        uploadData.append('file', newItem.image);
        try {
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: uploadData,
          });
          if (uploadRes.ok) {
            const resJson = await uploadRes.json();
            uploadedReceiptUrl = resJson.url || '';
          }
        } catch (uploadErr) {
          console.error('Receipt upload failed:', uploadErr);
        }
      }

      const manualDetails = {
        type: 'manual_payment',
        transactionId: newItem.transactionId || '',
        amount: Number(newItem.paidAmount || newItem.total) || 0,
        receiptUrl: uploadedReceiptUrl,
        bankName: newItem.bankName || 'Direct Bank Transfer',
        submittedAt: new Date().toISOString(),
        uploadedByAdmin: true,
      };

      if (newItem.id) {
        // Edit existing order
        const payload = {
          id: newItem.id,
          userId: newItem.userId ? parseInt(newItem.userId) : null,
          total: Number(newItem.total) || 0,
          status: newItem.status,
          paymentMethod: newItem.paymentMethod || 'Manual Payment',
          paymentInfo: manualDetails
        };
        await fetch(`/api/orders/${newItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new order
        const payload = {
          userId: newItem.userId ? parseInt(newItem.userId) : null,
          total: Number(newItem.total) || 0,
          netTotal: Number(newItem.total) || 0,
          status: newItem.status || (newItem.paymentMethod === 'Manual Payment' ? 'PENDING' : 'PAID'),
          paymentMethod: newItem.paymentMethod || 'Manual Payment',
          paymentInfo: manualDetails,
          paymentId: newItem.transactionId || null,
          shippingAddress: {
            recipientName: newItem.recipientName || 'Walk-in / Phone Customer',
            phoneNumber: newItem.phoneNumber || '+92',
            email: newItem.email || 'customer@gloriacosmetics.shop',
            city: newItem.city || 'Karachi',
            streetAddress: newItem.streetAddress || 'Direct In-Store / Admin Order',
            state: 'Sindh',
            country: 'Pakistan',
            zip: '75000'
          },
          items: newItem.orderItems && newItem.orderItems.length > 0 ? newItem.orderItems.map((item) => ({
            productId: parseInt(item.productId, 10),
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
          })) : [
            {
              productId: 1,
              quantity: 1,
              price: Number(newItem.total) || 0
            }
          ]
        };

        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (fetchData) {
        await fetchData();
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleDeleteItem = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete order #${id}?`)) {
      return;
    }
    setIsFetching(true);
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (fetchData) await fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
    setIsFetching(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ bgcolor: '#FBF9F7', minHeight: '100vh', p: { xs: 2.5, md: 4 } }}>
      {/* Top Loading Line */}
      {isFetching && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', zIndex: 9999 }}>
          <Box className="s2u-progress-bar-primary" sx={{ height: '100%', bgcolor: '#C53261' }} />
        </Box>
      )}

      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ letterSpacing: '0.15em', fontWeight: 700, color: '#C53261', display: 'block', mb: 0.5 }}>
            Admin Console • Sales Operations
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif', letterSpacing: '-0.02em' }}>
            Orders & Fulfillment
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', mt: 0.5 }}>
            Manage customer transactions, tracking status, shipping updates, and invoices.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => {
            setNewItem({
              id: null,
              userId: '',
              recipientName: '',
              phoneNumber: '',
              email: '',
              city: 'Karachi',
              streetAddress: '',
              total: '',
              paidAmount: '',
              status: 'PENDING',
              paymentMethod: 'Manual Payment',
              transactionId: '',
              bankName: 'Meezan Bank',
              orderItems: [],
              image: null,
              receiptPreview: null,
            });
            setIsModalOpen(true);
          }}
          startIcon={<AddIcon />}
          sx={{
            bgcolor: '#141311',
            color: '#fff',
            borderRadius: '0px',
            px: 3.5,
            py: 1.25,
            fontWeight: 700,
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#2A1824',
              boxShadow: 'none',
            },
          }}
        >
          Create Manual Order
        </Button>
      </Box>

      {/* Metric Cards Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #F0DCE3', borderRadius: '0px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261' }}>
              <MoneyIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Total Order Value
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#141311' }}>
                {Math.round(totalRevenue).toLocaleString()} PKR
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #F0DCE3', borderRadius: '0px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261' }}>
              <ShoppingBagIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Total Volume
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#141311' }}>
                {counts.all} Orders
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #F0DCE3', borderRadius: '0px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261' }}>
              <PendingIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Action Pending
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#C53261' }}>
                {counts.pending} Orders
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #F0DCE3', borderRadius: '0px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261' }}>
              <CompletedIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Fulfilled
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#166534' }}>
                {counts.completed} Orders
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Table Paper */}
      <Paper elevation={0} sx={{ bgcolor: '#fff', border: '1px solid #F0DCE3', borderRadius: '0px', overflow: 'hidden' }}>
        {/* Status Filter Tabs */}
        <Box sx={{ borderBottom: '1px solid #F0DCE3', bgcolor: '#FBF9F7', px: 2 }}>
          <Tabs
            value={statusTab}
            onChange={(e, val) => {
              setStatusTab(val);
              setPage(0);
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: '48px',
              '& .MuiTabs-indicator': {
                bgcolor: '#141311',
                height: '2px',
              },
              '& .MuiTab-root': {
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#8C7A70',
                minHeight: '48px',
                py: 0,
                px: 2,
                '&.Mui-selected': {
                  color: '#141311',
                },
              },
            }}
          >
            <Tab value="ALL" label={`All (${counts.all})`} />
            <Tab value="PENDING" label={`Pending (${counts.pending})`} />
            <Tab value="PAID" label={`Paid / Confirmed (${counts.paid})`} />
            <Tab value="SHIPPED" label={`Shipped (${counts.shipped})`} />
            <Tab value="COMPLETED" label={`Completed (${counts.completed})`} />
            <Tab value="CANCELLED" label={`Cancelled (${counts.cancelled})`} />
          </Tabs>
        </Box>

        {/* Search Bar */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid #F0DCE3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, bgcolor: '#fff' }}>
          <TextField
            size="small"
            placeholder="Search orders by ID, customer name, email, or payment method..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ width: { xs: '100%', sm: 420 }, ...inputStyles }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#8C7A70', fontSize: '1.15rem' }} />
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
            Showing {paginatedData.length} of {filteredData.length} orders
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer sx={{ maxHeight: '65vh', overflowX: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: '80px' }}>
                  Order
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: '80px' }}>
                  Item
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3' }}>
                  Customer
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3' }}>
                  Total Amount
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3' }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3' }}>
                  Date & Time
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3' }}>
                  Payment
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: '130px' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow
                    key={item.id}
                    onClick={() => handleRowClick(item.id)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: index % 2 === 0 ? '#fff' : '#FAF8F6',
                      '&:hover': { bgcolor: '#F5EFEB' },
                      borderBottom: '1px solid #F0DCE3',
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: '#141311', fontSize: '0.85rem', borderBottom: '1px solid #F0DCE3' }}>
                      #{item.id}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #F0DCE3' }}>
                      {item.orderItems && item.orderItems.length > 0 && item.orderItems[0].product?.images?.[0] ? (
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            border: '1px solid #F0DCE3',
                            borderRadius: '0px',
                            overflow: 'hidden',
                            position: 'relative',
                            bgcolor: '#FBF9F7',
                          }}
                        >
                          <Image
                            src={getImageUrl(item.orderItems[0].product.images[0].url)}
                            alt="Product"
                            fill
                            style={{ objectFit: 'cover' }}
                            unoptimized={item.orderItems[0].product.images[0].url?.includes('rapidtechpro.com')}
                          />
                        </Box>
                      ) : (
                        <Box sx={{ width: 44, height: 44, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <InventoryIcon sx={{ fontSize: 18, color: '#C5A059' }} />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #F0DCE3' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 30,
                            height: 30,
                            bgcolor: '#141311',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderRadius: '0px',
                          }}
                        >
                          {(item.user?.name || item.recipientName || 'G').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.85rem' }}>
                            {item.user?.name || item.recipientName || 'Guest Shopper'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#8C7A70', fontSize: '0.75rem' }}>
                            {item.email && item.email !== 'N/A' ? item.email : `User #${item.userId || 'Guest'}`}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#141311', fontSize: '0.85rem', borderBottom: '1px solid #F0DCE3' }}>
                      {parseFloat(item.total || 0).toLocaleString()} PKR
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottom: '1px solid #F0DCE3' }}>
                      <Chip
                        label={item.status || 'PENDING'}
                        size="small"
                        sx={{
                          ...getStatusStyles(item.status),
                          borderRadius: '0px',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          px: 0.5,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#8C7A70', fontSize: '0.8rem', borderBottom: '1px solid #F0DCE3' }}>
                      {new Date(item.updatedAt || item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      <br />
                      <Typography variant="caption" sx={{ color: '#8C7A70', fontSize: '0.7rem' }}>
                        {new Date(item.updatedAt || item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #F0DCE3' }}>
                      <Chip
                        label={item.paymentMethod || 'COD'}
                        size="small"
                        sx={{
                          ...getPaymentMethodStyles(item.paymentMethod),
                          borderRadius: '0px',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: '1px solid #F0DCE3' }}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(item.id);
                          }}
                          sx={{
                            borderRadius: '0px',
                            color: '#141311',
                            border: '1px solid #F0DCE3',
                            p: 0.75,
                            '&:hover': { bgcolor: '#141311', color: '#fff' },
                          }}
                        >
                          <VisibilityIcon sx={{ fontSize: '0.95rem' }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleDeleteItem(e, item.id)}
                          sx={{
                            borderRadius: '0px',
                            color: '#C53261',
                            border: '1px solid #F0DCE3',
                            p: 0.75,
                            '&:hover': { bgcolor: '#EF4444', color: '#fff', borderColor: '#EF4444' },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: '0.95rem' }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 8, color: '#8C7A70' }}>
                    <ShoppingBagIcon sx={{ fontSize: '2.5rem', color: '#C5A059', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#141311' }}>No orders found matching criteria</Typography>
                    <Typography variant="caption" sx={{ color: '#8C7A70' }}>Try switching tabs or refining search terms.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 15, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid #F0DCE3',
            bgcolor: '#FBF9F7',
            '& .MuiTablePagination-select': { borderRadius: '0px' },
          }}
        />
      </Paper>

      {/* Manual Order Creation Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '0px',
            border: '1px solid #F0DCE3',
            boxShadow: '0 24px 60px rgba(18, 11, 16, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3.5, px: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F0DCE3' }}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: '0.12em', fontWeight: 700, color: '#C53261', display: 'block' }}>
              Order Dispatch
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif' }}>
              {newItem.id ? 'Edit Order Record' : 'Create Manual Order'}
            </Typography>
          </Box>
          <IconButton onClick={() => setIsModalOpen(false)} sx={{ borderRadius: '0px', color: '#8C7A70' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#141311', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 2, fontSize: '0.8rem' }}>
              Customer & Transaction Details
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Recipient Full Name *"
                  value={newItem.recipientName || ''}
                  onChange={(e) => setNewItem({ ...newItem, recipientName: e.target.value })}
                  sx={inputStyles}
                  placeholder="e.g. Fatima Khan"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Phone Number *"
                  value={newItem.phoneNumber || ''}
                  onChange={(e) => setNewItem({ ...newItem, phoneNumber: e.target.value })}
                  sx={inputStyles}
                  placeholder="e.g. 0300-1234567"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Delivery City"
                  value={newItem.city || 'Karachi'}
                  onChange={(e) => setNewItem({ ...newItem, city: e.target.value })}
                  sx={inputStyles}
                  placeholder="e.g. Karachi, Lahore, Islamabad"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={inputStyles}>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={newItem.paymentMethod || 'Manual Payment'}
                    label="Payment Method"
                    onChange={(e) => setNewItem({ ...newItem, paymentMethod: e.target.value })}
                  >
                    <option value="Manual Payment" style={{ padding: '8px' }}>Manual Payment / Bank Transfer</option>
                    <option value="Cash on Delivery" style={{ padding: '8px' }}>Cash on Delivery (COD)</option>
                    <option value="Credit Card" style={{ padding: '8px' }}>Credit Card / PayPal</option>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Transaction ID / Reference # *"
                  value={newItem.transactionId || ''}
                  onChange={(e) => setNewItem({ ...newItem, transactionId: e.target.value })}
                  sx={inputStyles}
                  placeholder="e.g. TRX-98421098 or 20491823"
                  helperText="Required for manual bank / JazzCash verification"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={inputStyles}>
                  <InputLabel>Settlement Channel</InputLabel>
                  <Select
                    value={newItem.bankName || 'Meezan Bank'}
                    label="Settlement Channel"
                    onChange={(e) => setNewItem({ ...newItem, bankName: e.target.value })}
                  >
                    <option value="Meezan Bank" style={{ padding: '8px' }}>Meezan Bank</option>
                    <option value="HBL (Habib Bank Limited)" style={{ padding: '8px' }}>HBL (Habib Bank Limited)</option>
                    <option value="JazzCash" style={{ padding: '8px' }}>JazzCash</option>
                    <option value="EasyPaisa" style={{ padding: '8px' }}>EasyPaisa</option>
                    <option value="Bank Alfalah" style={{ padding: '8px' }}>Bank Alfalah</option>
                    <option value="Standard Chartered" style={{ padding: '8px' }}>Standard Chartered</option>
                    <option value="Other Bank" style={{ padding: '8px' }}>Other Bank / RAAST</option>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Order Amount (PKR) *"
                  type="number"
                  value={newItem.total}
                  onChange={(e) => setNewItem({ ...newItem, total: e.target.value })}
                  sx={inputStyles}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1, color: '#8C7A70', fontWeight: 700, fontSize: '0.85rem' }}>Rs.</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Declared Paid Amount (PKR)"
                  type="number"
                  value={newItem.paidAmount || newItem.total}
                  onChange={(e) => setNewItem({ ...newItem, paidAmount: e.target.value })}
                  sx={inputStyles}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1, color: '#8C7A70', fontWeight: 700, fontSize: '0.85rem' }}>Rs.</Typography>
                  }}
                  helperText="Amount sent by customer"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={inputStyles}>
                  <InputLabel>Initial Status</InputLabel>
                  <Select
                    value={newItem.status || 'PENDING'}
                    label="Initial Status"
                    onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                  >
                    <option value="PENDING" style={{ padding: '8px' }}>PENDING (Awaiting Verification)</option>
                    <option value="PAID" style={{ padding: '8px' }}>PAID (Verified)</option>
                    <option value="CONFIRMED" style={{ padding: '8px' }}>CONFIRMED</option>
                    <option value="SHIPPED" style={{ padding: '8px' }}>SHIPPED</option>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  onClick={() => document.getElementById('manual-order-image').click()}
                  sx={{
                    border: newItem.image ? '1px solid #166534' : '1px dashed #C5A059',
                    borderRadius: '0px',
                    bgcolor: newItem.image ? '#F0FDF4' : '#FBF9F7',
                    p: 1.5,
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F5EFEB', borderColor: '#C53261' }
                  }}
                >
                  <CloudUploadIcon sx={{ color: newItem.image ? '#166534' : '#C53261' }} />
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Typography variant="body2" sx={{ color: newItem.image ? '#166534' : '#141311', fontSize: '0.8rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {newItem.image ? `Receipt: ${newItem.image.name}` : 'Upload Payment Receipt Proof *'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8C7A70', fontSize: '0.7rem', display: 'block' }}>
                      {newItem.image ? `${(newItem.image.size / 1024).toFixed(1)} KB` : 'Click to select screenshot or bank slip'}
                    </Typography>
                  </Box>
                  <input
                    id="manual-order-image"
                    type="file"
                    hidden
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewItem({ ...newItem, image: file });
                      }
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3, borderColor: '#F0DCE3' }} />

          {/* Section 2: Order Items */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#141311', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>
                Line Items
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() =>
                  setNewItem({
                    ...newItem,
                    orderItems: [...newItem.orderItems, { productId: '', quantity: '', price: '' }],
                  })
                }
                sx={{
                  borderRadius: '0px',
                  borderColor: '#F0DCE3',
                  color: '#141311',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  '&:hover': { borderColor: '#C53261', bgcolor: '#FBF9F7' }
                }}
              >
                Add Item
              </Button>
            </Box>

            {newItem.orderItems.length === 0 ? (
              <Box sx={{ p: 3, bgcolor: '#FBF9F7', border: '1px dashed #F0DCE3', borderRadius: '0px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <InventoryIcon sx={{ fontSize: 28, color: '#C5A059' }} />
                <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600 }}>No cosmetics products added to this order yet.</Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {newItem.orderItems.map((orderItem, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1.5,
                      borderRadius: '0px',
                      bgcolor: '#FBF9F7',
                      border: '1px solid #F0DCE3',
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 40px',
                      gap: 1.5,
                      alignItems: 'center'
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Product ID"
                      size="small"
                      type="number"
                      value={orderItem.productId}
                      onChange={(e) => {
                        const updated = [...newItem.orderItems];
                        updated[index].productId = e.target.value;
                        setNewItem({ ...newItem, orderItems: updated });
                      }}
                      sx={inputStyles}
                    />
                    <TextField
                      fullWidth
                      label="Quantity"
                      size="small"
                      type="number"
                      value={orderItem.quantity}
                      onChange={(e) => {
                        const updated = [...newItem.orderItems];
                        updated[index].quantity = e.target.value;
                        setNewItem({ ...newItem, orderItems: updated });
                      }}
                      sx={inputStyles}
                    />
                    <TextField
                      fullWidth
                      label="Unit Price"
                      size="small"
                      type="number"
                      value={orderItem.price}
                      onChange={(e) => {
                        const updated = [...newItem.orderItems];
                        updated[index].price = e.target.value;
                        setNewItem({ ...newItem, orderItems: updated });
                      }}
                      sx={inputStyles}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        const updated = newItem.orderItems.filter((_, i) => i !== index);
                        setNewItem({ ...newItem, orderItems: updated });
                      }}
                      sx={{ color: '#C53261', borderRadius: '0px', '&:hover': { color: '#EF4444' } }}
                    >
                      <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, px: 4, borderTop: '1px solid #F0DCE3', display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => setIsModalOpen(false)}
            sx={{
              borderRadius: '0px',
              borderColor: '#F0DCE3',
              color: '#8C7A70',
              px: 3,
              py: 1,
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              '&:hover': { borderColor: '#C53261', bgcolor: '#FBF9F7', color: '#141311' }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddNewItem}
            sx={{
              borderRadius: '0px',
              bgcolor: '#141311',
              color: '#fff',
              px: 3.5,
              py: 1,
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#2A1824', boxShadow: 'none' }
            }}
          >
            {newItem.id ? 'Save Changes' : 'Create Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilterableTable;