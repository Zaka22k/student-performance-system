"use client";

import {
  useTheme,
  type SystemAccent,
  type Theme,
} from "@ui-kit/components";

interface ThemeOptionItem {
  id: Theme;
  label: string;
}

export const THEME_OPTIONS: readonly ThemeOptionItem[] = [
  { id: "light", label: "Светлая" },
  { id: "dark", label: "Тёмная" },
  { id: "auto", label: "Автоматически" },
];

interface AccentOptionItem {
  id: SystemAccent;
  name: string;
  cssVar: string;
}

export const ACCENT_OPTIONS: readonly AccentOptionItem[] = [
  { id: "green", name: "Зелёный (по умолчанию)", cssVar: "var(--system-green)" },
  { id: "blue", name: "Синий", cssVar: "var(--system-blue)" },
  { id: "indigo", name: "Индиго", cssVar: "var(--system-indigo)" },
  { id: "purple", name: "Фиолетовый", cssVar: "var(--system-purple)" },
  { id: "pink", name: "Розовый", cssVar: "var(--system-pink)" },
  { id: "red", name: "Красный", cssVar: "var(--system-red)" },
  { id: "orange", name: "Оранжевый", cssVar: "var(--system-orange)" },
  { id: "yellow", name: "Жёлтый", cssVar: "var(--system-yellow)" },
  { id: "mint", name: "Мятный", cssVar: "var(--system-mint)" },
  { id: "teal", name: "Бирюзовый", cssVar: "var(--system-teal)" },
  { id: "cyan", name: "Голубой", cssVar: "var(--system-cyan)" },
  { id: "brown", name: "Коричневый", cssVar: "var(--system-brown)" },
  { id: "gray", name: "Графитовый", cssVar: "var(--system-gray)" },
];

const DEFAULT_THEME: Theme = "light";
const DEFAULT_ACCENT: SystemAccent = "green";

export function useAppearancePage() {
  const { theme, resolvedTheme, accent, setTheme, toggleTheme, setAccent } =
    useTheme();

  const isDefault = theme === DEFAULT_THEME && accent === DEFAULT_ACCENT;

  const resetToDefault = () => {
    setTheme(DEFAULT_THEME);
    setAccent(DEFAULT_ACCENT);
  };

  return {
    theme,
    resolvedTheme,
    accent,
    setTheme,
    toggleTheme,
    setAccent,
    isDefault,
    resetToDefault,
  };
}
