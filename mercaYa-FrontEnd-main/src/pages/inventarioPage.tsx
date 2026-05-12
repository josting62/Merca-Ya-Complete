import { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { FiSearch, FiPlus, FiPackage } from "react-icons/fi";
import { useInventarioStore } from "../store/inventarioStore";
import Topbar from "../components/layout/topBar";
import Button from "../components/common/button";
import Spinner from "../components/common/spinner";
import ErrorMessage from "../components/common/errorMessage";
import Modal from "../components/common/modal";
import CategoriaCard from "../components/inventario/categoriaCard";
import ProductoCard from "../components/inventario/productoCard";
import ProductoForm from "../components/inventario/productoForm";
import { CATEGORIAS, getCategoriaInfo } from "../utils/constants";
import { formatCOP } from "../utils/formatters";
import type { Producto } from "../types";

type Vista = "categorias" | "productos";

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  borderRadius: "12px",
  fontSize: "13px",
  padding: "10px 12px 10px 36px",
  outline: "none",
  width: "100%",
  boxShadow: "var(--shadow-sm)",
};

const selectStyle: React.CSSProperties = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  borderRadius: "12px",
  fontSize: "13px",
  padding: "8px 12px",
  outline: "none",
};

export default function InventarioPage() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { items, loading, error, fetchAll, create, update, remove } =
    useInventarioStore();

  const [vista, setVista] = useState<Vista>("categorias");
  const [catActual, setCatActual] = useState("");
  const [search, setSearch] = useState("");
  const [fStock, setFStock] = useState("");
  const [fSort, setFSort] = useState("nombre");
  const [globalQ, setGlobalQ] = useState("");
  const [modalForm, setModalForm] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const totalProductos = items.length;
  const valorInventario = items.reduce((s, p) => s + p.pventa * p.stock, 0);
  const enStock = items.filter((p) => p.stock > p.stockMin).length;
  const stockBajo = items.filter(
    (p) => p.stock > 0 && p.stock <= p.stockMin,
  ).length;
  const sinStock = items.filter((p) => p.stock === 0).length;

  const catStats = useMemo(
    () =>
      CATEGORIAS.map((cat) => {
        const prods = items.filter((p) => p.cat === cat.name);
        return {
          name: cat.name,
          total: prods.length,
          enStock: prods.filter((p) => p.stock > p.stockMin).length,
          bajo: prods.filter((p) => p.stock > 0 && p.stock <= p.stockMin)
            .length,
          sinStock: prods.filter((p) => p.stock === 0).length,
          valor: prods.reduce((s, p) => s + p.pventa * p.stock, 0),
        };
      }),
    [items],
  );

  const productosFiltrados = useMemo(() => {
    let list = items.filter((p) => (catActual ? p.cat === catActual : true));
    const q = (vista === "categorias" ? globalQ : search).toLowerCase();
    if (q)
      list = list.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.barcode?.includes(q) ||
          p.cat.toLowerCase().includes(q),
      );
    if (fStock === "ok") list = list.filter((p) => p.stock > p.stockMin);
    if (fStock === "low")
      list = list.filter((p) => p.stock > 0 && p.stock <= p.stockMin);
    if (fStock === "out") list = list.filter((p) => p.stock === 0);
    if (fSort === "nombre")
      list.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (fSort === "precio_v_desc") list.sort((a, b) => b.pventa - a.pventa);
    if (fSort === "precio_v_asc") list.sort((a, b) => a.pventa - b.pventa);
    if (fSort === "stock_desc") list.sort((a, b) => b.stock - a.stock);
    if (fSort === "stock_asc") list.sort((a, b) => a.stock - b.stock);
    return list;
  }, [items, catActual, search, globalQ, fStock, fSort, vista]);

  const abrirCategoria = (cat: string) => {
    setCatActual(cat);
    setSearch("");
    setFStock("");
    setFSort("nombre");
    setVista("productos");
  };

  const volverCategorias = () => {
    setVista("categorias");
    setCatActual("");
    setGlobalQ("");
  };

  // FIX: fetchAll después de guardar para actualizar en tiempo real sin recargar
  const handleSave = async (data: Omit<Producto, "id">) => {
    // Validar stock no negativo
    if ((data as any).stock < 0) {
      alert("El stock no puede ser negativo");
      return;
    }
    setSaving(true);
    try {
      if (editing) await update(editing.id, data);
      else await create(data);
      // fetchAll() ya se llama dentro de create/update en el store
      setModalForm(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este producto?")) return;
    await remove(id);
  };

  const catInfo = getCategoriaInfo(catActual);

  if (loading)
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Inventario" onMenuClick={onMenuClick} />
        <Spinner />
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Inventario" onMenuClick={onMenuClick} />
        <ErrorMessage message={error} onRetry={fetchAll} />
      </div>
    );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Inventario"
        onMenuClick={onMenuClick}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setModalForm(true);
            }}
          >
            <FiPlus size={14} /> Agregar producto
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {[
            {
              label: "Productos",
              value: totalProductos,
              color: "var(--text-primary)",
            },
            {
              label: "Valor stock",
              value: formatCOP(valorInventario),
              color: "var(--brand)",
            },
            { label: "En stock", value: enStock, color: "#16a34a" },
            { label: "Stock bajo", value: stockBajo, color: "#a16207" },
            { label: "Sin stock", value: sinStock, color: "#dc2626" },
          ].map((k) => (
            <div
              key={k.label}
              className="p-3.5 text-center rounded-2xl"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                {k.label}
              </p>
              <p
                className="text-lg font-extrabold tracking-tight"
                style={{ color: k.color }}
              >
                {k.value}
              </p>
            </div>
          ))}
        </div>

        {/* Vista categorias */}
        {vista === "categorias" && (
          <>
            <div className="relative max-w-md">
              <FiSearch
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                value={globalQ}
                onChange={(e) => setGlobalQ(e.target.value)}
                placeholder="Busqueda global en todo el inventario..."
                style={inputStyle}
              />
            </div>

            {globalQ ? (
              <div>
                <p
                  className="text-xs font-bold mb-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  {productosFiltrados.length} resultado
                  {productosFiltrados.length !== 1 ? "s" : ""} para "{globalQ}"
                </p>
                {productosFiltrados.length === 0 ? (
                  <p
                    className="text-center py-12"
                    style={{ color: "var(--text-muted)" }}
                  >
                    No se encontraron productos
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {productosFiltrados.map((p) => (
                      <ProductoCard
                        key={p.id}
                        producto={p}
                        onEdit={(prod) => {
                          setEditing(prod);
                          setModalForm(true);
                        }}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catStats.map((cat) => (
                  <CategoriaCard
                    key={cat.name}
                    {...cat}
                    onClick={() => abrirCategoria(cat.name)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Vista productos de categoria */}
        {vista === "productos" && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={volverCategorias}
                className="flex items-center gap-1.5 text-sm font-semibold transition-all"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--text-primary)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--text-muted)")
                }
              >
                Categorias
              </button>
              <span style={{ color: "var(--border)" }}>›</span>
              <span
                className="text-sm font-bold"
                style={{ color: catInfo.color }}
              >
                {catInfo.icon} {catActual}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-44">
                <FiSearch
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar en esta categoria..."
                  style={{ ...inputStyle, padding: "8px 12px 8px 32px" }}
                />
              </div>
              <select
                value={fStock}
                onChange={(e) => setFStock(e.target.value)}
                style={selectStyle}
              >
                <option value="">Todo el stock</option>
                <option value="ok">En stock</option>
                <option value="low">Stock bajo</option>
                <option value="out">Sin stock</option>
              </select>
              <select
                value={fSort}
                onChange={(e) => setFSort(e.target.value)}
                style={selectStyle}
              >
                <option value="nombre">A-Z Nombre</option>
                <option value="precio_v_desc">Mayor precio</option>
                <option value="precio_v_asc">Menor precio</option>
                <option value="stock_desc">Mayor stock</option>
                <option value="stock_asc">Menor stock</option>
              </select>
              <span
                className="text-xs self-center"
                style={{ color: "var(--text-muted)" }}
              >
                {productosFiltrados.length} producto
                {productosFiltrados.length !== 1 ? "s" : ""}
              </span>
            </div>

            {productosFiltrados.length === 0 ? (
              <div
                className="text-center py-16"
                style={{ color: "var(--text-muted)" }}
              >
                <FiPackage size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  No hay productos que coincidan con el filtro
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {productosFiltrados.map((p) => (
                  <ProductoCard
                    key={p.id}
                    producto={p}
                    onEdit={(prod) => {
                      setEditing(prod);
                      setModalForm(true);
                    }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        open={modalForm}
        onClose={() => {
          setModalForm(false);
          setEditing(null);
        }}
        title={editing ? "Editar Producto" : "Nuevo Producto"}
        subtitle={
          editing
            ? `Editando: ${editing.nombre}`
            : "Completa los datos del producto"
        }
        size="lg"
      >
        <ProductoForm
          initial={editing || undefined}
          onSave={handleSave}
          onCancel={() => {
            setModalForm(false);
            setEditing(null);
          }}
          loading={saving}
        />
      </Modal>
    </div>
  );
}
