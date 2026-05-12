import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  dark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      dark: false,
      toggle: () => {
        const next = !get().dark;
        set({ dark: next });
        document.documentElement.classList.toggle("dark", next);
      },
    }),
    { name: "merka_theme" },
  ),
);

// Aplicar tema guardado al cargar
const saved = localStorage.getItem("merka_theme");
if (saved) {
  const { state } = JSON.parse(saved);
  if (state?.dark) document.documentElement.classList.add("dark");
}
