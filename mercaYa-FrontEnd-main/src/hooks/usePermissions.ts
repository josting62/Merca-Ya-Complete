import { useAuthStore } from "../store/authStore";

type Rol = "admin" | "vendedor" | "bodega" | "cajera";

interface Permisos {
  // Sidebar / módulos visibles
  verDashboard: boolean;
  verVentas: boolean;
  verCompras: boolean;
  verDespachos: boolean;
  verInventario: boolean;
  verClientes: boolean;
  verCartera: boolean;
  verUsuarios: boolean;
  verCaja: boolean;
  // Ventas
  crearVenta: boolean;
  editarVenta: boolean;
  eliminarVenta: boolean; // admin directo, otros necesitan PIN
  // Compras
  crearCompra: boolean;
  editarCompra: boolean;
  // Inventario
  crearProducto: boolean;
  editarProducto: boolean;
  eliminarProducto: boolean;
  verPreciosInventario: boolean;
  // Despachos
  crearDespacho: boolean;
  cambiarEstadoDespacho: boolean;
  anularDespacho: boolean;
  // Clientes
  crearCliente: boolean;
  editarCliente: boolean;
  eliminarCliente: boolean;
  // Cartera
  registrarCobro: boolean;
  registrarPago: boolean;
  // Caja
  usarCaja: boolean;
  // Usuarios
  gestionarUsuarios: boolean;
  // PIN
  requierePinAdmin: (accion: AccionCritica) => boolean;
}

export type AccionCritica =
  | "eliminar_venta"
  | "anular_despacho"
  | "descuento_alto";

const ACCIONES_CON_PIN: AccionCritica[] = [
  "eliminar_venta",
  "anular_despacho",
  "descuento_alto",
];

const PERMISOS: Record<Rol, Omit<Permisos, "requierePinAdmin">> = {
  admin: {
    verDashboard: true,
    verVentas: true,
    verCompras: true,
    verDespachos: true,
    verInventario: true,
    verClientes: true,
    verCartera: true,
    verUsuarios: true,
    verCaja: true,
    crearVenta: true,
    editarVenta: true,
    eliminarVenta: true,
    crearCompra: true,
    editarCompra: true,
    crearProducto: true,
    editarProducto: true,
    eliminarProducto: true,
    verPreciosInventario: true,
    crearDespacho: true,
    cambiarEstadoDespacho: true,
    anularDespacho: true,
    crearCliente: true,
    editarCliente: true,
    eliminarCliente: true,
    registrarCobro: true,
    registrarPago: true,
    usarCaja: true,
    gestionarUsuarios: true,
  },
  vendedor: {
    verDashboard: false,
    verVentas: true,
    verCompras: false,
    verDespachos: true,
    verInventario: true,
    verClientes: true,
    verCartera: false,
    verUsuarios: false,
    verCaja: false,
    crearVenta: true,
    editarVenta: true,
    eliminarVenta: false,
    crearCompra: false,
    editarCompra: false,
    crearProducto: false,
    editarProducto: false,
    eliminarProducto: false,
    verPreciosInventario: true,
    crearDespacho: true,
    cambiarEstadoDespacho: true,
    anularDespacho: false,
    crearCliente: true,
    editarCliente: true,
    eliminarCliente: false,
    registrarCobro: false,
    registrarPago: false,
    usarCaja: false,
    gestionarUsuarios: false,
  },
  bodega: {
    verDashboard: false,
    verVentas: false,
    verCompras: false,
    verDespachos: true,
    verInventario: true,
    verClientes: false,
    verCartera: false,
    verUsuarios: false,
    verCaja: false,
    crearVenta: false,
    editarVenta: false,
    eliminarVenta: false,
    crearCompra: false,
    editarCompra: false,
    crearProducto: true,
    editarProducto: true,
    eliminarProducto: false,
    verPreciosInventario: true,
    crearDespacho: false,
    cambiarEstadoDespacho: true,
    anularDespacho: false,
    crearCliente: false,
    editarCliente: false,
    eliminarCliente: false,
    registrarCobro: false,
    registrarPago: false,
    usarCaja: false,
    gestionarUsuarios: false,
  },
  cajera: {
    verDashboard: false,
    verVentas: true,
    verCompras: false,
    verDespachos: false,
    verInventario: false,
    verClientes: false,
    verCartera: false,
    verUsuarios: false,
    verCaja: true,
    crearVenta: false,
    editarVenta: false,
    eliminarVenta: false,
    crearCompra: false,
    editarCompra: false,
    crearProducto: false,
    editarProducto: false,
    eliminarProducto: false,
    verPreciosInventario: false,
    crearDespacho: false,
    cambiarEstadoDespacho: false,
    anularDespacho: false,
    crearCliente: false,
    editarCliente: false,
    eliminarCliente: false,
    registrarCobro: true,
    registrarPago: false,
    usarCaja: true,
    gestionarUsuarios: false,
  },
};

export function usePermissions(): Permisos {
  const { user } = useAuthStore();
  const rol = (user?.rol as Rol) || "vendedor";
  const permisos = PERMISOS[rol] ?? PERMISOS.vendedor;
  return {
    ...permisos,
    requierePinAdmin: (accion: AccionCritica) =>
      ACCIONES_CON_PIN.includes(accion),
  };
}
