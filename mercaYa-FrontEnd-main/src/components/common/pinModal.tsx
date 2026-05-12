import { useState, useRef, useEffect } from "react";
import { FiShield, FiCheck, FiX } from "react-icons/fi";
import api from "../../lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accion: string; // descripción de la acción que se intenta ejecutar
}

export default function PinModal({ open, onClose, onSuccess, accion }: Props) {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setPin(["", "", "", "", "", ""]);
      setError("");
      setOk(false);
      setTimeout(() => inputs.current[0]?.focus(), 100);
    }
  }, [open]);

  const handleChange = (i: number, val: string) => {
    const char = val
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(-1);
    const next = [...pin];
    next[i] = char;
    setPin(next);
    setError("");
    if (char && i < 5) inputs.current[i + 1]?.focus();
    // Auto-submit cuando los 6 caracteres están completos
    if (char && i === 5) {
      const full = [...next].join("");
      if (full.length === 6) submitPin(full);
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
    if (e.key === "Enter") {
      const full = pin.join("");
      if (full.length === 6) submitPin(full);
    }
  };

  const submitPin = async (fullPin: string) => {
    if (fullPin.length !== 6) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/verify-pin", { pin: fullPin });
      if (data.valid) {
        setOk(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 600);
      }
    } catch {
      setError(
        "PIN incorrecto. Solo el administrador puede autorizar esta acción.",
      );
      setPin(["", "", "", "", "", ""]);
      setTimeout(() => inputs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: "var(--brand-subtle)",
                color: "var(--brand)",
              }}
            >
              <FiShield size={18} />
            </div>
            <div>
              <p
                className="font-extrabold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                Autorización requerida
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {accion}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: "var(--surface-3)",
              color: "var(--text-muted)",
            }}
          >
            <FiX size={14} />
          </button>
        </div>

        <p
          className="text-xs mb-4 text-center"
          style={{ color: "var(--text-secondary)" }}
        >
          Ingresa el PIN de administrador para continuar
        </p>

        {/* Inputs PIN */}
        <div className="flex justify-center gap-2 mb-4">
          {pin.map((char, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el as HTMLInputElement; }}
              value={char}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              disabled={loading || ok}
              className="w-11 h-13 text-center text-lg font-extrabold rounded-xl outline-none transition-all uppercase"
              style={{
                height: "52px",
                backgroundColor: ok
                  ? "#dcfce7"
                  : error
                    ? "#fee2e2"
                    : "var(--surface-2)",
                border: `2px solid ${ok ? "#16a34a" : error ? "#dc2626" : char ? "var(--brand)" : "var(--border)"}`,
                color: ok
                  ? "#15803d"
                  : error
                    ? "#dc2626"
                    : "var(--text-primary)",
                letterSpacing: "0.1em",
              }}
            />
          ))}
        </div>

        {/* Estado */}
        {ok && (
          <div
            className="flex items-center justify-center gap-2 text-sm font-bold"
            style={{ color: "#16a34a" }}
          >
            <FiCheck size={16} /> Autorizado
          </div>
        )}
        {error && (
          <p
            className="text-xs text-center font-medium"
            style={{ color: "#dc2626" }}
          >
            {error}
          </p>
        )}
        {loading && (
          <p
            className="text-xs text-center"
            style={{ color: "var(--text-muted)" }}
          >
            Verificando...
          </p>
        )}

        {/* Botón manual */}
        {!ok && !loading && (
          <button
            onClick={() => submitPin(pin.join(""))}
            disabled={pin.join("").length !== 6}
            className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
            style={{
              backgroundColor: "var(--brand)",
              boxShadow: "var(--shadow-brand)",
            }}
          >
            Confirmar
          </button>
        )}
      </div>
    </div>
  );
}
