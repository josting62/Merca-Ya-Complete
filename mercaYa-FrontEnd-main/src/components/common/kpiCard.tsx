interface Props {
  label: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean;
  icon: string;
  accent?: "blue" | "purple" | "green" | "amber";
  onClick?: () => void;
}

const ACCENTS = {
  blue: {
    bar: "from-sky-400 to-sky-600",
    icon: "bg-sky-50 dark:bg-sky-900/30",
  },
  purple: {
    bar: "from-violet-400 to-violet-600",
    icon: "bg-violet-50 dark:bg-violet-900/30",
  },
  green: {
    bar: "from-green-400 to-green-600",
    icon: "bg-green-50 dark:bg-green-900/30",
  },
  amber: {
    bar: "from-amber-400 to-amber-600",
    icon: "bg-amber-50 dark:bg-amber-900/30",
  },
};

export default function KpiCard({
  label,
  value,
  delta,
  deltaUp = true,
  icon,
  accent = "blue",
  onClick,
}: Props) {
  const a = ACCENTS[accent];
  return (
    <div
      onClick={onClick}
      className={`relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 overflow-hidden shadow-xs transition-all ${onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""}`}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${a.bar}`}
      />
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {label}
          </p>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight truncate">
            {value}
          </p>
          {delta && (
            <p
              className={`text-xs mt-1.5 font-medium ${deltaUp ? "text-green-600 dark:text-green-400" : "text-red-500"}`}
            >
              {deltaUp ? "▲" : "▼"} {delta}
            </p>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-xl ${a.icon} flex items-center justify-center text-xl flex-shrink-0`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
