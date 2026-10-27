"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type {
  ChangeEvent,
  CSSProperties,
  InputHTMLAttributes,
  MouseEvent,
  ReactNode,
} from "react";
import { LiquidGlass } from "../LiquidGlass";
import styles from "./Fields.module.css";

/* ───────────── Типы ───────────── */

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  /** Icon before the text. / Иконка перед текстом. */
  startIcon?: ReactNode;
  /** Icon after the text. / Иконка после текста. */
  endIcon?: ReactNode;
  /** Introductory label. / Вводная подпись. */
  label?: ReactNode;
  /** Where the label sits: above the field or before it. / Где стоит подпись: над полем или перед ним. */
  labelPlacement?: "top" | "start";
  /** Helper text shown below the input field. / Текст подсказки снизу поля ввода. */
  hint?: ReactNode;
  /** Validation error state or message. / Ошибка валидации: подсвечивает рамку красным и выводит текст ошибки вместо `hint`. */
  error?: ReactNode | boolean;
  /** Class of the root element. / Класс корневого элемента. */
  className?: string;
  /** Style of the root element. / Стиль корневого элемента. */
  style?: CSSProperties;
};

export type SearchFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> & {
  /** Height of the field in pixels. / Высота строки в пикселях. */
  size?: number;
  /** Width of the field. / Ширина строки. */
  width?: number | string;
  /** Called after the clear button is pressed. / Вызывается после нажатия на кнопку очистки. */
  onClear?: () => void;
  /** Accessible name and tooltip of the clear button. / Доступное имя и всплывающая подсказка кнопки очистки. */
  clearLabel?: string;
  /** Class of the glass panel. / Класс стеклянной панели. */
  className?: string;
  /** Style of the glass panel. / Стиль стеклянной панели. */
  style?: CSSProperties;
};

/* ───────────── Утилиты ───────────── */

/*
 * The glass tint is drawn by the panel itself and read from --search-tint, which the CSS module
 * changes on hover, focus and disabled.
 * Заливку стекла рисует сама панель, цвет берётся из --search-tint, который CSS-модуль меняет
 * при наведении, фокусе и disabled.
 */
const SEARCH_TINT: CSSProperties = { backgroundColor: "var(--search-tint)" };

const cx = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(" ");

const hasContent = (node: ReactNode): boolean =>
  node !== undefined && node !== null && node !== false && node !== "";

/* ───────────── Иконки ───────────── */

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
      hint,
      error,
      className,
      style,
      disabled,
      id,
      type = "text",
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) {
    const baseId = useId();
    const inputId = id ?? `${baseId}-input`;
    const hintId = `${baseId}-hint`;
    const hasLabel = hasContent(label);

    const isInvalid =
      Boolean(error) || ariaInvalid === true || ariaInvalid === "true";
    const feedbackMessage =
      typeof error !== "boolean" && hasContent(error) ? error : hint;
    const hasFeedback = hasContent(feedbackMessage);

    const describedBy =
      [ariaDescribedBy, hasFeedback ? hintId : undefined]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div
        className={cx(
          styles.root,
          labelPlacement === "start" && styles.labelStart,
          disabled && styles.disabled,
          isInvalid && styles.invalid,
          className,
        )}
        style={style}
      >
        {hasLabel && (
          <label
            className={cx(styles.label, "BodyTextBlockStyle")}
            htmlFor={inputId}
          >
            {label}
          </label>
        )}

        <div className={styles.fieldWrapper}>
          <label className={styles.control}>
            {startIcon && <span className={styles.icon}>{startIcon}</span>}
            <input
              {...props}
              ref={ref}
              id={inputId}
              type={type}
              disabled={disabled}
              aria-describedby={describedBy}
              aria-invalid={isInvalid || undefined}
              className={cx(styles.input, "BodyTextBlockStyle")}
            />
            {endIcon && <span className={styles.icon}>{endIcon}</span>}
          </label>

          {hasFeedback && (
            <div
              id={hintId}
              className={cx(styles.hint, "CaptionTextBlockStyle")}
            >
              {feedbackMessage}
            </div>
          )}
        </div>
      </div>
    );
  },
);

/* ───────────── 2. Стеклянная строка поиска (SearchField) ───────────── */

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
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
      "aria-label": ariaLabel,
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

    const prevDefaultValueRef = useRef(defaultValue);
    if (prevDefaultValueRef.current !== defaultValue) {
      prevDefaultValueRef.current = defaultValue;
      if (!isControlled) {
        setUncontrolledHasValue(
          Boolean(defaultValue && String(defaultValue).length > 0),
        );
      }
    }

    useEffect(() => {
      const input = innerRef.current;
      const formEl = input?.form;
      if (!formEl) return;

      const handleReset = () => {
        if (!isControlled) {
          setUncontrolledHasValue(
            Boolean(defaultValue && String(defaultValue).length > 0),
          );
        }
      };

      formEl.addEventListener("reset", handleReset);
      return () => formEl.removeEventListener("reset", handleReset);
    }, [isControlled, defaultValue]);

    const hasValue = isControlled
      ? String(value).length > 0
      : uncontrolledHasValue;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setUncontrolledHasValue(e.target.value.length > 0);
      onChange?.(e);
    };

    const handleClear = () => {
      const input = innerRef.current;
      if (!input || disabled) return;

      const setNativeValue = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      setNativeValue?.call(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));

      onClear?.();
      input.focus();
    };

    const keepInputFocus = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
    };

    return (
      <LiquidGlass
        // Hover glow only: the press scale is set to 1 in the CSS module. Off when disabled.
        // Только свечение при наведении: масштаб при нажатии равен 1 в CSS-модуле. Выключено при disabled.
        interactive={!disabled}
        className={cx(styles.searchPanel, className)}
        style={{ ...SEARCH_TINT, ...style }}
        width={width}
        height={size}
      >
        <label className={styles.searchInner}>
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
            aria-label={ariaLabel ?? placeholder}
            className={styles.searchInput}
          />
          {hasValue && !disabled && (
            <button
              type="button"
              aria-label={clearLabel}
              title={clearLabel}
              onMouseDown={keepInputFocus}
              onClick={handleClear}
              className={styles.clearButton}
            >
              <ClearIcon />
            </button>
          )}
        </label>
      </LiquidGlass>
    );
  },
);
