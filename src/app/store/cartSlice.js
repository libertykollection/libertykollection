
// import { createSlice } from '@reduxjs/toolkit';

// const saveCartToLocalStorage = (cart) => {
//   localStorage.setItem('cart', JSON.stringify(cart));
// };

// const loadCartFromLocalStorage = () => {
//   const savedCart = localStorage.getItem('cart');
//   return savedCart ? JSON.parse(savedCart) : [];
// };

// const cartSlice = createSlice({
//   name: 'cart',
//   initialState: {
//     items: loadCartFromLocalStorage(),
//   },
//   reducers: {
//     addToCart: (state, action) => {
//       const { id, quantity } = action.payload;

//       const existingProductIndex = state.items.findIndex((item) => item.id === id);

//       if (existingProductIndex !== -1) {

//         state.items[existingProductIndex].quantity += quantity;
//       } else {

//         state.items.push({ ...action.payload, quantity });
//       }

//       saveCartToLocalStorage(state.items); 
//     },
//     removeFromCart: (state, action) => {

//       state.items = state.items.filter((item) => item.id !== action.payload.id);
//       saveCartToLocalStorage(state.items); 
//     },
//     updateQuantity: (state, action) => {
//       const { id, quantity } = action.payload;

//       const product = state.items.find((item) => item.id === id);
//       if (product) {
//         product.quantity = quantity;
//         saveCartToLocalStorage(state.items); 
//       }
//     },
//     setCart: (state, action) => {
//       state.items = action.payload;
//       saveCartToLocalStorage(state.items); 
//     },
//     clearCart: (state) => {
//       state.items = [];
//       saveCartToLocalStorage(state.items); 
//     },
//   },
// });

// export const { addToCart, removeFromCart, updateQuantity, setCart, clearCart } = cartSlice.actions;
// export default cartSlice.reducer;

// ./src/app/store/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const saveCartToLocalStorage = (cart) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
};

const normalizeCartItem = (item) => {
  if (!item) return item;
  let rawId = item.productId !== undefined && item.productId !== null ? item.productId : item.id;
  if (typeof rawId === 'string' && rawId.includes('-')) {
    rawId = rawId.split('-')[0];
  }
  const parsedId = parseInt(rawId, 10);
  const productId = !isNaN(parsedId) ? parsedId : (item.productId || item.id);

  return {
    ...item,
    productId,
  };
};

const loadCartFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    const savedCart = localStorage.getItem('cart');
    if (!savedCart) return [];
    try {
      const parsed = JSON.parse(savedCart);
      return Array.isArray(parsed) ? parsed.map(normalizeCartItem) : [];
    } catch (e) {
      return [];
    }
  }
  return [];
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCartFromLocalStorage(),
  },
  reducers: {
    addToCart: (state, action) => {
      const normalized = normalizeCartItem(action.payload);
      const id = normalized.id || normalized.productId;
      const quantity = normalized.quantity || 1;

      const existingProductIndex = state.items.findIndex((item) => item.id === id);

      if (existingProductIndex !== -1) {
        state.items[existingProductIndex].quantity += quantity;
        if (!state.items[existingProductIndex].productId) {
          state.items[existingProductIndex].productId = normalized.productId;
        }
      } else {
        state.items.push({ ...normalized, id, quantity });
      }

      saveCartToLocalStorage(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload.id);
      saveCartToLocalStorage(state.items);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;

      const product = state.items.find((item) => item.id === id);
      if (product) {
        product.quantity = quantity;
        saveCartToLocalStorage(state.items);
      }
    },
    setCart: (state, action) => {
      state.items = Array.isArray(action.payload)
        ? action.payload.map(normalizeCartItem)
        : [];
      saveCartToLocalStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToLocalStorage(state.items);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, setCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
