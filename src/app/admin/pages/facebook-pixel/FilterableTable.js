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
  TrackChanges as PixelIcon,
  Code as CodeIcon,
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

const FilterableTable = () => {
  const [filter, setFilter] = useState('');
  const [pixels, setPixels] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [newPixel, setNewPixel] = useState({ id: '', pixelCode: '' });
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, id: null });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const fetchPixels = async () => {
    setPageLoading(true);
    try {
      const response = await fetch('/api/pixels');
      const data = await response.json();
      const list = Array.isArray(data.data) ? data.data : [];
      setPixels(list);
    } catch (error) {
      console.error('Error fetching pixels:', error);
      setToast({ open: true, message: 'Failed to fetch pixels.', severity: 'error' });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchPixels();
  }, []);

  useEffect(() => {
    if (!filter.trim()) {
      setFilteredData(pixels);
    } else {
      const term = filter.toLowerCase();
      setFilteredData(
        pixels.filter(
          (p) =>
            (p.pixelCode && p.pixelCode.toLowerCase().includes(term)) ||
            String(p.id).includes(term)
        )
      );
    }
  }, [filter, pixels]);

  const handleSavePixel = async () => {
    if (!newPixel.pixelCode.trim()) {
      setToast({ open: true, message: 'Please enter a Meta / Facebook Pixel ID.', severity: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const response = newPixel.id
        ? await fetch(`/api/pixels/${newPixel.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPixel),
          })
        : await fetch('/api/pixels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pixelCode: newPixel.pixelCode }),
          });

      if (!response.ok) {
        throw new Error('Failed to save pixel code');
      }

      setToast({ open: true, message: 'Meta Pixel ID updated successfully!', severity: 'success' });
      setIsModalOpen(false);
      setNewPixel({ id: '', pixelCode: '' });
      fetchPixels();
    } catch (error) {
      console.error('Error saving pixel:', error);
      setToast({ open: true, message: 'Failed to save pixel.', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePixel = async () => {
    if (!deleteConfirmation.id) return;
    setIsLoading(true);
    try {
      await fetch(`/api/pixels/${deleteConfirmation.id}`, { method: 'DELETE' });
      setToast({ open: true, message: 'Pixel code removed.', severity: 'warning' });
      fetchPixels();
    } catch (error) {
      console.error('Error deleting pixel:', error);
      setToast({ open: true, message: 'Failed to delete pixel.', severity: 'error' });
    } finally {
      setIsLoading(false);
      setDeleteConfirmation({ open: false, id: null });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#FBF9F7', minHeight: '100vh' }}>
      {(isLoading || pageLoading) && (
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
            Meta (Facebook) Pixel Tracking
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', letterSpacing: '0.02em' }}>
            Inject conversion tracking pixels for cosmetics ad retargeting and analytics
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setNewPixel({ id: '', pixelCode: '' });
            setIsModalOpen(true);
          }}
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
          Add Tracking Pixel
        </Button>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
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
                Active Tracking Pixels
              </Typography>
              <Typography variant="h4" sx={{ color: '#141311', fontWeight: 600, mt: 0.5, fontFamily: 'serif' }}>
                {pixels.length}
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
              <PixelIcon fontSize="small" />
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
            placeholder="Search pixels by code or ID..."
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
            Showing {filteredData.length} of {pixels.length} pixels
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FBF9F7' }}>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: 80 }}>
                  ID
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3' }}>
                  Pixel ID / Code
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: 220 }}>
                  Created At
                </TableCell>
                <TableCell align="right" sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: 120 }}>
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
                      borderBottom: '1px solid #F0DCE3',
                    }}
                  >
                    <TableCell sx={{ color: '#8C7A70', fontSize: '0.85rem', fontWeight: 500 }}>
                      #{item.id}
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CodeIcon sx={{ fontSize: 18, color: '#C53261' }} />
                        <Chip
                          label={item.pixelCode}
                          size="small"
                          sx={{
                            borderRadius: '0px',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            bgcolor: '#FFF5F8',
                            color: '#141311',
                            border: '1px solid #F0DCE3',
                          }}
                        />
                      </Box>
                    </TableCell>

                    <TableCell sx={{ color: '#8C7A70', fontSize: '0.85rem' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setNewPixel({ id: item.id, pixelCode: item.pixelCode });
                            setIsModalOpen(true);
                          }}
                          sx={{
                            color: '#8C7A70',
                            borderRadius: '0px',
                            '&:hover': { color: '#C53261', bgcolor: '#FFF5F8' },
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
                  <TableCell colSpan={4} align="center" sx={{ py: 6, color: '#8C7A70' }}>
                    <PixelIcon sx={{ fontSize: 36, color: '#C5A059', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#141311' }}>
                      No Facebook pixel records found
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
            border: '1px solid #F0DCE3',
            boxShadow: '0 20px 40px rgba(18, 11, 16, 0.1)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #F0DCE3',
            p: 2.5,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontFamily: 'serif', fontWeight: 500, color: '#141311' }}>
              {newPixel.id ? 'Edit Meta Pixel ID' : 'Add Meta Pixel ID'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#8C7A70' }}>
              Enter the numeric Meta Pixel identifier from Facebook Events Manager
            </Typography>
          </Box>
          <IconButton onClick={() => setIsModalOpen(false)} disabled={isLoading} size="small">
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
              Pixel ID *
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={newPixel.pixelCode}
              onChange={(e) => setNewPixel({ ...newPixel, pixelCode: e.target.value })}
              placeholder="e.g. 102938475610293"
              sx={inputStyles}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #F0DCE3', gap: 1 }}>
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
              '&:hover': { bgcolor: '#FFF5F8', color: '#141311' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePixel}
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
              '&:hover': { bgcolor: '#C53261', boxShadow: 'none' },
            }}
          >
            {isLoading ? 'Saving...' : newPixel.id ? 'Update Pixel' : 'Save Pixel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, id: null })}
        PaperProps={{
          sx: {
            borderRadius: '0px',
            border: '1px solid #F0DCE3',
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'serif', color: '#141311' }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#8C7A70' }}>
            Are you sure you want to delete pixel record #{deleteConfirmation.id}?
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
            onClick={handleDeletePixel}
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