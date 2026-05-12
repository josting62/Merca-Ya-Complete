import { create } from "zustand";
import api from "../lib/api";
import type { Usuario } from "../types";

interface UsuarioCompleto extends Usuario {
  estado: "activo" | "inactivo";
  created_at: string;
}

interface UsuariosState {
  items: UsuarioCompleto[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (data: {
    nombre: string; email: string; password: string;
    rol: string; pin: string;
  }) => Promise<{ pin: string }>;
  update: (id: number, data: Partial<UsuarioCompleto>) => Promise<void>;
  changePin: (id: number, pin: string) => Promise<void>;
  remove: (id: number) => Promise<void>;
  generarPin: () => Promise<string>;
}

export const useUsuariosStore = create<UsuariosState>((set, get) => ({
  items:   [],
  loading: false,
  error:   null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<UsuarioCompleto[]>("/usuarios");
      set({ items: data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Error al cargar usuarios", loading: false });
    }
  },

  create: async (data) => {
    const { data: res } = await api.post("/usuarios", data);
    await get().fetchAll();
    return { pin: res.pin };
  },

  update: async (id, data) => {
    await api.put(`/usuarios/${id}`, data);
    await get().fetchAll();
  },

  changePin: async (id, pin) => {
    await api.put(`/usuarios/${id}/pin`, { pin });
  },

  remove: async (id) => {
    await api.delete(`/usuarios/${id}`);
    set((s) => ({
      items: s.items.map((u) =>
        u.id === id ? { ...u, estado: "inactivo" as const } : u
      ),
    }));
  },

  generarPin: async () => {
    const { data } = await api.post("/usuarios/generar-pin");
    return data.pin as string;
  },
}));