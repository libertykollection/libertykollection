'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import {
  AppRegistration as RegisterIcon,
  CloudUpload as UploadIcon,
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

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneno: '',
    city: '',
    role: 'ADMIN',
    image: null,
    base64: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image: file,
        base64: reader.result.split(',')[1],
      }));
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (base64) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64 }),
      });
      const result = await response.json();
      if (response.ok) {
        return result.image_url;
      } else {
        throw new Error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      let uploadedImageUrl = '';
      if (formData.base64) {
        uploadedImageUrl = await uploadImage(formData.base64);
      }

      const formDataToSend = {
        ...formData,
        imageUrl: uploadedImageUrl,
        base64: '',
      };

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataToSend),
      });

      const data = await response.json();
      if (data && (data.status === 100 || response.ok)) {
        router.push('/admin');
      } else {
        setErrorMessage(data?.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      setErrorMessage(error.message || 'Error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#FBF9F7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
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

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4.5 },
          borderRadius: '0px',
          border: '1px solid #E8DFC8',
          bgcolor: '#fff',
          maxWidth: '460px',
          width: '100%',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
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
            Create Admin Account
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', letterSpacing: '0.02em' }}>
            Register new administrator credentials for the management backend
          </Typography>
        </Box>

        {errorMessage && (
          <Alert severity="error" sx={{ borderRadius: '0px', mb: 2.5 }}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Full Name *
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Charlotte Tilbury"
                required
                sx={inputStyles}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Email Address *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@company.com"
                required
                sx={inputStyles}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Password *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                required
                sx={inputStyles}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Phone Number *
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="phoneno"
                value={formData.phoneno}
                onChange={handleChange}
                placeholder="+92 300 1234567"
                required
                sx={inputStyles}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                City *
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Lahore"
                required
                sx={inputStyles}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Profile Avatar
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                size="small"
                startIcon={<UploadIcon />}
                sx={{
                  borderRadius: '0px',
                  borderColor: '#E8DFC8',
                  color: '#141311',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  py: 1,
                  '&:hover': { borderColor: '#B98C2D', bgcolor: '#F9F5EC' },
                }}
              >
                {formData.image ? formData.image.name : 'Select Profile Photo'}
                <input type="file" name="image" accept="image/*" hidden onChange={handleImageChange} />
              </Button>
            </Box>

            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={<RegisterIcon />}
              sx={{
                bgcolor: '#141311',
                color: '#fff',
                borderRadius: '0px',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                fontWeight: 600,
                py: 1.5,
                mt: 1,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#B98C2D', boxShadow: 'none' },
              }}
            >
              {isLoading ? 'Creating Account...' : 'Register Administrator'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default Register;
