import { useEffect } from "react";
import { useNavigate, useOutletContext, Navigate } from "react-router-dom";
import { useDashboardStore } from "../store/dashboardStore";
import { useAuthStore } from "../store/authStore";
import { usePermissions } from "../hooks/usePermissions";
import Topbar from "../components/layout/topBar";
import KpiCard from "../components/common/kpiCard";
import Spinner from "../components/common/spinner";
import ErrorMessage from "../components/common/errorMessage";
import Button from "../components/common/button";
import { BadgePago } from "../components/common/badge";
import { formatCOP, formatDateLong, greetingByHour } from "../utils/formatters";
import { CATEGORIAS, getCategoriaInfo } from "../utils/constants";

const MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  boxShadow: "var(--shadow-sm)",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { user } = useAuthStore();
  const perms = usePermissions();
  const { data, loading, error, fetchDashboard } = useDashboardStore();

  if (!perms.verDashboard) {
    if (perms.usarCaja) return <Navigate to="/caja" replace />;
    if (perms.verVentas) return <Navigate to="/ventas" replace />;
    if (perms.verInventario) return <Navigate to="/inventario" replace />;
    if (perms.verDespachos) return <Navigate to="/despachos" replace />;
    return <Navigate to="/ventas" replace />;
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col h-full">
        <Topbar
          title={`${greetingByHour()}, ${user?.nombre?.split(" ")[0] || "Juan"}`}
          onMenuClick={onMenuClick}
        />
        <Spinner />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Dashboard" onMenuClick={onMenuClick} />
        <ErrorMessage message={error} onRetry={fetchDashboard} />
      </div>
    );

  const d = data;
  const now = new Date();

  const barData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const y = date.getFullYear(),
      m = date.getMonth() + 1;
    const vt =
      d?.grafico.ventas.find((x) => x.anio === y && x.mes === m)?.total || 0;
    const ct =
      d?.grafico.compras.find((x) => x.anio === y && x.mes === m)?.total || 0;
    return { label: MESES[date.getMonth()], ventas: vt, compras: ct };
  });
  const maxBar = Math.max(...barData.flatMap((b) => [b.ventas, b.compras]), 1);

  const catData = CATEGORIAS.map((cat) => {
    const found = d?.categorias.find((c) => c.cat === cat.name);
    return { ...cat, valor: found?.valor || 0, unidades: found?.unidades || 0 };
  });
  const maxCat = Math.max(...catData.map((c) => c.valor), 1);

  const kpisSecundarios = [
    {
      label: "Cobradas",
      value: d?.ventas.pagadas || 0,
      bg: "#f0fdf4",
      color: "#15803d",
      border: "#bbf7d0",
      path: "/ventas",
    },
    {
      label: "Sin cobrar",
      value: d?.ventas.noPagadas || 0,
      bg: "#fff1f2",
      color: "#dc2626",
      border: "#fecdd3",
      path: "/ventas",
    },
    {
      label: "Stock bajo",
      value: d?.inventario.stockBajo || 0,
      bg: "#fefce8",
      color: "#a16207",
      border: "#fde68a",
      path: "/inventario",
    },
    {
      label: "Sin stock",
      value: d?.inventario.sinStock || 0,
      bg: "#fff1f2",
      color: "#dc2626",
      border: "#fecdd3",
      path: "/inventario",
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title={`${greetingByHour()}, ${user?.nombre?.split(" ")[0] || "Juan"} 👋`}
        subtitle={formatDateLong()}
        onMenuClick={onMenuClick}
        actions={
          <>
            <Button size="sm" onClick={() => navigate("/ventas")}>
              ＋ Nueva venta
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate("/compras")}
            >
              ＋ Nueva compra
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {/* KPIs principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="Ventas del mes"
            value={formatCOP(d?.ventas.montoTotal || 0)}
            delta={`${d?.ventas.total || 0} registros`}
            icon="🏷️"
            accent="blue"
            onClick={() => navigate("/ventas")}
          />
          <KpiCard
            label="Gasto en compras"
            value={formatCOP(d?.compras.montoTotal || 0)}
            delta={`${d?.compras.total || 0} órdenes`}
            icon="🛒"
            accent="purple"
            onClick={() => navigate("/compras")}
          />
          <KpiCard
            label="Por cobrar"
            value={formatCOP(d?.ventas.porCobrar || 0)}
            delta={`${d?.ventas.noPagadas || 0} facturas pendientes`}
            deltaUp={false}
            icon="⏳"
            accent="amber"
            onClick={() => navigate("/cartera")}
          />
          <KpiCard
            label="Valor inventario"
            value={formatCOP(d?.inventario.valorInventario || 0)}
            delta={`${d?.inventario.totalProductos || 0} productos`}
            icon="📦"
            accent="green"
            onClick={() => navigate("/inventario")}
          />
        </div>

        {/* KPIs secundarios */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kpisSecundarios.map((item) => (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all hover:shadow-md"
              style={{
                backgroundColor: item.bg,
                border: `1px solid ${item.border}`,
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.transform =
                  "translateY(-1px)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.transform = "")
              }
            >
              <div className="min-w-0">
                <p
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: item.color + "aa" }}
                >
                  {item.label}
                </p>
                <p
                  className="text-xl font-extrabold tracking-tight"
                  style={{ color: item.color }}
                >
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Barras ventas vs compras */}
          <div className="md:col-span-2 p-5" style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-bold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                Ventas vs Compras — últimos 6 meses
              </h3>
              <div
                className="flex gap-3 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: "var(--brand)" }}
                  />
                  Ventas
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-400 inline-block" />
                  Compras
                </span>
              </div>
            </div>
            <div className="flex items-end gap-2 h-32">
              {barData.map((b) => (
                <div
                  key={b.label}
                  className="flex-1 flex flex-col items-center gap-0.5"
                >
                  <div className="flex items-end gap-0.5 w-full justify-center h-24">
                    <div
                      className="flex-1 rounded-t transition-all duration-700 min-h-[2px]"
                      style={{
                        height: `${Math.max((b.ventas / maxBar) * 96, 2)}px`,
                        background:
                          "linear-gradient(to top, var(--brand-dark), var(--brand-light))",
                      }}
                      title={`Ventas ${b.label}: ${formatCOP(b.ventas)}`}
                    />
                    <div
                      className="flex-1 rounded-t bg-gradient-to-t from-violet-400 to-violet-500 transition-all duration-700 min-h-[2px]"
                      style={{
                        height: `${Math.max((b.compras / maxBar) * 96, 2)}px`,
                      }}
                      title={`Compras ${b.label}: ${formatCOP(b.compras)}`}
                    />
                  </div>
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Inventario por categoría */}
          <div className="p-5" style={cardStyle}>
            <h3
              className="font-bold text-sm mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Inventario por categoría
            </h3>
            <div className="space-y-3">
              {catData.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {cat.icon} {cat.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {cat.unidades} u.
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: cat.color }}
                      >
                        {formatCOP(cat.valor)}
                      </span>
                    </div>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: "var(--surface-3)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max((cat.valor / maxCat) * 100, 2)}%`,
                        background: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Últimas ventas + alertas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Últimas ventas */}
          <div className="md:col-span-3 overflow-hidden" style={cardStyle}>
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <h3
                className="font-bold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                Últimas ventas
              </h3>
              <button
                onClick={() => navigate("/ventas")}
                className="text-xs font-semibold hover:underline"
                style={{ color: "var(--brand)" }}
              >
                Ver todas →
              </button>
            </div>
            {!d?.ultimasVentas?.length ? (
              <p
                className="text-center py-10 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Sin ventas registradas
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["N°", "Cliente", "Productos", "Total", "Pago"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-left"
                          style={{
                            backgroundColor: "var(--surface-2)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {d.ultimasVentas.map((v) => (
                    <tr
                      key={v.id}
                      style={{ borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--surface-2)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "")
                      }
                    >
                      <td
                        className="px-4 py-3 text-xs font-semibold"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {v.id}
                      </td>
                      <td
                        className="px-4 py-3 text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {v.cliente}
                      </td>
                      <td
                        className="px-4 py-3 text-xs max-w-[140px] truncate"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {v.productos}
                      </td>
                      <td
                        className="px-4 py-3 text-sm font-extrabold"
                        style={{ color: "var(--brand)" }}
                      >
                        {formatCOP(v.total)}
                      </td>
                      <td className="px-4 py-3">
                        <BadgePago estado={v.estadoPago} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Alertas de stock */}
          <div className="md:col-span-2 overflow-hidden" style={cardStyle}>
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <h3
                className="font-bold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                Alertas de stock
              </h3>
              <button
                onClick={() => navigate("/inventario")}
                className="text-xs font-semibold hover:underline"
                style={{ color: "var(--brand)" }}
              >
                Ver todo →
              </button>
            </div>
            <div className="p-3 space-y-2 overflow-y-auto max-h-64">
              {!d?.alertas?.length ? (
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    ✅ Todo el inventario en orden
                  </p>
                </div>
              ) : (
                d.alertas.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{
                      backgroundColor: p.tipo === "out" ? "#fff1f2" : "#fefce8",
                      border: `1px solid ${p.tipo === "out" ? "#fecdd3" : "#fde68a"}`,
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg">
                        {p.tipo === "out" ? "🚫" : "⚠️"}
                      </span>
                      <div className="min-w-0">
                        <p
                          className="text-xs font-bold truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {p.nombre}
                        </p>
                        <p
                          className="text-[10px]"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {p.cat} · {p.sku}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p
                        className="text-sm font-extrabold"
                        style={{
                          color: p.tipo === "out" ? "#dc2626" : "#a16207",
                        }}
                      >
                        {p.stock === 0 ? "Sin stock" : `${p.stock} u.`}
                      </p>
                      <p
                        className="text-[10px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Mín: {p.stockMin}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
