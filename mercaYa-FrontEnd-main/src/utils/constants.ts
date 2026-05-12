export const METODOS_PAGO = [
  "Efectivo",
  "Pago Móvil",
  "Transferencia",
] as const;

export const ESTADOS_ENTREGA = [
  { value: "pendiente", label: "Pendiente" },
  { value: "transito", label: "En tránsito" },
  { value: "completado", label: "Completado" },
  { value: "cancelado", label: "Cancelado" },
] as const;

export const ESTADOS_PAGO = [
  { value: "no-pagado", label: "No pagado" },
  { value: "parcial", label: "Parcial" },
  { value: "pagado", label: "Pagado" },
] as const;

export const CATEGORIAS = [
  { name: "Bolsas Transparentes", icon: "🛍️", color: "#0ea5e9" },
  { name: "Bolsas Chillonas", icon: "🌟", color: "#a78bfa" },
  { name: "Vasos", icon: "🥤", color: "#22c55e" },
  { name: "Envoplast", icon: "🎁", color: "#f59e0b" },
  { name: "Rafia", icon: "🧵", color: "#f87171" },
] as const;

export const TIPOS_CLIENTE = [
  "Mayorista",
  "Minorista",
  "Nuevo",
  "VIP",
] as const;

export function getCategoriaInfo(catName: string) {
  return (
    CATEGORIAS.find((c) => c.name === catName) ?? {
      name: catName,
      icon: "📦",
      color: "#64748b",
    }
  );
}
