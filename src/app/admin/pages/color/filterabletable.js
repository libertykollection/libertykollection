'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Stack,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Palette as PaletteIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  AutoAwesome as MagicIcon
} from '@mui/icons-material';
import ntc from 'ntcjs';

const COSMETIC_PRESETS = [
  { name: 'Velvet Espresso', hex: '#141311' },
  { name: 'Dusty Rose', hex: '#B98C2D' },
  { name: 'Rose Gold', hex: '#D2AA2D' },
  { name: 'Pillow Talk Nude', hex: '#C98A7D' },
  { name: 'Berry Velvet', hex: '#6B1D2F' },
  { name: 'Ruby Satin', hex: '#9E1B32' },
  { name: 'Champagne Shimmer', hex: '#E8D3B9' },
  { name: 'Peach Sorbet', hex: '#E9967A' },
  { name: 'Warm Terracotta', hex: '#C86D51' },
  { name: 'Porcelain Sand', hex: '#EFE5DC' },
];

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

const FilterableTable = ({ colors = [], fetchColors, isPageLoading = false }) => {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editColorId, setEditColorId] = useState(null);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#B98C2D');
  const [copiedHex, setCopiedHex] = useState(null);

  useEffect(() => {
    const list = Array.isArray(colors) ? colors : [];
    if (!filter.trim()) {
      setFilteredData(list);
    } else {
      const term = filter.toLowerCase();
      setFilteredData(
        list.filter(
          (item) =>
            (item.name && item.name.toLowerCase().includes(term)) ||
            (item.hex && item.hex.toLowerCase().includes(term)) ||
            String(item.id).includes(term)
        )
      );
    }
  }, [filter, colors]);

  const stats = useMemo(() => {
    const list = Array.isArray(colors) ? colors : [];
    return {
      total: list.length,
    };
  }, [colors]);

  const handleHexChange = (hex) => {
    setNewColorHex(hex);
    try {
      const ntcResult = ntc.name(hex);
      if (ntcResult && ntcResult[1]) {
        // If current name was empty or matched another color, auto-fill
        setNewColorName(ntcResult[1]);
      }
    } catch {
      // ignore
    }
  };

  const handleModalOpen = (color) => {
    if (color) {
      setEditColorId(color.id);
      setNewColorName(color.name || '');
      setNewColorHex(color.hex || '#B98C2D');
    } else {
      setEditColorId(null);
      setNewColorHex('#B98C2D');
      try {
        const ntcResult = ntc.name('#B98C2D');
        setNewColorName(ntcResult[1] || 'Dusty Rose');
      } catch {
        setNewColorName('Dusty Rose');
      }
    }
    setIsModalOpen(true);
  };

  const handleSaveColor = async () => {
    let finalName = newColorName.trim();
    if (!finalName) {
      try {
        const ntcResult = ntc.name(newColorHex);
        finalName = ntcResult[1] || 'Cosmetic Shade';
      } catch {
        finalName = 'Cosmetic Shade';
      }
    }

    setIsLoading(true);
    try {
      if (editColorId) {
        const response = await fetch('/api/colors', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editColorId, name: finalName, hex: newColorHex }),
        });
        if (response.ok) {
          fetchColors();
          setIsModalOpen(false);
        } else {
          alert('Failed to update color shade');
        }
      } else {
        const response = await fetch('/api/colors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: finalName, hex: newColorHex }),
        });
        if (response.ok) {
          fetchColors();
          setIsModalOpen(false);
        } else {
          alert('Failed to create color shade');
        }
      }
    } catch (error) {
      console.error('Error saving color:', error);
      alert('Error saving color shade');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteColor = async (id) => {
    if (!confirm('Are you sure you want to delete this color shade?')) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/colors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        fetchColors();
      } else {
        alert('Failed to delete color');
      }
    } catch (error) {
      console.error('Error deleting color:', error);
      alert('Error deleting color');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#FBF9F7', minHeight: '100vh' }}>
      {/* Top action/status bar when saving */}
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

      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
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
            Product Shades & Swatches
          </Typography>
          <Typography variant="body2" sx={{ color: '#8C7A70', letterSpacing: '0.02em' }}>
            Manage cosmetic shade palettes, lipstick swatches, and foundation tones with auto-naming
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleModalOpen(null)}
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
          Add New Shade
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
              border: '1px solid #E8DFC8',
              bgcolor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#8C7A70', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Total Active Shades
              </Typography>
              <Typography variant="h4" sx={{ color: '#141311', fontWeight: 600, mt: 0.5, fontFamily: 'serif' }}>
                {stats.total}
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
              <PaletteIcon fontSize="small" />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={8}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '0px',
              border: '1px solid #E8DFC8',
              bgcolor: '#fff',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: '#8C7A70', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, mb: 1 }}>
              Live Swatch Spectrum
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              {(colors || []).slice(0, 16).map((item, idx) => (
                <Tooltip key={idx} title={`${item.name} (${item.hex})`} arrow>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: item.hex || '#000',
                      border: '1px solid #E8DFC8',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                      '&:hover': {
                        transform: 'scale(1.25)',
                        zIndex: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      },
                    }}
                    onClick={() => handleModalOpen(item)}
                  />
                </Tooltip>
              ))}
              {(colors || []).length > 16 && (
                <Typography variant="caption" sx={{ color: '#8C7A70', ml: 1 }}>
                  +{(colors || []).length - 16} more
                </Typography>
              )}
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
        {/* Table Search Toolbar */}
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
            placeholder="Search by shade name, hex or ID..."
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
            Showing {filteredData.length} of {stats.total} shades
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FBF9F7' }}>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: 80 }}>
                  ID
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8', width: 140 }}>
                  Swatch
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  Shade Name
                </TableCell>
                <TableCell sx={{ color: '#8C7A70', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8DFC8' }}>
                  Hex Code
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: item.hex || '#000',
                            border: '1px solid #E8DFC8',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                          }}
                        />
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: '#141311', fontSize: '0.875rem' }}>
                        {item.name || 'Unnamed Shade'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#8C7A70' }}>
                        Cosmetics Color Variant
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={item.hex || '#000000'}
                          size="small"
                          sx={{
                            borderRadius: '0px',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            bgcolor: '#F9F5EC',
                            color: '#141311',
                            border: '1px solid #E8DFC8',
                          }}
                        />
                        <Tooltip title={copiedHex === item.hex ? 'Copied!' : 'Copy Hex'}>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(item.hex)}
                            sx={{ color: '#8C7A70', p: 0.5, '&:hover': { color: '#B98C2D' } }}
                          >
                            {copiedHex === item.hex ? <CheckIcon sx={{ fontSize: 16, color: '#2E7D32' }} /> : <CopyIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => handleModalOpen(item)}
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
                          onClick={() => handleDeleteColor(item.id)}
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
                    <PaletteIcon sx={{ fontSize: 36, color: '#D2AA2D', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#141311' }}>
                      No shades found matching your search
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8C7A70' }}>
                      Try adjusting your keywords or click "Add New Shade" above
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add / Edit Shade Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={() => !isLoading && setIsModalOpen(false)}
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
              {editColorId ? 'Edit Cosmetic Shade' : 'Add New Cosmetic Shade'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#8C7A70' }}>
              Select a color value or pick from luxury cosmetics presets
            </Typography>
          </Box>
          <IconButton onClick={() => setIsModalOpen(false)} disabled={isLoading} size="small">
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {/* Swatch & Color Preview Box */}
          <Box
            sx={{
              p: 2.5,
              mb: 3,
              border: '1px solid #E8DFC8',
              bgcolor: '#FBF9F7',
              display: 'flex',
              alignItems: 'center',
              gap: 2.5,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                bgcolor: newColorHex,
                border: '1px solid #E8DFC8',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                flexShrink: 0,
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#8C7A70', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Live Swatch Preview
              </Typography>
              <Typography variant="h6" sx={{ color: '#141311', fontWeight: 600, fontFamily: 'serif' }}>
                {newColorName || 'Select Shade Name'}
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#B98C2D', fontWeight: 600 }}>
                {newColorHex.toUpperCase()}
              </Typography>
            </Box>
          </Box>

          {/* Color Picker & Name Fields */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Color Picker
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #E8DFC8',
                  p: 0.75,
                  bgcolor: '#fff',
                  height: 48,
                }}
              >
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    cursor: 'pointer',
                    background: 'transparent',
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={8}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Hex Value
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={newColorHex}
                onChange={(e) => handleHexChange(e.target.value)}
                sx={inputStyles}
                InputProps={{
                  startAdornment: <InputAdornment position="start">#</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
              <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Shade Title
              </Typography>
              <Button
                size="small"
                startIcon={<MagicIcon sx={{ fontSize: 14 }} />}
                onClick={() => {
                  try {
                    const res = ntc.name(newColorHex);
                    if (res && res[1]) setNewColorName(res[1]);
                  } catch {}
                }}
                sx={{
                  color: '#B98C2D',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  p: 0,
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                }}
              >
                Auto-Name via ntc.js
              </Button>
            </Box>
            <TextField
              fullWidth
              size="small"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="e.g. Velvet Plum, Nude Flush, Crimson Satin"
              sx={inputStyles}
            />
          </Box>

          {/* Quick Cosmetic Presets */}
          <Box>
            <Typography variant="caption" sx={{ color: '#8C7A70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1 }}>
              Popular Cosmetic Presets
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {COSMETIC_PRESETS.map((preset, idx) => (
                <Chip
                  key={idx}
                  label={preset.name}
                  size="small"
                  onClick={() => {
                    setNewColorHex(preset.hex);
                    setNewColorName(preset.name);
                  }}
                  icon={
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: preset.hex,
                        borderRadius: '0px',
                        border: '1px solid #E8DFC8',
                        ml: 0.5,
                      }}
                    />
                  }
                  sx={{
                    borderRadius: '0px',
                    border: '1px solid #E8DFC8',
                    bgcolor: newColorHex.toLowerCase() === preset.hex.toLowerCase() ? '#F9F5EC' : '#fff',
                    color: '#141311',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: '#F9F5EC',
                      borderColor: '#D2AA2D',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E8DFC8', gap: 1 }}>
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
              '&:hover': { bgcolor: '#F9F5EC', color: '#141311' },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveColor}
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
            {isLoading ? 'Saving...' : editColorId ? 'Update Shade' : 'Save Shade'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilterableTable;