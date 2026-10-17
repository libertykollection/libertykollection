'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Grid,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Stack,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Article as ArticleIcon,
  Category as CategoryIcon,
  PhotoCamera as PhotoCameraIcon,
  Language as SeoIcon,
} from '@mui/icons-material';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

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

const AddBlogs = () => {
  const editorRef = useRef(null);
  const [blogs, setBlogs] = useState([]);
  const [blogCategories, setBlogCategories] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    id: null,
  });

  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    image: '',
    category: '',
    meta_title: '',
    meta_description: '',
    meta_focusKeyword: '',
    web_slug: '',
  });

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blog');
      if (response.ok) {
        const data = await response.json();
        setBlogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blogcategory');
      if (response.ok) {
        const data = await response.json();
        setBlogCategories(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching blog categories:', err);
    }
  };

  const loadAll = async () => {
    setPageLoading(true);
    await Promise.all([fetchBlogs(), fetchCategories()]);
    setPageLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    let result = blogs;

    if (categoryFilter !== 'ALL') {
      result = result.filter((b) => b.category === categoryFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (b) =>
          (b.title && b.title.toLowerCase().includes(term)) ||
          (b.category && b.category.toLowerCase().includes(term)) ||
          (b.web_slug && b.web_slug.toLowerCase().includes(term)) ||
          String(b.id).includes(term)
      );
    }

    setFilteredData(result);
  }, [blogs, searchTerm, categoryFilter]);

  const stats = useMemo(() => {
    return {
      total: blogs.length,
      categoriesCount: blogCategories.length,
    };
  }, [blogs, blogCategories]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      id: '',
      title: '',
      description: '',
      image: '',
      category: blogCategories[0]?.title || '',
      meta_title: '',
      meta_description: '',
      meta_focusKeyword: '',
      web_slug: '',
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (blog) => {
    setIsEditing(true);
    setFormData({
      id: blog.id,
      title: blog.title || '',
      description: blog.description || '',
      image: blog.image || '',
      category: blog.category || '',
      meta_title: blog.meta_title || '',
      meta_description: blog.meta_description || '',
      meta_focusKeyword: blog.meta_focusKeyword || '',
      web_slug: blog.web_slug || '',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (loading) return;
    setDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'title' && !prev.web_slug
        ? { web_slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') }
        : {}),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!(file instanceof Blob)) {
        reject(new Error('Provided value is not a file or blob'));
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadImageToExternalAPI = async (imageBase64) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API}`, {
        image: imageBase64,
      });
      return response.data.image_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Image upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.category ||
      !formData.web_slug.trim()
    ) {
      showToast('Please fill in title, description, category, and slug.', 'error');
      return;
    }

    if (!isEditing && !formData.image) {
      showToast('Please upload a cover image for the article.', 'error');
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = formData.image;

      if (formData.image instanceof File) {
        const imageBase64 = await convertToBase64(formData.image);
        finalImageUrl = await uploadImageToExternalAPI(imageBase64);
      }

      const payload = {
        ...formData,
        image: finalImageUrl,
      };

      if (isEditing) {
        await axios.put(`/api/blog/${formData.id}`, payload);
        showToast('Blog article updated successfully!');
      } else {
        await axios.post('/api/blog', payload);
        showToast('Blog article created successfully!');
      }

      setDialogOpen(false);
      fetchBlogs();
    } catch (err) {
      console.error('Error submitting blog:', err);
      showToast('Failed to save article. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.id) return;
    setLoading(true);
    try {
      await axios.delete(`/api/blog/${deleteConfirmation.id}`);
      showToast('Blog article deleted successfully!', 'warning');
      fetchBlogs();
    } catch (err) {
      console.error('Error deleting blog:', err);
      showToast('Failed to delete blog article.', 'error');
    } finally {
      setLoading(false);
      setDeleteConfirmation({ open: false, id: null });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#FBF9F7', minHeight: '100vh' }}>
      {/* Top Loading Progress Bar */}
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
            Cosmetic Editorial & Beauty Journal
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', letterSpacing: '0.02em' }}>
            Publish skincare guides, cosmetic routine advice, and beauty masterclasses
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
          Publish New Article
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
                Total Published Articles
              </Typography>
              <Typography variant="h4" sx={{ color: '#141311', fontWeight: 600, mt: 0.5, fontFamily: 'serif' }}>
                {stats.total}
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
              <ArticleIcon fontSize="small" />
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
                Active Categories
              </Typography>
              <Typography variant="h4" sx={{ color: '#141311', fontWeight: 600, mt: 0.5, fontFamily: 'serif' }}>
                {stats.categoriesCount}
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
          border: '1px solid #E8DFC8',
          bgcolor: '#fff',
          overflow: 'hidden',
        }}
      >
        {/* Table Filters Toolbar */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #E8DFC8',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flex: 1 }}>
            <TextField
              size="small"
              placeholder="Search articles by title, slug or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: { xs: '100%', sm: 340 }, ...inputStyles }}
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

            <FormControl size="small" sx={{ width: { xs: '100%', sm: 220 }, ...inputStyles }}>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Categories</MenuItem>
                {blogCategories.map((c) => (
                  <MenuItem key={c.id} value={c.title}>
                    {c.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Typography variant="caption" sx={{ color: '#8C7A70', letterSpacing: '0.04em' }}>
            Showing {filteredData.length} of {blogs.length} articles
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FBF9F7' }}>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: 70 }}>
                  ID
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: 80 }}>
                  Cover
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  Article Details
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: 160 }}>
                  Category
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: 180 }}>
                  Web Slug
                </TableCell>
                <TableCell align="right" sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: 110 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => {
                  const plainText = (item.description || '').replace(/<[^>]+>/g, '').trim();
                  const excerpt = plainText.length > 90 ? plainText.substring(0, 90) + '...' : plainText;
                  const imageUrl = item.image
                    ? `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${item.image}`
                    : null;

                  return (
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
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: '#F9F5EC',
                            border: '1px solid #E8DFC8',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={item.title || 'Blog cover'}
                              fill
                              sizes="48px"
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ArticleIcon sx={{ fontSize: 20, color: '#D2AA2D' }} />
                            </Box>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontWeight: 600, color: '#141311', fontSize: '0.9rem', mb: 0.25 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#8C7A70', display: 'block' }}>
                          {excerpt || 'No description preview available.'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={item.category || 'Uncategorized'}
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
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#B98C2D', bgcolor: '#FBF9F7', px: 1, py: 0.5, border: '1px solid #E8DFC8', display: 'inline-block' }}>
                          /{item.web_slug || 'no-slug'}
                        </Typography>
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
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#8C7A70' }}>
                    <ArticleIcon sx={{ fontSize: 36, color: '#D2AA2D', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#141311' }}>
                      No articles found matching criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Publish / Edit Article Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        disableEnforceFocus
        PaperProps={{
          sx: {
            borderRadius: '0px',
            border: '1px solid #E8DFC8',
            boxShadow: '0 24px 48px rgba(18, 11, 16, 0.15)',
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
              {isEditing ? 'Edit Cosmetic Article' : 'Compose New Beauty Article'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#8C7A70' }}>
              Create rich editorial stories, masterclasses, and routine advice
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} disabled={loading} size="small">
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 3, maxHeight: '75vh', overflowY: 'auto' }}>
            <Grid container spacing={3}>
              {/* Left Column: Core Details & Body */}
              <Grid item xs={12} md={8}>
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                    Article Headline *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. The 7-Step Hydration Ritual for Dewy Morning Skin"
                    required
                    sx={inputStyles}
                  />
                </Box>

                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                    Category Taxonomy *
                  </Typography>
                  <FormControl fullWidth size="small" sx={inputStyles}>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      {blogCategories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.title}>
                          {cat.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                    Article Body & Rich Content *
                  </Typography>
                  <Box sx={{ border: '1px solid #E8DFC8' }}>
                    <JoditEditor
                      ref={editorRef}
                      value={formData.description}
                      onBlur={(newContent) =>
                        setFormData((prev) => ({ ...prev, description: newContent }))
                      }
                      onChange={() => {}}
                    />
                  </Box>
                </Box>
              </Grid>

              {/* Right Column: Cover Image & SEO */}
              <Grid item xs={12} md={4}>
                {/* Cover Image Box */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    border: '1px solid #E8DFC8',
                    borderRadius: '0px',
                    bgcolor: '#FBF9F7',
                    mb: 3,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1.5 }}>
                    Featured Cover Image
                  </Typography>

                  <Box
                    sx={{
                      width: '100%',
                      height: 180,
                      bgcolor: '#fff',
                      border: '1px dashed #D2AA2D',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      mb: 1.5,
                    }}
                  >
                    {formData.image ? (
                      formData.image instanceof File ? (
                        <img
                          src={URL.createObjectURL(formData.image)}
                          alt="Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${formData.image}`}
                          alt="Cover"
                          fill
                          sizes="280px"
                          style={{ objectFit: 'cover' }}
                        />
                      )
                    ) : (
                      <>
                        <PhotoCameraIcon sx={{ fontSize: 32, color: '#D2AA2D', mb: 0.5 }} />
                        <Typography variant="caption" sx={{ color: '#8C7A70' }}>
                          Upload square/wide banner
                        </Typography>
                      </>
                    )}
                  </Box>

                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    size="small"
                    sx={{
                      borderRadius: '0px',
                      color: '#141311',
                      borderColor: '#141311',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      '&:hover': { borderColor: '#B98C2D', bgcolor: '#F9F5EC' },
                    }}
                  >
                    Select Cover Photo
                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                  </Button>
                </Paper>

                {/* SEO Settings */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    border: '1px solid #E8DFC8',
                    borderRadius: '0px',
                    bgcolor: '#FBF9F7',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SeoIcon sx={{ fontSize: 18, color: '#B98C2D' }} />
                    <Typography variant="caption" sx={{ color: '#141311', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      SEO & Meta Settings
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#8C7A70', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                      URL Slug *
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      name="web_slug"
                      value={formData.web_slug}
                      onChange={handleInputChange}
                      placeholder="e.g. morning-skincare-ritual"
                      sx={inputStyles}
                    />
                  </Box>

                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#8C7A70', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                      Meta Title
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleInputChange}
                      placeholder="Title for search engines"
                      sx={inputStyles}
                    />
                  </Box>

                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#8C7A70', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                      Focus Keyword
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      name="meta_focusKeyword"
                      value={formData.meta_focusKeyword}
                      onChange={handleInputChange}
                      placeholder="e.g. luxury skincare, hydrating serum"
                      sx={inputStyles}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: '#8C7A70', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                      Meta Description
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleInputChange}
                      placeholder="Brief snippet shown in search results..."
                      multiline
                      rows={2}
                      sx={inputStyles}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E8DFC8', gap: 1 }}>
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
                '&:hover': { bgcolor: '#F9F5EC', color: '#141311' },
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
                '&:hover': { bgcolor: '#B98C2D', boxShadow: 'none' },
              }}
            >
              {loading ? 'Publishing...' : isEditing ? 'Update Article' : 'Publish Article'}
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
            border: '1px solid #E8DFC8',
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'serif', color: '#141311' }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#8C7A70' }}>
            Are you sure you want to permanently delete article #{deleteConfirmation.id}?
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

export default AddBlogs;
