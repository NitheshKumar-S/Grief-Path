import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

interface AuthState {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, userId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  isAuthenticated: false,
  setAuth: async (token, userId) => {
    await SecureStore.setItemAsync("access_token", token);
    await SecureStore.setItemAsync("user_id", userId);
    set({ token, userId, isAuthenticated: true });
  },
  logout: async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("user_id");
    set({ token: null, userId: null, isAuthenticated: false });
  },
}));
