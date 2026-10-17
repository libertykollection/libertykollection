
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

const loadCartFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
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
      const { id, quantity } = action.payload;

      const existingProductIndex = state.items.findIndex((item) => item.id === id);

      if (existingProductIndex !== -1) {
        state.items[existingProductIndex].quantity += quantity || 1;
      } else {
        state.items.push({ ...action.payload, quantity: quantity || 1 });
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
      state.items = action.payload;
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
