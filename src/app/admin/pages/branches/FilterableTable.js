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
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Storefront as BranchIcon,
  LocationCity as CityIcon,
  Place as PinIcon,
} from '@mui/icons-material';

const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '0px',
    backgroundColor: '#fff',
    fontSize: '0.875rem',
    '& fieldset': {
      borderColor: '#E8DFC8',
    },
    '&:hover fieldset': {
      borderColor: '#D2AA2D',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#B98C2D',
      borderWidth: '1px',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    color: '#8C7A70',
    '&.Mui-focused': {
      color: '#B98C2D',
    },
  },
};

const FilterableTable = ({ data = [], fetchData, isPageLoading = false }) => {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, id: null });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const [newItem, setNewItem] = useState({
    id: null,
    title: '',
    city: '',
    address: '',
  });

  useEffect(() => {
    const list = Array.isArray(data) ? data : [];
    if (!filter.trim()) {
      setFilteredData(list);
    } else {
      const term = filter.toLowerCase();
      setFilteredData(
        list.filter((item) =>
          Object.values(item).some((val) =>
            String(val).toLowerCase().includes(term)
          )
        )
      );
    }
  }, [filter, data]);

  const uniqueCities = useMemo(() => {
    const set = new Set();
    (data || []).forEach((b) => {
      if (b.city) set.add(b.city.trim());
    });
    return Array.from(set);
  }, [data]);

  const handleOpenAdd = () => {
    setNewItem({ id: null, title: '', city: '', address: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setNewItem({
      id: item.id,
      title: item.title || '',
      city: item.city || '',
      address: item.address || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newItem.title.trim() || !newItem.city.trim()) {
      setToast({ open: true, message: 'Please fill in boutique title and city.', severity: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      if (newItem.id) {
        await fetch(`/api/branches/${newItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
        });
        setToast({ open: true, message: 'Boutique branch updated successfully!', severity: 'success' });
      } else {
        await fetch('/api/branches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
        });
        setToast({ open: true, message: 'Boutique branch added successfully!', severity: 'success' });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving branch:', error);
      setToast({ open: true, message: 'Error saving branch location.', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmation.id) return;
    setIsLoading(true);
    try {
      await fetch(`/api/branches/${deleteConfirmation.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      setToast({ open: true, message: 'Branch location deleted.', severity: 'warning' });
      fetchData();
    } catch (error) {
      console.error('Error deleting branch:', error);
      setToast({ open: true, message: 'Failed to delete branch.', severity: 'error' });
    } finally {
      setIsLoading(false);
      setDeleteConfirmation({ open: false, id: null });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#FBF9F7', minHeight: '100vh' }}>
      {(isLoading || isPageLoading) && (
        <div
          tabIndex={-1}
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 99999,
            pointerEvents: 'none',
          }}
        >
          <div className="s2u-progress-bar-primary" />
        </div>
      )}

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
            Boutique Branches & Experience Centers
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', letterSpacing: '0.02em' }}>
            Manage physical flagship ateliers, beauty lounges, and cosmetic counter locations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
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
              bgcolor: '#B98C2D',
              borderColor: '#B98C2D',
              boxShadow: 'none',
            },
          }}
        >
          Add Boutique Branch
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
              border: '1px solid #E8DFC8',
              bgcolor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Total Boutiques
              </Typography>
              <Typography variant="h4" sx={{ color: '#141311', fontWeight: 600, mt: 0.5, fontFamily: 'serif' }}>
                {(data || []).length}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                bgcolor: '#F9F5EC',
                color: '#B98C2D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BranchIcon fontSize="small" />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '0px',
              border: '1px solid #E8DFC8',
              bgcolor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Cities Covered
              </Typography>
              <Typography variant="h4" sx={{ color: '#141311', fontWeight: 600, mt: 0.5, fontFamily: 'serif' }}>
                {uniqueCities.length}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                bgcolor: '#F9F5EC',
                color: '#B98C2D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CityIcon fontSize="small" />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Table Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '0px',
          border: '1px solid #E8DFC8',
          bgcolor: '#fff',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #E8DFC8',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <TextField
            size="small"
            placeholder="Search branches by title, city, or address..."
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
            Showing {filteredData.length} of {(data || []).length} locations
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FBF9F7' }}>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: 80 }}>
                  ID
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: 220 }}>
                  Boutique Name
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: 160 }}>
                  City
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  Address
                </TableCell>
                <TableCell align="right" sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: 120 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    sx={{
                      '&:hover': { bgcolor: '#FDFBF9' },
                      borderBottom: '1px solid #E8DFC8',
                    }}
                  >
                    <TableCell sx={{ color: '#8C7A70', fontSize: '0.85rem', fontWeight: 500 }}>
                      #{item.id}
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: '#141311', fontSize: '0.875rem' }}>
                        {item.title}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={item.city}
                        size="small"
                        sx={{
                          borderRadius: '0px',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          bgcolor: '#F9F5EC',
                          color: '#141311',
                          border: '1px solid #E8DFC8',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PinIcon sx={{ fontSize: 16, color: '#B98C2D', flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ color: '#554A43', fontSize: '0.85rem' }}>
                          {item.address}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(item)}
                          sx={{
                            color: '#8C7A70',
                            borderRadius: '0px',
                            '&:hover': { color: '#B98C2D', bgcolor: '#F9F5EC' },
                          }}
                        >
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteConfirmation({ open: true, id: item.id })}
                          sx={{
                            color: '#8C7A70',
                            borderRadius: '0px',
                            '&:hover': { color: '#D32F2F', bgcolor: '#FDEDED' },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#8C7A70' }}>
                    <BranchIcon sx={{ fontSize: 36, color: '#D2AA2D', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#141311' }}>
                      No boutique branches found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add / Edit Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={() => !isLoading && setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '0px',
            border: '1px solid #E8DFC8',
            boxShadow: '0 20px 40px rgba(18, 11, 16, 0.1)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #E8DFC8',
            p: 2.5,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontFamily: 'serif', fontWeight: 500, color: '#141311' }}>
              {newItem.id ? 'Edit Boutique Branch' : 'Add Boutique Branch'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#8C7A70' }}>
              Set flagship store, counter location, and address details
            </Typography>
          </Box>
          <IconButton onClick={() => setIsModalOpen(false)} disabled={isLoading} size="small">
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSave}>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Boutique Title *
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="e.g. Flagship Atelier - Gulberg Galleria"
                required
                sx={inputStyles}
              />
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                City *
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={newItem.city}
                onChange={(e) => setNewItem({ ...newItem, city: e.target.value })}
                placeholder="e.g. Lahore, Karachi, Islamabad"
                required
                sx={inputStyles}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Full Physical Address *
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={newItem.address}
                onChange={(e) => setNewItem({ ...newItem, address: e.target.value })}
                placeholder="Shop #12, Ground Floor, Gulberg Main Boulevard..."
                multiline
                rows={3}
                required
                sx={inputStyles}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E8DFC8', gap: 1 }}>
            <Button
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
              sx={{
                borderRadius: '0px',
                color: '#8C7A70',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                fontWeight: 600,
                px: 2.5,
                '&:hover': { bgcolor: '#F9F5EC', color: '#141311' },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                bgcolor: '#141311',
                color: '#fff',
                borderRadius: '0px',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                fontWeight: 600,
                px: 3,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#B98C2D', boxShadow: 'none' },
              }}
            >
              {isLoading ? 'Saving...' : newItem.id ? 'Update Branch' : 'Add Branch'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, id: null })}
        PaperProps={{
          sx: {
            borderRadius: '0px',
            border: '1px solid #E8DFC8',
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'serif', color: '#141311' }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#8C7A70' }}>
            Are you sure you want to delete branch #{deleteConfirmation.id}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteConfirmation({ open: false, id: null })}
            sx={{ borderRadius: '0px', color: '#8C7A70' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{
              borderRadius: '0px',
              bgcolor: '#D32F2F',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#B71C1C', boxShadow: 'none' },
            }}
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ borderRadius: '0px', width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FilterableTable;
