import { create } from "zustand";
import api from "../lib/api";
import type { Cliente } from "../types";

interface ClientesState {
  items: Cliente[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (data: Omit<Cliente, "id">) => Promise<void>;
  update: (id: string, data: Partial<Cliente>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useClientesStore = create<ClientesState>((set) => ({
  items: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<Cliente[]>("/clientes");
      set({ items: data, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Error al cargar clientes",
        loading: false,
      });
    }
  },

  create: async (data) => {
    await api.post("/clientes", data);
    const { data: items } = await api.get<Cliente[]>("/clientes");
    set({ items });
  },

  update: async (id, data) => {
    await api.put(`/clientes/${id}`, data);
    const { data: items } = await api.get<Cliente[]>("/clientes");
    set({ items });
  },

  remove: async (id) => {
    await api.delete(`/clientes/${id}`);
    set((s) => ({ items: s.items.filter((c) => c.id !== id) }));
  },
}));
