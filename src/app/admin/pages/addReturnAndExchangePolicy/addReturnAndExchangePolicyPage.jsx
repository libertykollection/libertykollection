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
  Cached as ReturnIcon,
} from '@mui/icons-material';

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

const ReturnAndExchangePolicy = () => {
  const editorRef = useRef(null);
  const [formData, setFormData] = useState({
    Title: '',
    description: '',
    Text: '',
  });
  const [policy, setPolicy] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    async function fetchPolicy() {
      try {
        const response = await axios.get('/api/returnandexchangepolicy');
        if (Array.isArray(response.data) && response.data.length > 0) {
          const existing = response.data[0];
          setPolicy(existing);
          setFormData({
            Title: existing.Title || '',
            description: existing.description || '',
            Text: existing.Text || '',
          });
          setEditorContent(existing.Text || '');
        }
      } catch (error) {
        console.error('Error fetching return policy:', error);
      } finally {
        setIsEditorReady(true);
      }
    }
    fetchPolicy();
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
      if (policy && policy.id) {
        await axios.put(`/api/returnandexchangepolicy/${policy.id}`, formData, {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        const response = await axios.post('/api/returnandexchangepolicy', formData, {
          headers: { 'Content-Type': 'application/json' },
        });
        setPolicy(response.data);
      }
      setToast({ open: true, message: 'Return & Exchange policy saved successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error saving return policy:', error);
      setToast({ open: true, message: 'Failed to save policy.', severity: 'error' });
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
            Returns & Exchange Guarantee
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', letterSpacing: '0.02em' }}>
            Set terms for cosmetic product exchanges, damaged seal verification, and refunds
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
          maxWidth: '1080px',
        }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Policy Document Title
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="Title"
                value={formData.Title}
                onChange={handleInputChange}
                placeholder="e.g. 14-Day Flawless Satisfaction & Exchange Guarantee"
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
                placeholder="Brief summary regarding unopened cosmetic packaging and replacement procedures..."
                sx={inputStyles}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Detailed Legal Terms & Procedure
              </Typography>
              {isEditorReady && (
                <Box sx={{ border: '1px solid #E8DFC8' }}>
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
                  '&:hover': { bgcolor: '#B98C2D', boxShadow: 'none' },
                }}
              >
                {isLoading ? 'Saving...' : policy ? 'Update Policy' : 'Publish Policy'}
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

export default ReturnAndExchangePolicy;