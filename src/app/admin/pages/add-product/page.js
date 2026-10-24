'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// MUI Imports
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  Stack,
  Card,
  CardContent,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Close as CloseIcon,
  Description as DescriptionIcon,
  Info as InfoIcon,
  LocalOffer as LocalOfferIcon,
  Inventory as InventoryIcon,
  Style as StyleIcon,
  Public as PublicIcon,
  CloudUpload as CloudUploadIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

// React Quill (dynamically imported as in your code)
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

const AddProductPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');

  const [newProduct, setNewProduct] = useState({
    id: null,
    name: '',
    slug: '',
    richDescription: '',
    price: '',
    stock: '',
    categorySlug: '',
    subcategorySlug: '',
    colors: [],
    sizes: [],
    image: [],
    imageUrl: '',
    discount: '',
    isTopRated: false,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    sku: '',
    productType: 'tangible', // Default to tangible
  });

  const [digitalFiles, setDigitalFiles] = useState([]);
  const [digitalDimensions, setDigitalDimensions] = useState({
    height: { value: '', unit: 'px' },
    width: { value: '', unit: 'px' }
  });
  const [digitalTags, setDigitalTags] = useState([]); // Array for tags
  const [digitalMaterials, setDigitalMaterials] = useState([]); // Array for materials
  const [personalization, setPersonalization] = useState({ enabled: false, instruction: '' });
  const [settings, setSettings] = useState({
    shopSection: '',
    featureListing: false,
    renewalOption: 'automatic'
  });
  const [colorsMeta, setColorsMeta] = useState({ primary: '', secondary: '' });

  const [categories, setCategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    fetchColors();
    fetchSizes();

    if (productId) {
      fetchProductData(productId);
    }
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchSubcategories = async (categorySlug) => {
    try {
      const response = await fetch(`/api/subcategories/${categorySlug}`);
      if (!response.ok) throw new Error('Failed to fetch subcategories');
      const data = await response.json();
      setFilteredSubcategories(data?.data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      // alert(`Failed to fetch subcategories: ${error.message}`); // Optional: Don't spam alert on load, maybe just log or toast
      setFilteredSubcategories([]);
    }
  };

  const fetchColors = async () => {
    try {
      const response = await fetch('/api/colors');
      if (!response.ok) throw new Error('Failed to fetch colors');
      const data = await response.json();
      const mappedColors = data.map((color) => ({
        value: color.id,
        label: `${color.name} (${color.hex})`,
        hex: color.hex,
      }));
      setColors(mappedColors);
    } catch (error) {
      console.error('Error fetching colors:', error);
      setColors([]);
    }
  };

  const fetchSizes = async () => {
    try {
      const response = await fetch('/api/sizes');
      if (!response.ok) throw new Error('Failed to fetch sizes');
      const data = await response.json();
      const mappedSizes = data.map((size) => ({
        value: size.id,
        label: size.name,
      }));
      setSizes(mappedSizes);
    } catch (error) {
      console.error('Error fetching sizes:', error);
      setSizes([]);
    }
  };

  const fetchProductData = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product data');
      const data = await response.json();

      const parsedColors = Array.isArray(data.colors)
        ? data.colors.map((color) => ({
          value: color.id,
          label: `${color.name} (${color.hex})`,
          hex: color.hex,
        }))
        : [];
      const parsedSizes = Array.isArray(data.sizes)
        ? data.sizes.map((size) => ({
          value: size.id,
          label: size.name,
        }))
        : [];

      setNewProduct({
        ...data,
        colors: parsedColors,
        sizes: parsedSizes,
      });
      setExistingImages(data.images || []);
      if (data.categoryId) await fetchSubcategories(data.categoryId);
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
    setIsLoading(false);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAddNewItem = async () => {
    const requiredFields = [
      { name: 'name', label: 'Product Name' },
      { name: 'slug', label: 'Slug' },
      { name: 'richDescription', label: 'Description' },
      { name: 'price', label: 'Price' },
      { name: 'categorySlug', label: 'Category' },
      { name: 'subcategorySlug', label: 'Subcategory' },
    ];

    if (newProduct.productType === 'tangible') {
      requiredFields.push({ name: 'stock', label: 'Stock' });
    }

    let missingFields = requiredFields
      .filter((field) => typeof newProduct[field.name] === 'string' && !newProduct[field.name].trim())
      .map((field) => field.label);

    // Specific check for stock as number
    if (newProduct.productType === 'tangible' && (newProduct.stock === '' || newProduct.stock === null || newProduct.stock === undefined)) {
      if (!missingFields.includes('Stock')) missingFields.push('Stock');
    }

    if (missingFields.length > 0) {
      alert(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsLoading(true);

    try {
      const existingProductResponse = await fetch(`/api/products/${newProduct.slug}`);
      const existingData = await existingProductResponse.json();

      if (existingData.status === false) {
        alert('Product with this slug already exists.');
        setIsLoading(false);
        return;
      }

      // Upload Images
      const uploadedImages = await Promise.all(
        images.map(async (img) => {
          const imageBase64 = await convertToBase64(img);
          const response = await fetch(`${process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageBase64 }),
          });
          const result = await response.json();
          if (response.ok) return result.image_url;
          throw new Error(result.error || 'Failed to upload image');
        })
      );

      const imageUrls = uploadedImages.map((filename) => `${filename}`);

      // Upload Digital Files (Reuse Image API for now or handle appropriately)
      const uploadedDigitalFiles = await Promise.all(
        digitalFiles.map(async (file) => {
          const fileBase64 = await convertToBase64(file);
          const response = await fetch(`${process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API}`, { // Using same endpoint for demo/simplicity as we don't have a specific file endpoint yet
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: fileBase64 }),
          });
          const result = await response.json();
          if (response.ok) return { name: file.name, url: result.image_url };
          throw new Error(result.error || 'Failed to upload digital file');
        })
      );

      const digitalData = {
        files: uploadedDigitalFiles,
        dimensions: digitalDimensions,
        tags: digitalTags,
        materials: digitalMaterials,
        personalization: personalization,
        settings: settings,
        size: newProduct.digitalData?.size || ''
      };

      const productToSubmit = {
        ...newProduct,
        description: newProduct.richDescription,
        price: parseFloat(newProduct.price),
        stock: newProduct.productType === 'tangible' ? parseInt(newProduct.stock, 10) : 0, // 0 or -1 for digital?
        subcategorySlug: newProduct.subcategorySlug,
        colors: newProduct.productType === 'tangible' ? JSON.stringify(newProduct.colors.map((color) => color.value)) : null,
        sizes: newProduct.productType === 'tangible' ? JSON.stringify(newProduct.sizes.map((size) => size.value)) : null,
        images: imageUrls,
        discount: newProduct.discount ? roundToTwoDecimalPlaces(parseFloat(newProduct.discount)) : null,
        isTopRated: newProduct.isTopRated,
        meta_title: newProduct.meta_title,
        meta_description: newProduct.meta_description,
        meta_keywords: newProduct.meta_keywords,
        sku: newProduct.sku,
        productType: newProduct.productType,
        digitalData: newProduct.productType === 'digital' ? digitalData : null
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productToSubmit),
      });

      if (response.ok) {
        router.push('/admin/pages/Products');
      } else {
        console.error('Create product failed. Status:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Raw error response:', errorText);

        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error('Failed to parse error response as JSON');
          errorData = { message: errorText || 'Unknown error (non-JSON response)' };
        }

        console.error('Parsed error data:', errorData);
        alert(`Failed to create product: ${errorData.error || errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert(`Error adding product: ${error.message}`);
    }

    setIsLoading(false);
  };

  const roundToTwoDecimalPlaces = (num) => {
    return Math.round(num * 100) / 100;
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '0px',
      bgcolor: '#fff',
      '& fieldset': { borderColor: '#F0DCE3' },
      '&:hover fieldset': { borderColor: '#C53261' },
      '&.Mui-focused fieldset': { borderColor: '#C53261' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#C53261' },
  };

  const sectionHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    mb: 2.5,
    pb: 1,
    borderBottom: '1px solid #F0DCE3'
  };

  const selectMenuProps = {
    PaperProps: {
      sx: {
        borderRadius: '0px',
        mt: 1,
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        border: '1px solid #F0DCE3',
        '& .MuiList-root': { p: 1 },
        '& .MuiMenuItem-root': {
          fontSize: '0.875rem',
          fontWeight: 500,
          borderRadius: '0px',
          mb: 0.5,
          color: '#374151',
          '&:hover': { bgcolor: '#F8F5F2', color: '#C53261' },
          '&.Mui-selected': {
            bgcolor: '#FBF9F7',
            color: '#C53261',
            fontWeight: 700,
            '&:hover': { bgcolor: '#F8F5F2' }
          },
        }
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', p: 0 }}>
      {/* Loading Overlay */}
      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(18, 11, 16, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#fff',
              borderRadius: '0px',
              p: 4,
              border: '1px solid #F0DCE3',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CircularProgress sx={{ color: '#C53261', mb: 2 }} />
            <Typography variant="body2" sx={{ color: '#141311', fontWeight: 700 }}>Processing Request...</Typography>
          </Box>
        </Box>
      )}

      {/* Header & Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2, pb: 3, borderBottom: '1px solid #F0DCE3' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            onClick={() => router.back()}
            sx={{
              minWidth: '38px',
              width: '38px',
              height: '38px',
              borderRadius: '0px',
              bgcolor: '#fff',
              color: '#141311',
              border: '1px solid #F0DCE3',
              '&:hover': { bgcolor: '#F8F5F2', borderColor: '#C53261' },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: '1.1rem' }} />
          </Button>
          <Box>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#C53261]"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C53261]">
                Catalog Entry
              </span>
            </div>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif' }}>
              {newProduct.id ? 'Edit Product' : 'Add New Product'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#8C7A70', fontSize: '0.8rem', mt: 0.5 }}>
              {newProduct.id ? `Modifying existing product ID: ${newProduct.id}` : 'Create a fresh entry in your beauty product catalog'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/admin/pages/Products')}
            sx={{
              textTransform: 'none',
              borderRadius: '0px',
              px: 3,
              py: 1,
              fontSize: '0.8rem',
              fontWeight: 600,
              borderColor: '#F0DCE3',
              color: '#141311',
              bgcolor: '#fff',
              '&:hover': { borderColor: '#C53261', bgcolor: '#F8F5F2' }
            }}
          >
            Discard
          </Button>
          <Button
            variant="contained"
            onClick={handleAddNewItem}
            startIcon={<SaveIcon />}
            sx={{
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderRadius: '0px',
              px: 3.5,
              py: 1,
              fontSize: '0.75rem',
              fontWeight: 700,
              bgcolor: '#141311',
              color: '#fff',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#C53261', boxShadow: 'none' }
            }}
          >
            {newProduct.id ? 'Save Changes' : 'Create Product'}
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={newProduct.productType}
          exclusive
          onChange={(e, newType) => {
            if (newType !== null) {
              setNewProduct({ ...newProduct, productType: newType });
            }
          }}
          aria-label="product type"
          sx={{
            bgcolor: '#fff',
            borderRadius: '0px',
            border: '1px solid #F0DCE3',
            '& .MuiToggleButton-root': {
              borderRadius: '0px',
              border: 'none',
              px: 3.5,
              py: 1,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#8C7A70',
              '&.Mui-selected': {
                bgcolor: '#141311',
                color: '#fff',
                '&:hover': { bgcolor: '#1E141B' }
              }
            }
          }}
        >
          <ToggleButton value="tangible">
            Tangible Cosmetics
          </ToggleButton>
          <ToggleButton value="digital">
            Digital Asset
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: General & Description & Attributes */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            {/* General Info Card */}
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: '0px', border: '1px solid #F0DCE3', bgcolor: '#fff' }}>
              <Box sx={sectionHeaderStyles}>
                <Box sx={{ p: 1, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261', display: 'flex' }}>
                  <InfoIcon sx={{ fontSize: '1.25rem' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>General Details</Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    id="product-name"
                    fullWidth
                    label={newProduct.productType === 'digital' ? "Title *" : "Product Name *"}
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value.slice(0, 140) })}
                    placeholder={newProduct.productType === 'digital' ? "e.g. Low Battery Santa PNG Funny Christmas Shirt" : "Enter a descriptive product name"}
                    sx={inputStyles}
                    helperText={newProduct.productType === 'digital' ? `${newProduct.name.length}/140. A good title focuses on your item and doesn't use repetitive or subjective words, or info about pricing or shipping.` : ""}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    id="product-slug"
                    fullWidth
                    label="Product URL Slug"
                    value={newProduct.slug}
                    onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value.replace(/\s+/g, '-') })}
                    placeholder="product-name-slug"
                    sx={inputStyles}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    id="product-sku"
                    fullWidth
                    label="SKU ID"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    placeholder="Unique identifier"
                    sx={inputStyles}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={inputStyles}>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      id="category-select"
                      value={newProduct.categorySlug}
                      onChange={(e) => {
                        const categorySlug = e.target.value;
                        setNewProduct({ ...newProduct, categorySlug, subcategorySlug: '' });
                        fetchSubcategories(categorySlug);
                      }}
                      label="Category"
                      MenuProps={selectMenuProps}
                    >
                      <MenuItem value="">Select Category</MenuItem>
                      {Array.isArray(categories.data) &&
                        categories.data.map((category) => (
                          <MenuItem key={category.slug} value={category.slug}>{category.name}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={inputStyles} disabled={!filteredSubcategories.length}>
                    <InputLabel id="subcategory-label">Subcategory</InputLabel>
                    <Select
                      labelId="subcategory-label"
                      id="subcategory-select"
                      value={newProduct.subcategorySlug}
                      onChange={(e) => setNewProduct({ ...newProduct, subcategorySlug: e.target.value })}
                      label="Subcategory"
                      MenuProps={selectMenuProps}
                    >
                      <MenuItem value="">Select Subcategory</MenuItem>
                      {filteredSubcategories.map((subcategory) => (
                        <MenuItem key={subcategory.slug} value={subcategory.slug}>{subcategory.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* Description Card */}
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: '0px', border: '1px solid #F0DCE3', bgcolor: '#fff' }}>
              <Box sx={sectionHeaderStyles}>
                <Box sx={{ p: 1, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261', display: 'flex' }}>
                  <DescriptionIcon sx={{ fontSize: '1.25rem' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Description</Typography>
              </Box>
              <Box sx={{
                '& .ql-toolbar': { borderRadius: '0px', borderColor: '#F0DCE3', bgcolor: '#FBF9F7' },
                '& .ql-container': { borderRadius: '0px', borderColor: '#F0DCE3', minHeight: '220px', fontSize: '0.95rem' }
              }}>
                <ReactQuill
                  theme="snow"
                  id="product-description"
                  value={newProduct.richDescription}
                  onChange={(value) => setNewProduct({ ...newProduct, richDescription: value })}
                  placeholder="Tell customers about your cosmetics product formula, application and benefits..."
                />
              </Box>
            </Paper>

            {/* Attributes & Options (Tangible) */}
            {newProduct.productType === 'tangible' && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: '0px', border: '1px solid #F0DCE3', bgcolor: '#fff' }}>
                <Box sx={sectionHeaderStyles}>
                  <Box sx={{ p: 1, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261', display: 'flex' }}>
                    <StyleIcon sx={{ fontSize: '1.25rem' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attributes & Options</Typography>
                </Box>
                <Stack spacing={3}>
                  <FormControl fullWidth sx={inputStyles}>
                    <InputLabel id="colors-label">Available Colors / Shades</InputLabel>
                    <Select
                      labelId="colors-label"
                      id="product-colors"
                      multiple
                      value={newProduct.colors}
                      onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                      label="Available Colors / Shades"
                      MenuProps={selectMenuProps}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((color) => (
                            <Chip
                              key={color.value}
                              label={color.label}
                              size="small"
                              sx={{
                                bgcolor: '#FBF9F7',
                                border: '1px solid #F0DCE3',
                                borderRadius: '0px',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                '& .MuiChip-label': { display: 'flex', alignItems: 'center', gap: 1 }
                              }}
                              icon={<Box sx={{ width: 10, height: 10, borderRadius: '0px', bgcolor: color.hex, ml: 1 }}></Box>}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {colors.map((color) => (
                        <MenuItem key={color.value} value={color}>
                          <Checkbox checked={newProduct.colors.some((c) => c.value === color.value)} sx={{ color: '#C5A059', '&.Mui-checked': { color: '#C53261' } }} />
                          {color.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth sx={inputStyles}>
                    <InputLabel id="sizes-label">Available Sizes / Volumes</InputLabel>
                    <Select
                      labelId="sizes-label"
                      id="product-sizes"
                      multiple
                      value={newProduct.sizes}
                      onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
                      label="Available Sizes / Volumes"
                      MenuProps={selectMenuProps}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((size) => (
                            <Chip key={size.value} label={size.label} size="small" sx={{ bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', fontWeight: 600, fontSize: '0.75rem' }} />
                          ))}
                        </Box>
                      )}
                    >
                      {sizes.map((size) => (
                        <MenuItem key={size.value} value={size}>
                          <Checkbox checked={newProduct.sizes.some((s) => s.value === size.value)} sx={{ color: '#C5A059', '&.Mui-checked': { color: '#C53261' } }} />
                          {size.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Paper>
            )}

            {/* Digital Files & Core Details Card */}
            {newProduct.productType === 'digital' && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: '0px', border: '1px solid #F0DCE3', bgcolor: '#fff' }}>
                <Box sx={sectionHeaderStyles}>
                  <Box sx={{ p: 1, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261', display: 'flex' }}>
                    <CloudUploadIcon sx={{ fontSize: '1.25rem' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Digital files *</Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 2, color: '#8C7A70', fontSize: '0.85rem' }}>
                  Buyers can download these files as soon as they complete their purchase. Add up to 5 files.
                </Typography>
                <Stack spacing={4}>
                  <Box>
                    <Box
                      onClick={() => document.getElementById('digital-file-input').click()}
                      sx={{
                        border: '1px dashed #C5A059',
                        borderRadius: '0px',
                        bgcolor: '#FBF9F7',
                        p: 4,
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#F5EFEB', borderColor: '#C53261' },
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: '2rem', color: '#C53261' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311' }}>Drag and drop or click to add files</Typography>
                      <input
                        id="digital-file-input"
                        type="file"
                        hidden
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          if (digitalFiles.length + files.length > 5) {
                            alert('You can only upload up to 5 files.');
                            return;
                          }
                          setDigitalFiles(prev => [...prev, ...files]);
                        }}
                        multiple
                      />
                    </Box>
                    <Grid container spacing={1.5} sx={{ mt: 2 }}>
                      {digitalFiles.map((file, i) => (
                        <Grid item xs={12} key={i}>
                          <Box sx={{ p: 2, border: '1px solid #F0DCE3', borderRadius: '0px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <DescriptionIcon sx={{ color: '#C53261' }} />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#141311' }}>{file.name}</Typography>
                                <Typography variant="caption" sx={{ color: '#8C7A70' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</Typography>
                              </Box>
                            </Stack>
                            <IconButton size="small" onClick={() => setDigitalFiles(prev => prev.filter((_, idx) => idx !== i))} sx={{ borderRadius: '0px' }}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  <Box sx={{ borderTop: '1px solid #F0DCE3', pt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#141311', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>Core details *</Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, bgcolor: '#FBF9F7', borderRadius: '0px', border: '1px solid #F0DCE3' }}>
                      <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: '0px', border: '1px solid #F0DCE3' }}>
                        <CloudUploadIcon sx={{ color: '#C53261' }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311' }}>Digital files</Typography>
                        <Typography variant="body2" sx={{ color: '#8C7A70' }}>Instant download</Typography>
                        <Typography variant="caption" sx={{ color: '#8C7A70' }}>Direct access • Secure license</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            )}

            {/* Attributes Section (Digital) */}
            {newProduct.productType === 'digital' && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: '0px', border: '1px solid #F0DCE3', bgcolor: '#fff' }}>
                <Box sx={sectionHeaderStyles}>
                  <Box sx={{ p: 1, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261', display: 'flex' }}>
                    <StyleIcon sx={{ fontSize: '1.25rem' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attributes</Typography>
                </Box>
                <Stack spacing={4}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Product Size / Specs (e.g. 1920x1080, PDF Manual, 50 Pages)"
                        value={newProduct.digitalData?.size || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewProduct(prev => ({
                            ...prev,
                            digitalData: {
                              ...(prev.digitalData || {}),
                              size: val
                            }
                          }));
                        }}
                        placeholder="Mention the specifications of this digital asset"
                        sx={inputStyles}
                        helperText="Displayed clearly on the product detail page."
                      />
                    </Grid>
                  </Grid>

                  {/* Dimensions */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          label="Height"
                          value={digitalDimensions.height.value}
                          onChange={(e) => setDigitalDimensions({
                            ...digitalDimensions,
                            height: { ...digitalDimensions.height, value: e.target.value }
                          })}
                          sx={inputStyles}
                          fullWidth
                        />
                        <FormControl sx={{ minWidth: 100, ...inputStyles }}>
                          <Select
                            value={digitalDimensions.height.unit}
                            onChange={(e) => setDigitalDimensions({
                              ...digitalDimensions,
                              height: { ...digitalDimensions.height, unit: e.target.value }
                            })}
                            MenuProps={selectMenuProps}
                          >
                            <MenuItem value="px">px</MenuItem>
                            <MenuItem value="inch">in</MenuItem>
                            <MenuItem value="cm">cm</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          label="Width"
                          value={digitalDimensions.width.value}
                          onChange={(e) => setDigitalDimensions({
                            ...digitalDimensions,
                            width: { ...digitalDimensions.width, value: e.target.value }
                          })}
                          sx={inputStyles}
                          fullWidth
                        />
                        <FormControl sx={{ minWidth: 100, ...inputStyles }}>
                          <Select
                            value={digitalDimensions.width.unit}
                            onChange={(e) => setDigitalDimensions({
                              ...digitalDimensions,
                              width: { ...digitalDimensions.width, unit: e.target.value }
                            })}
                            MenuProps={selectMenuProps}
                          >
                            <MenuItem value="px">px</MenuItem>
                            <MenuItem value="inch">in</MenuItem>
                            <MenuItem value="cm">cm</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Tags */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#141311' }}>Tags</Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1.5, color: '#8C7A70' }}>
                      Add up to 13 tags to help search indexing.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        id="tag-input"
                        placeholder="Lipstick, Serum, Organic, Luxury..."
                        fullWidth
                        size="small"
                        sx={inputStyles}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.target.value.trim();
                            if (val && digitalTags.length < 13) {
                              setDigitalTags([...digitalTags, val]);
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        variant="outlined"
                        onClick={() => {
                          const input = document.getElementById('tag-input');
                          const val = input.value.trim();
                          if (val && digitalTags.length < 13) {
                            setDigitalTags([...digitalTags, val]);
                            input.value = '';
                          }
                        }}
                        sx={{ borderRadius: '0px', borderColor: '#F0DCE3', color: '#141311', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, '&:hover': { borderColor: '#C53261', bgcolor: '#FBF9F7' } }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#8C7A70' }}>{13 - digitalTags.length} left</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                      {digitalTags.map((tag, idx) => (
                        <Chip
                          key={idx}
                          label={tag}
                          onDelete={() => setDigitalTags(digitalTags.filter((_, i) => i !== idx))}
                          sx={{ borderRadius: '0px', bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', fontWeight: 600, color: '#141311' }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Materials */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#141311' }}>Key Ingredients / Materials</Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1.5, color: '#8C7A70' }}>
                      Transparency on formula and composition.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        id="material-input"
                        placeholder="Hyaluronic acid, Shea butter, Vegan wax..."
                        fullWidth
                        size="small"
                        sx={inputStyles}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.target.value.trim();
                            if (val && digitalMaterials.length < 13) {
                              setDigitalMaterials([...digitalMaterials, val]);
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        variant="outlined"
                        onClick={() => {
                          const input = document.getElementById('material-input');
                          const val = input.value.trim();
                          if (val && digitalMaterials.length < 13) {
                            setDigitalMaterials([...digitalMaterials, val]);
                            input.value = '';
                          }
                        }}
                        sx={{ borderRadius: '0px', borderColor: '#F0DCE3', color: '#141311', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, '&:hover': { borderColor: '#C53261', bgcolor: '#FBF9F7' } }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#8C7A70' }}>{13 - digitalMaterials.length} left</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                      {digitalMaterials.map((mat, idx) => (
                        <Chip
                          key={idx}
                          label={mat}
                          onDelete={() => setDigitalMaterials(digitalMaterials.filter((_, i) => i !== idx))}
                          sx={{ borderRadius: '0px', bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', fontWeight: 600, color: '#141311' }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            )}

            {/* Variations Notice (Digital) */}
            {newProduct.productType === 'digital' && (
              <Paper elevation={0} sx={{ p: 3, borderRadius: '0px', border: '1px dashed #F0DCE3', bgcolor: '#FBF9F7' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <InfoIcon sx={{ color: '#C53261' }} />
                  <Typography variant="body2" sx={{ color: '#8C7A70', fontWeight: 500 }}>
                    Variations are not applicable for digital listings.
                  </Typography>
                </Box>
              </Paper>
            )}

            {/* Personalization Card */}
            {newProduct.productType === 'digital' && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: '0px', border: '1px solid #F0DCE3', bgcolor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261', display: 'flex' }}>
                      <DescriptionIcon sx={{ fontSize: '1.25rem' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personalization</Typography>
                  </Box>
                  <Checkbox
                    checked={personalization.enabled}
                    onChange={(e) => setPersonalization({ ...personalization, enabled: e.target.checked })}
                    sx={{ color: '#C5A059', '&.Mui-checked': { color: '#C53261' } }}
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 3, color: '#8C7A70' }}>
                  Collect personalized engraving or custom requests for this listing.
                </Typography>
                {personalization.enabled && (
                  <Stack spacing={2}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#141311' }}>Instructions for buyers</Typography>
                    <Typography variant="caption" sx={{ color: '#8C7A70', mb: 1 }}>
                      Enter the instructions you want buyers to see.
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={personalization.instruction}
                      onChange={(e) => setPersonalization({ ...personalization, instruction: e.target.value })}
                      placeholder="e.g. Please enter initials for luxury bottle engraving..."
                      sx={inputStyles}
                    />
                  </Stack>
                )}
              </Paper>
            )}
          </Stack>
        </Grid>

        {/* Right Column: Pricing & Media */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Pricing Card */}
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: '0px', border: '1px solid #F0DCE3', bgcolor: '#fff' }}>
              <Box sx={sectionHeaderStyles}>
                <Box sx={{ p: 1, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261', display: 'flex' }}>
                  <LocalOfferIcon sx={{ fontSize: '1.25rem' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pricing & Stock</Typography>
              </Box>
              <Stack spacing={3}>
                <TextField
                  id="product-price"
                  fullWidth
                  label="Display Price (Rs.)"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  sx={inputStyles}
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
                <TextField
                  id="product-discount"
                  fullWidth
                  label="Discount Percentage (%)"
                  type="number"
                  value={newProduct.discount}
                  onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                  sx={inputStyles}
                  InputProps={{ inputProps: { min: 0, max: 100, step: 0.01 } }}
                />

                {newProduct.productType === 'tangible' && (
                  <Box sx={{
                    bgcolor: '#FBF9F7',
                    p: 2,
                    borderRadius: '0px',
                    border: '1px solid #F0DCE3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <InventoryIcon sx={{ color: '#C53261', fontSize: '1.2rem' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Stock</Typography>
                    </Box>
                    <TextField
                      id="product-stock"
                      type="number"
                      size="small"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      sx={{ width: '100px', ...inputStyles }}
                    />
                  </Box>
                )}

                <FormControlLabel
                  control={
                    <Checkbox
                      id="product-is-top-rated"
                      checked={newProduct.isTopRated}
                      onChange={(e) => setNewProduct({ ...newProduct, isTopRated: e.target.checked })}
                      sx={{ color: '#C5A059', '&.Mui-checked': { color: '#C53261' } }}
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontWeight: 600, color: '#141311', fontSize: '0.85rem' }}>Mark as Exclusive / Top Rated</Typography>}
                />
              </Stack>
            </Paper>

            {/* Media Card */}
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: '0px', border: '1px solid #F0DCE3', bgcolor: '#fff' }}>
              <Box sx={sectionHeaderStyles}>
                <Box sx={{ p: 1, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261', display: 'flex' }}>
                  <CloudUploadIcon sx={{ fontSize: '1.25rem' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Media Gallery</Typography>
              </Box>

              <Box
                onClick={() => fileInputRef.current.click()}
                sx={{
                  border: '1px dashed #C5A059',
                  borderRadius: '0px',
                  bgcolor: '#FBF9F7',
                  p: 3.5,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#F5EFEB', borderColor: '#C53261' },
                  transition: 'all 0.2s',
                  mb: 2.5
                }}
              >
                <CloudUploadIcon sx={{ fontSize: '2.2rem', color: '#C53261', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {newProduct.productType === 'digital' ? "Upload Asset Files or Media" : "Upload High-Res Product Photos"}
                </Typography>
                <Typography variant="caption" sx={{ color: '#8C7A70', display: 'block', mt: 0.5 }}>
                  {newProduct.productType === 'digital' ? "Add up to 20 photos and preview media" : "Supported formats: JPG, PNG, WEBP"}
                </Typography>
                <input
                  id="image-upload-input"
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  multiple
                  accept="image/*"
                />
              </Box>

              <Grid container spacing={1.5}>
                {existingImages.map((img, index) => (
                  <Grid item xs={4} key={`existing-${index}`}>
                    <Box sx={{ position: 'relative', pt: '100%', borderRadius: '0px', overflow: 'hidden', border: '1px solid #F0DCE3' }}>
                      <Image
                        fill
                        src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${img}`}
                        alt="Existing"
                        style={{ objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveExistingImage(index)}
                        sx={{ position: 'absolute', top: 3, right: 3, bgcolor: '#141311', color: '#fff', borderRadius: '0px', p: 0.5, '&:hover': { bgcolor: '#EF4444' } }}
                      >
                        <CloseIcon sx={{ fontSize: '0.75rem' }} />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
                {images.map((img, index) => (
                  <Grid item xs={4} key={`new-${index}`}>
                    <Box sx={{ position: 'relative', pt: '100%', borderRadius: '0px', overflow: 'hidden', border: '1px solid #C53261' }}>
                      <Image
                        fill
                        src={URL.createObjectURL(img)}
                        alt="New"
                        style={{ objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImage(index)}
                        sx={{ position: 'absolute', top: 3, right: 3, bgcolor: '#141311', color: '#fff', borderRadius: '0px', p: 0.5, '&:hover': { bgcolor: '#EF4444' } }}
                      >
                        <CloseIcon sx={{ fontSize: '0.75rem' }} />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* SEO Card */}
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: '0px', border: '1px solid #F0DCE3', bgcolor: '#fff' }}>
              <Box sx={sectionHeaderStyles}>
                <Box sx={{ p: 1, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261', display: 'flex' }}>
                  <PublicIcon sx={{ fontSize: '1.25rem' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search Optimization</Typography>
              </Box>
              <Stack spacing={3}>
                <TextField
                  id="meta-title"
                  fullWidth
                  label="Meta Title"
                  value={newProduct.meta_title}
                  onChange={(e) => setNewProduct({ ...newProduct, meta_title: e.target.value.slice(0, 60) })}
                  sx={inputStyles}
                  helperText={`${newProduct.meta_title.length}/60 characters`}
                />
                <TextField
                  id="meta-description"
                  fullWidth
                  multiline
                  rows={3}
                  label="Meta Description"
                  value={newProduct.meta_description}
                  onChange={(e) => setNewProduct({ ...newProduct, meta_description: e.target.value.slice(0, 160) })}
                  sx={inputStyles}
                  helperText={`${newProduct.meta_description.length}/160 characters`}
                />
                <TextField
                  id="meta-keywords"
                  fullWidth
                  label="Meta Keywords"
                  value={newProduct.meta_keywords}
                  onChange={(e) => setNewProduct({ ...newProduct, meta_keywords: e.target.value })}
                  placeholder="e.g. lipstick, matte, organic cosmetic"
                  sx={inputStyles}
                />
              </Stack>
            </Paper>

            {/* Settings & Renewal Card */}
            {newProduct.productType === 'digital' && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: '0px', border: '1px solid #F0DCE3', bgcolor: '#fff' }}>
                <Box sx={sectionHeaderStyles}>
                  <Box sx={{ p: 1, bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', borderRadius: '0px', color: '#C53261', display: 'flex' }}>
                    <InventoryIcon sx={{ fontSize: '1.25rem' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Settings</Typography>
                </Box>
                <Stack spacing={4}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#141311' }}>Returns and exchanges *</Typography>
                    <Box sx={{ p: 2.5, bgcolor: '#FBF9F7', borderRadius: '0px', border: '1px solid #F0DCE3' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: '#141311' }}>No returns or exchanges</Typography>
                      <Typography variant="body2" sx={{ color: '#8C7A70', fontSize: '0.85rem' }}>
                        Digital items aren't eligible for returns or exchanges because of the instant digital delivery.
                      </Typography>
                    </Box>
                  </Box>

                  <FormControl fullWidth sx={inputStyles}>
                    <InputLabel id="shop-section-label">Shop section</InputLabel>
                    <Select
                      labelId="shop-section-label"
                      value={settings.shopSection}
                      onChange={(e) => setSettings({ ...settings, shopSection: e.target.value })}
                      label="Shop section"
                      MenuProps={selectMenuProps}
                    >
                      <MenuItem value="">None</MenuItem>
                      <MenuItem value="featured">Featured Items</MenuItem>
                      <MenuItem value="new">New Arrivals</MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#FBF9F7', borderRadius: '0px', border: '1px solid #F0DCE3' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311' }}>Feature this listing</Typography>
                      <Typography variant="caption" sx={{ color: '#8C7A70' }}>Showcase this listing at the top of shop homepage</Typography>
                    </Box>
                    <Checkbox
                      checked={settings.featureListing}
                      onChange={(e) => setSettings({ ...settings, featureListing: e.target.checked })}
                      sx={{ color: '#C5A059', '&.Mui-checked': { color: '#C53261' } }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#141311' }}>Renewal options *</Typography>
                    <FormControl component="fieldset">
                      <ToggleButtonGroup
                        value={settings.renewalOption}
                        exclusive
                        onChange={(e, newOption) => {
                          if (newOption !== null) setSettings({ ...settings, renewalOption: newOption });
                        }}
                        sx={{
                          bgcolor: '#fff',
                          borderRadius: '0px',
                          border: '1px solid #F0DCE3',
                          '& .MuiToggleButton-root': {
                            borderRadius: '0px',
                            border: 'none',
                            px: 3,
                            py: 1,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#8C7A70',
                            '&.Mui-selected': {
                              bgcolor: '#141311',
                              color: '#fff',
                              '&:hover': { bgcolor: '#1E141B' }
                            }
                          }
                        }}
                      >
                        <ToggleButton value="automatic">
                          Automatic
                        </ToggleButton>
                        <ToggleButton value="manual">
                          Manual
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </FormControl>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#8C7A70' }}>
                      Each renewal lasts for four months or until the listing sells out.
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

const AddProductPage = () => {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</Box>}>
      <AddProductPageContent />
    </Suspense>
  );
};

export default AddProductPage;