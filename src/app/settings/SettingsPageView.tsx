"use client";

import {
  Page,
  Button,
  useTheme,
  type Theme,
  type SystemAccent,
} from "@ui-kit/components";
import SettingsHero from "./SettingsHero";
import styles from "./SettingsPage.module.css";

interface ThemeOptionItem {
  id: Theme;
  label: string;
}

const THEME_OPTIONS: readonly ThemeOptionItem[] = [
  { id: "light", label: "Светлая" },
  { id: "dark", label: "Тёмная" },
  { id: "auto", label: "Автоматически" },
];

interface AccentOptionItem {
  id: SystemAccent;
  name: string;
  cssVar: string;
}

const ACCENT_OPTIONS: readonly AccentOptionItem[] = [
  {
    id: "green",
    name: "Зелёный (по умолчанию)",
    cssVar: "var(--system-green)",
  },
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

export default function SettingsPageView() {
  const { theme, resolvedTheme, accent, setTheme, toggleTheme, setAccent } =
    useTheme();

  const isDefault = theme === DEFAULT_THEME && accent === DEFAULT_ACCENT;

  const handleReset = () => {
    setTheme(DEFAULT_THEME);
    setAccent(DEFAULT_ACCENT);
  };

  return (
    <Page title="Настройки" hero={<SettingsHero />}>
      <div className={styles.container}>
        <section className={styles.section}>
          <h2
            className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.sectionHeader}`}
          >
            Оформление
          </h2>

          <div className={styles.card}>
            <div
              className={styles.themeGrid}
              role="radiogroup"
              aria-label="Тема оформления"
            >
              {THEME_OPTIONS.map((item) => {
                const active = theme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={`${styles.themeOption} ${
                      active ? styles.themeOptionActive : ""
                    }`}
                    onClick={() => setTheme(item.id)}
                  >
                    <span
                      className={`BodyTextBlockStyle ${
                        active ? "BodyStrongTextBlockStyle" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className={styles.row}>
              <div className={styles.rowInfo}>
                <span className="BodyTextBlockStyle BodyStrongTextBlockStyle">
                  Активная цветовая схема
                </span>
                <span
                  className={`CaptionTextBlockStyle ${styles.rowDescription}`}
                >
                  Сейчас используется{" "}
                  {resolvedTheme === "dark" ? "тёмная" : "светлая"} палитра
                  {theme === "auto" ? " (синхронизировано с ОС)" : ""}
                </span>
              </div>

              <Button appearance="normal" onClick={toggleTheme}>
                Переключить на {resolvedTheme === "dark" ? "светлую" : "тёмную"}
              </Button>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2
            className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.sectionHeader}`}
          >
            Акцент и выделение
          </h2>

          <div className={styles.card}>
            <div className={styles.row}>
              <div className={styles.rowInfo}>
                <span className="BodyTextBlockStyle BodyStrongTextBlockStyle">
                  Системный цвет акцента
                </span>
                <span
                  className={`CaptionTextBlockStyle ${styles.rowDescription}`}
                >
                  Цвет основных кнопок, активных элементов и курсора фокуса
                </span>
              </div>

              <div
                className={styles.swatchList}
                role="radiogroup"
                aria-label="Системные цвета акцента"
              >
                {ACCENT_OPTIONS.map((item) => {
                  const active = accent === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      aria-label={item.name}
                      title={item.name}
                      className={`${styles.swatch} ${
                        active ? styles.swatchActive : ""
                      }`}
                      style={{ backgroundColor: item.cssVar }}
                      onClick={() => setAccent(item.id)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <Button
          appearance="destructive"
          disabled={isDefault}
          style={{ alignSelf: "start" }}
          onClick={handleReset}
        >
          Сбросить по умолчанию
        </Button>
      </div>
    </Page>
  );
}
