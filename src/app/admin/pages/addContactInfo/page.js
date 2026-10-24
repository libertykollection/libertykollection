'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Grid,
  InputAdornment,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Language as WebsiteIcon,
  Person as OwnerIcon,
  Save as SaveIcon,
  SupportAgent as ConciergeIcon,
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

const ContactInfoPage = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: '',
    address: '',
    website: '',
    owner: '',
  });
  const [contactInfo, setContactInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    async function fetchContactInfo() {
      setPageLoading(true);
      try {
        const response = await axios.get('/api/contactinfo');
        if (Array.isArray(response.data) && response.data.length > 0) {
          const existingContact = response.data[0];
          setContactInfo(existingContact);
          setFormData({
            phoneNumber: existingContact.phoneNumber || '',
            email: existingContact.email || '',
            address: existingContact.address || '',
            website: existingContact.website || '',
            owner: existingContact.owner || '',
          });
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      } finally {
        setPageLoading(false);
      }
    }
    fetchContactInfo();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (contactInfo && contactInfo.id) {
        await axios.put(`/api/contactinfo/${contactInfo.id}`, formData, {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        const response = await axios.post('/api/contactinfo', formData, {
          headers: { 'Content-Type': 'application/json' },
        });
        setContactInfo(response.data);
      }
      setToast({ open: true, message: 'Contact details updated successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error saving contact info:', error);
      setToast({ open: true, message: 'Failed to save contact info.', severity: 'error' });
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
            Boutique Contact & Headquarters
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', letterSpacing: '0.02em' }}>
            Manage direct phone hotlines, official company address, customer care inbox, and domain
          </Typography>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: '0px',
          border: '1px solid #F0DCE3',
          bgcolor: '#fff',
          maxWidth: '860px',
        }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Customer Care Hotline
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+92 300 1234567"
                sx={inputStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: '#8C7A70', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Official Concierge Email
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="care@company.com"
                sx={inputStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#8C7A70', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Brand Domain / Web URL
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://company.com"
                sx={inputStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WebsiteIcon sx={{ color: '#8C7A70', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Brand Director / Founder
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="owner"
                value={formData.owner}
                onChange={handleInputChange}
                placeholder="Founder / Managing Director"
                sx={inputStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <OwnerIcon sx={{ color: '#8C7A70', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Company & Dispatch Headquarters Address
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Suite 101, Luxury Arcade, Commercial Zone, Lahore, Pakistan"
                multiline
                rows={3}
                sx={inputStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <LocationIcon sx={{ color: '#8C7A70', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

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
                  '&:hover': { bgcolor: '#C53261', boxShadow: 'none' },
                }}
              >
                {isLoading ? 'Saving...' : 'Save Contact Details'}
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

export default ContactInfoPage;