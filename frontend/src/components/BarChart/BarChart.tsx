import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import styles from "./BarChart.module.css";

export interface BarChartItem {
  /** Уникальный ключ строки (например, id из БД). По умолчанию используется `label`. */
  key?: string | number;
  label: string;
  /** Числовое значение или `null`, если данных нет (пустая полоса и «—»). */
  value: number | null;
}

export interface BarChartProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  items: readonly BarChartItem[];
  /** Значение, которому соответствует полная полоса. По умолчанию наибольшее из значений. */
  max?: number;
  /** Подпись значения справа от полосы. По умолчанию число как есть. */
  formatValue?: (value: number) => string;
  /** Что показать, когда `items` пуст. */
  emptyContent?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const BarChart = forwardRef<HTMLDivElement, BarChartProps>(function BarChart(
  {
    items,
    max,
    formatValue = (v) => String(v),
    emptyContent = "Нет данных",
    className,
    style,
    "aria-label": ariaLabel,
    ...rest
  },
  ref,
) {
  if (items.length === 0) {
    return (
      <div
        ref={ref}
        className={["BodyTextBlockStyle", styles.empty, className]
          .filter(Boolean)
          .join(" ")}
        style={style}
        {...rest}
      >
        {emptyContent}
      </div>
    );
  }

  const computedMax = Math.max(
    0,
    ...items.map((i) =>
      i.value !== null && Number.isFinite(i.value) ? i.value : 0,
    ),
  );
  const top =
    max !== undefined && Number.isFinite(max) && max > 0 ? max : computedMax;

  return (
    <div
      {...rest}
      ref={ref}
      role="list"
      aria-label={ariaLabel}
      className={[styles.chart, className].filter(Boolean).join(" ")}
      style={style}
    >
      {items.map((item) => {
        const hasValidValue =
          item.value !== null && Number.isFinite(item.value);
        const share =
          hasValidValue && top > 0
            ? Math.max(0, Math.min(1, item.value! / top))
            : 0;
        const text = hasValidValue ? formatValue(item.value!) : "—";
        const now = hasValidValue
          ? Math.max(0, Math.min(top, item.value!))
          : undefined;

        return (
          <div
            key={item.key ?? item.label}
            role="listitem"
            className={styles.row}
          >
            <span
              className={`BodyTextBlockStyle \${styles.label}`}
              title={item.label}
            >
              {item.label}
            </span>
            <div
              className={styles.track}
              role="meter"
              aria-label={item.label}
              aria-valuemin={0}
              aria-valuemax={top}
              aria-valuenow={now}
              aria-valuetext={text}
            >
              <div
                className={styles.fill}
                style={{ width: `${share * 100}\%` }}
              />{" "}
            </div>{" "}
            <span className={`BodyTextBlockStyle ${styles.value}`}>{text}</span>
          </div>
        );
      })}
    </div>
  );
});

export default BarChart;
