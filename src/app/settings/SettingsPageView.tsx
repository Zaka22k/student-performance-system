"use client";

import {
  Page,
  Button,
  useTheme,
  type Theme,
  type SystemAccent,
} from "@ui-kit/components";
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

function SettingsHero() {
  return (
    <div className={styles.hero} aria-hidden="true">
      <svg
        className={styles.heroArtwork}
        viewBox="0 0 1440 280"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <rect width="1440" height="280" fill="var(--window-bg)" />

        <path
          d="M0 178C190 112 312 122 470 180s274 92 430 25 340-117 540-54v129H0Z"
          fill="var(--grouped-bg)"
          opacity="0.9"
        />
        <path
          d="M0 220c210-74 365-74 555-15s329 55 493-8 270-73 392-38v121H0Z"
          fill="var(--under-page-bg)"
          opacity="0.78"
        />

        <circle
          cx="1160"
          cy="34"
          r="190"
          fill="var(--control-accent)"
          opacity="0.13"
        />
        <circle
          cx="1260"
          cy="-8"
          r="118"
          fill="var(--system-indigo)"
          opacity="0.13"
        />
        <circle
          cx="1110"
          cy="148"
          r="154"
          fill="none"
          stroke="var(--system-cyan)"
          strokeWidth="1.5"
          opacity="0.38"
        />
        <circle
          cx="1110"
          cy="148"
          r="184"
          fill="none"
          stroke="var(--control-accent)"
          strokeWidth="1"
          strokeDasharray="3 9"
          opacity="0.42"
        />

        <g opacity="0.58" fill="none" stroke="var(--separator-opaque)">
          <path d="M0 44h270M0 58h180M1300 232h140" strokeWidth="1" />
          <path d="M102 0v76M116 0v48M1370 0v52" strokeWidth="1" />
        </g>

        {/* Небольшая абстрактная панель вместо отдельных превью тем. */}
        <g transform="translate(820 36) rotate(-3 230 105)">
          <rect
            x="0"
            y="0"
            width="390"
            height="202"
            rx="22"
            fill="var(--elevated-bg)"
            stroke="var(--window-border)"
            strokeWidth="1.2"
          />
          <rect
            x="18"
            y="18"
            width="354"
            height="42"
            rx="12"
            fill="var(--fill-tertiary)"
          />
          <circle cx="42" cy="39" r="7" fill="var(--control-accent)" />
          <rect
            x="59"
            y="34"
            width="92"
            height="9"
            rx="4.5"
            fill="var(--label-secondary)"
            opacity="0.65"
          />
          <rect
            x="325"
            y="31"
            width="30"
            height="16"
            rx="8"
            fill="var(--selected-control)"
          />
          <circle cx="345" cy="39" r="5" fill="var(--control-accent)" />

          <rect
            x="20"
            y="78"
            width="158"
            height="104"
            rx="13"
            fill="var(--grouped-bg)"
          />
          <rect
            x="34"
            y="94"
            width="78"
            height="7"
            rx="3.5"
            fill="var(--label-secondary)"
            opacity="0.55"
          />
          <rect
            x="34"
            y="111"
            width="126"
            height="9"
            rx="4.5"
            fill="var(--fill-primary)"
          />
          <rect
            x="34"
            y="111"
            width="82"
            height="9"
            rx="4.5"
            fill="var(--control-accent)"
          />
          <rect
            x="34"
            y="137"
            width="42"
            height="28"
            rx="8"
            fill="var(--system-blue)"
            opacity="0.18"
          />
          <rect
            x="84"
            y="137"
            width="42"
            height="28"
            rx="8"
            fill="var(--system-purple)"
            opacity="0.18"
          />
          <rect
            x="134"
            y="137"
            width="30"
            height="28"
            rx="8"
            fill="var(--system-orange)"
            opacity="0.2"
          />

          <rect
            x="194"
            y="78"
            width="178"
            height="104"
            rx="13"
            fill="var(--grouped-bg)"
          />
          <rect
            x="210"
            y="94"
            width="90"
            height="7"
            rx="3.5"
            fill="var(--label-secondary)"
            opacity="0.55"
          />
          <circle cx="224" cy="132" r="13" fill="var(--system-green)" />
          <circle cx="262" cy="132" r="13" fill="var(--system-blue)" />
          <circle cx="300" cy="132" r="13" fill="var(--system-purple)" />
          <circle cx="338" cy="132" r="13" fill="var(--system-orange)" />
          <rect
            x="210"
            y="158"
            width="130"
            height="6"
            rx="3"
            fill="var(--separator-opaque)"
            opacity="0.7"
          />
        </g>

        <circle
          cx="755"
          cy="64"
          r="8"
          fill="var(--system-yellow)"
          opacity="0.9"
        />
        <circle
          cx="785"
          cy="222"
          r="5"
          fill="var(--system-pink)"
          opacity="0.9"
        />
        <path
          d="M690 44l10 10-10 10-10-10zM1288 202l8 8-8 8-8-8z"
          fill="var(--control-accent)"
          opacity="0.75"
        />
      </svg>
    </div>
  );
}

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
