'use client';

import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Grid,
} from '@mui/material';
import {
  Save as SaveIcon,
  ContactMail as ContactIcon,
} from '@mui/icons-material';

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

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

const ContactUs = () => {
  const editorRef = useRef(null);
  const [formData, setFormData] = useState({
    Title: '',
    description: '',
    Text: '',
  });
  const [contactUs, setContactUs] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    async function fetchContactUs() {
      try {
        const response = await axios.get('/api/contactus');
        if (Array.isArray(response.data) && response.data.length > 0) {
          const existingContent = response.data[0];
          setContactUs(existingContent);
          setFormData({
            Title: existingContent.Title || '',
            description: existingContent.description || '',
            Text: existingContent.Text || '',
          });
          setEditorContent(existingContent.Text || '');
        }
      } catch (error) {
        console.error('Error fetching Contact Us content:', error);
      } finally {
        setIsEditorReady(true);
      }
    }
    fetchContactUs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextChange = (content) => {
    setEditorContent(content);
    setFormData((prev) => ({ ...prev, Text: content }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (contactUs && contactUs.id) {
        await axios.put(`/api/contactus/${contactUs.id}`, formData, {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        const response = await axios.post('/api/contactus', formData, {
          headers: { 'Content-Type': 'application/json' },
        });
        setContactUs(response.data);
      }
      setToast({ open: true, message: 'Contact Us content saved successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error saving Contact Us content:', error);
      setToast({ open: true, message: 'Failed to save Contact Us content.', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#FBF9F7', minHeight: '100vh' }}>
      {isLoading && (
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
            Concierge & Client Relations
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', letterSpacing: '0.02em' }}>
            Edit the public contact greeting, boutique appointment details, and concierge intro
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
          maxWidth: '1080px',
        }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Concierge Headline
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="Title"
                value={formData.Title}
                onChange={handleInputChange}
                placeholder="e.g. Bespoke Beauty Advisory & Client Concierge"
                sx={inputStyles}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Summary Tagline
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Our beauty advisors are available 7 days a week to assist with consultations..."
                sx={inputStyles}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Full Description & Contact Guidelines
              </Typography>
              {isEditorReady && (
                <Box sx={{ border: '1px solid #F0DCE3' }}>
                  <JoditEditor
                    ref={editorRef}
                    value={editorContent}
                    onBlur={handleTextChange}
                    onChange={() => {}}
                  />
                </Box>
              )}
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
                {isLoading ? 'Saving...' : contactUs ? 'Update Contact Page' : 'Publish Contact Page'}
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

export default ContactUs;