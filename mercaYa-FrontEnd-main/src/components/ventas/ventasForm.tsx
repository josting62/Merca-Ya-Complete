import { useState, useRef, useEffect } from "react";
import {
  FiPlus,
  FiX,
  FiSave,
  FiDollarSign,
  FiSmartphone,
  FiRepeat,
  FiSearch,
  FiPackage,
} from "react-icons/fi";
import type { Venta, ProdVenta } from "../../types";
import Input from "../common/input";
import Select from "../common/select";
import Button from "../common/button";
import { useInventarioStore } from "../../store/inventarioStore";
import {
  METODOS_PAGO,
  ESTADOS_ENTREGA,
  ESTADOS_PAGO,
} from "../../utils/constants";
import { formatCOP } from "../../utils/formatters";
import { getCategoriaInfo } from "../../utils/constants";

interface Props {
  initial?: Partial<Venta>;
  clientes: { id: string; nombre: string }[];
  onSave: (data: Omit<Venta, "id">) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const emptyProd = (): ProdVenta => ({ n: "", p: 0, q: 1, d: 0 });

const METODO_ICONS: Record<string, React.ReactNode> = {
  Efectivo: <FiDollarSign size={13} />,
  "Pago Móvil": <FiSmartphone size={13} />,
  Transferencia: <FiRepeat size={13} />,
};

const labelStyle: React.CSSProperties = { color: "var(--text-muted)" };
const fieldStyle: React.CSSProperties = {
  backgroundColor: "var(--surface-2)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  borderRadius: "12px",
  padding: "10px 12px",
  fontSize: "13px",
  outline: "none",
  width: "100%",
};

// ── Componente de autocompletado para cada fila de producto ──
interface ProdInputProps {
  value: string;
  precio: number;
  onSelect: (nombre: string, precio: number) => void;
  onChange: (val: string) => void;
}

function ProductoAutocomplete({
  value,
  precio,
  onSelect,
  onChange,
}: ProdInputProps) {
  const [query, setQuery] = useState(value);
  const [abierto, setAbierto] = useState(false);
  const [focused, setFocused] = useState(false);
  const productos = useInventarioStore((s) => s.items);
  const ref = useRef<HTMLDivElement>(null);

  // Cierra el dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sincroniza si viene valor inicial
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtrados = productos
    .filter(
      (p) =>
        query.length >= 1 &&
        (p.nombre.toLowerCase().includes(query.toLowerCase()) ||
          p.sku?.toLowerCase().includes(query.toLowerCase()) ||
          p.cat?.toLowerCase().includes(query.toLowerCase())),
    )
    .slice(0, 8);

  const handleInput = (val: string) => {
    setQuery(val);
    onChange(val);
    setAbierto(val.length >= 1);
  };

  const handleSelect = (p: (typeof productos)[0]) => {
    setQuery(p.nombre);
    onSelect(p.nombre, p.pventa);
    setAbierto(false);
  };

  return (
    <div ref={ref} className="relative w-full min-w-[180px]">
      <div
        className="flex items-center gap-1.5 w-full"
        style={{ borderBottom: focused ? "1px solid var(--brand)" : "none" }}
      >
        <FiSearch
          size={11}
          style={{ color: "var(--text-muted)", flexShrink: 0 }}
        />
        <input
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => {
            setFocused(true);
            if (query.length >= 1) setAbierto(true);
          }}
          onBlur={() => setFocused(false)}
          placeholder="Buscar producto..."
          className="w-full bg-transparent text-sm outline-none"
          style={{ color: "var(--text-primary)" }}
        />
      </div>

      {/* Dropdown */}
      {abierto && filtrados.length > 0 && (
        <div
          className="absolute left-0 top-full mt-1 z-50 rounded-xl overflow-hidden shadow-lg w-72"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {filtrados.map((p) => {
            const cat = getCategoriaInfo(p.cat);
            const sinStock = p.stock === 0;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelect(p)}
                disabled={sinStock}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all disabled:opacity-40"
                style={{ borderBottom: "1px solid var(--border)" }}
                onMouseEnter={(e) => {
                  if (!sinStock)
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "var(--surface-2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "";
                }}
              >
                {/* Icono categoría */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: cat.color + "18" }}
                >
                  {cat.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-bold truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {p.nombre}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {p.cat}
                    </span>
                    {p.sku && (
                      <span
                        className="text-[10px] font-mono"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {p.sku}
                      </span>
                    )}
                  </div>
                </div>

                {/* Precio y stock */}
                <div className="text-right flex-shrink-0">
                  <p
                    className="text-xs font-extrabold"
                    style={{ color: "var(--brand)" }}
                  >
                    {formatCOP(p.pventa)}
                  </p>
                  <p
                    className="text-[10px] font-semibold"
                    style={{
                      color: sinStock
                        ? "#dc2626"
                        : p.stock <= p.stockMin
                          ? "#a16207"
                          : "#16a34a",
                    }}
                  >
                    {sinStock ? "Sin stock" : `${p.stock} en stock`}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Si no hay resultados */}
          {filtrados.length === 0 && query.length >= 1 && (
            <div className="px-3 py-4 text-center">
              <FiPackage
                size={20}
                className="mx-auto mb-1 opacity-30"
                style={{ color: "var(--text-muted)" }}
              />
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Sin resultados para "{query}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Formulario principal ──
export default function VentaForm({
  initial,
  clientes,
  onSave,
  onCancel,
  loading,
}: Props) {
  const { items: productos, fetchAll } = useInventarioStore();

  const [cliente, setCliente] = useState(initial?.cliente || "");
  const [metodo, setMetodo] = useState(initial?.metodo || "");
  const [fechaEnt, setFechaEnt] = useState(initial?.fechaEntrega || "");
  const [fechaPago, setFechaPago] = useState(initial?.fechaPago || "");
  const [estado, setEstado] = useState(initial?.estado || "pendiente");
  const [estadoPago, setEstadoPago] = useState(
    initial?.estadoPago || "no-pagado",
  );
  const [notas, setNotas] = useState(initial?.notas || "");
  const [prods, setProds] = useState<ProdVenta[]>(
    initial?.prods?.length ? initial.prods : [emptyProd()],
  );

  // Carga productos si no están cargados
  useEffect(() => {
    if (productos.length === 0) fetchAll();
  }, []);

  const updateProd = (
    i: number,
    field: keyof ProdVenta,
    val: string | number,
  ) =>
    setProds((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)),
    );

  const selectProducto = (i: number, nombre: string, precio: number) => {
    setProds((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, n: nombre, p: precio } : p)),
    );
  };

  const addProd = () => setProds((p) => [...p, emptyProd()]);
  const removeProd = (i: number) =>
    setProds((p) => p.filter((_, idx) => idx !== i));

  const subtotal = prods.reduce((s, p) => s + p.p * p.q, 0);
  const descuento = prods.reduce((s, p) => s + p.p * p.q * (p.d / 100), 0);
  const total = subtotal - descuento;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || !metodo) return;
    const validProds = prods.filter((p) => p.n && p.p > 0 && p.q > 0);
    if (!validProds.length) return;
    await onSave({
      cliente,
      metodo: metodo as Venta["metodo"],
      fechaEntrega: fechaEnt,
      fechaPago,
      estado: estado as Venta["estado"],
      estadoPago: estadoPago as Venta["estadoPago"],
      notas,
      prods: validProds,
      total,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Cliente y fechas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
            style={labelStyle}
          >
            Cliente <span style={{ color: "#f87171" }}>*</span>
          </label>
          <select
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            required
            style={fieldStyle}
            onFocus={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "var(--brand)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 0 3px rgba(59,91,219,0.2)";
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "var(--border)";
              (e.currentTarget as HTMLElement).style.boxShadow = "";
            }}
          >
            <option value="">— Seleccionar cliente —</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <Select
          label="Método de pago *"
          value={metodo}
          onChange={setMetodo}
          options={METODOS_PAGO.map((m) => ({ value: m, label: m }))}
          required
        />
        <Input
          label="Fecha de entrega"
          type="date"
          value={fechaEnt}
          onChange={setFechaEnt}
        />
        <Input
          label="Fecha de pago"
          type="date"
          value={fechaPago}
          onChange={setFechaPago}
        />
        <Select
          label="Estado de entrega"
          value={estado}
          onChange={setEstado}
          options={ESTADOS_ENTREGA.map((e) => ({
            value: e.value,
            label: e.label,
          }))}
        />
        <Select
          label="Estado de pago"
          value={estadoPago}
          onChange={setEstadoPago}
          options={ESTADOS_PAGO.map((e) => ({
            value: e.value,
            label: e.label,
          }))}
        />
      </div>

      {/* Método visual */}
      <div>
        <p
          className="text-[10px] font-bold uppercase tracking-wider mb-2"
          style={labelStyle}
        >
          Forma de pago
        </p>
        <div className="flex gap-2 flex-wrap">
          {METODOS_PAGO.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetodo(m)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
              style={
                metodo === m
                  ? {
                      border: "2px solid var(--brand)",
                      backgroundColor: "var(--brand-subtle)",
                      color: "var(--brand)",
                    }
                  : {
                      border: "2px solid var(--border)",
                      color: "var(--text-muted)",
                      backgroundColor: "transparent",
                    }
              }
            >
              {METODO_ICONS[m]} {m}
            </button>
          ))}
        </div>
      </div>

      {/* Productos con autocompletado */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-wider"
              style={labelStyle}
            >
              Productos
            </p>
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Escribe para buscar del inventario
            </p>
          </div>
          <button
            type="button"
            onClick={addProd}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all"
            style={{
              backgroundColor: "var(--brand-subtle)",
              color: "var(--brand)",
            }}
          >
            <FiPlus size={11} /> Agregar
          </button>
        </div>

        <div
          className="rounded-xl overflow-visible"
          style={{ border: "1px solid var(--border)" }}
        >
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr
                  style={{
                    backgroundColor: "var(--surface-2)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {[
                    "Producto",
                    "Precio unit.",
                    "Cantidad",
                    "Desc. %",
                    "Subtotal",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-[10px] font-bold uppercase text-left"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prods.map((p, i) => {
                  const sub = p.p * p.q * (1 - p.d / 100);
                  return (
                    <tr
                      key={i}
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      {/* Columna producto con autocompletado */}
                      <td
                        className="px-3 py-2"
                        style={{
                          position: "relative",
                          overflow: "visible",
                          minWidth: "200px",
                        }}
                      >
                        <ProductoAutocomplete
                          value={p.n}
                          precio={p.p}
                          onSelect={(nombre, precio) =>
                            selectProducto(i, nombre, precio)
                          }
                          onChange={(val) => updateProd(i, "n", val)}
                        />
                      </td>

                      {/* Precio — editable, autocompleta desde inventario */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            $
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={p.p || ""}
                            onChange={(e) =>
                              updateProd(i, "p", +e.target.value)
                            }
                            className="w-24 bg-transparent text-sm outline-none"
                            placeholder="0"
                            style={{ color: "var(--text-primary)" }}
                          />
                        </div>
                      </td>

                      {/* Cantidad */}
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="1"
                          value={p.q}
                          onChange={(e) => updateProd(i, "q", +e.target.value)}
                          className="w-16 bg-transparent text-sm outline-none"
                          style={{ color: "var(--text-primary)" }}
                        />
                      </td>

                      {/* Descuento */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-0.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={p.d}
                            onChange={(e) =>
                              updateProd(i, "d", +e.target.value)
                            }
                            className="w-14 bg-transparent text-sm outline-none"
                            style={{ color: "var(--text-primary)" }}
                          />
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            %
                          </span>
                        </div>
                      </td>

                      {/* Subtotal */}
                      <td
                        className="px-3 py-2 text-sm font-bold whitespace-nowrap"
                        style={{ color: "var(--brand)" }}
                      >
                        {formatCOP(sub)}
                      </td>

                      {/* Eliminar fila */}
                      <td className="px-3 py-2">
                        {prods.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProd(i)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                            style={{
                              backgroundColor: "#fee2e2",
                              color: "#dc2626",
                            }}
                          >
                            <FiX size={11} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total */}
        <div
          className="mt-3 p-4 rounded-xl flex justify-between items-center"
          style={{
            backgroundColor: "var(--brand-subtle)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="text-sm space-y-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            <p>
              Subtotal:{" "}
              <span
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {formatCOP(subtotal)}
              </span>
            </p>
            {descuento > 0 && (
              <p style={{ color: "#dc2626" }}>
                Descuento: -{formatCOP(descuento)}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase" style={labelStyle}>
              Total
            </p>
            <p
              className="text-2xl font-extrabold tracking-tight"
              style={{ color: "var(--brand)" }}
            >
              {formatCOP(total)}
            </p>
          </div>
        </div>
      </div>

      {/* Notas */}
      <div>
        <label
          className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
          style={labelStyle}
        >
          Observaciones
        </label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Instrucciones de entrega, condiciones especiales..."
          rows={2}
          className="resize-none"
          style={{ ...fieldStyle, lineHeight: "1.5" }}
          onFocus={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--brand)";
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 0 3px rgba(59,91,219,0.2)";
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor =
              "var(--border)";
            (e.currentTarget as HTMLElement).style.boxShadow = "";
          }}
        />
      </div>

      {/* Acciones */}
      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          <FiSave size={14} /> {loading ? "Guardando..." : "Guardar venta"}
        </Button>
      </div>
    </form>
  );
}
