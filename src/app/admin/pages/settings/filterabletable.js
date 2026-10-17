'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Close as CloseIcon,
  LocalShipping as ShippingIcon,
  Percent as TaxIcon,
  Payments as CodIcon,
  SettingsSuggest as SettingsIcon,
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

const FilterableTable = ({ settings = [], fetchSettings, isPageLoading = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [editSetting, setEditSetting] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [settingForm, setSettingForm] = useState({
    deliveryCharge: '',
    taxPercentage: '',
    other1: 0,
    other2: 0,
  });

  const activeSetting = settings && settings.length > 0 ? settings[0] : null;

  const handleEditItem = (item) => {
    setEditSetting(item);
    setSettingForm({
      deliveryCharge: item?.deliveryCharge ?? '',
      taxPercentage: item?.taxPercentage ?? '',
      other1: item?.other1 ?? 0,
      other2: item?.other2 ?? 0,
    });
    setIsModalVisible(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSettingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const method = editSetting ? 'PUT' : 'POST';
      const url = editSetting ? `/api/settings/${editSetting.id}` : '/api/settings';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingForm),
      });

      if (response.ok) {
        await fetchSettings();
        setIsModalVisible(false);
        setEditSetting(null);
        setToast({ open: true, message: 'Store transactional rates updated successfully!', severity: 'success' });
      } else {
        setToast({ open: true, message: 'Failed to update store settings.', severity: 'error' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setToast({ open: true, message: 'Error saving settings.', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#FBF9F7', minHeight: '100vh' }}>
      {(isLoading || isPageLoading) && (
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
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
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
            Store Transactional & Delivery Settings
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', letterSpacing: '0.02em' }}>
            Configure default delivery rates, sales tax percentages, and Cash on Delivery surcharges
          </Typography>
        </Box>
        {activeSetting && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => handleEditItem(activeSetting)}
            sx={{
              bgcolor: '#141311',
              color: '#fff',
              borderRadius: '0px',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              fontWeight: 600,
              px: 3,
              py: 1.25,
              border: '1px solid #141311',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#B98C2D',
                borderColor: '#B98C2D',
                boxShadow: 'none',
              },
            }}
          >
            Edit Store Rates
          </Button>
        )}
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '0px',
              border: '1px solid #E8DFC8',
              bgcolor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Standard Delivery Fee
              </Typography>
              <Typography variant="h4" sx={{ color: '#141311', fontWeight: 600, mt: 0.5, fontFamily: 'serif' }}>
                {activeSetting?.deliveryCharge ? `${activeSetting.deliveryCharge} PKR` : 'Free / 0 PKR'}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                bgcolor: '#F9F5EC',
                color: '#B98C2D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShippingIcon fontSize="small" />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '0px',
              border: '1px solid #E8DFC8',
              bgcolor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Sales Tax Rate
              </Typography>
              <Typography variant="h4" sx={{ color: '#141311', fontWeight: 600, mt: 0.5, fontFamily: 'serif' }}>
                {activeSetting?.taxPercentage ? `${activeSetting.taxPercentage}%` : '0%'}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                bgcolor: '#F9F5EC',
                color: '#B98C2D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TaxIcon fontSize="small" />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '0px',
              border: '1px solid #E8DFC8',
              bgcolor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                COD Surcharge Fee
              </Typography>
              <Typography variant="h4" sx={{ color: '#141311', fontWeight: 600, mt: 0.5, fontFamily: 'serif' }}>
                {activeSetting?.other1 ? `${activeSetting.other1} PKR` : '0 PKR'}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                bgcolor: '#F9F5EC',
                color: '#B98C2D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CodIcon fontSize="small" />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Table Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '0px',
          border: '1px solid #E8DFC8',
          bgcolor: '#fff',
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FBF9F7' }}>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  Standard Delivery Charge
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  Tax Percentage (%)
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  Cash On Delivery Fee
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  Additional Handling
                </TableCell>
                <TableCell align="right" sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: 120 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {settings.length > 0 && settings[0] ? (
                settings.map((item) => (
                  <TableRow
                    key={item.id || 'default'}
                    hover
                    sx={{
                      '&:hover': { bgcolor: '#FDFBF9' },
                      borderBottom: '1px solid #E8DFC8',
                    }}
                  >
                    <TableCell sx={{ color: '#141311', fontWeight: 600, fontSize: '0.9rem' }}>
                      {item.deliveryCharge ? `${item.deliveryCharge} PKR` : 'Free Delivery'}
                    </TableCell>

                    <TableCell sx={{ color: '#554A43', fontSize: '0.875rem' }}>
                      {item.taxPercentage ? `${item.taxPercentage}%` : '0%'}
                    </TableCell>

                    <TableCell sx={{ color: '#554A43', fontSize: '0.875rem' }}>
                      {item.other1 ? `${item.other1} PKR` : '0 PKR'}
                    </TableCell>

                    <TableCell sx={{ color: '#8C7A70', fontSize: '0.875rem' }}>
                      {item.other2 ? `${item.other2} PKR` : 'None'}
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                        onClick={() => handleEditItem(item)}
                        sx={{
                          borderRadius: '0px',
                          color: '#141311',
                          border: '1px solid #E8DFC8',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          '&:hover': { borderColor: '#B98C2D', color: '#B98C2D', bgcolor: '#F9F5EC' },
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#8C7A70' }}>
                    <SettingsIcon sx={{ fontSize: 36, color: '#D2AA2D', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#141311' }}>
                      No store settings configured yet
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Settings Dialog */}
      <Dialog
        open={isModalVisible}
        onClose={() => !isLoading && setIsModalVisible(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '0px',
            border: '1px solid #E8DFC8',
            boxShadow: '0 20px 40px rgba(18, 11, 16, 0.1)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #E8DFC8',
            p: 2.5,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontFamily: 'serif', fontWeight: 500, color: '#141311' }}>
              Configure Store Rates
            </Typography>
            <Typography variant="caption" sx={{ color: '#8C7A70' }}>
              Update transactional fees applied at client checkout
            </Typography>
          </Box>
          <IconButton onClick={() => setIsModalVisible(false)} disabled={isLoading} size="small">
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleFormSubmit}>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Standard Delivery Charge (PKR) *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="deliveryCharge"
                value={settingForm.deliveryCharge}
                onChange={handleFormChange}
                required
                sx={inputStyles}
                InputProps={{
                  startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                }}
              />
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Sales Tax Rate (%) *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="taxPercentage"
                value={settingForm.taxPercentage}
                onChange={handleFormChange}
                required
                sx={inputStyles}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Cash On Delivery (COD) Surcharge (PKR)
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="other1"
                value={settingForm.other1}
                onChange={handleFormChange}
                sx={inputStyles}
                InputProps={{
                  startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                }}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Special Handling / Packaging Surcharge (PKR)
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="other2"
                value={settingForm.other2}
                onChange={handleFormChange}
                sx={inputStyles}
                InputProps={{
                  startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E8DFC8', gap: 1 }}>
            <Button
              onClick={() => setIsModalVisible(false)}
              disabled={isLoading}
              sx={{
                borderRadius: '0px',
                color: '#8C7A70',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                fontWeight: 600,
                px: 2.5,
                '&:hover': { bgcolor: '#F9F5EC', color: '#141311' },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                bgcolor: '#141311',
                color: '#fff',
                borderRadius: '0px',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                fontWeight: 600,
                px: 3,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#B98C2D', boxShadow: 'none' },
              }}
            >
              {isLoading ? 'Updating...' : 'Save Settings'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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

export default FilterableTable;
