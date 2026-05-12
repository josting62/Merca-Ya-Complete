import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  FiSun, FiMoon, FiSave, FiBell, FiFileText,
  FiHome, FiCheck,
} from "react-icons/fi";
import { useThemeStore } from "../store/themeStore";
import Topbar from "../components/layout/topBar";
import Button from "../components/common/button";

export default function ConfiguracionPage() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { dark, toggle } = useThemeStore();

  // Empresa
  const [nombre, setNombre]       = useState("Merka Plásticos SAS");
  const [nit, setNit]             = useState("900.123.456-7");
  const [telefono, setTelefono]   = useState("+57 300 123 4567");
  const [ciudad, setCiudad]       = useState("Cúcuta, Norte de Santander");
  const [direccion, setDireccion] = useState("Calle 5 # 12-34, Zona Industrial");
  const [email, setEmail]         = useState("admin@merka.com");
  const [regimen, setRegimen]     = useState("Responsable de IVA");

  // Notificaciones
  const [notiStock,  setNotiStock]  = useState(true);
  const [notiFact,   setNotiFact]   = useState(true);
  const [notiVentas, setNotiVentas] = useState(false);

  // Facturación
  const [prefijo,   setPrefijo]   = useState("MRK-");
  const [consec,    setConsec]    = useState("0006");
  const [iva,       setIva]       = useState(false);
  const [diasCred,  setDiasCred]  = useState("30");

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputClass = `
    w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all
    focus:ring-2 focus:ring-[var(--brand)]
  `;

  const Toggle = ({
    value, onChange,
  }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-300"
      style={{ backgroundColor: value ? 'var(--brand)' : 'var(--border-strong)' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300"
        style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Configuración" onMenuClick={onMenuClick} />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">

        {/* Toast guardado */}
        {saved && (
          <div
            className="fixed bottom-6 right-6 z-50 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 fade-in"
            style={{ backgroundColor: '#16a34a' }}
          >
            <FiCheck size={16} /> Cambios guardados
          </div>
        )}

        {/* ── Modo oscuro ── */}
        <div
          className="rounded-2xl p-5 flex items-center justify-between gap-4"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderLeft: '4px solid var(--brand)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--brand-subtle)', color: 'var(--brand)' }}
            >
              {dark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Modo oscuro
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Cambia entre tema claro y oscuro
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              {dark ? "Oscuro" : "Claro"}
            </span>
            <Toggle value={dark} onChange={toggle} />
          </div>
        </div>

        {/* ── Información de la empresa ── */}
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2
            className="font-extrabold text-sm mb-4 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--brand-subtle)', color: 'var(--brand)' }}
            >
              <FiHome size={14} />
            </span>
            Información de la empresa
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Nombre de la empresa", value: nombre, set: setNombre, type: "text" },
              { label: "NIT / RUT",             value: nit,     set: setNit,     type: "text" },
              { label: "Teléfono",              value: telefono, set: setTelefono, type: "tel" },
              { label: "Ciudad",                value: ciudad,   set: setCiudad,   type: "text" },
            ].map((f) => (
              <div key={f.label}>
                <label
                  className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  className={inputClass}
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            ))}

            <div className="sm:col-span-2">
              <label
                className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                Dirección
              </label>
              <input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className={inputClass}
                style={{
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div>
              <label
                className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                style={{
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div>
              <label
                className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                Régimen tributario
              </label>
              <select
                value={regimen}
                onChange={(e) => setRegimen(e.target.value)}
                className={inputClass}
                style={{
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <option>Responsable de IVA</option>
                <option>No responsable de IVA</option>
                <option>Régimen simple</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{
                backgroundColor: 'var(--brand)',
                boxShadow: 'var(--shadow-brand)',
              }}
            >
              <FiSave size={14} /> Guardar cambios
            </button>
          </div>
        </div>

        {/* ── Notificaciones ── */}
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2
            className="font-extrabold text-sm mb-4 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--brand-subtle)', color: 'var(--brand)' }}
            >
              <FiBell size={14} />
            </span>
            Notificaciones
          </h2>

          <div className="space-y-0">
            {[
              {
                label: "Alertas de stock bajo",
                sub:   "Notificar cuando un producto baje del mínimo",
                value: notiStock,
                set:   setNotiStock,
              },
              {
                label: "Vencimiento de facturas",
                sub:   "Recordatorio 3 días antes de vencer",
                value: notiFact,
                set:   setNotiFact,
              },
              {
                label: "Nuevas ventas",
                sub:   "Notificar al registrar una venta nueva",
                value: notiVentas,
                set:   setNotiVentas,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-4"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {item.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {item.sub}
                  </p>
                </div>
                <Toggle value={item.value} onChange={() => item.set(!item.value)} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Facturación ── */}
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2
            className="font-extrabold text-sm mb-4 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--brand-subtle)', color: 'var(--brand)' }}
            >
              <FiFileText size={14} />
            </span>
            Facturación
          </h2>

          <div className="space-y-0">
            {[
              {
                label: "Prefijo de factura",
                sub:   "Se añade antes del número consecutivo",
                input: (
                  <input
                    value={prefijo}
                    onChange={(e) => setPrefijo(e.target.value)}
                    className="w-28 rounded-xl px-3 py-2 text-sm text-right outline-none transition-all focus:ring-2 focus:ring-[var(--brand)]"
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                ),
              },
              {
                label: "Próximo consecutivo",
                sub:   "Número de la próxima factura",
                input: (
                  <input
                    type="number"
                    value={consec}
                    onChange={(e) => setConsec(e.target.value)}
                    className="w-28 rounded-xl px-3 py-2 text-sm text-right outline-none transition-all focus:ring-2 focus:ring-[var(--brand)]"
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                ),
              },
              {
                label: "Incluir IVA por defecto",
                sub:   "Aplica IVA del 19% automáticamente",
                input: <Toggle value={iva} onChange={() => setIva(!iva)} />,
              },
              {
                label: "Días de crédito por defecto",
                sub:   "Vencimiento estándar de facturas a crédito",
                input: (
                  <input
                    type="number"
                    value={diasCred}
                    onChange={(e) => setDiasCred(e.target.value)}
                    className="w-28 rounded-xl px-3 py-2 text-sm text-right outline-none transition-all focus:ring-2 focus:ring-[var(--brand)]"
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                ),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-4 gap-4 last:border-0"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {item.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {item.sub}
                  </p>
                </div>
                {item.input}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}