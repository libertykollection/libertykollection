'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// MUI Imports
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
  Modal,
  Grid,
  TablePagination,
  InputAdornment,
  Stack,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';

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

const FilterableTable = () => {
  const [filter, setFilter] = useState('');
  const [categoriesData, setCategoriesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newCategory, setNewCategory] = useState({
    slug: '',
    name: '',
    imageUrl: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  });
  const [image, setImage] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      const list = data.data || [];
      setCategoriesData(list);
      setFilteredData(list);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!filter.trim()) {
      setFilteredData(categoriesData);
    } else {
      const term = filter.toLowerCase();
      const filtered = categoriesData.filter((item) =>
        (item.name && item.name.toLowerCase().includes(term)) ||
        (item.slug && item.slug.toLowerCase().includes(term)) ||
        (item.meta_title && item.meta_title.toLowerCase().includes(term))
      );
      setFilteredData(filtered);
    }
    setPage(0);
  }, [filter, categoriesData]);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAddNewItem = async () => {
    setIsModalOpen(false);
    setIsLoading(true);
    try {
      let imageUrl = newCategory.imageUrl;

      if (image) {
        const imageBase64 = await convertToBase64(image);
        const response = await fetch(`${process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: imageBase64 }),
        });

        const result = await response.json();
        if (response.ok) {
          imageUrl = result.image_url;
        } else {
          throw new Error(result.error || 'Failed to upload image');
        }
      }

      const categoryToSubmit = {
        ...newCategory,
        imageUrl,
      };

      const isEditing = newCategory.slug && categoriesData.some((item) => item.slug === newCategory.slug);
      const response = isEditing
        ? await fetch(`/api/categories/${newCategory.slug}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryToSubmit),
          })
        : await fetch('/api/categories', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryToSubmit),
          });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setNewCategory({
        slug: '',
        name: '',
        imageUrl: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
      });
      setImage(null);
      await fetchCategories();
    } catch (error) {
      console.error('Error adding or updating item:', error);
    }
    setIsLoading(false);
  };

  const handleDeleteItem = async (slug) => {
    if (!window.confirm(`Are you sure you want to delete category "${slug}"?`)) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/categories/${slug}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete category with slug: ${slug}`);
      }

      await fetchCategories();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
    setIsLoading(false);
  };

  const handleEditItem = (item) => {
    setNewCategory({
      slug: item.slug,
      name: item.name,
      imageUrl: item.imageUrl,
      meta_title: item.meta_title || '',
      meta_description: item.meta_description || '',
      meta_keywords: item.meta_keywords || '',
    });
    setImage(null);
    setIsModalOpen(true);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Paginated data
  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ bgcolor: '#FBF9F7', minHeight: '100vh', p: { xs: 2.5, md: 4 } }}>
      {/* Top Luxury Loading Bar Indicator */}
      {isLoading && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', zIndex: 9999 }}>
          <Box className="s2u-progress-bar-primary" sx={{ height: '100%', bgcolor: '#B98C2D' }} />
        </Box>
      )}

      {/* Header section with Cosmetics branding */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ letterSpacing: '0.15em', fontWeight: 700, color: '#B98C2D', display: 'block', mb: 0.5 }}>
            Admin Console • Catalog Architecture
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif', letterSpacing: '-0.02em' }}>
            Categories Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', mt: 0.5 }}>
            Define top-level beauty departments, skincare classifications, and cosmetic taxonomy.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => {
            setNewCategory({
              slug: '',
              name: '',
              imageUrl: '',
              meta_title: '',
              meta_description: '',
              meta_keywords: '',
            });
            setImage(null);
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
          Add New Category
        </Button>
      </Box>

      {/* Overview Stat Badges */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #E8DFC8', borderRadius: '0px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FBF9F7', border: '1px solid #E8DFC8', borderRadius: '0px', color: '#B98C2D' }}>
              <CategoryIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Total Categories
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311' }}>
                {categoriesData.length}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #E8DFC8', borderRadius: '0px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FBF9F7', border: '1px solid #E8DFC8', borderRadius: '0px', color: '#B98C2D' }}>
              <SearchIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Filtered Results
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311' }}>
                {filteredData.length}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #E8DFC8', borderRadius: '0px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FBF9F7', border: '1px solid #E8DFC8', borderRadius: '0px', color: '#B98C2D' }}>
              <CloudUploadIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Media Integrated
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311' }}>
                {categoriesData.filter(c => Boolean(c.imageUrl)).length}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Table Card */}
      <Paper elevation={0} sx={{ bgcolor: '#fff', border: '1px solid #E8DFC8', borderRadius: '0px', overflow: 'hidden' }}>
        {/* Search & Actions Bar */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid #E8DFC8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, bgcolor: '#fff' }}>
          <TextField
            size="small"
            placeholder="Search categories by name, slug or keyword..."
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
            Showing {paginatedData.length} of {filteredData.length} entries
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer sx={{ maxHeight: '65vh', overflowX: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: '70px' }}>
                  ID
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: '90px' }}>
                  Thumbnail
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  Category Name
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  Slug ID
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  SEO Meta Title
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  Last Updated
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: '120px' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow
                    key={item.slug || index}
                    sx={{
                      bgcolor: index % 2 === 0 ? '#fff' : '#FAF8F6',
                      '&:hover': { bgcolor: '#F5EFEB' },
                      borderBottom: '1px solid #E8DFC8',
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: '#8C7A70', fontSize: '0.8rem', borderBottom: '1px solid #E8DFC8' }}>
                      #{item.id}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #E8DFC8' }}>
                      <Box sx={{ width: 48, height: 48, bgcolor: '#FBF9F7', border: '1px solid #E8DFC8', borderRadius: '0px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.imageUrl ? (
                          <Image
                            width={48}
                            height={48}
                            src={item.imageUrl.startsWith('http') ? item.imageUrl : `https://data.tascpa.ca/uploads/${item.imageUrl}`}
                            alt={item.name || 'Category'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <CategoryIcon sx={{ color: '#D2AA2D', fontSize: '1.25rem' }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#141311', fontSize: '0.9rem', borderBottom: '1px solid #E8DFC8' }}>
                      {item.name}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #E8DFC8' }}>
                      <Chip
                        label={item.slug}
                        size="small"
                        sx={{
                          bgcolor: '#FBF9F7',
                          color: '#8C7A70',
                          border: '1px solid #E8DFC8',
                          borderRadius: '0px',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#8C7A70', fontSize: '0.85rem', borderBottom: '1px solid #E8DFC8', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.meta_title || '—'}
                    </TableCell>
                    <TableCell sx={{ color: '#8C7A70', fontSize: '0.8rem', borderBottom: '1px solid #E8DFC8' }}>
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: '1px solid #E8DFC8' }}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => handleEditItem(item)}
                          sx={{
                            borderRadius: '0px',
                            color: '#141311',
                            border: '1px solid #E8DFC8',
                            p: 0.75,
                            '&:hover': { bgcolor: '#141311', color: '#fff' },
                          }}
                        >
                          <EditIcon sx={{ fontSize: '0.95rem' }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteItem(item.slug)}
                          sx={{
                            borderRadius: '0px',
                            color: '#B98C2D',
                            border: '1px solid #E8DFC8',
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
                    <CategoryIcon sx={{ fontSize: '2.5rem', color: '#D2AA2D', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#141311' }}>No categories found</Typography>
                    <Typography variant="caption" sx={{ color: '#8C7A70' }}>Try searching with different terms or click &quot;Add New Category&quot;.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Bar */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid #E8DFC8',
            bgcolor: '#FBF9F7',
            '& .MuiTablePagination-select': { borderRadius: '0px' },
          }}
        />
      </Paper>

      {/* Luxury Add / Edit Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: '#fff',
            p: { xs: 3, md: 4.5 },
            borderRadius: '0px',
            border: '1px solid #E8DFC8',
            boxShadow: '0 24px 60px rgba(18, 11, 16, 0.15)',
            width: '92%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          {/* Modal Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, pb: 2, borderBottom: '1px solid #E8DFC8' }}>
            <Box>
              <Typography variant="overline" sx={{ letterSpacing: '0.12em', fontWeight: 700, color: '#B98C2D', display: 'block' }}>
                Taxonomy Editor
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif' }}>
                {newCategory.slug && categoriesData.some((item) => item.slug === newCategory.slug)
                  ? 'Edit Category'
                  : 'Add New Category'}
              </Typography>
            </Box>
            <IconButton onClick={() => setIsModalOpen(false)} sx={{ borderRadius: '0px', color: '#8C7A70', '&:hover': { bgcolor: '#FBF9F7' } }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category Name *"
                value={newCategory.name}
                onChange={(e) => {
                  const val = e.target.value;
                  const autoSlug = !newCategory.slug || newCategory.slug === newCategory.name.toLowerCase().replace(/\s+/g, '-')
                    ? val.toLowerCase().replace(/\s+/g, '-')
                    : newCategory.slug;
                  setNewCategory({ ...newCategory, name: val, slug: autoSlug });
                }}
                sx={inputStyles}
                placeholder="e.g. Lipsticks & Balms"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Slug ID *"
                value={newCategory.slug}
                onChange={(e) => {
                  const slugValue = e.target.value.toLowerCase().replace(/\s+/g, '-');
                  setNewCategory({ ...newCategory, slug: slugValue });
                }}
                sx={inputStyles}
                placeholder="lipsticks-and-balms"
                helperText="Unique URL identifier for this category"
              />
            </Grid>

            {/* Media Upload Area */}
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#141311', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
                Category Hero Image
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {/* Existing or preview image */}
                {(newCategory.imageUrl || image) && (
                  <Box sx={{ width: 80, height: 80, border: '1px solid #E8DFC8', borderRadius: '0px', overflow: 'hidden', position: 'relative', bgcolor: '#FBF9F7', flexShrink: 0 }}>
                    <Image
                      fill
                      src={image ? URL.createObjectURL(image) : (newCategory.imageUrl.startsWith('http') ? newCategory.imageUrl : `https://data.tascpa.ca/uploads/${newCategory.imageUrl}`)}
                      alt="Category Preview"
                      style={{ objectFit: 'cover' }}
                    />
                  </Box>
                )}

                <Box
                  onClick={() => document.getElementById('category-image-input').click()}
                  sx={{
                    flex: 1,
                    p: 2.5,
                    border: '1px dashed #D2AA2D',
                    borderRadius: '0px',
                    bgcolor: '#FBF9F7',
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F5EFEB', borderColor: '#B98C2D' },
                    transition: 'all 0.2s',
                  }}
                >
                  <CloudUploadIcon sx={{ color: '#B98C2D', fontSize: '1.75rem', mb: 0.5 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {image ? image.name : 'Upload Category Banner'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8C7A70' }}>
                    PNG, JPG, WEBP up to 5MB
                  </Typography>
                  <input
                    id="category-image-input"
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                </Box>
              </Box>
            </Grid>

            {/* SEO Section */}
            <Grid item xs={12}>
              <Box sx={{ pt: 1, borderTop: '1px solid #E8DFC8' }}>
                <Typography variant="overline" sx={{ color: '#8C7A70', fontWeight: 700, letterSpacing: '0.08em', display: 'block', mb: 1.5 }}>
                  SEO & Meta Information
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Title"
                value={newCategory.meta_title}
                onChange={(e) => setNewCategory({ ...newCategory, meta_title: e.target.value })}
                sx={inputStyles}
                placeholder="Organic Beauty & Skincare | Official Store"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Description"
                value={newCategory.meta_description}
                onChange={(e) => setNewCategory({ ...newCategory, meta_description: e.target.value })}
                sx={inputStyles}
                multiline
                rows={2.5}
                placeholder="Explore our curated collection of luxury cosmetic essentials..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Keywords"
                value={newCategory.meta_keywords}
                onChange={(e) => setNewCategory({ ...newCategory, meta_keywords: e.target.value })}
                sx={inputStyles}
                placeholder="cosmetics, lipstick, vegan, cruelty-free, skincare"
              />
            </Grid>
          </Grid>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 4, pt: 2, borderTop: '1px solid #E8DFC8' }}>
            <Button
              onClick={() => setIsModalOpen(false)}
              variant="outlined"
              sx={{
                borderRadius: '0px',
                borderColor: '#E8DFC8',
                color: '#8C7A70',
                px: 3,
                py: 1,
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                '&:hover': { borderColor: '#B98C2D', bgcolor: '#FBF9F7', color: '#141311' },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNewItem}
              variant="contained"
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
                '&:hover': { bgcolor: '#2A1824', boxShadow: 'none' },
              }}
            >
              {categoriesData.some((item) => item.slug === newCategory.slug) ? 'Save Changes' : 'Create Category'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default FilterableTable;