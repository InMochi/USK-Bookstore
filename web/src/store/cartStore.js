import { create } from 'zustand';

const useCartStore = create((set) => ({
  cartItems: [],
  totalItems: 0,

  setCartItems: (items) =>
    set({ cartItems: items, totalItems: items.length }),

  clearCart: () => set({ cartItems: [], totalItems: 0 }),
}));

export default useCartStore;