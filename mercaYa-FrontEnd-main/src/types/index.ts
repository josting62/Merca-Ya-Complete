export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: "admin" | "vendedor" | "bodega" | "cajera";
}

export interface Producto {
  id: string;
  nombre: string;
  marca: string;
  cat: string;
  desc: string;
  barcode: string;
  sku: string;
  pventa: number;
  pcompra: number;
  stock: number;
  stockMin: number;
  unidad: string;
  iva: number;
  foto: string;
}

export interface ProdVenta {
  n: string;
  p: number;
  q: number;
  d: number;
}

export interface Venta {
  id: string;
  cliente: string;
  metodo: "Efectivo" | "Pago Móvil" | "Transferencia";
  fechaEntrega: string;
  fechaPago: string;
  total: number;
  estado: "completado" | "transito" | "pendiente" | "cancelado";
  estadoPago: "pagado" | "parcial" | "no-pagado";
  notas: string;
  prods: ProdVenta[];
}

export interface Compra {
  id: string;
  empresa: string;
  metodo: "Efectivo" | "Pago Móvil" | "Transferencia";
  cuotas: number;
  fechaCompra: string;
  fechaEntrega: string;
  fechaPago: string;
  total: number;
  estado: "completado" | "transito" | "pendiente" | "cancelado";
  estadoPago: "pagado" | "parcial" | "no-pagado";
  notas: string;
  prods: ProdVenta[];
}

export interface Cliente {
  id: string;
  nombre: string;
  doc: string;
  tel: string;
  email: string;
  ciudad: string;
  dir: string;
  tipo: "Mayorista" | "Minorista" | "Nuevo" | "VIP";
  estado: "activo" | "inactivo";
  credito: number;
  dias: number;
  deuda: number;
  notas: string;
}

export interface Pago {
  id: number;
  tipo: "cobro" | "pago";
  referencia_id: string;
  nombre: string;
  concepto: string;
  metodo: string;
  monto: number;
  fecha: string;
}

export interface Despacho {
  id: number;
  codigo: string;
  venta_id: string;
  cliente_nombre: string;
  cliente_doc: string;
  cliente_tel: string;
  cliente_email: string;
  direccion: string;
  ciudad: string;
  estado: "en_empresa" | "en_ruta" | "entregado" | "cancelado";
  notas: string;
  origen_lat: number;
  origen_lng: number;
  destino_lat: number;
  destino_lng: number;
  despacho_lat: number | null;
  despacho_lng: number | null;
  ultima_pos: string | null;
  created_at: string;
}