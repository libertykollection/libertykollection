'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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

const ProfilePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({ name: '', email: '', id: null });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const res = await axios.get(`/api/users/${decoded.id}`);
          setUserData({ name: res.data.name, email: res.data.email, id: decoded.id });
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };
    fetchProfile();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({ open: true, message: 'New passwords do not match.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put('/api/users/change-password', {
        id: userData.id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.data.status) {
        setToast({ open: true, message: 'Security password updated successfully!', severity: 'success' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setToast({ open: true, message: res.data.message || 'Failed to update password.', severity: 'error' });
      }
    } catch (error) {
      setToast({ open: true, message: error.response?.data?.message || 'Error updating password', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#FBF9F7', minHeight: '100vh' }}>
      {/* Top Loading Progress Bar */}
      {loading && (
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
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={() => router.back()}
          sx={{
            borderRadius: '0px',
            bgcolor: '#fff',
            border: '1px solid #E8DFC8',
            color: '#141311',
            '&:hover': { bgcolor: '#F9F5EC', color: '#B98C2D' },
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'serif',
              fontWeight: 500,
              color: '#141311',
              letterSpacing: '-0.02em',
              mb: 0.25,
            }}
          >
            Administrator Profile & Security
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', letterSpacing: '0.02em' }}>
            Manage your personal administrator credentials and update access keypass
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ maxWidth: '1080px' }}>
        {/* Personal Details */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: '0px',
              border: '1px solid #E8DFC8',
              bgcolor: '#fff',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: '#F9F5EC',
                  color: '#B98C2D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PersonIcon fontSize="small" />
              </Box>
              <Typography variant="h6" sx={{ fontFamily: 'serif', fontWeight: 600, color: '#141311' }}>
                Account Information
              </Typography>
            </Box>

            <Divider sx={{ mb: 3, borderColor: '#E8DFC8' }} />

            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                  Full Name
                </Typography>
                <TextField fullWidth size="small" value={userData.name} disabled sx={inputStyles} />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                  Official Email
                </Typography>
                <TextField fullWidth size="small" value={userData.email} disabled sx={inputStyles} />
              </Box>

              <Typography variant="caption" sx={{ color: '#8C7A70', lineHeight: 1.6 }}>
                * Administrator identity profiles are secured. To request changes to your registered name or email, contact the Super Administrator.
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* Change Password */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: '0px',
              border: '1px solid #E8DFC8',
              bgcolor: '#fff',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: '#F9F5EC',
                  color: '#B98C2D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LockIcon fontSize="small" />
              </Box>
              <Typography variant="h6" sx={{ fontFamily: 'serif', fontWeight: 600, color: '#141311' }}>
                Update Security Password
              </Typography>
            </Box>

            <Divider sx={{ mb: 3, borderColor: '#E8DFC8' }} />

            <form onSubmit={handleChangePassword}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                    Current Password *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    sx={inputStyles}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                            {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                    New Secure Password *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    sx={inputStyles}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                    Confirm New Password *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    sx={inputStyles}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={<SaveIcon />}
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
                  {loading ? 'Updating Password...' : 'Save New Password'}
                </Button>
              </Stack>
            </form>
          </Paper>
        </Grid>
      </Grid>

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

export default ProfilePage;
