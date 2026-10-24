'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  InputAdornment,
  Grid,
  Stack,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
  SupervisorAccount as ManagerIcon,
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

const FilterableTable = ({ data = [], fetchData, isPageLoading = false }) => {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, id: null });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const [branches, setBranches] = useState([]);
  const [newItem, setNewItem] = useState({
    id: null,
    name: '',
    branch: '',
    role: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    const list = Array.isArray(data) ? data : [];
    if (!filter.trim()) {
      setFilteredData(list);
    } else {
      const term = filter.toLowerCase();
      setFilteredData(
        list.filter((item) =>
          Object.values(item).some((val) =>
            String(val).toLowerCase().includes(term)
          )
        )
      );
    }
  }, [filter, data]);

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches');
      const result = await response.json();
      setBranches(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const stats = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const superAdmins = list.filter((u) => (u.role || '').toLowerCase().includes('super')).length;
    const managers = list.filter((u) => !(u.role || '').toLowerCase().includes('super')).length;
    return {
      total: list.length,
      superAdmins,
      managers,
    };
  }, [data]);

  const handleOpenAdd = () => {
    setNewItem({
      id: null,
      name: '',
      branch: branches[0]?.title || '',
      role: 'admin',
      email: '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setNewItem({
      id: item.id,
      name: item.name || '',
      branch: item.branch || '',
      role: item.role || 'admin',
      email: item.email || '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleAddorUpdateItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.email.trim()) {
      setToast({ open: true, message: 'Please provide name and email.', severity: 'error' });
      return;
    }
    if (!newItem.id && !newItem.password) {
      setToast({ open: true, message: 'Please provide a password for new admin.', severity: 'error' });
      return;
    }

    setIsLoading(true);
    const method = newItem.id ? 'PUT' : 'POST';
    const url = newItem.id ? `/api/admin/${newItem.id}` : '/api/admin';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save admin user');
      }
      setToast({
        open: true,
        message: newItem.id ? 'Admin account updated successfully!' : 'New administrator created successfully!',
        severity: 'success',
      });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving admin:', error);
      setToast({ open: true, message: error.message || 'Error saving user', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteConfirmation.id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/${deleteConfirmation.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Failed to delete admin');
      }
      setToast({ open: true, message: 'Admin account removed.', severity: 'warning' });
      fetchData();
    } catch (error) {
      console.error('Error deleting admin:', error);
      setToast({ open: true, message: error.message || 'Error deleting admin', severity: 'error' });
    } finally {
      setIsLoading(false);
      setDeleteConfirmation({ open: false, id: null });
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
            Staff & Administrator Roles
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', letterSpacing: '0.02em' }}>
            Manage administrative credentials, boutique branch access, and role permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
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
              bgcolor: '#C53261',
              borderColor: '#C53261',
              boxShadow: 'none',
            },
          }}
        >
          Add Administrator
        </Button>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '0px',
              border: '1px solid #F0DCE3',
              bgcolor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Total Admins
              </Typography>
              <Typography variant="h4" sx={{ color: '#141311', fontWeight: 600, mt: 0.5, fontFamily: 'serif' }}>
                {stats.total}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                bgcolor: '#FFF5F8',
                color: '#C53261',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AdminIcon fontSize="small" />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '0px',
              border: '1px solid #F0DCE3',
              bgcolor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Super Admins
              </Typography>
              <Typography variant="h4" sx={{ color: '#141311', fontWeight: 600, mt: 0.5, fontFamily: 'serif' }}>
                {stats.superAdmins}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                bgcolor: '#FFF5F8',
                color: '#C53261',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SecurityIcon fontSize="small" />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '0px',
              border: '1px solid #F0DCE3',
              bgcolor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Branch Managers & Staff
              </Typography>
              <Typography variant="h4" sx={{ color: '#141311', fontWeight: 600, mt: 0.5, fontFamily: 'serif' }}>
                {stats.managers}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                bgcolor: '#FFF5F8',
                color: '#C53261',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ManagerIcon fontSize="small" />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Table Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '0px',
          border: '1px solid #F0DCE3',
          bgcolor: '#fff',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #F0DCE3',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <TextField
            size="small"
            placeholder="Search admins by name, email, or role..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ width: { xs: '100%', sm: 380 }, ...inputStyles }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#8C7A70', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: filter && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setFilter('')}>
                    <CloseIcon sx={{ fontSize: 16, color: '#8C7A70' }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Typography variant="caption" sx={{ color: '#8C7A70', letterSpacing: '0.04em' }}>
            Showing {filteredData.length} of {(data || []).length} administrators
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FBF9F7' }}>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: 80 }}>
                  ID
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3' }}>
                  Admin Details
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: 180 }}>
                  Branch
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: 160 }}>
                  Role
                </TableCell>
                <TableCell align="right" sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F0DCE3', width: 120 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    sx={{
                      '&:hover': { bgcolor: '#FDFBF9' },
                      borderBottom: '1px solid #F0DCE3',
                    }}
                  >
                    <TableCell sx={{ color: '#8C7A70', fontSize: '0.85rem', fontWeight: 500 }}>
                      #{item.id}
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: '#141311', fontSize: '0.875rem' }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#8C7A70' }}>
                        {item.email}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ color: '#554A43', fontSize: '0.85rem' }}>
                      {item.branch || 'Headquarters'}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={item.role || 'Staff'}
                        size="small"
                        sx={{
                          borderRadius: '0px',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          bgcolor: (item.role || '').toLowerCase().includes('super') ? '#141311' : '#FFF5F8',
                          color: (item.role || '').toLowerCase().includes('super') ? '#fff' : '#141311',
                          border: '1px solid #F0DCE3',
                        }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(item)}
                          sx={{
                            color: '#8C7A70',
                            borderRadius: '0px',
                            '&:hover': { color: '#C53261', bgcolor: '#FFF5F8' },
                          }}
                        >
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteConfirmation({ open: true, id: item.id })}
                          sx={{
                            color: '#8C7A70',
                            borderRadius: '0px',
                            '&:hover': { color: '#D32F2F', bgcolor: '#FDEDED' },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#8C7A70' }}>
                    <AdminIcon sx={{ fontSize: 36, color: '#C5A059', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#141311' }}>
                      No administrator accounts found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add / Edit Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={() => !isLoading && setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '0px',
            border: '1px solid #F0DCE3',
            boxShadow: '0 20px 40px rgba(18, 11, 16, 0.1)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #F0DCE3',
            p: 2.5,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontFamily: 'serif', fontWeight: 500, color: '#141311' }}>
              {newItem.id ? 'Edit Administrator' : 'Create Administrator'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#8C7A70' }}>
              Set staff profile, branch affiliation, and role permissions
            </Typography>
          </Box>
          <IconButton onClick={() => setIsModalOpen(false)} disabled={isLoading} size="small">
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleAddorUpdateItem}>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Full Name *
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g. Eleanor Vance"
                required
                sx={inputStyles}
              />
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Email Address *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="email"
                value={newItem.email}
                onChange={(e) => setNewItem({ ...newItem, email: e.target.value })}
                placeholder="admin@company.com"
                required
                sx={inputStyles}
              />
            </Box>

            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                  Branch / Location
                </Typography>
                <FormControl fullWidth size="small" sx={inputStyles}>
                  <Select
                    value={newItem.branch || ''}
                    onChange={(e) => setNewItem({ ...newItem, branch: e.target.value })}
                  >
                    <MenuItem value="">Headquarters</MenuItem>
                    {branches.map((b) => (
                      <MenuItem key={b.id} value={b.title}>
                        {b.title} ({b.city})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                  Admin Role *
                </Typography>
                <FormControl fullWidth size="small" sx={inputStyles}>
                  <Select
                    value={newItem.role || 'admin'}
                    onChange={(e) => setNewItem({ ...newItem, role: e.target.value })}
                  >
                    <MenuItem value="super admin">Super Admin (Full Access)</MenuItem>
                    <MenuItem value="admin">Admin (Manager)</MenuItem>
                    <MenuItem value="sub admin">Sub Admin (Staff)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                {newItem.id ? 'Change Password (leave blank to keep unchanged)' : 'Account Password *'}
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="password"
                value={newItem.password}
                onChange={(e) => setNewItem({ ...newItem, password: e.target.value })}
                placeholder="••••••••••••"
                required={!newItem.id}
                sx={inputStyles}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #F0DCE3', gap: 1 }}>
            <Button
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
              sx={{
                borderRadius: '0px',
                color: '#8C7A70',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                fontWeight: 600,
                px: 2.5,
                '&:hover': { bgcolor: '#FFF5F8', color: '#141311' },
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
                '&:hover': { bgcolor: '#C53261', boxShadow: 'none' },
              }}
            >
              {isLoading ? 'Saving...' : newItem.id ? 'Update Admin' : 'Create Admin'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, id: null })}
        PaperProps={{
          sx: {
            borderRadius: '0px',
            border: '1px solid #F0DCE3',
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'serif', color: '#141311' }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#8C7A70' }}>
            Are you sure you want to revoke access for admin user #{deleteConfirmation.id}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteConfirmation({ open: false, id: null })}
            sx={{ borderRadius: '0px', color: '#8C7A70' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteItem}
            variant="contained"
            sx={{
              borderRadius: '0px',
              bgcolor: '#D32F2F',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#B71C1C', boxShadow: 'none' },
            }}
          >
            Confirm Delete
          </Button>
        </DialogActions>
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