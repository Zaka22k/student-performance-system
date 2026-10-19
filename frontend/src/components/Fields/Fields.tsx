import { forwardRef, useCallback, useId, useRef, useState } from "react";
import type { CSSProperties, InputHTMLAttributes, ReactNode } from "react";
import { GlassPanel } from "../GlassPanel";
import styles from "./Fields.module.css";

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  /** Icon before the text. / Иконка перед текстом. */
  startIcon?: ReactNode;
  /** Icon after the text. / Иконка после текста. */
  endIcon?: ReactNode;
  /**
   * Introductory label. Per HIG, use title-style capitalization and end it with a colon.
   * Вводная подпись. По HIG: заглавные буквы как в заголовке и двоеточие в конце.
   */
  label?: ReactNode;
  /**
   * Where the label sits: above the field or before it (macOS style).
   * Где стоит подпись: над полем или перед ним (как в macOS).
   */
  labelPlacement?: "top" | "start";
  /** Class of the root element. / Класс корневого элемента. */
  className?: string;
  /** Style of the root element. / Стиль корневого элемента. */
  style?: CSSProperties;
};

export type GlassSearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> & {
  size?: number;
  width?: number | string;
  onClear?: () => void;
  clearLabel?: string;
};

const cx = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(" ");

/* ───────────── Встроенные SVG-иконки для поиска ───────────── */

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="20"
      height="20"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="8.75"
        cy="8.75"
        r="5.25"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M12.75 12.75 16.5 16.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4.5 4.5l7 7M11.5 4.5l-7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ───────────── 1. Обычное поле ввода (TextField) ───────────── */

export const TextField = forwardRef<HTMLInputElement, FieldProps>(
  function TextField(
    {
      startIcon,
      endIcon,
      label,
      labelPlacement = "top",
      className,
      style,
      disabled,
      id,
      type = "text",
      ...props
    },
    ref,
  ) {
    const baseId = useId();
    const inputId = id ?? `${baseId}-input`;

    return (
      <div
        className={cx(
          styles.root,
          labelPlacement === "start" && styles.labelStart,
          disabled && styles.disabled,
          className,
        )}
        style={style}
      >
        {label !== undefined && label !== null && (
          <label
            className={cx(styles.label, "BodyTextBlockStyle")}
            htmlFor={inputId}
          >
            {label}
          </label>
        )}

        {/* <label>: клик по иконкам и отступам тоже фокусирует input */}
        <label className={styles.control}>
          {startIcon && <span className={styles.icon}>{startIcon}</span>}
          <input
            {...props}
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            className={cx(styles.input, "BodyTextBlockStyle")}
          />
          {endIcon && <span className={styles.icon}>{endIcon}</span>}
        </label>
      </div>
    );
  },
);

/* ───────────── 2. Стеклянная строка поиска (GlassSearchInput) ───────────── */

export const SearchField = forwardRef<HTMLInputElement, GlassSearchInputProps>(
  function SearchField(
    {
      className,
      style,
      size = 36,
      width = 280,
      value,
      defaultValue,
      onChange,
      onClear,
      clearLabel = "Очистить поиск",
      placeholder = "Поиск…",
      disabled,
      ...props
    },
    forwardedRef,
  ) {
    const innerRef = useRef<HTMLInputElement | null>(null);
    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    const isControlled = value !== undefined;
    const [uncontrolledHasValue, setUncontrolledHasValue] = useState(() =>
      Boolean(defaultValue && String(defaultValue).length > 0),
    );

    const hasValue = isControlled
      ? String(value).length > 0
      : uncontrolledHasValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setUncontrolledHasValue(e.target.value.length > 0);
      }
      onChange?.(e);
    };

    const handleClear = () => {
      const input = innerRef.current;
      if (!input || disabled) return;

      // Вызываем нативный сеттер, чтобы React корректно отследил событие input/change
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      nativeInputValueSetter?.call(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));

      if (!isControlled) setUncontrolledHasValue(false);
      onClear?.();
      input.focus();
    };

    return (
      <GlassPanel
        className={cx(styles.glassPanel, className)}
        style={style}
        width={width}
        height={size}
      >
        <div className={styles.glassInner}>
          <span className={styles.searchIcon}>
            <SearchIcon />
          </span>
          <input
            {...props}
            ref={setRefs}
            type="search"
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cx(styles.glassInput, "BodyTextBlockStyle")}
          />
          {hasValue && !disabled && (
            <button
              type="button"
              aria-label={clearLabel}
              title={clearLabel}
              onClick={handleClear}
              className={styles.clearButton}
            >
              <ClearIcon />
            </button>
          )}
        </div>
      </GlassPanel>
    );
  },
);
