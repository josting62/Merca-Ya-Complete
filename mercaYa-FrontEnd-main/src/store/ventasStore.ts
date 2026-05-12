import { create } from "zustand";
import toast from "react-hot-toast";
import api from "../lib/api";
import { socket } from "../lib/socket";
import type { Venta } from "../types";

interface VentasState {
  items: Venta[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (data: Omit<Venta, "id">) => Promise<void>;
  update: (id: string, data: Partial<Venta>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  registrarPago: (id: string, monto: number, metodo: string) => Promise<void>;
  clearError: () => void;
  initSocket: () => () => void;
}

export const useVentasStore = create<VentasState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<Venta[]>("/ventas");
      set({ items: data, loading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al cargar ventas";
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  create: async (data) => {
    try {
      await api.post<Venta>("/ventas", data);
      toast.success("Venta creada correctamente");
      // Socket actualizará la lista automáticamente
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al crear la venta";
      toast.error(msg);
      throw err;
    }
  },

  update: async (id, data) => {
    try {
      await api.put(`/ventas/${id}`, data);
      toast.success("Venta actualizada");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al actualizar la venta";
      toast.error(msg);
      throw err;
    }
  },

  remove: async (id) => {
    try {
      await api.delete(`/ventas/${id}`);
      toast.success("Venta eliminada");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al eliminar la venta";
      toast.error(msg);
      throw err;
    }
  },

  registrarPago: async (id, monto, metodo) => {
    try {
      await api.put(`/ventas/${id}/pago`, { monto, metodo });
      toast.success("Pago registrado correctamente");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al registrar el pago";
      toast.error(msg);
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  // ── Inicializa los listeners de Socket.io ──
  initSocket: () => {
    const onNueva = (venta: Venta) => {
      set((s) => {
        const existe = s.items.find((v) => v.id === venta.id);
        if (existe) return s;
        return { items: [venta, ...s.items] };
      });
      toast.success(`Nueva venta: ${venta.id} — ${venta.cliente}`, {
        icon: "🏷️",
      });
    };

    const onActualizada = (venta: Partial<Venta> & { id: string }) => {
      set((s) => ({
        items: s.items.map((v) => (v.id === venta.id ? { ...v, ...venta } : v)),
      }));
    };

    const onPagada = ({ id, estadoPago, fechaPago, metodo }: any) => {
      set((s) => ({
        items: s.items.map((v) =>
          v.id === id ? { ...v, estadoPago, fechaPago, metodo } : v,
        ),
      }));
      toast.success(`Venta ${id} cobrada`, { icon: "💳" });
    };

    const onEliminada = ({ id }: { id: string }) => {
      set((s) => ({ items: s.items.filter((v) => v.id !== id) }));
    };

    socket.on("venta:nueva", onNueva);
    socket.on("venta:actualizada", onActualizada);
    socket.on("venta:pagada", onPagada);
    socket.on("venta:eliminada", onEliminada);

    // Retorna función de cleanup
    return () => {
      socket.off("venta:nueva", onNueva);
      socket.off("venta:actualizada", onActualizada);
      socket.off("venta:pagada", onPagada);
      socket.off("venta:eliminada", onEliminada);
    };
  },
}));
