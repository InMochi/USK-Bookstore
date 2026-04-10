import { create } from 'zustand';

const getInitialUser = () => {
  try {
    const savedUser = localStorage.getItem('user');
    if (!savedUser || savedUser === "undefined") return null;
    return JSON.parse(savedUser);
  } catch (error) {
    console.error("Gagal parsing user dari localStorage", error);
    return null;
  }
};

const useAuthStore = create((set) => ({
  user: getInitialUser(),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoadingUser: false,

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoadingUser: false });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false, isLoadingUser: false });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isLoadingUser: false });
  },

  setLoadingUser: (val) => set({ isLoadingUser: val }),
}));

export default useAuthStore;