'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Stack,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Business as CompanyIcon,
  CloudUpload as UploadIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
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

const CompanyDetailsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    headerImage: '',
    favIcon: '',
  });
  const [companyDetails, setCompanyDetails] = useState(null);
  const [headerImageFile, setHeaderImageFile] = useState(null);
  const [favIconFile, setFavIconFile] = useState(null);
  const [headerImagePreview, setHeaderImagePreview] = useState(null);
  const [favIconPreview, setFavIconPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    async function fetchCompanyDetails() {
      setPageLoading(true);
      try {
        const response = await fetch('/api/companydetails');
        const data = await response.json();
        if (data) {
          setCompanyDetails(data);
          setFormData({
            name: data.name || '',
            description: data.description || '',
            headerImage: data.headerImage || '',
            favIcon: data.favIcon || '',
          });
          setHeaderImagePreview(
            data.headerImage
              ? `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${data.headerImage}`
              : null
          );
          setFavIconPreview(
            data.favIcon
              ? `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${data.favIcon}`
              : null
          );
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
      } finally {
        setPageLoading(false);
      }
    }
    fetchCompanyDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;

    if (name === 'headerImage') {
      setHeaderImageFile(file);
      setHeaderImagePreview(URL.createObjectURL(file));
    } else if (name === 'favIcon') {
      setFavIconFile(file);
      setFavIconPreview(URL.createObjectURL(file));
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadImage = async (base64Image, type) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, type: type }),
      });
      const result = await response.json();
      return result.url || result.image_url || null;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let headerImageUrl = formData.headerImage;
      let favIconUrl = formData.favIcon;

      if (headerImageFile) {
        const headerImageBase64 = await convertToBase64(headerImageFile);
        const uploaded = await uploadImage(headerImageBase64);
        if (uploaded) headerImageUrl = uploaded;
      }

      if (favIconFile) {
        const favIconBase64 = await convertToBase64(favIconFile);
        const uploaded = await uploadImage(favIconBase64, 'ico');
        if (uploaded) favIconUrl = uploaded;
      }

      const updatedFormData = {
        ...formData,
        headerImage: headerImageUrl,
        favIcon: favIconUrl,
      };

      if (companyDetails && companyDetails.id) {
        const response = await fetch(`/api/companydetails/${companyDetails.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFormData),
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to update company details');
        }
        const updated = await response.json();
        setCompanyDetails(updated);
        setFormData({
          name: updated.name || '',
          description: updated.description || '',
          headerImage: updated.headerImage || '',
          favIcon: updated.favIcon || '',
        });
        setHeaderImageFile(null);
        setFavIconFile(null);
      } else {
        const response = await fetch('/api/companydetails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFormData),
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to create company details');
        }
        const data = await response.json();
        setCompanyDetails(data);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          headerImage: data.headerImage || '',
          favIcon: data.favIcon || '',
        });
        setHeaderImageFile(null);
        setFavIconFile(null);
      }

      setToast({ open: true, message: 'Company identity details updated successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error saving company details:', error);
      setToast({ open: true, message: 'Failed to update company details.', severity: 'error' });
    } finally {
      setIsLoading(false);
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            Brand Identity & Company Profile
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', letterSpacing: '0.02em' }}>
            Configure store branding, official company name, navbar logo, and browser favicon
          </Typography>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3.5} sx={{ maxWidth: '1100px' }}>
          {/* General Information */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: '0px',
                border: '1px solid #F0DCE3',
                bgcolor: '#fff',
                height: '100%',
              }}
            >
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 2.5 }}>
                General Brand Credentials
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                  Brand / Company Name *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Gloira Luxury Cosmetics"
                  required
                  sx={inputStyles}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                  Brand Mission & Overview
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief synopsis of your cosmetics store, ethos, and authentic products..."
                  multiline
                  rows={4}
                  sx={inputStyles}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                startIcon={<SaveIcon />}
                sx={{
                  bgcolor: '#141311',
                  color: '#fff',
                  borderRadius: '0px',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#C53261', boxShadow: 'none' },
                }}
              >
                {isLoading ? 'Saving Changes...' : companyDetails ? 'Update Brand Identity' : 'Save Brand Identity'}
              </Button>
            </Paper>
          </Grid>

          {/* Media & Assets */}
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              {/* Header Logo */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: '0px',
                  border: '1px solid #F0DCE3',
                  bgcolor: '#fff',
                }}
              >
                <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 1.5 }}>
                  Primary Brand Logo
                </Typography>

                <Box
                  sx={{
                    width: '100%',
                    height: 120,
                    bgcolor: '#FBF9F7',
                    border: '1px dashed #C5A059',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    p: 2,
                    mb: 1.5,
                  }}
                >
                  {headerImagePreview ? (
                    <img
                      src={headerImagePreview}
                      alt="Logo preview"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <CompanyIcon sx={{ color: '#C5A059', fontSize: 32, mb: 0.5 }} />
                      <Typography variant="caption" sx={{ color: '#8C7A70', display: 'block' }}>
                        No logo uploaded
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  size="small"
                  startIcon={<UploadIcon />}
                  sx={{
                    borderRadius: '0px',
                    borderColor: '#141311',
                    color: '#141311',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    '&:hover': { borderColor: '#C53261', bgcolor: '#FFF5F8' },
                  }}
                >
                  Upload Store Logo
                  <input type="file" name="headerImage" accept="image/*" hidden onChange={handleFileChange} />
                </Button>
              </Paper>

              {/* Browser Favicon */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: '0px',
                  border: '1px solid #F0DCE3',
                  bgcolor: '#fff',
                }}
              >
                <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 1.5 }}>
                  Browser Favicon (.ico / .png)
                </Typography>

                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: '#FBF9F7',
                    border: '1px dashed #C5A059',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    p: 1,
                    mb: 1.5,
                  }}
                >
                  {favIconPreview ? (
                    <img
                      src={favIconPreview}
                      alt="Favicon preview"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <Typography variant="caption" sx={{ color: '#8C7A70', fontSize: '0.7rem' }}>
                      32x32
                    </Typography>
                  )}
                </Box>

                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  size="small"
                  startIcon={<UploadIcon />}
                  sx={{
                    borderRadius: '0px',
                    borderColor: '#141311',
                    color: '#141311',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    '&:hover': { borderColor: '#C53261', bgcolor: '#FFF5F8' },
                  }}
                >
                  Upload Favicon
                  <input type="file" name="favIcon" accept="image/*" hidden onChange={handleFileChange} />
                </Button>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </form>

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

export default CompanyDetailsPage;