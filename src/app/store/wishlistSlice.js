import { createSlice } from '@reduxjs/toolkit';

const saveWishlistToLocalStorage = (wishlist) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gloria_wishlist', JSON.stringify(wishlist));
  }
};

const loadWishlistFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('gloria_wishlist');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return [];
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: loadWishlistFromLocalStorage(),
  },
  reducers: {
    addToWishlist: (state, action) => {
      const product = action.payload;
      if (!product) return;
      const id = product.id;
      const exists = state.items.some((item) => item.id === id);
      if (!exists) {
        state.items.push(product);
        saveWishlistToLocalStorage(state.items);
      }
    },
    removeFromWishlist: (state, action) => {
      const id = action.payload?.id !== undefined ? action.payload.id : action.payload;
      state.items = state.items.filter((item) => item.id !== id);
      saveWishlistToLocalStorage(state.items);
    },
    toggleWishlist: (state, action) => {
      const product = action.payload;
      if (!product) return;
      const id = product.id;
      const index = state.items.findIndex((item) => item.id === id);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(product);
      }
      saveWishlistToLocalStorage(state.items);
    },
    setWishlist: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : [];
      saveWishlistToLocalStorage(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      saveWishlistToLocalStorage(state.items);
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  setWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
