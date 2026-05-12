import { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { FiTruck, FiMapPin, FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import { MdOutlineStorefront } from "react-icons/md";
import Topbar from "../components/layout/topBar";
import Spinner from "../components/common/spinner";
import Modal from "../components/common/modal";
import { useDespachoStore } from "../store/despachoStore";
import type { Despacho } from "../types";

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  boxShadow: "var(--shadow-sm)",
};

const ESTADOS: {
  value: Despacho["estado"];
  label: string;
  icon: any;
  bg: string;
  color: string;
}[] = [
  {
    value: "en_empresa",
    label: "En empresa",
    icon: MdOutlineStorefront,
    bg: "#fef9c3",
    color: "#a16207",
  },
  {
    value: "en_ruta",
    label: "En ruta",
    icon: FiTruck,
    bg: "var(--brand-subtle)",
    color: "var(--brand)",
  },
  {
    value: "entregado",
    label: "Entregado",
    icon: FiCheck,
    bg: "#dcfce7",
    color: "#15803d",
  },
  {
    value: "cancelado",
    label: "Cancelado",
    icon: FiX,
    bg: "#fee2e2",
    color: "#dc2626",
  },
];

const BadgeEstadoDespacho = ({ estado }: { estado: Despacho["estado"] }) => {
  const e = ESTADOS.find((x) => x.value === estado)!;
  const Icon = e.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full"
      style={{ backgroundColor: e.bg, color: e.color }}
    >
      <Icon size={10} /> {e.label}
    </span>
  );
};

export default function DespachoPage() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { items, loading, fetchAll, updateEstado, updatePosicion, remove } =
    useDespachoStore();
  const [rastreoTarget, setRastreoTarget] = useState<Despacho | null>(null);
  const [MapaComponent, setMapaComponent] = useState<any>(null);
  const watchRef = useRef<number | null>(null);

  useEffect(() => {
    fetchAll();
    import("../components/despacho/mapaRastreo").then((m) =>
      setMapaComponent(() => m.default),
    );
  }, []);

  useEffect(() => {
    if (!rastreoTarget || rastreoTarget.estado !== "en_ruta") return;
    if ("geolocation" in navigator) {
      watchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          updatePosicion(
            rastreoTarget.id,
            pos.coords.latitude,
            pos.coords.longitude,
          );
          setRastreoTarget((prev) =>
            prev
              ? {
                  ...prev,
                  despacho_lat: pos.coords.latitude,
                  despacho_lng: pos.coords.longitude,
                }
              : prev,
          );
        },
        (err) => console.warn("GPS error:", err),
        { enableHighAccuracy: true, maximumAge: 5000 },
      );
    }
    return () => {
      if (watchRef.current !== null)
        navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [rastreoTarget?.id, rastreoTarget?.estado]);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este despacho?")) return;
    await remove(id);
  };

  if (loading)
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Despachos" onMenuClick={onMenuClick} />
        <Spinner />
      </div>
    );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Despachos" onMenuClick={onMenuClick} />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ESTADOS.map((e) => {
            const Icon = e.icon;
            const count = items.filter((d) => d.estado === e.value).length;
            return (
              <div key={e.value} style={cardStyle} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="p-1.5 rounded-lg"
                    style={{ backgroundColor: e.bg, color: e.color }}
                  >
                    <Icon size={12} />
                  </span>
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {e.label}
                  </p>
                </div>
                <p
                  className="text-2xl font-extrabold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {count}
                </p>
              </div>
            );
          })}
        </div>

        {/* Tabla */}
        <div style={{ ...cardStyle, overflow: "hidden" }}>
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div>
              <h3
                className="font-bold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                Órdenes de Despacho
              </h3>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {items.length} orden{items.length !== 1 ? "es" : ""}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {[
                    "Código",
                    "Venta",
                    "Cliente",
                    "Ciudad",
                    "Dirección",
                    "Estado",
                    "Fecha",
                    "Acciones",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-left whitespace-nowrap"
                      style={{
                        backgroundColor: "var(--surface-2)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No hay despachos registrados
                    </td>
                  </tr>
                ) : (
                  items.map((d) => (
                    <tr
                      key={d.id}
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
                        className="px-4 py-3 text-xs font-black"
                        style={{ color: "var(--brand)" }}
                      >
                        {d.codigo}
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {d.venta_id}
                      </td>
                      <td
                        className="px-4 py-3 text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {d.cliente_nombre}
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {d.ciudad}
                      </td>
                      <td
                        className="px-4 py-3 text-xs max-w-[150px] truncate"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {d.direccion}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={d.estado}
                          onChange={(e) =>
                            updateEstado(
                              d.id,
                              e.target.value as Despacho["estado"],
                            )
                          }
                          className="text-xs rounded-lg px-2 py-1 outline-none"
                          style={{
                            border: "1px solid var(--border)",
                            backgroundColor: "var(--surface-2)",
                            color: "var(--text-primary)",
                          }}
                        >
                          {ESTADOS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td
                        className="px-4 py-3 text-xs whitespace-nowrap"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {new Date(d.created_at).toLocaleDateString("es-CO")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setRastreoTarget(d)}
                            title="Rastrear"
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                            style={{
                              backgroundColor: "var(--brand-subtle)",
                              color: "var(--brand)",
                            }}
                            onMouseEnter={(e) =>
                              ((e.currentTarget as HTMLElement).style.opacity =
                                "0.8")
                            }
                            onMouseLeave={(e) =>
                              ((e.currentTarget as HTMLElement).style.opacity =
                                "1")
                            }
                          >
                            <FiMapPin size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
                            title="Eliminar"
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                            style={{
                              backgroundColor: "#fee2e2",
                              color: "#dc2626",
                            }}
                            onMouseEnter={(e) =>
                              ((
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor = "#fecaca")
                            }
                            onMouseLeave={(e) =>
                              ((
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor = "#fee2e2")
                            }
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal rastreo */}
      {rastreoTarget && (
        <Modal
          open={!!rastreoTarget}
          onClose={() => setRastreoTarget(null)}
          title={`Rastreo — ${rastreoTarget.codigo}`}
          subtitle={`${rastreoTarget.cliente_nombre} · ${rastreoTarget.ciudad}`}
          size="lg"
        >
          <div className="space-y-4">
            <BadgeEstadoDespacho estado={rastreoTarget.estado} />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p
                  className="text-[10px] font-bold uppercase mb-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Dirección
                </p>
                <p
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {rastreoTarget.direccion}
                </p>
              </div>
              {rastreoTarget.ultima_pos && (
                <div>
                  <p
                    className="text-[10px] font-bold uppercase mb-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Última posición GPS
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {new Date(rastreoTarget.ultima_pos).toLocaleTimeString(
                      "es-CO",
                    )}
                  </p>
                </div>
              )}
            </div>
            {MapaComponent && <MapaComponent despacho={rastreoTarget} />}
            <div
              className="flex gap-4 pt-1 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <span>🔵 Origen (negocio)</span>
              <span>🔴 Destino (cliente)</span>
              <span>🟢 Despachador</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
