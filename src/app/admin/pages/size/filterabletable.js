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
  Grid,
  Stack,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Straighten as SizeIcon,
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

const FilterableTable = ({ sizes = [], fetchSizes }) => {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSize, setCurrentSize] = useState({ id: null, name: '' });

  useEffect(() => {
    if (!filter.trim()) {
      setFilteredData(sizes || []);
    } else {
      const term = filter.toLowerCase();
      setFilteredData(
        (sizes || []).filter((item) =>
          (item.name && item.name.toLowerCase().includes(term)) ||
          String(item.id).includes(term)
        )
      );
    }
  }, [filter, sizes]);

  const stats = useMemo(() => {
    const list = sizes || [];
    return {
      total: list.length,
    };
  }, [sizes]);

  const handleAddOrUpdateSize = async () => {
    if (!currentSize.name.trim()) {
      alert('Please enter a size or volume name.');
      return;
    }
    setIsLoading(true);
    try {
      const method = currentSize.id ? 'PUT' : 'POST';
      const response = await fetch('/api/sizes', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentSize),
      });

      if (response.ok) {
        if (fetchSizes) fetchSizes();
        setIsModalOpen(false);
        setCurrentSize({ id: null, name: '' });
      } else {
        alert('Failed to save size specification');
      }
    } catch (error) {
      console.error('Error saving size:', error);
    }
    setIsLoading(false);
  };

  const handleEditClick = (size) => {
    setCurrentSize(size);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this size entry?')) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/sizes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok && fetchSizes) {
        fetchSizes();
      }
    } catch (error) {
      console.error('Error deleting size:', error);
    }
    setIsLoading(false);
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
            Admin Console • Product Variants
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif', letterSpacing: '-0.02em' }}>
            Product Sizes & Volumes
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', mt: 0.5 }}>
            Define volume measurements (e.g. 15ml, 30ml, 50ml, Travel Size) for beauty catalog selections.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => {
            setCurrentSize({ id: null, name: '' });
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
          Add New Size
        </Button>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #F0DCE3', borderRadius: '0px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261' }}>
              <SizeIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Total Configured Sizes
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311' }}>
                {stats.total} Sizes
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
            placeholder="Search sizes..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ width: { xs: '100%', sm: 350 }, ...inputStyles }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#8C7A70', fontSize: '1.15rem' }} />
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
            {filteredData.length} entries recorded
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer sx={{ maxHeight: '65vh', overflowX: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: '80px' }}>
                  ID
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3' }}>
                  Size / Volume Specification
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
                        label={item.name}
                        sx={{
                          borderRadius: '0px',
                          bgcolor: '#FBF9F7',
                          border: '1px solid #F0DCE3',
                          color: '#141311',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          px: 1,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: '1px solid #F0DCE3' }}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(item)}
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
                          onClick={() => handleDeleteClick(item.id)}
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
                  <TableCell colSpan={3} sx={{ textAlign: 'center', py: 8, color: '#8C7A70' }}>
                    <SizeIcon sx={{ fontSize: '2.5rem', color: '#C5A059', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#141311' }}>No size configurations found</Typography>
                    <Typography variant="caption" sx={{ color: '#8C7A70' }}>Click &quot;Add New Size&quot; to configure dimensions or volumes.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add / Edit Size Dialog */}
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
              Size Attribute
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif' }}>
              {currentSize.id ? 'Edit Size' : 'New Size'}
            </Typography>
          </Box>
          <IconButton onClick={() => setIsModalOpen(false)} sx={{ borderRadius: '0px', color: '#8C7A70' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3.5, py: 3 }}>
          <Box sx={{ mt: 1 }}>
            <TextField
              label="Size / Volume Name *"
              fullWidth
              value={currentSize.name}
              onChange={(e) => setCurrentSize({ ...currentSize, name: e.target.value })}
              placeholder="e.g. 50ml, 100ml, Mini, Travel Pack"
              sx={inputStyles}
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
            onClick={handleAddOrUpdateSize}
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
            {currentSize.id ? 'Save Changes' : 'Create Size'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilterableTable;