"use client";

import { Button, Page } from "@ui-kit/components";
import SettingsHero from "../SettingsHero";
import {
  ACCENT_OPTIONS,
  THEME_OPTIONS,
  useAppearancePage,
} from "./useAppearancePage";
import styles from "../SettingsPage.module.css";

export default function AppearancePageView() {
  const page = useAppearancePage();

  return (
    <Page title="Оформление" hero={<SettingsHero />}>
      <div className={styles.container}>
        <section className={styles.section}>
          <h2
            className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.sectionHeader}`}
          >
            Тема приложения
          </h2>

          <div className={styles.card}>
            <div
              className={styles.themeGrid}
              role="radiogroup"
              aria-label="Тема оформления"
            >
              {THEME_OPTIONS.map((item) => {
                const active = page.theme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={`${styles.themeOption} ${active ? styles.themeOptionActive : ""}`}
                    onClick={() => page.setTheme(item.id)}
                  >
                    <span
                      className={`BodyTextBlockStyle ${active ? "BodyStrongTextBlockStyle" : ""}`}
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
                  {page.resolvedTheme === "dark" ? "тёмная" : "светлая"} палитра
                  {page.theme === "auto" ? " (синхронизировано с ОС)" : ""}
                </span>
              </div>

              <Button appearance="normal" onClick={page.toggleTheme}>
                Переключить на{" "}
                {page.resolvedTheme === "dark" ? "светлую" : "тёмную"}
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
                  const active = page.accent === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      aria-label={item.name}
                      title={item.name}
                      className={`${styles.swatch} ${active ? styles.swatchActive : ""}`}
                      style={{ backgroundColor: item.cssVar }}
                      onClick={() => page.setAccent(item.id)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <Button
          appearance="destructive"
          disabled={page.isDefault}
          style={{ alignSelf: "start" }}
          onClick={page.resetToDefault}
        >
          Сбросить по умолчанию
        </Button>
      </div>
    </Page>
  );
}
