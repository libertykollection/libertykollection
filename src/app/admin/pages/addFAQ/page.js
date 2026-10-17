'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  Box,
  Typography,
  Grid,
  Stack,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  HelpOutline as FaqIcon,
  QuestionAnswer as AnswerIcon,
} from '@mui/icons-material';
import axios from 'axios';

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

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success',
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    id: null,
  });

  const fetchFaqs = async () => {
    setPageLoading(true);
    try {
      const response = await axios.get('/api/faq');
      const list = Array.isArray(response.data) ? response.data : [];
      setFaqs(list);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch FAQs.',
        type: 'error',
      });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(faqs);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredData(
        faqs.filter(
          (f) =>
            (f.question && f.question.toLowerCase().includes(term)) ||
            (f.answer && f.answer.toLowerCase().includes(term)) ||
            String(f.id).includes(term)
        )
      );
    }
  }, [searchTerm, faqs]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ question: '', answer: '' });
    setOpenDialog(true);
  };

  const handleOpenEdit = (faq) => {
    setIsEditing(true);
    setCurrentId(faq.id);
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentId(null);
    setFormData({ question: '', answer: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide both question and answer.',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && currentId) {
        await axios.put(`/api/faq/${currentId}`, formData);
        setSnackbar({
          open: true,
          message: 'FAQ updated successfully.',
          type: 'success',
        });
      } else {
        await axios.post('/api/faq', formData);
        setSnackbar({
          open: true,
          message: 'FAQ created successfully.',
          type: 'success',
        });
      }
      handleCloseDialog();
      fetchFaqs();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save FAQ.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.id) return;
    setIsLoading(true);
    try {
      await axios.delete(`/api/faq/${deleteConfirmation.id}`);
      setSnackbar({
        open: true,
        message: 'FAQ deleted successfully.',
        type: 'warning',
      });
      fetchFaqs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete FAQ.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
      setDeleteConfirmation({ open: false, id: null });
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
            Client Inquiries & FAQ
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', letterSpacing: '0.02em' }}>
            Manage beauty consultation questions, product compatibility, shade matching, and ordering FAQs
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
              bgcolor: '#B98C2D',
              borderColor: '#B98C2D',
              boxShadow: 'none',
            },
          }}
        >
          Add New Question
        </Button>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
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
                Total Active Questions
              </Typography>
              <Typography variant="h4" sx={{ color: '#141311', fontWeight: 600, mt: 0.5, fontFamily: 'serif' }}>
                {faqs.length}
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
              <FaqIcon fontSize="small" />
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
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #E8DFC8',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <TextField
            size="small"
            placeholder="Search FAQs by question or answer keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: '100%', sm: 380 }, ...inputStyles }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#8C7A70', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <CloseIcon sx={{ fontSize: 16, color: '#8C7A70' }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Typography variant="caption" sx={{ color: '#8C7A70', letterSpacing: '0.04em' }}>
            Showing {filteredData.length} of {faqs.length} entries
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FBF9F7' }}>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: 80 }}>
                  ID
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: '35%' }}>
                  Question
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  Answer
                </TableCell>
                <TableCell align="right" sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: 120 }}>
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
                      borderBottom: '1px solid #E8DFC8',
                    }}
                  >
                    <TableCell sx={{ color: '#8C7A70', fontSize: '0.85rem', fontWeight: 500 }}>
                      #{item.id}
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: '#141311', fontSize: '0.875rem' }}>
                        {item.question}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#554A43',
                          fontSize: '0.85rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.answer}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(item)}
                          sx={{
                            color: '#8C7A70',
                            borderRadius: '0px',
                            '&:hover': { color: '#B98C2D', bgcolor: '#F9F5EC' },
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
                  <TableCell colSpan={4} align="center" sx={{ py: 6, color: '#8C7A70' }}>
                    <FaqIcon sx={{ fontSize: 36, color: '#D2AA2D', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#141311' }}>
                      No FAQs found matching your search
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
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
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
              {isEditing ? 'Edit Client FAQ' : 'Add Client FAQ'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#8C7A70' }}>
              Frequently asked customer inquiry regarding cosmetics and orders
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} disabled={isLoading} size="small">
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Question *
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="e.g. How do I choose the correct foundation undertone?"
                required
                sx={inputStyles}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Comprehensive Answer *
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="answer"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Provide clear, reassuring advice and application instructions..."
                multiline
                rows={5}
                required
                sx={inputStyles}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E8DFC8', gap: 1 }}>
            <Button
              onClick={handleCloseDialog}
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
              {isLoading ? 'Saving...' : isEditing ? 'Update FAQ' : 'Save FAQ'}
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
            border: '1px solid #E8DFC8',
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'serif', color: '#141311' }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#8C7A70' }}>
            Are you sure you want to delete FAQ #{deleteConfirmation.id}?
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
            onClick={handleConfirmDelete}
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
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.type}
          sx={{ borderRadius: '0px', width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FAQ;