import { create } from "zustand";
import toast from "react-hot-toast";
import api from "../lib/api";
import { socket } from "../lib/socket";
import type { Producto } from "../types";

interface InventarioState {
  items: Producto[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (data: Omit<Producto, "id">) => Promise<void>;
  update: (id: string, data: Partial<Producto>) => Promise<void>;
  updateStock: (id: string, stock: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearError: () => void;
  initSocket: () => () => void;
}

export const useInventarioStore = create<InventarioState>((set, get) => ({
  items:   [],
  loading: false,
  error:   null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<Producto[]>("/inventario");
      set({ items: data, loading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al cargar inventario";
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  create: async (data) => {
    try {
      await api.post("/inventario", data);
      toast.success("Producto creado correctamente", { icon: "📦" });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al crear el producto";
      toast.error(msg);
      throw err;
    }
  },

  update: async (id, data) => {
    try {
      await api.put(`/inventario/${id}`, data);
      toast.success("Producto actualizado");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al actualizar el producto";
      toast.error(msg);
      throw err;
    }
  },

  updateStock: async (id, stock) => {
    try {
      await api.patch(`/inventario/${id}/stock`, { stock });
      set((s) => ({
        items: s.items.map((p) => (p.id === id ? { ...p, stock } : p)),
      }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al actualizar stock");
      throw err;
    }
  },

  remove: async (id) => {
    try {
      await api.delete(`/inventario/${id}`);
      toast.success("Producto eliminado");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al eliminar el producto");
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  initSocket: () => {
    const onNuevo = (producto: Producto) => {
      set((s) => {
        const existe = s.items.find((p) => p.id === producto.id);
        if (existe) return s;
        return { items: [...s.items, producto] };
      });
      toast.success(`Nuevo producto: ${producto.nombre}`, { icon: "📦" });
    };

    const onActualizado = (producto: Partial<Producto> & { id: string }) => {
      set((s) => ({
        items: s.items.map((p) => p.id === producto.id ? { ...p, ...producto } : p),
      }));
    };

    const onStockBajo = (producto: { id: string; nombre: string; stock: number; stockMin: number }) => {
      toast(`⚠️ Stock bajo: ${producto.nombre} (${producto.stock} unidades)`, {
        icon: "⚠️",
        style: { background: '#fef9c3', color: '#a16207' },
        duration: 6000,
      });
    };

    const onEliminado = ({ id }: { id: string }) => {
      set((s) => ({ items: s.items.filter((p) => p.id !== id) }));
    };

    socket.on("inventario:nuevo",      onNuevo);
    socket.on("inventario:actualizado",onActualizado);
    socket.on("inventario:stock_bajo", onStockBajo);
    socket.on("inventario:eliminado",  onEliminado);

    return () => {
      socket.off("inventario:nuevo",      onNuevo);
      socket.off("inventario:actualizado",onActualizado);
      socket.off("inventario:stock_bajo", onStockBajo);
      socket.off("inventario:eliminado",  onEliminado);
    };
  },
}));