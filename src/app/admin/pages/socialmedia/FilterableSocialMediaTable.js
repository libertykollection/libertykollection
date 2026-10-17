'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  Grid,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Pinterest as PinterestIcon,
  OpenInNew as OpenInNewIcon,
  Save as SaveIcon,
  Share as SocialIcon,
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

const PLATFORMS = [
  { key: 'instagram', label: 'Instagram Profile', icon: <InstagramIcon sx={{ color: '#E1306C' }} />, placeholder: 'https://instagram.com/yourbrand' },
  { key: 'facebook', label: 'Facebook Page', icon: <FacebookIcon sx={{ color: '#1877F2' }} />, placeholder: 'https://facebook.com/yourbrand' },
  { key: 'tiktok', label: 'TikTok Account', icon: <SocialIcon sx={{ color: '#000000' }} />, placeholder: 'https://tiktok.com/@yourbrand' },
  { key: 'pinterest', label: 'Pinterest Boards', icon: <PinterestIcon sx={{ color: '#E60023' }} />, placeholder: 'https://pinterest.com/yourbrand' },
  { key: 'twitter', label: 'X (Twitter)', icon: <TwitterIcon sx={{ color: '#1DA1F2' }} />, placeholder: 'https://x.com/yourbrand' },
];

const SocialMediaForm = () => {
  const [formData, setFormData] = useState({
    id: null,
    facebook: '',
    instagram: '',
    twitter: '',
    tiktok: '',
    pinterest: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchSocialMediaLinks = async () => {
      setPageLoading(true);
      try {
        const response = await fetch('/api/socialmedia');
        const result = await response.json();
        if (result.status && result.data.length > 0) {
          const existingData = result.data[0];
          setFormData({
            id: existingData.id,
            facebook: existingData.facebook || '',
            instagram: existingData.instagram || '',
            twitter: existingData.twitter || '',
            tiktok: existingData.tiktok || '',
            pinterest: existingData.pinterest || '',
          });
        }
      } catch (error) {
        console.error('Error fetching social media links:', error);
      } finally {
        setPageLoading(false);
      }
    };

    fetchSocialMediaLinks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/socialmedia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.status) {
        setToast({ open: true, message: 'Social media channels updated successfully!', severity: 'success' });
      } else {
        setToast({ open: true, message: 'Failed to update social channels.', severity: 'error' });
      }
    } catch (error) {
      console.error('Error updating social media links:', error);
      setToast({ open: true, message: 'An error occurred while saving.', severity: 'error' });
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
            Social Channels & Community Handles
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', letterSpacing: '0.02em' }}>
            Connect client-facing footer icons and header links to official brand social channels
          </Typography>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: '0px',
          border: '1px solid #E8DFC8',
          bgcolor: '#fff',
          maxWidth: '780px',
        }}
      >
        <form onSubmit={handleUpdate}>
          <Grid container spacing={3}>
            {PLATFORMS.map((platform) => {
              const url = formData[platform.key];
              return (
                <Grid item xs={12} key={platform.key}>
                  <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                    {platform.label}
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name={platform.key}
                    value={url || ''}
                    onChange={handleInputChange}
                    placeholder={platform.placeholder}
                    sx={inputStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {platform.icon}
                        </InputAdornment>
                      ),
                      endAdornment: url ? (
                        <InputAdornment position="end">
                          <Tooltip title="Test link in new tab">
                            <IconButton
                              size="small"
                              component="a"
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ color: '#8C7A70', '&:hover': { color: '#B98C2D' } }}
                            >
                              <OpenInNewIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ) : null,
                    }}
                  />
                </Grid>
              );
            })}

            <Grid item xs={12}>
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
                  '&:hover': { bgcolor: '#B98C2D', boxShadow: 'none' },
                }}
              >
                {isLoading ? 'Saving Channels...' : 'Save Social Links'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

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

export default SocialMediaForm;