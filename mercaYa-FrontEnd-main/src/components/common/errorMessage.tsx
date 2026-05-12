import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: Props) {
  return (
    <div
      className="m-6 p-4 rounded-2xl flex items-start gap-3"
      style={{
        backgroundColor: "#fff1f2",
        border: "1px solid #fecdd3",
      }}
    >
      <FiAlertTriangle
        size={16}
        style={{ color: "#dc2626", flexShrink: 0, marginTop: 2 }}
      />
      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: "#dc2626" }}>
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 flex items-center gap-1 text-xs font-semibold transition-all"
            style={{ color: "#dc2626" }}
          >
            <FiRefreshCw size={11} /> Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
