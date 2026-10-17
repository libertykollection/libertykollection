'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  People as PeopleIcon,
  CheckCircle as ActiveIcon,
  AdminPanelSettings as AdminIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// MUI Imports
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  Chip,
  Avatar,
  InputAdornment,
  Grid,
  Stack
} from '@mui/material';

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

const FilterableCustomerTable = ({ customers = [], fetchCustomers }) => {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState(customers || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    phoneno: '',
    city: '',
    image: null,
    imageUrl: '',
    role: 'CUSTOMER',
  });
  const [isAdminForm, setIsAdminForm] = useState(false);
  const [images, setImages] = useState([]);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (!filter.trim()) {
      setFilteredData(customers || []);
    } else {
      const term = filter.toLowerCase();
      setFilteredData(
        (customers || []).filter((item) =>
          (item.name && item.name.toLowerCase().includes(term)) ||
          (item.email && item.email.toLowerCase().includes(term)) ||
          (item.phoneno && item.phoneno.toLowerCase().includes(term)) ||
          (item.city && item.city.toLowerCase().includes(term)) ||
          (item.role && item.role.toLowerCase().includes(term))
        )
      );
    }
    setPage(0);
  }, [filter, customers]);

  // Statistics
  const stats = useMemo(() => {
    const list = customers || [];
    return {
      total: list.length,
      active: list.filter(c => c.status === 1).length,
      admins: list.filter(c => c.role === 'ADMIN').length,
    };
  }, [customers]);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAddNewItem = async () => {
    if (!newCustomer.name || !newCustomer.email || (!newCustomer.id && !newCustomer.password) || !newCustomer.phoneno || !newCustomer.city) {
      alert('Please fill in all required fields.');
      return;
    }
    setIsLoading(true);
    try {
      let imageUrl = newCustomer.imageUrl || '';
      if (images.length > 0) {
        const imageBase64 = await convertToBase64(images[0]);
        const response = await fetch(`${process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageBase64 }),
        });
        const result = await response.json();
        if (response.ok) {
          imageUrl = result.image_url;
        } else {
          throw new Error(result.error || 'Failed to upload image');
        }
      }

      const customerToSubmit = { ...newCustomer, imageUrl };
      const endpoint = isAdminForm ? '/api/users/admin-user' : '/api/users';

      const response = newCustomer.id
        ? await fetch(`/api/users/${newCustomer.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerToSubmit),
          })
        : await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerToSubmit),
          });

      if (response.ok) {
        if (fetchCustomers) fetchCustomers();
        setIsModalOpen(false);
        resetForm();
      } else {
        const errorData = await response.json();
        alert(`Failed to save customer: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding/updating customer:', error);
      alert('An unexpected error occurred.');
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setNewCustomer({
      id: null,
      name: '',
      email: '',
      password: '',
      phoneno: '',
      city: '',
      image: null,
      imageUrl: '',
      role: 'CUSTOMER',
    });
    setImages([]);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer account?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        if (fetchCustomers) fetchCustomers();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
    setIsLoading(false);
  };

  const handleEditItem = (item) => {
    setNewCustomer(item);
    setIsAdminForm(item.role === 'ADMIN');
    setIsModalOpen(true);
  };

  const handleStatusChange = async (id, action) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (response.ok) {
        if (fetchCustomers) fetchCustomers();
      } else {
        const errorData = await response.json();
        alert(`Failed to update status: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
    setIsLoading(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ bgcolor: '#FBF9F7', minHeight: '100vh', p: { xs: 2.5, md: 4 } }}>
      {/* Top Loading Line */}
      {isLoading && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', zIndex: 9999 }}>
          <Box className="s2u-progress-bar-primary" sx={{ height: '100%', bgcolor: '#B98C2D' }} />
        </Box>
      )}

      {/* Header section */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ letterSpacing: '0.15em', fontWeight: 700, color: '#B98C2D', display: 'block', mb: 0.5 }}>
            Admin Console • Customer Relations
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif', letterSpacing: '-0.02em' }}>
            Registered Customers
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', mt: 0.5 }}>
            Manage client profiles, contact points, accounts status, and access roles.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => {
            resetForm();
            setIsAdminForm(false);
            setIsModalOpen(true);
          }}
          startIcon={<AddIcon />}
          sx={{
            bgcolor: '#141311',
            color: '#fff',
            borderRadius: '0px',
            px: 3.5,
            py: 1.25,
            fontWeight: 700,
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#2A1824',
              boxShadow: 'none',
            },
          }}
        >
          Add New User
        </Button>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #E8DFC8', borderRadius: '0px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FBF9F7', border: '1px solid #E8DFC8', borderRadius: '0px', color: '#B98C2D' }}>
              <PeopleIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Total Customers
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311' }}>
                {stats.total}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #E8DFC8', borderRadius: '0px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FBF9F7', border: '1px solid #E8DFC8', borderRadius: '0px', color: '#B98C2D' }}>
              <ActiveIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Active Accounts
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#166534' }}>
                {stats.active}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #E8DFC8', borderRadius: '0px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FBF9F7', border: '1px solid #E8DFC8', borderRadius: '0px', color: '#B98C2D' }}>
              <AdminIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A70', fontWeight: 700 }}>
                Administrators
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311' }}>
                {stats.admins}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Table Card */}
      <Paper elevation={0} sx={{ bgcolor: '#fff', border: '1px solid #E8DFC8', borderRadius: '0px', overflow: 'hidden' }}>
        {/* Search Bar */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid #E8DFC8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, bgcolor: '#fff' }}>
          <TextField
            size="small"
            placeholder="Search by customer name, email, phone number, or city..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ width: { xs: '100%', sm: 400 }, ...inputStyles }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#8C7A70', fontSize: '1.15rem' }} />
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
            Showing {paginatedData.length} of {filteredData.length} profiles
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer sx={{ maxHeight: '65vh', overflowX: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: '70px' }}>
                  ID
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  Customer Profile
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  Contact Information
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  City / Location
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  Role
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  Status
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, bgcolor: '#FBF9F7', color: '#141311', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: '130px' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow
                    key={item.id}
                    sx={{
                      bgcolor: index % 2 === 0 ? '#fff' : '#FAF8F6',
                      '&:hover': { bgcolor: '#F5EFEB' },
                      borderBottom: '1px solid #E8DFC8',
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: '#8C7A70', fontSize: '0.8rem', borderBottom: '1px solid #E8DFC8' }}>
                      #{item.id}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #E8DFC8' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={item.imageUrl ? `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${item.imageUrl}` : undefined}
                          sx={{
                            width: 34,
                            height: 34,
                            bgcolor: '#141311',
                            color: '#fff',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            borderRadius: '0px',
                          }}
                        >
                          {item.name?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.85rem' }}>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#8C7A70', fontSize: '0.75rem' }}>
                            Joined: {new Date(item.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #E8DFC8' }}>
                      <Typography variant="body2" sx={{ color: '#141311', fontSize: '0.85rem', fontWeight: 600 }}>
                        {item.email}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#8C7A70', fontSize: '0.75rem' }}>
                        {item.phoneno || 'No Phone'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#8C7A70', fontSize: '0.85rem', borderBottom: '1px solid #E8DFC8' }}>
                      {item.city || '—'}
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottom: '1px solid #E8DFC8' }}>
                      <Chip
                        label={item.role || 'CUSTOMER'}
                        size="small"
                        sx={{
                          borderRadius: '0px',
                          bgcolor: item.role === 'ADMIN' ? '#141311' : '#FBF9F7',
                          color: item.role === 'ADMIN' ? '#fff' : '#8C7A70',
                          border: '1px solid #E8DFC8',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottom: '1px solid #E8DFC8' }}>
                      <Chip
                        label={item.status === 1 ? 'Active' : 'Suspended'}
                        size="small"
                        sx={{
                          borderRadius: '0px',
                          bgcolor: item.status === 1 ? '#F0FDF4' : '#FEF2F2',
                          color: item.status === 1 ? '#166534' : '#991B1B',
                          border: item.status === 1 ? '1px solid #BBF7D0' : '1px solid #FECACA',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: '1px solid #E8DFC8' }}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => handleEditItem(item)}
                          sx={{
                            borderRadius: '0px',
                            color: '#141311',
                            border: '1px solid #E8DFC8',
                            p: 0.75,
                            '&:hover': { bgcolor: '#141311', color: '#fff' },
                          }}
                        >
                          <EditIcon sx={{ fontSize: '0.95rem' }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleStatusChange(item.id, item.status === 1 ? 'deactivate' : 'activate')}
                          sx={{
                            borderRadius: '0px',
                            color: item.status === 1 ? '#B98C2D' : '#166534',
                            border: '1px solid #E8DFC8',
                            px: 1,
                            py: 0.5,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            '&:hover': { bgcolor: '#FBF9F7' },
                          }}
                        >
                          {item.status === 1 ? 'OFF' : 'ON'}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteItem(item.id)}
                          sx={{
                            borderRadius: '0px',
                            color: '#B98C2D',
                            border: '1px solid #E8DFC8',
                            p: 0.75,
                            '&:hover': { bgcolor: '#EF4444', color: '#fff', borderColor: '#EF4444' },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: '0.95rem' }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8, color: '#8C7A70' }}>
                    <PeopleIcon sx={{ fontSize: '2.5rem', color: '#D2AA2D', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#141311' }}>No customer profiles found</Typography>
                    <Typography variant="caption" sx={{ color: '#8C7A70' }}>Try searching with different terms or click &quot;Add New User&quot;.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid #E8DFC8',
            bgcolor: '#FBF9F7',
            '& .MuiTablePagination-select': { borderRadius: '0px' },
          }}
        />
      </Paper>

      {/* Luxury Add / Edit User Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '0px',
            border: '1px solid #E8DFC8',
            boxShadow: '0 24px 60px rgba(18, 11, 16, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3.5, px: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E8DFC8' }}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: '0.12em', fontWeight: 700, color: '#B98C2D', display: 'block' }}>
              Account Management
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#141311', fontFamily: 'serif' }}>
              {newCustomer.id ? 'Edit User Record' : 'Register New User'}
            </Typography>
          </Box>
          <IconButton onClick={() => setIsModalOpen(false)} sx={{ borderRadius: '0px', color: '#8C7A70' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3 }}>
          <Box sx={{ display: 'grid', gap: 2.5, mt: 1 }}>
            <TextField
              fullWidth
              label="Full Name *"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              sx={inputStyles}
              placeholder="e.g. Ayesha Khan"
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address *"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  sx={inputStyles}
                  placeholder="ayesha@example.com"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number *"
                  value={newCustomer.phoneno}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phoneno: e.target.value })}
                  sx={inputStyles}
                  placeholder="+92 300 1234567"
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label={newCustomer.id ? "Password (Leave blank to keep current)" : "Password *"}
              type="password"
              value={newCustomer.password}
              onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })}
              sx={inputStyles}
            />

            <TextField
              fullWidth
              label="City / Region *"
              value={newCustomer.city}
              onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
              sx={inputStyles}
              placeholder="Karachi, Lahore, Islamabad..."
            />

            <Box sx={{ border: '1px dashed #D2AA2D', borderRadius: '0px', p: 2.5, bgcolor: '#FBF9F7', textAlign: 'center' }}>
              <CloudUploadIcon sx={{ color: '#B98C2D', mb: 0.5 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#141311', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {images.length > 0 ? images[0].name : "Upload Profile Avatar"}
              </Typography>
              <Button
                component="label"
                variant="outlined"
                sx={{
                  mt: 1,
                  borderRadius: '0px',
                  borderColor: '#E8DFC8',
                  color: '#141311',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  '&:hover': { borderColor: '#B98C2D', bgcolor: '#fff' }
                }}
              >
                Choose Photo
                <input type="file" hidden accept="image/*" onChange={(e) => setImages([e.target.files[0]])} />
              </Button>
            </Box>

            {!isAdminForm && (
              <FormControl fullWidth sx={inputStyles}>
                <InputLabel id="role-select-label">Account Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  value={newCustomer.role}
                  onChange={(e) => setNewCustomer({ ...newCustomer, role: e.target.value })}
                  label="Account Role"
                  MenuProps={{
                    PaperProps: {
                      sx: { borderRadius: '0px', border: '1px solid #E8DFC8' }
                    }
                  }}
                >
                  <MenuItem value="CUSTOMER">Customer (Standard Shopper)</MenuItem>
                  <MenuItem value="ADMIN">Administrator (Staff Access)</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, px: 4, borderTop: '1px solid #E8DFC8', display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => setIsModalOpen(false)}
            sx={{
              borderRadius: '0px',
              borderColor: '#E8DFC8',
              color: '#8C7A70',
              px: 3,
              py: 1,
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              '&:hover': { borderColor: '#B98C2D', bgcolor: '#FBF9F7', color: '#141311' }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddNewItem}
            sx={{
              borderRadius: '0px',
              bgcolor: '#141311',
              color: '#fff',
              px: 3.5,
              py: 1,
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#2A1824', boxShadow: 'none' }
            }}
          >
            {newCustomer.id ? 'Save Changes' : 'Create Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilterableCustomerTable;