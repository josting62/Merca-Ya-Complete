import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api";
import type { Usuario } from "../types";

interface AuthState {
  user: Usuario | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      isAuthenticated: false,
      loading:         false,
      error:           null,
      _hasHydrated:    false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          // El backend guarda el JWT en cookie HttpOnly automáticamente
          // El frontend solo recibe los datos del usuario
          const { data } = await api.post("/auth/login", { email, password });
          set({
            user:            data.user,
            isAuthenticated: true,
            loading:         false,
          });
        } catch (err: any) {
          set({
            error:   err.response?.data?.message || "Credenciales incorrectas",
            loading: false,
          });
        }
      },

      logout: async () => {
        try {
          // Le dice al backend que borre la cookie HttpOnly
          await api.post("/auth/logout");
        } catch {
          // Si falla el request, igual limpiamos el estado local
        } finally {
          set({ user: null, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "merka_auth",
      // Solo persistimos los datos del usuario, NO el token
      partialize: (s) => ({
        user:            s.user,
        isAuthenticated: s.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);