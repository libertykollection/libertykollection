'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// MUI Imports
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select as MuiSelect,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionIcon from '@mui/icons-material/Description';
import PublicIcon from '@mui/icons-material/Public';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import StyleIcon from '@mui/icons-material/Style';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

const FilterableTable = ({
  products = [],
  fetchProducts,
  categories = [],
  subcategories = [],
  colors = [],
  sizes = [],
}) => {
  const [filter, setFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [topRatedFilter, setTopRatedFilter] = useState('all');
  const [filteredData, setFilteredData] = useState(products);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [itemSlugToDelete, setItemSlugToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    subcategorySlug: '',
    colors: [],
    sizes: [],
    discount: '',
    isTopRated: false,
    images: [],
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    sku: '',
  });

  const [existingImages, setExistingImages] = useState([]);
  const [page, setPage] = useState(0); // Current page
  const [rowsPerPage, setRowsPerPage] = useState(15); // Rows per page
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    let result = products;

    // Search filter (Name, SKU, ID, etc.)
    if (filter) {
      result = result.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(filter.toLowerCase())
        ) ||
        String(item.id).includes(filter) ||
        String(item.sku || '').toLowerCase().includes(filter.toLowerCase())
      );
    }

    // Stock level filter
    if (stockFilter !== 'all') {
      result = result.filter((item) => {
        const stock = parseInt(item.stock || 0);
        if (stockFilter === 'out') return stock === 0;
        if (stockFilter === 'low') return stock > 0 && stock < 10;
        if (stockFilter === 'medium') return stock >= 10 && stock < 50;
        if (stockFilter === 'healthy') return stock >= 50;
        return true;
      });
    }

    // Top Rated filter
    if (topRatedFilter !== 'all') {
      const isTop = topRatedFilter === 'top';
      result = result.filter((item) => item.isTopRated === isTop);
    }

    setFilteredData(result);
    setPage(0);
  }, [filter, stockFilter, topRatedFilter, products]);

  useEffect(() => {
    if (subcategories.length) {
      setFilteredSubcategories(subcategories);
    } else {
      setFilteredSubcategories([]);
    }
  }, [selectedCategory, subcategories]);

  const handleDeleteClick = (slug) => {
    setItemSlugToDelete(slug);
    setIsPopupVisible(true);
  };

  const handleDeleteItem = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${itemSlugToDelete}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        fetchProducts();
        setIsPopupVisible(false);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
    setIsLoading(false);
  };

  const handleCancelDelete = () => {
    setIsPopupVisible(false);
    setItemSlugToDelete(null);
  };

  const roundToTwoDecimalPlaces = (num) => Math.round(num * 100) / 100;

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

  const handleEditItem = (item) => {
    setEditProduct(item);

    let itemColors = [];
    try {
      if (Array.isArray(item.colors)) {
        itemColors = item.colors;
      } else if (typeof item.colors === 'string') {
        // Handle "null" string or valid JSON
        if (item.colors === 'null') itemColors = [];
        else itemColors = JSON.parse(item.colors);
      }
      // Ensure it's an array purely
      if (!Array.isArray(itemColors)) itemColors = [];
    } catch (e) {
      console.error("Error parsing colors for edit:", e);
      itemColors = [];
    }

    let itemSizes = [];
    try {
      if (Array.isArray(item.sizes)) {
        itemSizes = item.sizes;
      } else if (typeof item.sizes === 'string') {
        if (item.sizes === 'null') itemSizes = [];
        else itemSizes = JSON.parse(item.sizes);
      }
      if (!Array.isArray(itemSizes)) itemSizes = [];
    } catch (e) {
      console.error("Error parsing sizes for edit:", e);
      itemSizes = [];
    }

    const existingColors = colors
      .filter((color) => itemColors.includes(color.id))
      .map((color) => ({
        value: color.id,
        label: `${color.name} (${color.hex})`,
        hex: color.hex,
      }));

    const existingSizes = sizes
      .filter((size) => itemSizes.includes(size.id))
      .map((size) => ({ value: size.id, label: size.name }));

    setProductForm({
      name: item.name,
      slug: item.slug,
      description: item.description,
      price: item.price,
      stock: item.stock,
      subcategorySlug: item.subcategorySlug,
      colors: existingColors,
      sizes: existingSizes,
      discount: item.discount || '',
      isTopRated: item.isTopRated || false,
      images: [],
      meta_title: item.meta_title || '',
      meta_description: item.meta_description || '',
      meta_keywords: item.meta_keywords || '',
      sku: item.sku,
    });
    setExistingImages(item.images.map((img) => img.url));
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue =
      type === 'checkbox' ? checked : name === 'stock' ? Math.max(0, parseInt(value) || 0) : value;
    setProductForm({ ...productForm, [name]: newValue });
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
    setIsLoading(true);
    try {
      const uploadedImages = await Promise.all(
        productForm.images.map(async (file) => {
          const imageBase64 = await convertToBase64(file);
          const response = await fetch(process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageBase64 }),
          });
          const result = await response.json();
          if (response.ok) return result.image_url;
          throw new Error(result.error || 'Failed to upload image');
        })
      );

      const productData = {
        ...productForm,
        stock: parseInt(productForm.stock) || 0,
        images: [...existingImages, ...uploadedImages],
        discount: productForm.discount ? productForm.discount : null,
        colors: productForm.colors.map((color) => color.value),
        sizes: productForm.sizes.map((size) => size.value),
      };

      const response = await fetch(`/api/products/${editProduct.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        fetchProducts();
        setEditProduct(null);
        setProductForm({
          name: '',
          slug: '',
          description: '',
          price: '',
          stock: '',
          subcategorySlug: '',
          colors: [],
          sizes: [],
          discount: '',
          isTopRated: false,
          images: [],
          meta_title: '',
          meta_description: '',
          meta_keywords: '',
          sku: '',
        });
        setExistingImages([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
    setIsLoading(false);
  };

  const handleCancelEdit = () => {
    setEditProduct(null);
    setProductForm({
      name: '',
      slug: '',
      description: '',
      price: '',
      stock: '',
      subcategorySlug: '',
      colors: [],
      sizes: [],
      discount: '',
      isTopRated: false,
      images: [],
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      sku: '',
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setProductForm((prevForm) => ({
      ...prevForm,
      images: [...prevForm.images, ...files],
    }));
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleRemoveImage = (index) => {
    setProductForm((prevForm) => ({
      ...prevForm,
      images: prevForm.images.filter((_, i) => i !== index),
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Pagination Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };

  // Calculate paginated data
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Stock level helper function
  const getStockStatus = (stock) => {
    const stockNum = parseInt(stock) || 0;
    if (stockNum === 0) {
      return { label: 'Out of Stock', color: 'error', severity: 'error', icon: <WarningIcon /> };
    } else if (stockNum < 10) {
      return { label: 'Low Stock', color: 'warning', severity: 'warning', icon: <WarningIcon /> };
    } else if (stockNum < 50) {
      return { label: 'Medium Stock', color: 'info', severity: 'info', icon: <InventoryIcon /> };
    } else {
      return { label: 'In Stock', color: 'success', severity: 'success', icon: <CheckCircleIcon /> };
    }
  };

  // Stock display component
  const StockDisplay = ({ stock }) => {
    const stockNum = parseInt(stock) || 0;
    const status = getStockStatus(stock);

    let badgeClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
    if (stockNum === 0) badgeClass = "bg-red-50 text-red-700 border-red-200";
    else if (stockNum < 10) badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
    else if (stockNum < 50) badgeClass = "bg-[#C53261]/10 text-[#C53261] border-[#C53261]/30";

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <span className={`px-2 py-0.5 text-[11px] font-bold border tracking-wider rounded-none ${badgeClass}`}>
          {stockNum} units
        </span>
        <Typography
          variant="caption"
          sx={{
            color: '#8C7A70',
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        >
          {status.label}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', p: 0 }}>
      {/* Confirmation Dialog */}
      <Dialog
        open={isPopupVisible}
        onClose={handleCancelDelete}
        PaperProps={{
          sx: { borderRadius: '0px', p: 1, maxWidth: '420px', border: '1px solid #F0DCE3' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 4 }}>
          <Box sx={{ p: 2, bgcolor: '#FEF2F2', borderRadius: '0px', color: '#EF4444', display: 'flex', border: '1px solid #FEE2E2' }}>
            <WarningIcon sx={{ fontSize: '2rem' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif' }}>
            Confirm Product Deletion
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 0 }}>
          <Typography variant="body2" sx={{ color: '#6B5E55' }}>
            Deleting this product will remove it from the catalog and customer storefront. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 1.5 }}>
          <Button
            onClick={handleCancelDelete}
            sx={{
              textTransform: 'none',
              borderRadius: '0px',
              px: 3,
              py: 1,
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#141311',
              bgcolor: '#F8F5F2',
              border: '1px solid #F0DCE3',
              '&:hover': { bgcolor: '#F0DCE3' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteItem}
            disabled={isLoading}
            variant="contained"
            sx={{
              textTransform: 'none',
              borderRadius: '0px',
              px: 3,
              py: 1,
              fontSize: '0.8rem',
              fontWeight: 700,
              bgcolor: '#EF4444',
              color: '#fff',
              '&:hover': { bgcolor: '#DC2626' }
            }}
          >
            {isLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Delete Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay */}
      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(18, 11, 16, 0.4)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <CircularProgress sx={{ color: '#C53261' }} />
        </Box>
      )}

      {/* Products Card Container */}
      <Card elevation={0} sx={{ borderRadius: '0px', border: '1px solid #F0DCE3', bgcolor: '#fff', overflow: 'hidden' }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          {/* Header Banner */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2, pb: 3, borderBottom: '1px solid #F0DCE3' }}>
            <Box>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#C53261]"></span>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C53261]">
                  Catalog Management
                </span>
              </div>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif' }}>
                Cosmetics Inventory
              </Typography>
              <Typography variant="body2" sx={{ color: '#8C7A70', fontSize: '0.8rem', mt: 0.5 }}>
                Manage beauty products, SKUs, pricing, stock levels, and store visibility
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                startIcon={<SearchIcon sx={{ fontSize: '1.1rem' }} />}
                sx={{
                  textTransform: 'none',
                  borderRadius: '0px',
                  px: 2.5,
                  py: 1,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderColor: isSearchVisible ? '#C53261' : '#F0DCE3',
                  color: isSearchVisible ? '#C53261' : '#141311',
                  bgcolor: isSearchVisible ? '#F8F5F2' : 'transparent',
                  '&:hover': { borderColor: '#C53261', bgcolor: '#F8F5F2' }
                }}
              >
                Search Bar
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push('/admin/pages/add-product')}
                startIcon={<PlusIcon className="h-4 w-4" />}
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderRadius: '0px',
                  px: 3,
                  py: 1,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  bgcolor: '#141311',
                  color: '#fff',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#C53261', boxShadow: 'none' }
                }}
              >
                Add Product
              </Button>
            </Box>
          </Box>

          {/* Search Input Filter */}
          {isSearchVisible && (
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search by product name, SKU code, or category..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#C53261', fontSize: '1.1rem' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '0px',
                  bgcolor: '#FBF9F7',
                  '& fieldset': { borderColor: '#F0DCE3' },
                  '&:hover fieldset': { borderColor: '#C53261' },
                  '&.Mui-focused fieldset': { borderColor: '#C53261' },
                },
              }}
            />
          )}

          {/* Stock Summary Executive Cards (4 items) */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {[
              { label: 'Out of Stock', count: filteredData.filter((p) => parseInt(p.stock || 0) === 0).length, color: '#EF4444', icon: <WarningIcon sx={{ fontSize: '1.1rem', color: '#EF4444' }} /> },
              { label: 'Low Stock (1-9)', count: filteredData.filter((p) => { const s = parseInt(p.stock || 0); return s > 0 && s < 10; }).length, color: '#F59E0B', icon: <WarningIcon sx={{ fontSize: '1.1rem', color: '#F59E0B' }} /> },
              { label: 'Medium Stock (10-49)', count: filteredData.filter((p) => { const s = parseInt(p.stock || 0); return s >= 10 && s < 50; }).length, color: '#C53261', icon: <InventoryIcon sx={{ fontSize: '1.1rem', color: '#C53261' }} /> },
              { label: 'Healthy Stock (50+)', count: filteredData.filter((p) => parseInt(p.stock || 0) >= 50).length, color: '#10B981', icon: <CheckCircleIcon sx={{ fontSize: '1.1rem', color: '#10B981' }} /> }
            ].map((card, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card sx={{
                  p: 2.5,
                  borderRadius: '0px',
                  border: '1px solid #F0DCE3',
                  boxShadow: 'none',
                  bgcolor: '#fff',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': { borderColor: card.color }
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#8C7A70', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {card.label}
                    </Typography>
                    <Box sx={{
                      p: 0.75,
                      bgcolor: `${card.color}15`,
                      display: 'flex'
                    }}>
                      {card.icon}
                    </Box>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif' }}>
                    {card.count} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#8C7A70', fontFamily: 'sans-serif' }}>SKUs</span>
                  </Typography>
                  <Box sx={{ height: '2px', bgcolor: card.color, width: '30%', mt: 'auto', pt: 0, opacity: 0.8 }} />
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Advanced Filters Row */}
          <Box sx={{
            display: 'flex',
            gap: 2,
            mb: 4,
            flexWrap: 'wrap',
            alignItems: 'center',
            bgcolor: '#F8F5F2',
            p: 2,
            borderRadius: '0px',
            border: '1px solid #F0DCE3'
          }}>
            <Box sx={{ minWidth: '160px', flex: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="Search Keyword / ID"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={inputStyles}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#8C7A70', mr: 1, fontSize: '1rem' }} />
                }}
              />
            </Box>
            <Box sx={{ minWidth: '180px', flex: 1 }}>
              <FormControl fullWidth size="small" sx={inputStyles}>
                <InputLabel>Inventory Filter</InputLabel>
                <MuiSelect
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  label="Inventory Filter"
                  MenuProps={selectMenuProps}
                >
                  <MenuItem value="all">All Inventory</MenuItem>
                  <MenuItem value="healthy">Healthy Stock (50+)</MenuItem>
                  <MenuItem value="medium">Medium Stock (10-49)</MenuItem>
                  <MenuItem value="low">Low Stock (1-9)</MenuItem>
                  <MenuItem value="out">Out of Stock (0)</MenuItem>
                </MuiSelect>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: '160px', flex: 1 }}>
              <FormControl fullWidth size="small" sx={inputStyles}>
                <InputLabel>Product Rating</InputLabel>
                <MuiSelect
                  value={topRatedFilter}
                  onChange={(e) => setTopRatedFilter(e.target.value)}
                  label="Product Rating"
                  MenuProps={selectMenuProps}
                >
                  <MenuItem value="all">All Items</MenuItem>
                  <MenuItem value="top">Top Rated Products</MenuItem>
                  <MenuItem value="regular">Standard Products</MenuItem>
                </MuiSelect>
              </FormControl>
            </Box>
            <Button
              variant="text"
              onClick={() => {
                setFilter('');
                setStockFilter('all');
                setTopRatedFilter('all');
              }}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                color: '#EF4444',
                borderRadius: '0px',
                '&:hover': { bgcolor: '#FEF2F2' }
              }}
            >
              Reset Filters
            </Button>
          </Box>

          {/* Products Table */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: '0px',
              border: '1px solid #F0DCE3',
              overflow: 'hidden',
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#FBF9F7', borderBottom: '1px solid #F0DCE3' }}>
                  {['ID', 'Product', 'SKU', 'Price', 'Inventory', 'Updated', 'Actions'].map((head) => (
                    <TableCell key={head} sx={{ color: '#8C7A70', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', py: 2, borderBottom: '1px solid #F0DCE3' }}>
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(paginatedData) && paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <TableRow
                      key={item.slug}
                      sx={{
                        '&:hover': { bgcolor: '#FDFBF9' },
                        transition: 'background-color 0.15s',
                        borderBottom: '1px solid #F0DCE3'
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: '#141311', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        #{item.id}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{
                            width: 44, height: 44, borderRadius: '0px', overflow: 'hidden',
                            border: '1px solid #F0DCE3', bgcolor: '#F8F5F2', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {item.images && item.images.length > 0 ? (
                              <Image
                                width={44}
                                height={44}
                                unoptimized
                                src={item.images[0].url.startsWith('http') || item.images[0].url.startsWith('/') ? item.images[0].url : `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${item.images[0].url}`}
                                alt=""
                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                              />
                            ) : (
                              <InventoryIcon sx={{ fontSize: '1.2rem', color: '#C5A059' }} />
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311', maxWidth: 220, lineHeight: 1.3, fontSize: '0.85rem' }}>
                            {item.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 text-[11px] font-mono bg-[#F8F5F2] text-[#6B5E55] border border-[#F0DCE3] rounded-none">
                          {item.sku || 'No SKU'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#141311', fontSize: '0.85rem' }}>
                          {parseFloat(item.price || 0).toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#8C7A70' }}>PKR</span>
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StockDisplay stock={item.stock} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 500 }}>
                          {new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <button
                            type="button"
                            onClick={() => handleEditItem(item)}
                            title="Edit Product"
                            className="p-1.5 bg-[#F8F5F2] hover:bg-[#141311] text-[#141311] hover:text-[#C5A059] border border-[#F0DCE3] transition-colors"
                          >
                            <EditIcon sx={{ fontSize: '1rem' }} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(item.slug)}
                            title="Delete Product"
                            className="p-1.5 bg-red-50 hover:bg-[#EF4444] text-[#EF4444] hover:text-white border border-red-200 transition-colors"
                          >
                            <DeleteIcon sx={{ fontSize: '1rem' }} />
                          </button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <InventoryIcon sx={{ fontSize: '2.5rem', mb: 1, color: '#C5A059' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311' }}>No products match your filter</Typography>
                        <Typography variant="caption" sx={{ color: '#8C7A70' }}>Try resetting or modifying your search keyword</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <TablePagination
              rowsPerPageOptions={[10, 15, 25, 50]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                border: 'none',
                '& .MuiTablePagination-select': { borderRadius: '0px' }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      {editProduct && (
        <Dialog
          open={Boolean(editProduct)}
          onClose={handleCancelEdit}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '0px', bgcolor: '#FBF9F7', border: '1px solid #F0DCE3', backgroundImage: 'none' }
          }}
        >
          <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff', borderBottom: '1px solid #F0DCE3' }}>
            <Box>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#C53261]"></span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C53261]">
                  Inventory Editor
                </span>
              </div>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif' }}>
                Edit Product #{editProduct.id}
              </Typography>
            </Box>
            <IconButton onClick={handleCancelEdit} sx={{ bgcolor: '#F8F5F2', borderRadius: '0px', border: '1px solid #F0DCE3', '&:hover': { bgcolor: '#F0DCE3' } }}>
              <CloseIcon sx={{ fontSize: '1.1rem' }} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              {/* Left Column: General & Description & SEO */}
              <Grid item xs={12} lg={8}>
                <Stack spacing={3}>
                  {/* General Info Card */}
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '0px', border: '1px solid #F0DCE3', bgcolor: '#fff' }}>
                    <Box sx={sectionHeaderStyles}>
                      <Box sx={{ p: 1, bgcolor: '#C53261]/15', borderRadius: '0px', color: '#C53261', display: 'flex' }}>
                        <InfoIcon sx={{ fontSize: '1.1rem' }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.95rem' }}>General Details</Typography>
                    </Box>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Product Name"
                          name="name"
                          value={productForm.name}
                          onChange={handleFormChange}
                          sx={inputStyles}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Product URL Slug"
                          name="slug"
                          value={productForm.slug}
                          onChange={(e) => setProductForm({ ...productForm, slug: e.target.value.replace(/\s+/g, '-') })}
                          sx={inputStyles}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="SKU Code"
                          name="sku"
                          value={productForm.sku}
                          onChange={handleFormChange}
                          sx={inputStyles}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth size="small" sx={inputStyles}>
                          <InputLabel>Subcategory</InputLabel>
                          <MuiSelect
                            name="subcategorySlug"
                            value={productForm.subcategorySlug}
                            onChange={handleFormChange}
                            label="Subcategory"
                            MenuProps={selectMenuProps}
                          >
                            <MenuItem value="">Select Subcategory</MenuItem>
                            {filteredSubcategories.map((subcat) => (
                              <MenuItem key={subcat.id} value={subcat.slug}>{subcat.name}</MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Description Card */}
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '0px', border: '1px solid #F0DCE3', bgcolor: '#fff' }}>
                    <Box sx={sectionHeaderStyles}>
                      <Box sx={{ p: 1, bgcolor: '#C5A059]/15', borderRadius: '0px', color: '#C5A059', display: 'flex' }}>
                        <DescriptionIcon sx={{ fontSize: '1.1rem' }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.95rem' }}>Product Description</Typography>
                    </Box>
                    <Box sx={{
                      '& .ql-toolbar': { borderRadius: '0px', borderColor: '#F0DCE3', bgcolor: '#FBF9F7' },
                      '& .ql-container': { borderRadius: '0px', borderColor: '#F0DCE3', minHeight: '180px', fontSize: '0.9rem' }
                    }}>
                      <ReactQuill
                        value={productForm.description}
                        onChange={(value) => setProductForm({ ...productForm, description: value })}
                      />
                    </Box>
                  </Paper>

                  {/* SEO Card */}
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '0px', border: '1px solid #F0DCE3', bgcolor: '#fff' }}>
                    <Box sx={sectionHeaderStyles}>
                      <Box sx={{ p: 1, bgcolor: '#10B981]/15', borderRadius: '0px', color: '#10B981', display: 'flex' }}>
                        <PublicIcon sx={{ fontSize: '1.1rem' }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.95rem' }}>Search Optimization</Typography>
                    </Box>
                    <Stack spacing={2.5}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Meta Title"
                        value={productForm.meta_title}
                        onChange={(e) => setProductForm({ ...productForm, meta_title: e.target.value.slice(0, 60) })}
                        sx={inputStyles}
                        helperText={`${productForm.meta_title.length}/60 characters`}
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Meta Description"
                        value={productForm.meta_description}
                        onChange={(e) => setProductForm({ ...productForm, meta_description: e.target.value.slice(0, 160) })}
                        sx={inputStyles}
                        helperText={`${productForm.meta_description.length}/160 characters`}
                      />
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>

              {/* Right Column: Pricing, Media & Attributes */}
              <Grid item xs={12} lg={4}>
                <Stack spacing={3}>
                  {/* Pricing Card */}
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '0px', border: '1px solid #F0DCE3', bgcolor: '#fff' }}>
                    <Box sx={sectionHeaderStyles}>
                      <Box sx={{ p: 1, bgcolor: '#141311]/10', borderRadius: '0px', color: '#141311', display: 'flex' }}>
                        <LocalOfferIcon sx={{ fontSize: '1.1rem' }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.95rem' }}>Pricing & Stock</Typography>
                    </Box>
                    <Stack spacing={2.5}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Price (PKR)"
                        name="price"
                        type="number"
                        value={productForm.price}
                        onChange={handleFormChange}
                        sx={inputStyles}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Discount (%)"
                        name="discount"
                        type="number"
                        value={productForm.discount}
                        onChange={(e) => setProductForm({ ...productForm, discount: roundToTwoDecimalPlaces(parseFloat(e.target.value) || 0) })}
                        sx={inputStyles}
                      />
                      <Box sx={{ bgcolor: '#F8F5F2', p: 2, borderRadius: '0px', border: '1px solid #F0DCE3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.8rem' }}>Stock Quantity</Typography>
                        <TextField
                          type="number"
                          size="small"
                          name="stock"
                          value={productForm.stock}
                          onChange={handleFormChange}
                          sx={{ width: '90px', '& .MuiOutlinedInput-root': { borderRadius: '0px', bgcolor: '#fff' } }}
                        />
                      </Box>
                      <FormControlLabel
                        control={<Checkbox checked={productForm.isTopRated} onChange={handleFormChange} name="isTopRated" sx={{ color: '#C53261', '&.Mui-checked': { color: '#C53261' } }} />}
                        label={<Typography variant="body2" sx={{ fontWeight: 600, color: '#141311', fontSize: '0.85rem' }}>Feature as Top Rated</Typography>}
                      />
                    </Stack>
                  </Paper>

                  {/* Media Gallery Card */}
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '0px', border: '1px solid #F0DCE3', bgcolor: '#fff' }}>
                    <Box sx={sectionHeaderStyles}>
                      <Box sx={{ p: 1, bgcolor: '#C53261]/15', borderRadius: '0px', color: '#C53261', display: 'flex' }}>
                        <CloudUploadIcon sx={{ fontSize: '1.1rem' }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.95rem' }}>Media Gallery</Typography>
                    </Box>
                    <Box
                      onClick={() => fileInputRef.current.click()}
                      sx={{
                        border: '1px dashed #C5A059',
                        borderRadius: '0px',
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        mb: 2,
                        bgcolor: '#FBF9F7',
                        '&:hover': { bgcolor: '#F8F5F2', borderColor: '#C53261' }
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: '1.75rem', color: '#C53261', mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#141311', fontSize: '0.8rem' }}>Click to upload new images</Typography>
                      <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} multiple accept="image/*" />
                    </Box>
                    <Grid container spacing={1}>
                      {existingImages.map((img, index) => (
                        <Grid item xs={4} key={`existing-${index}`}>
                          <Box sx={{ position: 'relative', pt: '100%', borderRadius: '0px', overflow: 'hidden', border: '1px solid #F0DCE3' }}>
                            <Image fill src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${img}`} alt="" style={{ objectFit: 'cover' }} />
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveExistingImage(index)}
                              sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: '0px', '&:hover': { bgcolor: '#FEE2E2', color: '#EF4444' } }}
                            >
                              <CloseIcon sx={{ fontSize: '0.8rem' }} />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                      {productForm.images.map((img, index) => (
                        <Grid item xs={4} key={`new-${index}`}>
                          <Box sx={{ position: 'relative', pt: '100%', borderRadius: '0px', overflow: 'hidden', border: '1px solid #C53261' }}>
                            <Image fill src={URL.createObjectURL(img)} alt="" style={{ objectFit: 'cover' }} />
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveImage(index)}
                              sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: '0px', '&:hover': { bgcolor: '#FEE2E2', color: '#EF4444' } }}
                            >
                              <CloseIcon sx={{ fontSize: '0.8rem' }} />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>

                  {/* Attributes Card */}
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '0px', border: '1px solid #F0DCE3', bgcolor: '#fff' }}>
                    <Box sx={sectionHeaderStyles}>
                      <Box sx={{ p: 1, bgcolor: '#C5A059]/15', borderRadius: '0px', color: '#C5A059', display: 'flex' }}>
                        <StyleIcon sx={{ fontSize: '1.1rem' }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.95rem' }}>Attributes</Typography>
                    </Box>
                    <Stack spacing={2}>
                      <FormControl fullWidth size="small" sx={inputStyles}>
                        <InputLabel>Colors</InputLabel>
                        <MuiSelect
                          multiple
                          value={productForm.colors}
                          onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                          label="Colors"
                          MenuProps={selectMenuProps}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((color) => (
                                <span
                                  key={color.value}
                                  className="px-2 py-0.5 text-[10px] font-semibold bg-[#F8F5F2] border border-[#F0DCE3] rounded-none text-[#141311]"
                                >
                                  {color.label}
                                </span>
                              ))}
                            </Box>
                          )}
                        >
                          {colors.map((color) => (
                            <MenuItem key={color.id} value={{ value: color.id, label: color.name, hex: color.hex }}>
                              <Checkbox checked={productForm.colors.some((c) => c.value === color.id)} sx={{ color: '#C53261', '&.Mui-checked': { color: '#C53261' } }} />
                              <Box sx={{ width: 12, height: 12, borderRadius: '0px', bgcolor: color.hex, mr: 1, border: '1px solid #F0DCE3' }} />
                              {color.name}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                      <FormControl fullWidth size="small" sx={inputStyles}>
                        <InputLabel>Sizes</InputLabel>
                        <MuiSelect
                          multiple
                          value={productForm.sizes}
                          onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                          label="Sizes"
                          MenuProps={selectMenuProps}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((size) => (
                                <span
                                  key={size.value}
                                  className="px-2 py-0.5 text-[10px] font-semibold bg-[#F8F5F2] border border-[#F0DCE3] rounded-none text-[#141311]"
                                >
                                  {size.label}
                                </span>
                              ))}
                            </Box>
                          )}
                        >
                          {sizes.map((size) => (
                            <MenuItem key={size.id} value={{ value: size.id, label: size.name }}>
                              <Checkbox checked={productForm.sizes.some((s) => s.value === size.id)} sx={{ color: '#C53261', '&.Mui-checked': { color: '#C53261' } }} />
                              {size.name}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#fff', borderTop: '1px solid #F0DCE3' }}>
            <Button
              onClick={handleCancelEdit}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: '#141311',
                borderRadius: '0px',
                bgcolor: '#F8F5F2',
                border: '1px solid #F0DCE3',
                px: 3,
                py: 1,
                fontSize: '0.8rem',
                '&:hover': { bgcolor: '#F0DCE3' }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFormSubmit}
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderRadius: '0px',
                px: 4,
                py: 1,
                fontSize: '0.75rem',
                fontWeight: 700,
                bgcolor: '#141311',
                color: '#fff',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#C53261', boxShadow: 'none' }
              }}
            >
              Update Product
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default FilterableTable;