import { useState } from "react";
import type { Cliente } from "../../types";
import Input from "../common/input";
import Select from "../common/select";
import Button from "../common/button";
import { TIPOS_CLIENTE } from "../../utils/constants";

interface Props {
  initial?: Partial<Cliente>;
  onSave: (data: Omit<Cliente, "id">) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ClienteForm({
  initial,
  onSave,
  onCancel,
  loading,
}: Props) {
  const [nombre, setNombre] = useState(initial?.nombre || "");
  const [doc, setDoc] = useState(initial?.doc || "");
  const [tel, setTel] = useState(initial?.tel || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [ciudad, setCiudad] = useState(initial?.ciudad || "Cúcuta");
  const [dir, setDir] = useState(initial?.dir || "");
  const [tipo, setTipo] = useState(initial?.tipo || "Nuevo");
  const [estado, setEstado] = useState(initial?.estado || "activo");
  const [credito, setCredito] = useState(initial?.credito || 0);
  const [dias, setDias] = useState(initial?.dias || 0);
  const [notas, setNotas] = useState(initial?.notas || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) return;
    await onSave({
      nombre,
      doc,
      tel,
      email,
      ciudad,
      dir,
      tipo: tipo as Cliente["tipo"],
      estado: estado as Cliente["estado"],
      credito: +credito,
      dias: +dias,
      deuda: initial?.deuda || 0,
      notas,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nombre completo *"
          value={nombre}
          onChange={setNombre}
          placeholder="María González"
          required
          className="sm:col-span-2"
        />
        <Input
          label="Documento (CC/NIT)"
          value={doc}
          onChange={setDoc}
          placeholder="52.123.456"
        />
        <Input
          label="Teléfono / WhatsApp"
          value={tel}
          onChange={setTel}
          placeholder="+57 310 111 2222"
        />
        <Input
          label="Correo electrónico"
          value={email}
          onChange={setEmail}
          placeholder="cliente@email.com"
          type="email"
        />
        <Input
          label="Ciudad"
          value={ciudad}
          onChange={setCiudad}
          placeholder="Cúcuta"
        />
        <Input
          label="Dirección"
          value={dir}
          onChange={setDir}
          placeholder="Barrio La Playa calle 3 #5-12"
          className="sm:col-span-2"
        />

        <Select
          label="Tipo de cliente"
          value={tipo}
          onChange={setTipo}
          options={TIPOS_CLIENTE.map((t) => ({ value: t, label: t }))}
        />
        <Select
          label="Estado"
          value={estado}
          onChange={setEstado}
          options={[
            { value: "activo", label: "✅ Activo" },
            { value: "inactivo", label: "⛔ Inactivo" },
          ]}
        />

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Límite de crédito ($)
          </label>
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-500 transition">
            <span className="text-slate-400 text-sm">$</span>
            <input
              type="number"
              min="0"
              value={credito || ""}
              onChange={(e) => setCredito(+e.target.value)}
              placeholder="0 = sin crédito"
              className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Días de crédito
          </label>
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-500 transition">
            <input
              type="number"
              min="0"
              value={dias || ""}
              onChange={(e) => setDias(+e.target.value)}
              placeholder="0 = contado"
              className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none"
            />
            <span className="text-slate-400 text-sm">días</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Notas
        </label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Observaciones del cliente..."
          rows={2}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 transition resize-none placeholder:text-slate-300"
        />
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "💾 Guardar cliente"}
        </Button>
      </div>
    </form>
  );
}
