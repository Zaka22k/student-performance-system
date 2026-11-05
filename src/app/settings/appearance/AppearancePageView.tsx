"use client";

import type { CSSProperties } from "react";
import { Button, Page, TabBar } from "@ui-kit/components";
import SettingsHero from "../SettingsHero";
import {
  ACCENT_OPTIONS,
  THEME_OPTIONS,
  useAppearancePage,
} from "./useAppearancePage";
import styles from "../SettingsPage.module.css";

const THEME_TABS = THEME_OPTIONS.map((item) => ({
  value: item.id,
  label: item.id === "auto" ? "Авто" : item.label,
  ariaLabel: item.label,
}));

export default function AppearancePageView() {
  const page = useAppearancePage();
  const activeAccent =
    ACCENT_OPTIONS.find((item) => item.id === page.accent) ?? ACCENT_OPTIONS[0];
  const activeThemeLabel =
    page.resolvedTheme === "dark" ? "Тёмная" : "Светлая";
  const themeDescription =
    page.theme === "auto"
      ? "Синхронизировано с настройками операционной системы"
      : page.theme === "dark"
        ? "Тёмный режим включён вручную"
        : "Светлый режим включён вручную";

  return (
    <Page
      title="Оформление"
      hero={<SettingsHero />}
      toolbar={{
        trailing: (
          <TabBar
            layout="inline"
            value={page.theme}
            onValueChange={page.setTheme}
            items={THEME_TABS}
            aria-label="Тема приложения"
          />
        ),
      }}
    >
      <div className={styles.appearanceContainer}>
        <header className={styles.appearanceIntro}>
          <div className={styles.appearanceIntroText}>
            <span className={styles.appearanceEyebrow}>ПЕРСОНАЛИЗАЦИЯ</span>
            <h1 className={"TitleLargeTextBlockStyle " + styles.appearanceTitle}>
              Внешний вид
            </h1>
            <p className={"BodyTextBlockStyle " + styles.appearanceDescription}>
              Настройте цветовую палитру и выберите режим, в котором удобнее
              работать с журналом и отчётами.
            </p>
          </div>

          <div className={styles.activeTheme}>
            <span className={styles.activeThemeMark} aria-hidden="true" />
            <div className={styles.activeThemeText}>
              <span>Сейчас используется</span>
              <strong>{activeThemeLabel} тема</strong>
            </div>
          </div>
        </header>

        <div className={styles.appearanceGrid}>
          <section className={styles.themeSection}>
            <div className={styles.appearancePanelHead}>
              <div>
                <h2 className={styles.appearancePanelTitle}>
                  Предпросмотр оформления
                </h2>
                <p className={styles.appearancePanelDescription}>
                  Так выглядит рабочее пространство с выбранной палитрой
                </p>
              </div>
              <span className={styles.themeState}>
                <span className={styles.themeStateDot} />
                {activeThemeLabel}
              </span>
            </div>

            <div
              className={styles.themePreview}
              data-theme-preview={page.resolvedTheme}
              style={
                {
                  "--preview-accent": activeAccent.cssVar,
                } as CSSProperties
              }
            >
              <aside className={styles.previewSidebar}>
                <div className={styles.previewBrand}>
                  <span className={styles.previewBrandMark} />
                  <span />
                </div>
                <div className={styles.previewNavItem}>
                  <span />
                  <i />
                </div>
                <div className={styles.previewNavItem}>
                  <span />
                </div>
                <div className={styles.previewNavItem}>
                  <span />
                </div>
                <div className={styles.previewNavDivider} />
                <div className={styles.previewNavItem}>
                  <span />
                </div>
              </aside>

              <div className={styles.previewMain}>
                <div className={styles.previewToolbar}>
                  <span className={styles.previewToolbarTitle}>
                    Успеваемость
                  </span>
                  <span className={styles.previewToolbarAction} />
                </div>
                <div className={styles.previewContent}>
                  <div className={styles.previewGreeting}>
                    <span />
                    <i />
                  </div>
                  <div className={styles.previewMetrics}>
                    <div className={styles.previewMetric}>
                      <span>Студенты</span>
                      <strong>128</strong>
                    </div>
                    <div className={styles.previewMetric}>
                      <span>Средний балл</span>
                      <strong>4,72</strong>
                    </div>
                  </div>
                  <div className={styles.previewTable}>
                    <div className={styles.previewTableHead}>
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className={styles.previewTableRow}>
                      <span />
                      <i />
                      <b />
                    </div>
                    <div className={styles.previewTableRow}>
                      <span />
                      <i />
                      <b />
                    </div>
                    <div className={styles.previewTableRow}>
                      <span />
                      <i />
                      <b />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className={styles.themeNote}>{themeDescription}</p>
          </section>

          <section className={styles.accentSection}>
            <div className={styles.appearancePanelHead}>
              <div>
                <h2 className={styles.appearancePanelTitle}>Цвет акцента</h2>
                <p className={styles.appearancePanelDescription}>
                  Цвет кнопок, активных пунктов меню и выделения
                </p>
              </div>
            </div>

            <div className={styles.selectedAccent}>
              <span
                className={styles.selectedAccentColor}
                style={{ backgroundColor: activeAccent.cssVar }}
              />
              <div className={styles.selectedAccentText}>
                <strong>{activeAccent.name}</strong>
                <span>Выбран для интерфейса приложения</span>
              </div>
            </div>

            <div
              className={styles.accentGrid}
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
                    className={
                      styles.swatch +
                      (active ? " " + styles.swatchActive : "")
                    }
                    style={{ backgroundColor: item.cssVar }}
                    onClick={() => page.setAccent(item.id)}
                  />
                );
              })}
            </div>

            <div className={styles.accentHint}>
              Цвет применяется ко всем основным элементам интерфейса. Выбор
              сохраняется автоматически.
            </div>
          </section>
        </div>

        <footer className={styles.appearanceFooter}>
          <div>
            <strong>Настройки по умолчанию</strong>
            <p>
              Светлая тема и зелёный системный акцент — исходное оформление
              приложения.
            </p>
          </div>
          <Button
            appearance="destructive"
            disabled={page.isDefault}
            onClick={page.resetToDefault}
          >
            Сбросить
          </Button>
        </footer>
      </div>
    </Page>
  );
}
