'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  Box,
  Typography,
  Grid,
  Stack,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import axios from 'axios';

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

const BlogCategories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success',
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    id: null,
  });

  const fetchCategories = async () => {
    setPageLoading(true);
    try {
      const response = await axios.get('/api/blogcategory');
      const list = Array.isArray(response.data) ? response.data : [];
      setCategories(list);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch blog categories.',
        type: 'error',
      });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(categories);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredData(
        categories.filter(
          (c) =>
            (c.title && c.title.toLowerCase().includes(term)) ||
            (c.description && c.description.toLowerCase().includes(term)) ||
            String(c.id).includes(term)
        )
      );
    }
  }, [searchTerm, categories]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ title: '', description: '' });
    setOpenDialog(true);
  };

  const handleOpenEdit = (category) => {
    setIsEditing(true);
    setCurrentId(category.id);
    setFormData({
      title: category.title || '',
      description: category.description || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentId(null);
    setFormData({ title: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide a category title.',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      if (isEditing && currentId) {
        await axios.put(`/api/blogcategory/${currentId}`, formData);
        setSnackbar({
          open: true,
          message: 'Category updated successfully.',
          type: 'success',
        });
      } else {
        await axios.post('/api/blogcategory', formData);
        setSnackbar({
          open: true,
          message: 'Category created successfully.',
          type: 'success',
        });
      }
      handleCloseDialog();
      fetchCategories();
    } catch (error) {
      console.error('Error saving blog category:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save category.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.id) return;
    setLoading(true);
    try {
      await axios.delete(`/api/blogcategory/${deleteConfirmation.id}`);
      setSnackbar({
        open: true,
        message: 'Category deleted successfully.',
        type: 'warning',
      });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete category.',
        type: 'error',
      });
    } finally {
      setLoading(false);
      setDeleteConfirmation({ open: false, id: null });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#FBF9F7', minHeight: '100vh' }}>
      {/* Top Progress Bar */}
      {(loading || pageLoading) && (
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
            Editorial & Blog Categories
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', letterSpacing: '0.02em' }}>
            Organize beauty advice, skincare routines, masterclasses, and product stories
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
              bgcolor: '#C53261',
              borderColor: '#C53261',
              boxShadow: 'none',
            },
          }}
        >
          Add New Category
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
                Total Blog Categories
              </Typography>
              <Typography variant="h4" sx={{ color: '#141311', fontWeight: 600, mt: 0.5, fontFamily: 'serif' }}>
                {categories.length}
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
              <CategoryIcon fontSize="small" />
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
        {/* Table Search Toolbar */}
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
            placeholder="Search categories by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: '100%', sm: 380 }, ...inputStyles }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#8C7A70', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <CloseIcon sx={{ fontSize: 16, color: '#8C7A70' }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Typography variant="caption" sx={{ color: '#8C7A70', letterSpacing: '0.04em' }}>
            Showing {filteredData.length} of {categories.length} categories
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FBF9F7' }}>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: 80 }}>
                  ID
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: 220 }}>
                  Category Title
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3' }}>
                  Description
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: 140 }}>
                  Created Date
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
                      <Typography sx={{ fontWeight: 600, color: '#141311', fontSize: '0.875rem' }}>
                        {item.title}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#554A43',
                          fontSize: '0.85rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.description || 'No description provided.'}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ color: '#8C7A70', fontSize: '0.8rem' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(item)}
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
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#8C7A70' }}>
                    <CategoryIcon sx={{ fontSize: 36, color: '#C5A059', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#141311' }}>
                      No blog categories found
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
        open={openDialog}
        onClose={handleCloseDialog}
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
              {isEditing ? 'Edit Category' : 'Create Blog Category'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#8C7A70' }}>
              Set up taxonomy for beauty articles and makeup guides
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} disabled={loading} size="small">
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Category Title *
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Skincare Routines, Beauty Tips, Masterclasses"
                required
                sx={inputStyles}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Description
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary of articles in this section..."
                multiline
                rows={4}
                sx={inputStyles}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #F0DCE3', gap: 1 }}>
            <Button
              onClick={handleCloseDialog}
              disabled={loading}
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
              type="submit"
              variant="contained"
              disabled={loading}
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
              {loading ? 'Saving...' : isEditing ? 'Update Category' : 'Save Category'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
            Are you sure you want to permanently delete category #{deleteConfirmation.id}?
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
            onClick={handleConfirmDelete}
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

      {/* Notification Toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.type}
          sx={{ borderRadius: '0px', width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BlogCategories;