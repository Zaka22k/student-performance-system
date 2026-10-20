import type { CSSProperties, ReactNode } from "react";
import styles from "./BarChart.module.css";

export interface BarChartItem {
  label: string;
  value: number | null; // null — данных нет: пустая полоса и «—»
}

export interface BarChartProps {
  items: BarChartItem[];
  /** Значение, которому соответствует полная полоса. По умолчанию наибольшее из значений. */
  max?: number;
  /** Подпись значения справа от полосы. По умолчанию число как есть. */
  formatValue?: (value: number) => string;
  /** Что показать, когда items пуст */
  emptyContent?: ReactNode;
  "aria-label"?: string;
  className?: string;
  style?: CSSProperties;
}

export default function BarChart({
  items,
  max,
  formatValue = (v) => String(v),
  emptyContent = "Нет данных",
  className,
  style,
  "aria-label": ariaLabel,
}: BarChartProps) {
  if (items.length === 0) {
    return <div className={`BodyTextBlockStyle ${styles.empty}`}>{emptyContent}</div>;
  }

  const top = max ?? Math.max(0, ...items.map((i) => i.value ?? 0));

  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className={[styles.chart, className].filter(Boolean).join(" ")}
      style={style}
    >
      {items.map((item) => {
        const share = item.value !== null && top > 0 ? Math.min(1, item.value / top) : 0;
        const text = item.value === null ? "—" : formatValue(item.value);
        return (
          <div key={item.label} role="listitem" className={styles.row}>
            <span className={`BodyTextBlockStyle ${styles.label}`} title={item.label}>
              {item.label}
            </span>
            <div
              className={styles.track}
              role="meter"
              aria-label={item.label}
              aria-valuemin={0}
              aria-valuemax={top}
              aria-valuenow={item.value ?? undefined}
              aria-valuetext={text}
            >
              <div className={styles.fill} style={{ width: `${share * 100}%` }} />
            </div>
            <span className={`BodyTextBlockStyle ${styles.value}`}>{text}</span>
          </div>
        );
      })}
    </div>
  );
}
