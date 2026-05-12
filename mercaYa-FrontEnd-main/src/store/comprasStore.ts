import { create } from "zustand";
import api from "../lib/api";
import type { Compra } from "../types";

interface ComprasState {
  items: Compra[];
  loading: boolean;
  error: string | null;

  fetchAll: () => Promise<void>;
  create: (data: Omit<Compra, "id">) => Promise<void>;
  update: (id: string, data: Partial<Compra>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  registrarPago: (id: string, monto: number, metodo: string) => Promise<void>;
  clearError: () => void;
}

export const useComprasStore = create<ComprasState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<Compra[]>("/compras");
      set({ items: data, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Error al cargar compras",
        loading: false,
      });
    }
  },

  create: async (data) => {
    await api.post("/compras", data);
    await get().fetchAll();
  },

  update: async (id, data) => {
    await api.put(`/compras/${id}`, data);
    await get().fetchAll();
  },

  remove: async (id) => {
    await api.delete(`/compras/${id}`);
    set((s) => ({ items: s.items.filter((c) => c.id !== id) }));
  },

  registrarPago: async (id, monto, metodo) => {
    await api.put(`/compras/${id}/pago`, { monto, metodo });
    await get().fetchAll();
  },

  clearError: () => set({ error: null }),
}));
