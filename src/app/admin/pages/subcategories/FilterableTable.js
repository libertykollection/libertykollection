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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import AccountTreeIcon from '@mui/icons-material/AccountTree';
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

const selectMenuProps = {
  PaperProps: {
    sx: {
      borderRadius: '0px',
      border: '1px solid #E8DFC8',
      boxShadow: '0 12px 30px rgba(18, 11, 16, 0.08)',
      '& .MuiMenuItem-root': {
        fontSize: '0.875rem',
        '&.Mui-selected': {
          bgcolor: '#FBF9F7',
          color: '#B98C2D',
          fontWeight: 700,
        },
      },
    },
  },
};

const FilterableTable = ({ subcategories = [], fetchSubcategories }) => {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newSubcategory, setNewSubcategory] = useState({
    name: '',
    slug: '',
    categoryId: '',
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
    if (Array.isArray(subcategories)) {
      if (!filter.trim()) {
        setFilteredData(subcategories);
      } else {
        const term = filter.toLowerCase();
        const filtered = subcategories.filter((item) =>
          (item.name && item.name.toLowerCase().includes(term)) ||
          (item.slug && item.slug.toLowerCase().includes(term)) ||
          (item.category && item.category.name && item.category.name.toLowerCase().includes(term))
        );
        setFilteredData(filtered);
      }
      setPage(0);
    }
  }, [filter, subcategories]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setCategories(result.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error.message);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchCategories();
    }
  }, [isModalOpen]);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const resetForm = () => {
    setNewSubcategory({
      name: '',
      slug: '',
      categoryId: '',
      imageUrl: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
    });
    setImage(null);
  };

  const handleAddNewItem = async () => {
    setIsLoading(true);
    try {
      let imageUrl = newSubcategory.imageUrl;

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

      const updatedSlug = newSubcategory.slug ? newSubcategory.slug : generateSlug(newSubcategory.name);

      const subcategoryToSubmit = {
        ...newSubcategory,
        slug: updatedSlug,
        categoryId: parseInt(newSubcategory.categoryId, 10),
        imageUrl,
      };

      const isEditing = Boolean(newSubcategory.id || (newSubcategory.slug && subcategories.some(s => s.slug === newSubcategory.slug)));
      const response = isEditing
        ? await fetch(`/api/subcategories/${newSubcategory.slug}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subcategoryToSubmit),
          })
        : await fetch('/api/subcategories', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subcategoryToSubmit),
          });

      const result = await response.json();

      if (response.ok) {
        if (fetchSubcategories) fetchSubcategories();
        setIsModalOpen(false);
        resetForm();
      } else {
        alert(`Failed to save subcategory: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
    setIsLoading(false);
  };

  const handleDeleteItem = async (slug) => {
    if (!window.confirm(`Are you sure you want to delete subcategory "${slug}"?`)) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/subcategories/${slug}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete subcategory');
      }

      if (fetchSubcategories) fetchSubcategories();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
    }
    setIsLoading(false);
  };

  const handleEditItem = (item) => {
    setNewSubcategory({
      ...item,
      slug: item.slug,
      categoryId: item.categoryId || (item.category ? item.category.id : ''),
      image: null,
      imageUrl: item.imageUrl || '',
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

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ bgcolor: '#FBF9F7', minHeight: '100vh', p: { xs: 2.5, md: 4 } }}>
      {/* Top Loading Line */}
      {isLoading && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', zIndex: 9999 }}>
          <Box className="s2u-progress-bar-primary" sx={{ height: '100%', bgcolor: '#B98C2D' }} />
        </Box>
      )}

      {/* Header section with Cosmetics branding */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ letterSpacing: '0.15em', fontWeight: 700, color: '#B98C2D', display: 'block', mb: 0.5 }}>
            Admin Console • Granular Classification
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif', letterSpacing: '-0.02em' }}>
            Subcategories Directory
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', mt: 0.5 }}>
            Organize nested cosmetics product types (e.g. Matte Lipsticks, Hydrating Serums, Mineral Powders).
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => {
            resetForm();
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
          Add New Subcategory
        </Button>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #E8DFC8', borderRadius: '0px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FBF9F7', border: '1px solid #E8DFC8', borderRadius: '0px', color: '#B98C2D' }}>
              <AccountTreeIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Total Subcategories
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311' }}>
                {subcategories.length}
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
                Matching Results
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
                With Visual Media
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311' }}>
                {subcategories.filter(s => Boolean(s.imageUrl)).length}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Table Container */}
      <Paper elevation={0} sx={{ bgcolor: '#fff', border: '1px solid #E8DFC8', borderRadius: '0px', overflow: 'hidden' }}>
        {/* Search Bar */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid #E8DFC8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, bgcolor: '#fff' }}>
          <TextField
            size="small"
            placeholder="Search by subcategory name, parent category, or slug..."
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
            Showing {paginatedData.length} of {filteredData.length} subcategories
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
                  Subcategory Name
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  Parent Category
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  Slug ID
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
                            alt={item.name || 'Subcategory'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <AccountTreeIcon sx={{ color: '#D2AA2D', fontSize: '1.25rem' }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#141311', fontSize: '0.9rem', borderBottom: '1px solid #E8DFC8' }}>
                      {item.name}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #E8DFC8' }}>
                      <Chip
                        label={item.category ? item.category.name : `Category #${item.categoryId || '—'}`}
                        size="small"
                        sx={{
                          bgcolor: '#FBF9F7',
                          color: '#141311',
                          border: '1px solid #E8DFC8',
                          borderRadius: '0px',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      />
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
                    <AccountTreeIcon sx={{ fontSize: '2.5rem', color: '#D2AA2D', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#141311' }}>No subcategories found</Typography>
                    <Typography variant="caption" sx={{ color: '#8C7A70' }}>Try searching with different terms or click &quot;Add New Subcategory&quot;.</Typography>
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
                Classification Form
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif' }}>
                {newSubcategory.slug && subcategories.some((s) => s.slug === newSubcategory.slug)
                  ? 'Edit Subcategory'
                  : 'Add New Subcategory'}
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
                label="Subcategory Name *"
                value={newSubcategory.name}
                onChange={(e) => {
                  const val = e.target.value;
                  const autoSlug = !newSubcategory.slug || newSubcategory.slug === generateSlug(newSubcategory.name)
                    ? generateSlug(val)
                    : newSubcategory.slug;
                  setNewSubcategory({ ...newSubcategory, name: val, slug: autoSlug });
                }}
                sx={inputStyles}
                placeholder="e.g. Matte Lipsticks"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={inputStyles}>
                <InputLabel id="category-select-label">Parent Category *</InputLabel>
                <Select
                  labelId="category-select-label"
                  value={newSubcategory.categoryId}
                  onChange={(e) => setNewSubcategory({ ...newSubcategory, categoryId: e.target.value })}
                  label="Parent Category *"
                  MenuProps={selectMenuProps}
                >
                  <MenuItem value="">Select Parent Category</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id || cat.slug} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Slug ID *"
                value={newSubcategory.slug}
                onChange={(e) => setNewSubcategory({ ...newSubcategory, slug: generateSlug(e.target.value) })}
                sx={inputStyles}
                placeholder="matte-lipsticks"
                helperText="Unique URL identifier for this subcategory"
              />
            </Grid>

            {/* Media Upload Area */}
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#141311', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
                Subcategory Banner / Icon
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {(newSubcategory.imageUrl || image) && (
                  <Box sx={{ width: 80, height: 80, border: '1px solid #E8DFC8', borderRadius: '0px', overflow: 'hidden', position: 'relative', bgcolor: '#FBF9F7', flexShrink: 0 }}>
                    <Image
                      fill
                      src={image ? URL.createObjectURL(image) : (newSubcategory.imageUrl.startsWith('http') ? newSubcategory.imageUrl : `https://data.tascpa.ca/uploads/${newSubcategory.imageUrl}`)}
                      alt="Subcategory Preview"
                      style={{ objectFit: 'cover' }}
                    />
                  </Box>
                )}

                <Box
                  onClick={() => document.getElementById('subcategory-image-input').click()}
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
                    {image ? image.name : 'Upload Subcategory Visual'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8C7A70' }}>
                    PNG, JPG, WEBP up to 5MB
                  </Typography>
                  <input
                    id="subcategory-image-input"
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
                value={newSubcategory.meta_title}
                onChange={(e) => setNewSubcategory({ ...newSubcategory, meta_title: e.target.value })}
                sx={inputStyles}
                placeholder="Long-Lasting Matte Lipsticks | Official Store"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Description"
                value={newSubcategory.meta_description}
                onChange={(e) => setNewSubcategory({ ...newSubcategory, meta_description: e.target.value })}
                sx={inputStyles}
                multiline
                rows={2.5}
                placeholder="Discover highly pigmented, smudge-proof matte lipsticks in all flattering tones..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Keywords"
                value={newSubcategory.meta_keywords}
                onChange={(e) => setNewSubcategory({ ...newSubcategory, meta_keywords: e.target.value })}
                sx={inputStyles}
                placeholder="matte lipstick, velvet lip, cruelty-free"
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
                letterSpacing: '0.05em',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#2A1824', boxShadow: 'none' },
              }}
            >
              {subcategories.some((s) => s.slug === newSubcategory.slug) ? 'Save Changes' : 'Create Subcategory'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default FilterableTable;