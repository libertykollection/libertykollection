'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
  Paper,
  Grid
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  FiMail,
  FiLock,
  FiUser,
  FiPhone,
  FiMapPin,
  FiCamera,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneno: '',
    city: '',
    role: 'CUSTOMER',
    image: null,
    base64: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [brandName, setBrandName] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/companydetails')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.name) setBrandName(data.name);
      })
      .catch(() => null);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      const lettersOnly = /^[A-Za-z\s]*$/;
      if (!lettersOnly.test(value)) {
        toast.error('Name should only contain letters.');
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    if (!value.startsWith('+92')) {
      value = '+92' + value.replace(/^0+/, '');
    }
    setFormData((prev) => ({ ...prev, phoneno: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const phoneRegex = /^\+92\d{10}$/;
    if (!phoneRegex.test(formData.phoneno)) {
      toast.error("Phone format: +92xxxxxxxxxx (10 digits)");
      return;
    }

    setLoading(true);
    try {
      const uploadedImageUrl = formData.base64 ? await uploadImage(formData.base64) : '';

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imageUrl: uploadedImageUrl,
          base64: '',
          confirmPassword: '',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Registration successful! Please check your email to verify.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (base64) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Upload failed');
    return result.image_url;
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '0px',
      bgcolor: '#FFF5F8',
      '& fieldset': { borderColor: '#F0DCE3' },
      '&:hover fieldset': { borderColor: '#C53261' },
      '&.Mui-focused fieldset': { borderColor: '#141311', borderWidth: '1px' },
      '&.Mui-focused': { bgcolor: '#fff' },
    },
    '& .MuiInputLabel-root': {
      color: '#6B7280',
      fontSize: '0.85rem',
      '&.Mui-focused': { color: '#141311' }
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', py: 8, px: 2, background: '#FBF9F7'
    }}>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Paper sx={{
          width: '100%',
          maxWidth: 540,
          p: { xs: 4, sm: 6 },
          borderRadius: '0px',
          background: '#FFFFFF',
          border: '1px solid #F0DCE3',
          boxShadow: 'none',
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color: '#C53261', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', mb: 1 }}>
              <HiSparkles size={14} />
              {brandName ? `${brandName}` : 'Gloria Cosmetics'}
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#141311', fontFamily: 'serif', letterSpacing: '-0.01em' }}>
              Create Account
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.8rem' }}>
              Join our beauty clientele for privileged access, custom shades, and rapid checkout
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  id="reg-name"
                  fullWidth label="Full Name" name="name" required
                  value={formData.name} onChange={handleChange} sx={inputStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><FiUser color="#9CA3AF" size={16} /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="reg-email"
                  fullWidth label="Email Address" name="email" type="email" required
                  value={formData.email} onChange={handleChange} sx={inputStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><FiMail color="#9CA3AF" size={16} /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="reg-password"
                  fullWidth label="Password" name="password" required
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password} onChange={handleChange} sx={inputStyle}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><FiLock color="#9CA3AF" size={16} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ borderRadius: '0px' }}>
                          {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="reg-confirm"
                  fullWidth label="Confirm Password" name="confirmPassword" required
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword} onChange={handleChange} sx={inputStyle}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><FiLock color="#9CA3AF" size={16} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ borderRadius: '0px' }}>
                          {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="reg-phone"
                  fullWidth label="Phone" name="phoneno" required placeholder="+92xxxxxxxxxx"
                  value={formData.phoneno} onChange={handlePhoneChange} sx={inputStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><FiPhone color="#9CA3AF" size={16} /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="reg-city"
                  fullWidth label="City / Region" name="city" required
                  value={formData.city} onChange={handleChange} sx={inputStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><FiMapPin color="#9CA3AF" size={16} /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  accept="image/*" style={{ display: 'none' }}
                  id="profile-upload" type="file" onChange={handleImageChange}
                />
                <label htmlFor="profile-upload">
                  <Button
                    component="span" fullWidth startIcon={<FiCamera />}
                    sx={{
                      height: '48px',
                      borderRadius: '0px',
                      border: '1px dashed #F0DCE3',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: formData.image ? '#C53261' : '#6B7280',
                      bgcolor: '#FFF5F8',
                      '&:hover': { bgcolor: '#fff', borderColor: '#141311' }
                    }}
                  >
                    {formData.image ? 'Profile Portrait Selected' : 'Upload Client Portrait (Optional)'}
                  </Button>
                </label>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit" variant="contained" fullWidth disabled={loading}
                  sx={{
                    py: 1.8,
                    borderRadius: '0px',
                    bgcolor: '#141311',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    boxShadow: 'none',
                    border: '1px solid #141311',
                    '&:hover': {
                      bgcolor: '#2A1B24',
                      boxShadow: 'none',
                    },
                    '&:disabled': {
                      bgcolor: '#9CA3AF',
                      color: '#fff',
                    }
                  }}
                >
                  {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Register My Account'}
                </Button>
              </Grid>
              <Grid item xs={12} sx={{ textAlign: 'center', mt: 1 }}>
                <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.8rem' }}>
                  Already registered?{' '}
                  <Typography
                    component="span" onClick={() => router.push('/login')}
                    sx={{
                      color: '#C53261',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontSize: '0.75rem',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Sign In
                  </Typography>
                </Typography>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Register;
