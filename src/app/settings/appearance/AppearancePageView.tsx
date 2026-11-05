"use client";

import { Button, Page, SegmentedControl } from "@ui-kit/components";
import AppearanceHero from "./AppearanceHero";
import {
  ACCENT_OPTIONS,
  THEME_OPTIONS,
  useAppearancePage,
} from "./useAppearancePage";
import styles from "./AppearancePage.module.css";
import type { Theme } from "@ui-kit/components";

// Подготовка данных для табов
const THEME_TABS = THEME_OPTIONS.map((item) => ({
  value: item.id,
  // Сокращаем "Автоматически" до "Авто" для компактности в тулбаре
  label: item.id === "auto" ? "Авто" : item.label,
  tooltip: item.label,
}));

function ThemeToolbarTabs({
  value,
  onValueChange,
}: {
  value: Theme;
  onValueChange: (value: Theme) => void;
}) {
  return (
    <SegmentedControl
      variant="glass"
      layout="inline"
      value={value}
      onValueChange={onValueChange}
      items={THEME_TABS}
      style={{ minWidth: 240 }}
    />
  );
}

export default function AppearancePageView() {
  const page = useAppearancePage();
  const activeAccent =
    ACCENT_OPTIONS.find((item) => item.id === page.accent) ?? ACCENT_OPTIONS[0];

  return (
    <Page
      title="Оформление"
      hero={<AppearanceHero />}
      toolbar={{
        center: (
          <ThemeToolbarTabs value={page.theme} onValueChange={page.setTheme} />
        ),
      }}
    >
      <div className={styles.appearanceContainer}>
        <section className={styles.accentBlock}>
          <div className={styles.accentHeader}>
            <h2 className={styles.appearancePanelTitle}>Цвет акцента</h2>
            <p className={styles.appearancePanelDescription}>
              Цвет кнопок, активных пунктов меню и выделения
            </p>
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
                    styles.swatch + (active ? " " + styles.swatchActive : "")
                  }
                  style={{ backgroundColor: item.cssVar }}
                  onClick={() => page.setAccent(item.id)}
                />
              );
            })}
          </div>
        </section>

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
