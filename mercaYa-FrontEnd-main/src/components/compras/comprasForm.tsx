import { useState } from "react";
import { FiPlus, FiX, FiSave } from "react-icons/fi";
import type { Compra, ProdVenta } from "../../types";
import Input from "../common/input";
import Select from "../common/select";
import Button from "../common/button";
import {
  METODOS_PAGO,
  ESTADOS_ENTREGA,
  ESTADOS_PAGO,
} from "../../utils/constants";
import { formatCOP } from "../../utils/formatters";

const EMPRESAS = [
  "InnoTech SAS",
  "GlobalParts Ltda",
  "DigitalStore CO",
  "LogiTech Distribuciones",
  "TechSupply Co.",
];

interface Props {
  initial?: Partial<Compra>;
  onSave: (data: Omit<Compra, "id">) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const emptyProd = (): ProdVenta => ({ n: "", p: 0, q: 1, d: 0 });

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

export default function CompraForm({
  initial,
  onSave,
  onCancel,
  loading,
}: Props) {
  const [empresa, setEmpresa] = useState(initial?.empresa || "");
  const [metodo, setMetodo] = useState(initial?.metodo || "");
  const [cuotas, setCuotas] = useState(initial?.cuotas || 1);
  const [fechaCompra, setFechaCompra] = useState(initial?.fechaCompra || "");
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

  const updateProd = (
    i: number,
    field: keyof ProdVenta,
    val: string | number,
  ) =>
    setProds((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)),
    );
  const addProd = () => setProds((p) => [...p, emptyProd()]);
  const removeProd = (i: number) =>
    setProds((p) => p.filter((_, idx) => idx !== i));

  const subtotal = prods.reduce((s, p) => s + p.p * p.q, 0);
  const descuento = prods.reduce((s, p) => s + p.p * p.q * (p.d / 100), 0);
  const total = subtotal - descuento;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa || !metodo) return;
    const validProds = prods.filter((p) => p.n && p.p > 0 && p.q > 0);
    if (!validProds.length) return;
    await onSave({
      empresa,
      metodo: metodo as Compra["metodo"],
      cuotas: +cuotas,
      fechaCompra,
      fechaEntrega: fechaEnt,
      fechaPago,
      estado: estado as Compra["estado"],
      estadoPago: estadoPago as Compra["estadoPago"],
      notas,
      prods: validProds,
      total,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Empresa y fechas ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Empresa */}
        <div>
          <label
            className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
            style={labelStyle}
          >
            Empresa / Proveedor <span style={{ color: "#f87171" }}>*</span>
          </label>
          <select
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
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
            <option value="">-- Seleccionar empresa --</option>
            {EMPRESAS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        {/* Metodo — solo el select, SIN botones duplicados */}
        <Select
          label="Metodo de pago *"
          value={metodo}
          onChange={setMetodo}
          options={METODOS_PAGO.map((m) => ({ value: m, label: m }))}
          required
        />

        <Input
          label="Fecha de compra"
          type="date"
          value={fechaCompra}
          onChange={setFechaCompra}
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

        {/* Cuotas */}
        <div>
          <label
            className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
            style={labelStyle}
          >
            Cuotas
          </label>
          <div className="flex items-center gap-3">
            <select
              value={cuotas > 1 ? "si" : "no"}
              onChange={(e) => setCuotas(e.target.value === "no" ? 1 : 2)}
              style={{ ...fieldStyle, width: "auto" }}
            >
              <option value="no">Contado</option>
              <option value="si">A cuotas</option>
            </select>
            {cuotas > 1 && (
              <input
                type="number"
                min="2"
                max="60"
                value={cuotas}
                onChange={(e) => setCuotas(+e.target.value)}
                className="w-20 rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{
                  backgroundColor: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            )}
            {cuotas > 1 && total > 0 && (
              <span
                className="text-xs font-bold"
                style={{ color: "var(--brand)" }}
              >
                {formatCOP(total / cuotas)} c/u
              </span>
            )}
          </div>
        </div>

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

      {/* ── Productos ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p
            className="text-[10px] font-bold uppercase tracking-wider"
            style={labelStyle}
          >
            Productos
          </p>
          <button
            type="button"
            onClick={addProd}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg"
            style={{
              backgroundColor: "var(--brand-subtle)",
              color: "var(--brand)",
            }}
          >
            <FiPlus size={11} /> Agregar
          </button>
        </div>

        <div
          className="rounded-xl"
          style={{ border: "1px solid var(--border)", overflow: "visible" }}
        >
          <div style={{ overflowX: "auto", overflowY: "visible" }}>
            <table className="w-full min-w-[560px]">
              <thead>
                <tr
                  style={{
                    backgroundColor: "var(--surface-2)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {[
                    "Producto",
                    "Precio",
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
                      <td className="px-3 py-2" style={{ minWidth: "180px" }}>
                        {/* Texto visible con color correcto en modo claro/oscuro */}
                        <input
                          value={p.n}
                          onChange={(e) => updateProd(i, "n", e.target.value)}
                          placeholder="Nombre del producto"
                          className="w-full bg-transparent text-sm outline-none"
                          style={{ color: "var(--text-primary)" }}
                        />
                      </td>
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
                            placeholder="0"
                            onChange={(e) =>
                              updateProd(i, "p", +e.target.value)
                            }
                            className="w-24 bg-transparent text-sm outline-none"
                            style={{ color: "var(--text-primary)" }}
                          />
                        </div>
                      </td>
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
                      <td
                        className="px-3 py-2 text-sm font-bold whitespace-nowrap"
                        style={{ color: "var(--brand)" }}
                      >
                        {formatCOP(sub)}
                      </td>
                      <td className="px-3 py-2">
                        {prods.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProd(i)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
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
            {cuotas > 1 && total > 0 && (
              <p className="font-semibold" style={{ color: "var(--brand)" }}>
                {cuotas} cuotas de {formatCOP(total / cuotas)}
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

      {/* ── Notas ── */}
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
          placeholder="Numero de factura, condiciones del proveedor..."
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

      {/* ── Acciones ── */}
      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          <FiSave size={14} /> {loading ? "Guardando..." : "Guardar compra"}
        </Button>
      </div>
    </form>
  );
}
