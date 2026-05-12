import { create } from "zustand";
import toast from "react-hot-toast";
import api from "../lib/api";
import { socket } from "../lib/socket";
import type { Despacho } from "../types";

interface DespachoState {
  items: Despacho[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (data: Partial<Despacho>) => Promise<{ codigo: string }>;
  updateEstado: (id: number, estado: Despacho["estado"]) => Promise<void>;
  updatePosicion: (id: number, lat: number, lng: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
  initSocket: () => () => void;
}

export const useDespachoStore = create<DespachoState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<Despacho[]>("/despachos");
      set({ items: data, loading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al cargar despachos";
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  create: async (data) => {
    try {
      const { data: nuevo } = await api.post("/despachos", data);
      toast.success(`Despacho ${nuevo.codigo} creado`, { icon: "🚚" });
      return { codigo: nuevo.codigo };
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al crear el despacho";
      toast.error(msg);
      throw err;
    }
  },

  updateEstado: async (id, estado) => {
    try {
      await api.put(`/despachos/${id}/estado`, { estado });
      set((s) => ({
        items: s.items.map((d) => (d.id === id ? { ...d, estado } : d)),
      }));
      const labels: Record<string, string> = {
        en_empresa: "En empresa",
        en_ruta: "En ruta 🚚",
        entregado: "Entregado ✅",
        cancelado: "Cancelado",
      };
      toast.success(`Despacho: ${labels[estado] || estado}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al cambiar estado");
      throw err;
    }
  },

  updatePosicion: async (id, lat, lng) => {
    try {
      await api.put(`/despachos/${id}/posicion`, { lat, lng });
    } catch (err: any) {
      console.warn("Error al actualizar posición:", err.message);
    }
  },

  remove: async (id) => {
    try {
      await api.delete(`/despachos/${id}`);
      set((s) => ({ items: s.items.filter((d) => d.id !== id) }));
      toast.success("Despacho eliminado");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al eliminar despacho");
      throw err;
    }
  },

  initSocket: () => {
    const onNuevo = (despacho: Despacho) => {
      set((s) => {
        const existe = s.items.find((d) => d.id === despacho.id);
        if (existe) return s;
        return { items: [despacho, ...s.items] };
      });
      toast.success(`Nuevo despacho: ${despacho.codigo}`, { icon: "🚚" });
    };

    const onEstado = ({
      id,
      estado,
    }: {
      id: number;
      estado: Despacho["estado"];
    }) => {
      set((s) => ({
        items: s.items.map((d) => (d.id === id ? { ...d, estado } : d)),
      }));
      if (estado === "entregado") {
        toast.success(`Despacho entregado`, { icon: "✅", duration: 5000 });
      }
    };

    const onPosicion = ({
      id,
      lat,
      lng,
    }: {
      id: number;
      lat: number;
      lng: number;
    }) => {
      set((s) => ({
        items: s.items.map((d) =>
          d.id === id ? { ...d, despacho_lat: lat, despacho_lng: lng } : d,
        ),
      }));
    };

    const onEliminado = ({ id }: { id: number }) => {
      set((s) => ({ items: s.items.filter((d) => d.id !== id) }));
    };

    socket.on("despacho:nuevo", onNuevo);
    socket.on("despacho:estado", onEstado);
    socket.on("despacho:posicion", onPosicion);
    socket.on("despacho:eliminado", onEliminado);

    return () => {
      socket.off("despacho:nuevo", onNuevo);
      socket.off("despacho:estado", onEstado);
      socket.off("despacho:posicion", onPosicion);
      socket.off("despacho:eliminado", onEliminado);
    };
  },
}));
