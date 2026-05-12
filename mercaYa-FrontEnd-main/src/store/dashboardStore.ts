import { create } from "zustand";
import api from "../lib/api";

interface DashKpis {
  ventas: {
    total: number;
    montoTotal: number;
    pagadas: number;
    noPagadas: number;
    porCobrar: number;
  };
  compras: {
    total: number;
    montoTotal: number;
  };
  inventario: {
    totalProductos: number;
    valorInventario: number;
    sinStock: number;
    stockBajo: number;
  };
  ultimasVentas: {
    id: string;
    cliente: string;
    total: number;
    estadoPago: string;
    productos: string;
  }[];
  grafico: {
    ventas: { anio: number; mes: number; total: number }[];
    compras: { anio: number; mes: number; total: number }[];
  };
  categorias: {
    cat: string;
    valor: number;
    unidades: number;
  }[];
  alertas: {
    id: string;
    nombre: string;
    cat: string;
    sku: string;
    stock: number;
    stockMin: number;
    tipo: "out" | "low";
  }[];
}

interface DashState {
  data: DashKpis | null;
  loading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashState>((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<DashKpis>("/dashboard");
      set({ data, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Error al cargar dashboard",
        loading: false,
      });
    }
  },
}));
