'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  IconButton,
  Grid,
  Chip,
  Rating,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
};

const FilterableTable = ({ products = [], isPageLoading = false }) => {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const list = Array.isArray(products) ? products : [];
    if (!filter.trim()) {
      setFilteredData(list);
    } else {
      const term = filter.toLowerCase();
      setFilteredData(
        list.filter(
          (item) =>
            (item.name && item.name.toLowerCase().includes(term)) ||
            (item.description && item.description.toLowerCase().includes(term)) ||
            String(item.id).includes(term)
        )
      );
    }
  }, [filter, products]);

  const stats = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return {
      total: list.length,
    };
  }, [products]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#FBF9F7', minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'serif',
              fontWeight: 500,
              color: '#141311',
              letterSpacing: '-0.02em',
              mb: 0.5,
            }}
          >
            Best-Selling & Top-Rated Formulations
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', letterSpacing: '0.02em' }}>
            Products with the highest client satisfaction scores, repeat purchases, and 5-star ratings
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => router.push('/admin/pages/Products')}
          sx={{
            bgcolor: '#141311',
            color: '#fff',
            borderRadius: '0px',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            fontWeight: 600,
            px: 3,
            py: 1.25,
            border: '1px solid #141311',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#C53261',
              borderColor: '#C53261',
              boxShadow: 'none',
            },
          }}
        >
          View Full Inventory
        </Button>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '0px',
              border: '1px solid #F0DCE3',
              bgcolor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Top Rated Formulas
              </Typography>
              <Typography variant="h4" sx={{ color: '#141311', fontWeight: 600, mt: 0.5, fontFamily: 'serif' }}>
                {stats.total}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                bgcolor: '#FFF5F8',
                color: '#C53261',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrophyIcon fontSize="small" />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Table Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '0px',
          border: '1px solid #F0DCE3',
          bgcolor: '#fff',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #F0DCE3',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <TextField
            size="small"
            placeholder="Search top-rated cosmetics by name or description..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ width: { xs: '100%', sm: 380 }, ...inputStyles }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#8C7A70', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: filter && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setFilter('')}>
                    <CloseIcon sx={{ fontSize: 16, color: '#8C7A70' }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Typography variant="caption" sx={{ color: '#8C7A70', letterSpacing: '0.04em' }}>
            Showing {filteredData.length} of {(products || []).length} products
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FBF9F7' }}>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: 80 }}>
                  Item
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3' }}>
                  Product Title & Details
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: 140 }}>
                  Price (PKR)
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: 140 }}>
                  Rating
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: 120 }}>
                  Stock Status
                </TableCell>
                <TableCell align="right" sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: 100 }}>
                  View
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => {
                  const rawImg = item.images && item.images.length > 0 ? (item.images[0].url || item.images[0].name) : null;
                  const imageSrc = rawImg
                    ? (rawImg.startsWith('http') || rawImg.startsWith('/')
                        ? rawImg
                        : `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${rawImg}`)
                    : null;

                  return (
                    <TableRow
                      key={item.id}
                      hover
                      sx={{
                        '&:hover': { bgcolor: '#FDFBF9' },
                        borderBottom: '1px solid #F0DCE3',
                      }}
                    >
                      <TableCell>
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            bgcolor: '#FFF5F8',
                            border: '1px solid #F0DCE3',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          {imageSrc ? (
                            <Image
                              src={imageSrc}
                              alt={item.name}
                              fill
                              unoptimized
                              sizes="52px"
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <StarIcon sx={{ color: '#C5A059', fontSize: 20 }} />
                            </Box>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontWeight: 600, color: '#141311', fontSize: '0.875rem' }}>
                          {item.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#8C7A70',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {(item.description || '').replace(/<[^>]+>/g, '') || 'No description'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontWeight: 600, color: '#141311', fontSize: '0.875rem' }}>
                          {Number(item.price || 0).toLocaleString()} PKR
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Rating
                            value={Number(item.rating || 5)}
                            readOnly
                            size="small"
                            sx={{ color: '#C53261' }}
                          />
                          <Typography variant="caption" sx={{ fontWeight: 600, color: '#141311' }}>
                            ({item.rating || '5.0'})
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={`${item.stock || 0} units`}
                          size="small"
                          sx={{
                            borderRadius: '0px',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            bgcolor: Number(item.stock) > 0 ? '#E8F5E9' : '#FFEBEE',
                            color: Number(item.stock) > 0 ? '#2E7D32' : '#C62828',
                            border: '1px solid #F0DCE3',
                          }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/admin/pages/Products`)}
                          sx={{
                            color: '#8C7A70',
                            borderRadius: '0px',
                            '&:hover': { color: '#C53261', bgcolor: '#FFF5F8' },
                          }}
                        >
                          <OpenInNewIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#8C7A70' }}>
                    <StarIcon sx={{ fontSize: 36, color: '#C5A059', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#141311' }}>
                      No top-rated cosmetics products found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default FilterableTable;