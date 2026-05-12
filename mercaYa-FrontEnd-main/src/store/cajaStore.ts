import { create } from "zustand";
import api from "../lib/api";
import type { Venta } from "../types";

interface ResumenCaja {
  totalCobrado: number;
  totalTransacciones: number;
  efectivo: number;
  movil: number;
  transferencia: number;
}

interface CajaState {
  ventas: Venta[];
  ventaActiva: Venta | null;
  resumen: ResumenCaja;
  loading: boolean;
  buscando: boolean;
  error: string | null;
  fetchVentas: () => Promise<void>;
  buscarPorCodigo: (codigo: string) => Promise<Venta | null>;
  cobrar: (ventaId: string, monto: number, metodo: string) => Promise<void>;
  setVentaActiva: (v: Venta | null) => void;
}

export const useCajaStore = create<CajaState>((set, get) => ({
  ventas: [],
  ventaActiva: null,
  resumen: {
    totalCobrado: 0,
    totalTransacciones: 0,
    efectivo: 0,
    movil: 0,
    transferencia: 0,
  },
  loading: false,
  buscando: false,
  error: null,

  fetchVentas: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<Venta[]>("/ventas");
      // Calcula resumen del día
      const hoy = new Date().toISOString().slice(0, 10);
      const pagadasHoy = data.filter(
        (v) => v.estadoPago === "pagado" && v.fechaPago?.slice(0, 10) === hoy,
      );
      const resumen: ResumenCaja = {
        totalCobrado: pagadasHoy.reduce((s, v) => s + v.total, 0),
        totalTransacciones: pagadasHoy.length,
        efectivo: pagadasHoy
          .filter((v) => v.metodo === "Efectivo")
          .reduce((s, v) => s + v.total, 0),
        movil: pagadasHoy
          .filter((v) => v.metodo === "Pago Móvil")
          .reduce((s, v) => s + v.total, 0),
        transferencia: pagadasHoy
          .filter((v) => v.metodo === "Transferencia")
          .reduce((s, v) => s + v.total, 0),
      };
      set({ ventas: data, resumen, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Error al cargar ventas",
        loading: false,
      });
    }
  },

  buscarPorCodigo: async (codigo: string) => {
    set({ buscando: true });
    try {
      const { data } = await api.get<Venta>(
        `/ventas/${codigo.trim().toUpperCase()}`,
      );
      set({ ventaActiva: data, buscando: false });
      return data;
    } catch {
      set({ buscando: false });
      return null;
    }
  },

  cobrar: async (ventaId, monto, metodo) => {
    await api.put(`/ventas/${ventaId}/pago`, { monto, metodo });
    await get().fetchVentas();
    set({ ventaActiva: null });
  },

  setVentaActiva: (v) => set({ ventaActiva: v }),
}));
