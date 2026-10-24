'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Chip,
  Rating,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Reviews as ReviewsIcon,
  Close as CloseIcon,
  CheckCircle as ActiveIcon
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

const ReviewableTable = ({ reviews = [], fetchReviews, products = [] }) => {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newReview, setNewReview] = useState({
    id: null,
    reviewer: '',
    rating: 5,
    comment: '',
    productId: '',
    status: 'active',
  });

  useEffect(() => {
    if (Array.isArray(reviews)) {
      if (!filter.trim()) {
        setFilteredData(reviews);
      } else {
        const term = filter.toLowerCase();
        setFilteredData(
          reviews.filter((item) =>
            (item.reviewer && item.reviewer.toLowerCase().includes(term)) ||
            (item.comment && item.comment.toLowerCase().includes(term)) ||
            (item.product?.name && item.product.name.toLowerCase().includes(term)) ||
            String(item.rating).includes(term)
          )
        );
      }
    }
  }, [filter, reviews]);

  const stats = useMemo(() => {
    const list = reviews || [];
    const avg = list.length ? (list.reduce((acc, r) => acc + (parseFloat(r.rating) || 0), 0) / list.length).toFixed(1) : '5.0';
    return {
      total: list.length,
      average: avg,
      active: list.filter(r => r.status === 'active' || !r.status).length,
    };
  }, [reviews]);

  const handleAddNewItem = async () => {
    if (!newReview.reviewer || !newReview.comment) {
      alert('Please fill in reviewer name and feedback comment.');
      return;
    }
    setIsLoading(true);
    try {
      const reviewToSubmit = {
        ...newReview,
        productId: newReview.productId ? parseInt(newReview.productId, 10) : null,
        rating: parseInt(newReview.rating, 10),
      };

      const response = newReview.id
        ? await fetch(`/api/reviews/${newReview.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewToSubmit),
          })
        : await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewToSubmit),
          });

      if (response.ok) {
        if (fetchReviews) fetchReviews();
        setIsModalOpen(false);
        setNewReview({
          id: null,
          reviewer: '',
          rating: 5,
          comment: '',
          productId: '',
          status: 'active',
        });
      } else {
        alert('Failed to save customer review');
      }
    } catch (error) {
      console.error('Error adding or updating review:', error);
    }
    setIsLoading(false);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to remove this customer review?')) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok && fetchReviews) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
    setIsLoading(false);
  };

  const handleEditItem = (item) => {
    setNewReview({
      ...item,
      productId: item.productId || '',
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
            Admin Console • Social Proof & Ratings
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif', letterSpacing: '-0.02em' }}>
            Customer Reviews & Feedback
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', mt: 0.5 }}>
            Monitor cosmetics ratings, client testimonials, and product satisfaction scores.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => {
            setNewReview({
              id: null,
              reviewer: '',
              rating: 5,
              comment: '',
              productId: '',
              status: 'active',
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
          Add Testimonial
        </Button>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #F0DCE3', borderRadius: '0px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261' }}>
              <ReviewsIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Total Verified Reviews
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
              <StarIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Average Satisfaction
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#C53261' }}>
                {stats.average} / 5.0
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
                Published Live
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#166534' }}>
                {stats.active}
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
            placeholder="Search by reviewer, comments, or product name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ width: { xs: '100%', sm: 400 }, ...inputStyles }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#8C7A70', fontSize: '1.15rem' }} />
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
            {filteredData.length} reviews cataloged
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
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: '160px' }}>
                  Reviewer
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: '140px' }}>
                  Score
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3' }}>
                  Feedback Review
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: '160px' }}>
                  Associated Product
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: '100px' }}>
                  Status
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: '110px' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableRow
                    key={item.id || index}
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
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.85rem' }}>
                        {item.reviewer}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#8C7A70', fontSize: '0.75rem' }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : 'Verified Shopper'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #F0DCE3' }}>
                      <Rating value={parseFloat(item.rating) || 5} readOnly size="small" sx={{ color: '#C5A059' }} />
                    </TableCell>
                    <TableCell sx={{ color: '#141311', fontSize: '0.85rem', lineHeight: 1.5, borderBottom: '1px solid #F0DCE3' }}>
                      &ldquo;{item.comment}&rdquo;
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #F0DCE3' }}>
                      <Chip
                        label={item.product ? item.product.name : `Product #${item.productId || 'Store'}`}
                        size="small"
                        sx={{
                          borderRadius: '0px',
                          bgcolor: '#FBF9F7',
                          border: '1px solid #F0DCE3',
                          color: '#141311',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          maxWidth: 150,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottom: '1px solid #F0DCE3' }}>
                      <Chip
                        label={item.status === 'active' || !item.status ? 'Published' : item.status}
                        size="small"
                        sx={{
                          borderRadius: '0px',
                          bgcolor: item.status === 'active' || !item.status ? '#F0FDF4' : '#FFFBEB',
                          color: item.status === 'active' || !item.status ? '#166534' : '#B45309',
                          border: item.status === 'active' || !item.status ? '1px solid #BBF7D0' : '1px solid #FDE68A',
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
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8, color: '#8C7A70' }}>
                    <ReviewsIcon sx={{ fontSize: '2.5rem', color: '#C5A059', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#141311' }}>No customer feedback found</Typography>
                    <Typography variant="caption" sx={{ color: '#8C7A70' }}>Click &quot;Add Testimonial&quot; to register product reviews.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add / Edit Review Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
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
              Testimonial Editor
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif' }}>
              {newReview.id ? 'Edit Review' : 'Add Testimonial'}
            </Typography>
          </Box>
          <IconButton onClick={() => setIsModalOpen(false)} sx={{ borderRadius: '0px', color: '#8C7A70' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="Reviewer Name *"
              fullWidth
              value={newReview.reviewer}
              onChange={(e) => setNewReview({ ...newReview, reviewer: e.target.value })}
              placeholder="e.g. Fatima Tariq"
              sx={inputStyles}
            />

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#141311', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                Star Rating
              </Typography>
              <Rating
                value={parseInt(newReview.rating, 10)}
                onChange={(e, val) => setNewReview({ ...newReview, rating: val || 5 })}
                sx={{ color: '#C5A059' }}
              />
            </Box>

            <FormControl fullWidth sx={inputStyles}>
              <InputLabel id="product-review-label">Linked Product (Optional)</InputLabel>
              <Select
                labelId="product-review-label"
                value={newReview.productId || ''}
                onChange={(e) => setNewReview({ ...newReview, productId: e.target.value })}
                label="Linked Product (Optional)"
                MenuProps={{
                  PaperProps: {
                    sx: { borderRadius: '0px', border: '1px solid #F0DCE3' }
                  }
                }}
              >
                <MenuItem value="">General Store Review</MenuItem>
                {products.map((prod) => (
                  <MenuItem key={prod.id} value={prod.id}>
                    {prod.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Customer Comment / Testimonial *"
              fullWidth
              multiline
              rows={4}
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Share customer's impressions on texture, fragrance, results..."
              sx={inputStyles}
            />
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
            {newReview.id ? 'Save Changes' : 'Publish Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewableTable;
