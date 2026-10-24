'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Checkbox,
  Chip,
  Grid,
  Stack,
  FormControlLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ConfirmationNumber as CouponIcon,
  Percent as PercentIcon,
  CheckCircle as ActiveIcon,
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

const FilterableCouponTable = ({ coupons = [], fetchCoupons }) => {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState(coupons || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    id: null,
    code: '',
    discount: 0,
    expiration: '',
    isActive: true,
  });

  useEffect(() => {
    if (!filter.trim()) {
      setFilteredData(coupons || []);
    } else {
      const term = filter.toLowerCase();
      setFilteredData(
        (coupons || []).filter((item) =>
          (item.code && item.code.toLowerCase().includes(term)) ||
          String(item.discount).includes(term)
        )
      );
    }
  }, [filter, coupons]);

  const stats = useMemo(() => {
    const list = coupons || [];
    return {
      total: list.length,
      active: list.filter(c => c.isActive).length,
      avgDiscount: list.length ? Math.round(list.reduce((acc, c) => acc + (c.discount || 0), 0) / list.length) : 0,
    };
  }, [coupons]);

  const handleAddNewItem = async () => {
    if (!newCoupon.code || newCoupon.discount === undefined) {
      alert('Please fill in coupon code and discount percentage.');
      return;
    }
    setIsLoading(true);
    try {
      const couponToSubmit = {
        ...newCoupon,
        expiration: newCoupon.expiration ? new Date(newCoupon.expiration) : null,
      };

      const response = newCoupon.id
        ? await fetch(`/api/coupons/${newCoupon.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(couponToSubmit),
          })
        : await fetch('/api/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(couponToSubmit),
          });

      if (!response.ok) {
        throw new Error('Failed to create or update coupon');
      }

      await response.json();
      if (fetchCoupons) fetchCoupons();
      setIsModalOpen(false);
      setNewCoupon({ id: null, code: '', discount: 0, expiration: '', isActive: true });
    } catch (error) {
      console.error('Error adding or updating coupon:', error);
      alert('Error updating coupon.');
    }
    setIsLoading(false);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promotional coupon?')) return;
    setIsLoading(true);
    try {
      await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (fetchCoupons) fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
    setIsLoading(false);
  };

  const handleEditItem = (item) => {
    setNewCoupon({
      ...item,
      expiration: item.expiration ? new Date(item.expiration).toISOString().slice(0, 10) : '',
    });
    setIsModalOpen(true);
  };

  return (
    <Box sx={{ bgcolor: '#FBF9F7', minHeight: '100vh', p: { xs: 2.5, md: 4 } }}>
      {/* Top Loading Line */}
      {isLoading && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', zIndex: 9999 }}>
          <Box className="s2u-progress-bar-primary" sx={{ height: '100%', bgcolor: '#C53261' }} />
        </Box>
      )}

      {/* Header section */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ letterSpacing: '0.15em', fontWeight: 700, color: '#C53261', display: 'block', mb: 0.5 }}>
            Admin Console • Marketing & Discounts
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif', letterSpacing: '-0.02em' }}>
            Promo Vouchers & Coupons
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', mt: 0.5 }}>
            Generate seasonal promotional codes, percentage deductions, and customer rewards.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => {
            setNewCoupon({
              id: null,
              code: '',
              discount: 0,
              expiration: '',
              isActive: true,
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
          Create New Voucher
        </Button>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #F0DCE3', borderRadius: '0px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261' }}>
              <CouponIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Total Promo Codes
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311' }}>
                {stats.total}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #F0DCE3', borderRadius: '0px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261' }}>
              <ActiveIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Active Vouchers
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#166534' }}>
                {stats.active}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #F0DCE3', borderRadius: '0px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261' }}>
              <PercentIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Average Deduction
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311' }}>
                {stats.avgDiscount}% OFF
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Table Card */}
      <Paper elevation={0} sx={{ bgcolor: '#fff', border: '1px solid #F0DCE3', borderRadius: '0px', overflow: 'hidden' }}>
        {/* Search Bar */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid #F0DCE3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, bgcolor: '#fff' }}>
          <TextField
            size="small"
            placeholder="Search by promo code or percentage..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ width: { xs: '100%', sm: 380 }, ...inputStyles }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#8C7A70', fontSize: '1.15rem' }} />
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
            {filteredData.length} coupons configured
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer sx={{ maxHeight: '65vh', overflowX: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: '70px' }}>
                  ID
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3' }}>
                  Voucher Code
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3' }}>
                  Discount Rate
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3' }}>
                  Expiration Date
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3' }}>
                  Status
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: '120px' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableRow
                    key={item.id}
                    sx={{
                      bgcolor: index % 2 === 0 ? '#fff' : '#FAF8F6',
                      '&:hover': { bgcolor: '#F5EFEB' },
                      borderBottom: '1px solid #F0DCE3',
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: '#8C7A70', fontSize: '0.8rem', borderBottom: '1px solid #F0DCE3' }}>
                      #{item.id}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #F0DCE3' }}>
                      <Chip
                        label={item.code}
                        sx={{
                          borderRadius: '0px',
                          bgcolor: '#141311',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          fontFamily: 'monospace',
                          letterSpacing: '0.08em',
                          px: 0.5,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#C53261', fontSize: '0.9rem', borderBottom: '1px solid #F0DCE3' }}>
                      {item.discount}% OFF
                    </TableCell>
                    <TableCell sx={{ color: '#8C7A70', fontSize: '0.85rem', borderBottom: '1px solid #F0DCE3' }}>
                      {item.expiration ? new Date(item.expiration).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Expiry'}
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottom: '1px solid #F0DCE3' }}>
                      <Chip
                        label={item.isActive ? 'Active' : 'Expired'}
                        size="small"
                        sx={{
                          borderRadius: '0px',
                          bgcolor: item.isActive ? '#F0FDF4' : '#FEF2F2',
                          color: item.isActive ? '#166534' : '#991B1B',
                          border: item.isActive ? '1px solid #BBF7D0' : '1px solid #FECACA',
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
                          onClick={() => handleEditItem(item)}
                          sx={{
                            borderRadius: '0px',
                            color: '#141311',
                            border: '1px solid #F0DCE3',
                            p: 0.75,
                            '&:hover': { bgcolor: '#141311', color: '#fff' },
                          }}
                        >
                          <EditIcon sx={{ fontSize: '0.95rem' }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteItem(item.id)}
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
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8, color: '#8C7A70' }}>
                    <CouponIcon sx={{ fontSize: '2.5rem', color: '#C5A059', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#141311' }}>No coupon vouchers found</Typography>
                    <Typography variant="caption" sx={{ color: '#8C7A70' }}>Click &quot;Create New Voucher&quot; to establish discounts.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add / Edit Coupon Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '0px',
            border: '1px solid #F0DCE3',
            boxShadow: '0 24px 60px rgba(18, 11, 16, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3.5, px: 3.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F0DCE3' }}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: '0.12em', fontWeight: 700, color: '#C53261', display: 'block' }}>
              Marketing Promotion
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif' }}>
              {newCoupon.id ? 'Edit Voucher' : 'New Voucher'}
            </Typography>
          </Box>
          <IconButton onClick={() => setIsModalOpen(false)} sx={{ borderRadius: '0px', color: '#8C7A70' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3.5, py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="Coupon Code *"
              fullWidth
              value={newCoupon.code}
              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
              placeholder="e.g. LUXURY20"
              sx={inputStyles}
            />
            <TextField
              label="Discount Percentage (%) *"
              type="number"
              fullWidth
              value={newCoupon.discount}
              onChange={(e) => setNewCoupon({ ...newCoupon, discount: parseFloat(e.target.value) })}
              sx={inputStyles}
              InputProps={{ inputProps: { min: 1, max: 100 } }}
            />
            <TextField
              label="Expiration Date"
              type="date"
              fullWidth
              value={newCoupon.expiration}
              onChange={(e) => setNewCoupon({ ...newCoupon, expiration: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={inputStyles}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={newCoupon.isActive}
                  onChange={(e) => setNewCoupon({ ...newCoupon, isActive: e.target.checked })}
                  sx={{ color: '#C5A059', '&.Mui-checked': { color: '#C53261' } }}
                />
              }
              label={<Typography variant="body2" sx={{ fontWeight: 700, color: '#141311' }}>Voucher is Active for Shoppers</Typography>}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, px: 3.5, borderTop: '1px solid #F0DCE3', display: 'flex', gap: 1.5 }}>
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
            {newCoupon.id ? 'Save Changes' : 'Create Voucher'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilterableCouponTable;