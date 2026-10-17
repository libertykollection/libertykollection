'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ViewCarousel as SliderIcon,
  CloudUpload as CloudUploadIcon,
  Link as LinkIcon,
  Close as CloseIcon,
  Launch as LaunchIcon
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

const FilterableSliderTable = ({ sliders = [], fetchSliders }) => {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState(sliders);
  const [isLoading, setIsLoading] = useState(false);
  const [editSlider, setEditSlider] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sliderForm, setSliderForm] = useState({
    imgurl: '',
    link: '',
  });
  const [existingImage, setExistingImage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!filter.trim()) {
      setFilteredData(sliders || []);
    } else {
      const term = filter.toLowerCase();
      setFilteredData(
        (sliders || []).filter((item) =>
          (item.link && item.link.toLowerCase().includes(term)) ||
          String(item.id).includes(term)
        )
      );
    }
  }, [filter, sliders]);

  const stats = useMemo(() => {
    const list = sliders || [];
    return {
      total: list.length,
      linked: list.filter(s => Boolean(s.link)).length,
      hasImage: list.filter(s => Boolean(s.imgurl)).length,
    };
  }, [sliders]);

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hero slider banner?')) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/slider/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok && fetchSliders) {
        fetchSliders();
      }
    } catch (error) {
      console.error('Error deleting slider:', error);
    }
    setIsLoading(false);
  };

  const handleEditItem = (item) => {
    setEditSlider(item);
    setSliderForm({
      imgurl: '',
      link: item.link || '',
    });
    setExistingImage(item.imgurl || '');
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setEditSlider(null);
    setSliderForm({
      imgurl: '',
      link: '',
    });
    setExistingImage('');
    setIsModalOpen(true);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsModalOpen(false);
    setIsLoading(true);

    try {
      let uploadedImageUrl = existingImage;

      if (fileInputRef.current && fileInputRef.current.files.length > 0) {
        const imageBase64 = await convertToBase64(fileInputRef.current.files[0]);
        const response = await fetch(`${process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: imageBase64 }),
        });
        const result = await response.json();
        if (response.ok) {
          uploadedImageUrl = result.image_url;
        } else {
          throw new Error(result.error || 'Failed to upload image');
        }
      }

      const sliderData = {
        imgurl: uploadedImageUrl,
        link: sliderForm.link,
      };

      const method = editSlider ? 'PUT' : 'POST';
      const url = editSlider ? `/api/slider/${editSlider.id}` : '/api/slider';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sliderData),
      });

      if (response.ok) {
        if (fetchSliders) fetchSliders();
        setEditSlider(null);
        setSliderForm({ imgurl: '', link: '' });
        setExistingImage('');
      } else {
        alert('Failed to save slider banner');
      }
    } catch (error) {
      console.error('Error saving slider:', error);
    }
    setIsLoading(false);
  };

  return (
    <Box sx={{ bgcolor: '#FBF9F7', minHeight: '100vh', p: { xs: 2.5, md: 4 } }}>
      {/* Top Loading Line */}
      {isLoading && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', zIndex: 9999 }}>
          <Box className="s2u-progress-bar-primary" sx={{ height: '100%', bgcolor: '#B98C2D' }} />
        </Box>
      )}

      {/* Header section */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ letterSpacing: '0.15em', fontWeight: 700, color: '#B98C2D', display: 'block', mb: 0.5 }}>
            Admin Console • Storefront Visual Merchandising
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif', letterSpacing: '-0.02em' }}>
            Hero Carousel & Banners
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', mt: 0.5 }}>
            Curate hero slides, promotion graphics, and direct customer landing links for the storefront homepage.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleAddItem}
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
          Add New Hero Slide
        </Button>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #E8DFC8', borderRadius: '0px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FBF9F7', border: '1px solid #E8DFC8', borderRadius: '0px', color: '#B98C2D' }}>
              <SliderIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Total Active Slides
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311' }}>
                {stats.total}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #E8DFC8', borderRadius: '0px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FBF9F7', border: '1px solid #E8DFC8', borderRadius: '0px', color: '#B98C2D' }}>
              <LinkIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Campaign Links
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#166534' }}>
                {stats.linked}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #E8DFC8', borderRadius: '0px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FBF9F7', border: '1px solid #E8DFC8', borderRadius: '0px', color: '#B98C2D' }}>
              <CloudUploadIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Live Media Banners
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311' }}>
                {stats.hasImage}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Table Card */}
      <Paper elevation={0} sx={{ bgcolor: '#fff', border: '1px solid #E8DFC8', borderRadius: '0px', overflow: 'hidden' }}>
        {/* Search Bar */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid #E8DFC8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, bgcolor: '#fff' }}>
          <TextField
            size="small"
            placeholder="Search slides by target link or ID..."
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
            {filteredData.length} banner items in sequence
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
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: '220px' }}>
                  Banner Graphic
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  Target Destination URL
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: '120px' }}>
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
                      borderBottom: '1px solid #E8DFC8',
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: '#8C7A70', fontSize: '0.8rem', borderBottom: '1px solid #E8DFC8' }}>
                      #{item.id}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #E8DFC8' }}>
                      <Box
                        sx={{
                          width: 180,
                          height: 75,
                          border: '1px solid #E8DFC8',
                          borderRadius: '0px',
                          overflow: 'hidden',
                          position: 'relative',
                          bgcolor: '#FBF9F7',
                        }}
                      >
                        {item.imgurl ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${item.imgurl}`}
                            alt={`Slider #${item.id}`}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8C7A70' }}>
                            <SliderIcon sx={{ fontSize: '1.5rem', color: '#D2AA2D' }} />
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #E8DFC8' }}>
                      {item.link ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={item.link}
                            size="small"
                            sx={{
                              borderRadius: '0px',
                              bgcolor: '#FBF9F7',
                              border: '1px solid #E8DFC8',
                              color: '#141311',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              fontFamily: 'monospace'
                            }}
                          />
                          <IconButton
                            size="small"
                            href={item.link.startsWith('http') ? item.link : `http://${item.link}`}
                            target="_blank"
                            sx={{ borderRadius: '0px', p: 0.5, color: '#8C7A70' }}
                          >
                            <LaunchIcon sx={{ fontSize: '0.85rem' }} />
                          </IconButton>
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#8C7A70' }}>No Destination Linked (Static Banner)</Typography>
                      )}
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
                          onClick={() => handleDeleteItem(item.id)}
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
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 8, color: '#8C7A70' }}>
                    <SliderIcon sx={{ fontSize: '2.5rem', color: '#D2AA2D', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#141311' }}>No hero banners found</Typography>
                    <Typography variant="caption" sx={{ color: '#8C7A70' }}>Click &quot;Add New Hero Slide&quot; to configure storefront visuals.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add / Edit Slide Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '0px',
            border: '1px solid #E8DFC8',
            boxShadow: '0 24px 60px rgba(18, 11, 16, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3.5, px: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E8DFC8' }}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: '0.12em', fontWeight: 700, color: '#B98C2D', display: 'block' }}>
              Carousel Slide
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif' }}>
              {editSlider ? 'Edit Hero Banner' : 'Add Hero Slide'}
            </Typography>
          </Box>
          <IconButton onClick={() => setIsModalOpen(false)} sx={{ borderRadius: '0px', color: '#8C7A70' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent sx={{ px: 4, py: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              <TextField
                label="Target Link (Click URL)"
                fullWidth
                name="link"
                value={sliderForm.link}
                onChange={(e) => setSliderForm({ ...sliderForm, link: e.target.value })}
                placeholder="e.g. /customer/pages/product-detail?slug=velvet-matte-lipstick"
                sx={inputStyles}
                helperText="Where customer will land upon clicking this hero banner"
              />

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#141311', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
                  Banner Graphic Image
                </Typography>

                {existingImage && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: '#8C7A70', display: 'block', mb: 0.5 }}>Current Image Preview:</Typography>
                    <Box sx={{ width: '100%', height: 120, position: 'relative', border: '1px solid #E8DFC8', borderRadius: '0px', overflow: 'hidden' }}>
                      <Image
                        src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${existingImage}`}
                        alt="Existing banner"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
                  </Box>
                )}

                <Box
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  sx={{
                    border: '1px dashed #D2AA2D',
                    borderRadius: '0px',
                    bgcolor: '#FBF9F7',
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F5EFEB', borderColor: '#B98C2D' },
                    transition: 'all 0.2s',
                  }}
                >
                  <CloudUploadIcon sx={{ color: '#B98C2D', fontSize: '2rem', mb: 0.5 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {sliderForm.imgurl ? sliderForm.imgurl.name : (existingImage ? 'Replace Banner Graphic' : 'Upload High-Res Banner')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8C7A70' }}>
                    Recommended ratio: 1920x600 or 16:9 (JPG, PNG, WEBP)
                  </Typography>
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => setSliderForm({ ...sliderForm, imgurl: e.target.files[0] })}
                  />
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, px: 4, borderTop: '1px solid #E8DFC8', display: 'flex', gap: 1.5 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => setIsModalOpen(false)}
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
                '&:hover': { borderColor: '#B98C2D', bgcolor: '#FBF9F7', color: '#141311' }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
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
                '&:hover': { bgcolor: '#2A1824', boxShadow: 'none' }
              }}
            >
              {editSlider ? 'Update Banner' : 'Publish Banner'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default FilterableSliderTable;
