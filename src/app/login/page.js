'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
    InputAdornment,
    IconButton,
    Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [brandName, setBrandName] = useState('');

    const router = useRouter();

    useEffect(() => {
        fetch('/api/companydetails')
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.name) setBrandName(data.name);
            })
            .catch(() => null);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (token) {
            const userRole = localStorage.getItem('role');
            if (userRole === 'ADMIN') {
                router.push('/admin/pages/Main');
            } else if (userRole === 'CUSTOMER') {
                router.push('/');
            }
        }
    }, [router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/login', { email, password });
            if (response.data.success) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('authToken', token);
                localStorage.setItem('role', user.role);
                localStorage.setItem('userId', user.id);
                localStorage.setItem('userName', user.name);

                if (user.role === 'ADMIN') {
                    toast.success('Welcome back to the Admin Concierge.');
                    setTimeout(() => router.push('/admin/pages/Main'), 1200);
                } else if (user.role === 'CUSTOMER') {
                    toast.success('Welcome back to Liberty Kollection.');
                    setTimeout(() => router.push('/'), 1200);
                }
            }
        } catch (error) {
            console.error('Error logging in:', error.message);
            const errorMessage = error.response?.data?.message || 'Invalid credentials. Please verify your email and password.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!email) {
            setError('Please enter your email address first.');
            return;
        }
        setResendLoading(true);
        setResendSuccess('');
        try {
            const response = await axios.post('/api/resend-verification', { email });
            if (response.data.status) {
                setResendSuccess(response.data.message);
                setError('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend verification.');
        } finally {
            setResendLoading(false);
        }
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
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBF9F7', py: 6, px: 2 }}>
            <ToastContainer position="bottom-right" autoClose={3000} />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Paper
                    sx={{
                        width: '100%',
                        maxWidth: 460,
                        p: { xs: 4, sm: 6 },
                        borderRadius: '0px',
                        background: '#FFFFFF',
                        border: '1px solid #F0DCE3',
                        boxShadow: 'none',
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 5 }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color: '#C53261', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', mb: 1 }}>
                            <HiSparkles size={14} />
                            {brandName ? `${brandName}` : 'Liberty Kollection'}
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#141311', fontFamily: 'serif', letterSpacing: '-0.01em' }}>
                            Welcome Back
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: 400 }}>
                            Sign in to access your vanity bag and order archives
                        </Typography>
                    </Box>

                    {error && (
                        <Box sx={{ mb: 3, p: 2, bgcolor: '#FFF1F2', color: '#9F1239', border: '1px solid #FECDD3', borderRadius: '0px', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>
                            {error}
                            {error.includes('verify your email') && (
                                <Button onClick={handleResendVerification} disabled={resendLoading} sx={{ mt: 1, width: '100%', textTransform: 'none', color: '#C53261', fontWeight: 700, fontSize: '0.75rem' }}>
                                    {resendLoading ? <CircularProgress size={16} /> : 'Resend Verification Dispatch'}
                                </Button>
                            )}
                        </Box>
                    )}

                    {resendSuccess && (
                        <Box sx={{ mb: 3, p: 2, bgcolor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: '0px', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>
                            {resendSuccess}
                        </Box>
                    )}

                    <form onSubmit={handleLogin}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <TextField
                                id="login-email"
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                fullWidth
                                required
                                sx={inputStyle}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FiMail color="#9CA3AF" size={16} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                id="login-password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                fullWidth
                                required
                                sx={inputStyle}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FiLock color="#9CA3AF" size={16} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ borderRadius: '0px' }}>
                                                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Typography
                                    onClick={() => router.push('/customer/pages/forgot-password')}
                                    sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#C53261', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                >
                                    Forgot Password?
                                </Typography>
                            </Box>

                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    py: 1.8,
                                    borderRadius: '0px',
                                    bgcolor: '#141311',
                                    color: '#FFFFFF',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.12em',
                                    fontSize: '0.75rem',
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
                                {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Sign In to Account'}
                            </Button>

                            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #F0DCE3', textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.8rem' }}>
                                    New to {brandName || 'Liberty Kollection'}?{' '}
                                    <Typography
                                        component="span"
                                        onClick={() => router.push('/customer/pages/register')}
                                        sx={{
                                            color: '#C53261',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            fontSize: '0.75rem',
                                            '&:hover': { textDecoration: 'underline' },
                                        }}
                                    >
                                        Create An Account
                                    </Typography>
                                </Typography>
                            </Box>
                        </Box>
                    </form>
                </Paper>
            </motion.div>
        </Box>
    );
};

export default LoginPage;
