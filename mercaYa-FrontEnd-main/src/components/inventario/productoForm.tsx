import { useState } from "react";
import { FiSave } from "react-icons/fi";
import type { Producto } from "../../types";
import Input from "../common/input";
import Select from "../common/select";
import Button from "../common/button";
import { CATEGORIAS } from "../../utils/constants";
import { formatCOP } from "../../utils/formatters";

interface Props {
  initial?: Partial<Producto>;
  onSave: (data: Omit<Producto, "id">) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const UNIDADES = ["Milla", "Paquetico", "Paquete", "Caja", "Rollo", "Unidad"];

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
  transition: "all 0.15s",
};

export default function ProductoForm({
  initial,
  onSave,
  onCancel,
  loading,
}: Props) {
  const [nombre, setNombre] = useState(initial?.nombre || "");
  const [marca, setMarca] = useState(initial?.marca || "Merka");
  const [cat, setCat] = useState(initial?.cat || "");
  const [desc, setDesc] = useState(initial?.desc || "");
  const [barcode, setBarcode] = useState(initial?.barcode || "");
  const [sku, setSku] = useState(initial?.sku || "");
  const [pventa, setPventa] = useState(initial?.pventa || 0);
  const [pcompra, setPcompra] = useState(initial?.pcompra || 0);
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [stockMin, setStockMin] = useState(initial?.stockMin ?? 5);
  const [unidad, setUnidad] = useState(initial?.unidad || "Unidad");
  const [iva, setIva] = useState(initial?.iva ?? 0);

  const margen =
    pventa > 0 && pcompra > 0
      ? Math.round(((pventa - pcompra) / pventa) * 100)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !cat || pventa <= 0) return;
    await onSave({
      nombre,
      marca,
      cat,
      desc,
      barcode,
      sku,
      pventa: +pventa,
      pcompra: +pcompra,
      stock: +stock,
      stockMin: +stockMin,
      unidad,
      iva: +iva,
      foto: "",
    });
  };

  const sectionLabel = (text: string) => (
    <p
      className="text-[10px] font-bold uppercase tracking-wider mb-3"
      style={labelStyle}
    >
      {text}
    </p>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Info básica */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nombre del producto *"
          value={nombre}
          onChange={setNombre}
          placeholder="Ej: Bolsa Transparente 5kg – Milla"
          required
          className="sm:col-span-2"
        />
        <Input
          label="Marca"
          value={marca}
          onChange={setMarca}
          placeholder="Merka"
        />
        <Select
          label="Categoría *"
          value={cat}
          onChange={setCat}
          required
          options={CATEGORIAS.map((c) => ({
            value: c.name,
            label: `${c.icon} ${c.name}`,
          }))}
        />
        <Select
          label="Unidad de presentación"
          value={unidad}
          onChange={setUnidad}
          options={UNIDADES.map((u) => ({ value: u, label: u }))}
        />
        <Input
          label="SKU"
          value={sku}
          onChange={setSku}
          placeholder="BT-5K-M"
        />
        <Input
          label="Código de barras"
          value={barcode}
          onChange={setBarcode}
          placeholder="7700001..."
          className="sm:col-span-2"
        />
      </div>

      {/* Descripción */}
      <div>
        <label
          className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
          style={labelStyle}
        >
          Descripción
        </label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Descripción del producto..."
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

      {/* Precios */}
      <div>
        {sectionLabel("Precios")}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Precio de venta *",
              val: pventa,
              set: setPventa,
              req: true,
            },
            {
              label: "Precio de costo",
              val: pcompra,
              set: setPcompra,
              req: false,
            },
          ].map(({ label, val, set, req }) => (
            <div key={label}>
              <label
                className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                style={labelStyle}
              >
                {label}
              </label>
              <div
                className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 transition-all"
                style={{
                  backgroundColor: "var(--surface-2)",
                  border: "1px solid var(--border)",
                }}
              >
                <span
                  className="text-sm font-bold"
                  style={{ color: "var(--text-muted)" }}
                >
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  value={val || ""}
                  onChange={(e) => set(+e.target.value)}
                  placeholder="0"
                  required={req}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
            </div>
          ))}
          <div className="flex flex-col justify-end">
            <div
              className="p-3 rounded-xl text-center"
              style={{
                backgroundColor: margen > 0 ? "#dcfce7" : "var(--surface-2)",
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-wider"
                style={labelStyle}
              >
                Margen
              </p>
              <p
                className="text-2xl font-extrabold"
                style={{ color: margen > 0 ? "#15803d" : "var(--text-muted)" }}
              >
                {margen}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock e IVA */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Input
          label="Stock actual"
          type="number"
          value={stock}
          onChange={(v) => setStock(+v)}
        />
        <Input
          label="Stock mínimo"
          type="number"
          value={stockMin}
          onChange={(v) => setStockMin(+v)}
        />
        <div>
          <label
            className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
            style={labelStyle}
          >
            IVA %
          </label>
          <select
            value={iva}
            onChange={(e) => setIva(+e.target.value)}
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
            <option value={0}>0% — Excluido</option>
            <option value={5}>5%</option>
            <option value={19}>19%</option>
          </select>
        </div>
        <div className="flex flex-col justify-end">
          <div
            className="p-3 rounded-xl text-center"
            style={{ backgroundColor: "var(--surface-2)" }}
          >
            <p className="text-[10px] font-bold uppercase" style={labelStyle}>
              P. venta + IVA
            </p>
            <p
              className="text-sm font-extrabold"
              style={{ color: "var(--text-primary)" }}
            >
              {formatCOP(pventa * (1 + iva / 100))}
            </p>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          <FiSave size={14} /> {loading ? "Guardando..." : "Guardar producto"}
        </Button>
      </div>
    </form>
  );
}
