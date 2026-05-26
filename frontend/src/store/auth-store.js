import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage"; // seria necessário instalar, mas vamos simular com state
// Para simplificar, guardaremos token e user em memória apenas. Em produção usar SecureStore.

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  isLoading: true,
  login: (token, user) => set({ token, user, isLoading: false }),
  logout: () => set({ token: null, user: null, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
