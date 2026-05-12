import { create } from "zustand";
import api from "../lib/api";
import type { Pago } from "../types";

interface CuentaCobrar {
  id: string;
  cliente: string;
  total: number;
  estadoPago: string;
  fechaPago: string;
  metodo: string;
}

interface CuentaPagar {
  id: string;
  empresa: string;
  total: number;
  estadoPago: string;
  fechaPago: string;
  metodo: string;
  cuotas: number;
}

interface CarteraState {
  cobrar: CuentaCobrar[];
  pagar: CuentaPagar[];
  historial: Pago[];
  loading: boolean;
  error: string | null;

  fetchCobrar: () => Promise<void>;
  fetchPagar: () => Promise<void>;
  fetchHistorial: () => Promise<void>;
  registrarCobro: (
    ventaId: string,
    monto: number,
    metodo: string,
    referencia?: string,
  ) => Promise<void>;
  registrarPago: (
    compraId: string,
    monto: number,
    metodo: string,
    referencia?: string,
  ) => Promise<void>;
}

export const useCarteraStore = create<CarteraState>((set) => ({
  cobrar: [],
  pagar: [],
  historial: [],
  loading: false,
  error: null,

  fetchCobrar: async () => {
    set({ loading: true });
    const { data } = await api.get<CuentaCobrar[]>("/cartera/cobrar");
    set({ cobrar: data, loading: false });
  },

  fetchPagar: async () => {
    set({ loading: true });
    const { data } = await api.get<CuentaPagar[]>("/cartera/pagar");
    set({ pagar: data, loading: false });
  },

  fetchHistorial: async () => {
    const { data } = await api.get<Pago[]>("/cartera/historial");
    set({ historial: data });
  },

  registrarCobro: async (ventaId, monto, metodo, referencia) => {
    await api.post("/cartera/cobrar", { ventaId, monto, metodo, referencia });
    const { data } = await api.get<CuentaCobrar[]>("/cartera/cobrar");
    set({ cobrar: data });
  },

  registrarPago: async (compraId, monto, metodo, referencia) => {
    await api.post("/cartera/pagar", { compraId, monto, metodo, referencia });
    const { data } = await api.get<CuentaPagar[]>("/cartera/pagar");
    set({ pagar: data });
  },
}));
