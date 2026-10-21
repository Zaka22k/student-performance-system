import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type {
  CSSProperties,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from "react";
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
  /** Helper text shown below the input field. / Текст подсказки снизу поля ввода. */
  hint?: ReactNode;
  /** Class of the root element. / Класс корневого элемента. */
  className?: string;
  /** Style of the root element. / Стиль корневого элемента. */
  style?: CSSProperties;
};

export type SearchFieldMode = "auto" | "default" | "compact";

export type GlassSearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> & {
  size?: number;
  width?: number | string;
  /**
   * Режим отображения:
   * - "default" — поле всегда развёрнуто на свою ширину
   * - "compact" — свёрнуто до иконки поиска, но разворачивается при фокусе или наличии текста
   * - "auto" — автоматически переключается между "default" и "compact" в зависимости от доступного места
   */
  mode?: SearchFieldMode;
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
      hint,
      className,
      style,
      disabled,
      id,
      type = "text",
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) {
    const baseId = useId();
    const inputId = id ?? `\${baseId}-input`;
    const hintId = `\${baseId}-hint`;
    const hasHint = hint !== undefined && hint !== null;

    const describedBy =
      [ariaDescribedBy, hasHint ? hintId : undefined]
        .filter(Boolean)
        .join(" ") || undefined;

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

        <div className={styles.fieldWrapper}>
          {/* <label>: клик по иконкам и отступам тоже фокусирует input */}
          <label className={styles.control}>
            {startIcon && <span className={styles.icon}>{startIcon}</span>}
            <input
              {...props}
              ref={ref}
              id={inputId}
              type={type}
              disabled={disabled}
              aria-describedby={describedBy}
              className={cx(styles.input, "BodyTextBlockStyle")}
            />
            {endIcon && <span className={styles.icon}>{endIcon}</span>}
          </label>

          {hasHint && (
            <div
              id={hintId}
              className={cx(styles.hint, "CaptionTextBlockStyle")}
            >
              {hint}
            </div>
          )}
        </div>
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
      mode = "default",
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      onClick,
      onClear,
      clearLabel = "Очистить поиск",
      placeholder = "Поиск…",
      disabled,
      ...props
    },
    forwardedRef,
  ) {
    const innerRef = useRef<HTMLInputElement | null>(null);
    const innerWrapRef = useRef<HTMLDivElement | null>(null);

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
    const [isFocused, setIsFocused] = useState(false);
    const [autoCompact, setAutoCompact] = useState(false);

    const hasValue = isControlled
      ? String(value).length > 0
      : uncontrolledHasValue;

    // В режиме "auto" следим за доступным местом в родительском контейнере и шириной экрана:
    // если места меньше требуемой ширины поля (или экран <= 768px), переключаемся в "compact".
    useEffect(() => {
      if (mode !== "auto") {
        setAutoCompact(false);
        return;
      }

      const panelEl = innerWrapRef.current?.parentElement;
      const containerEl = panelEl?.parentElement;
      const targetWidth =
        typeof width === "number" ? width : parseFloat(String(width)) || 280;

      const checkSpace = () => {
        if (window.innerWidth <= 768) {
          setAutoCompact(true);
          return;
        }
        if (!containerEl || !panelEl) {
          setAutoCompact(false);
          return;
        }

        // Вычисляем, сколько места занято соседними элементами в том же контейнере
        const containerStyle = window.getComputedStyle(containerEl);
        const paddingInline =
          (parseFloat(containerStyle.paddingLeft) || 0) +
          (parseFloat(containerStyle.paddingRight) || 0);
        const gap =
          parseFloat(containerStyle.columnGap || containerStyle.gap) || 0;

        let siblingsWidth = 0;
        let visibleChildrenCount = 0;

        for (const child of Array.from(containerEl.children)) {
          if (child === panelEl) {
            visibleChildrenCount++;
            continue;
          }
          const childEl = child as HTMLElement;
          const childStyle = window.getComputedStyle(childEl);
          if (
            childStyle.display === "none" ||
            childStyle.position === "absolute" ||
            childStyle.position === "fixed"
          ) {
            continue;
          }
          visibleChildrenCount++;
          siblingsWidth += childEl.getBoundingClientRect().width;
        }

        const totalGaps = Math.max(0, visibleChildrenCount - 1) * gap;
        const availableWidth =
          containerEl.clientWidth - paddingInline - siblingsWidth - totalGaps;

        setAutoCompact(availableWidth < targetWidth);
      };

      checkSpace();

      const observer = new ResizeObserver(checkSpace);
      if (containerEl) {
        observer.observe(containerEl);
      }
      window.addEventListener("resize", checkSpace);

      return () => {
        observer.disconnect();
        window.removeEventListener("resize", checkSpace);
      };
    }, [mode, width]);

    const effectiveMode: "default" | "compact" =
      mode === "auto" ? (autoCompact ? "compact" : "default") : mode;

    // В режиме compact поле свёрнуто до иконки, но разворачивается при фокусе или наличии текста
    const isCollapsed = effectiveMode === "compact" && !isFocused && !hasValue;

    const effectiveWidth = isCollapsed ? size : width;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setUncontrolledHasValue(e.target.value.length > 0);
      }
      onChange?.(e);
    };

    const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape" && effectiveMode === "compact" && !hasValue) {
        e.currentTarget.blur();
      }
      onKeyDown?.(e);
    };

    const handleInnerClick = (e: MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (e.target !== innerRef.current) {
        innerRef.current?.focus();
      }
    };

    const handleClear = (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
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
        className={cx(
          styles.glassPanel,
          isCollapsed && styles.glassPanelCollapsed,
          className,
        )}
        style={style}
        width={effectiveWidth}
        height={size}
      >
        <div
          ref={innerWrapRef}
          className={styles.glassInner}
          onClick={handleInnerClick}
        >
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
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={onClick}
            placeholder={placeholder}
            disabled={disabled}
            aria-label={props["aria-label"] ?? placeholder}
            className={cx(styles.glassInput, "BodyTextBlockStyle")}
          />
          {!isCollapsed && hasValue && !disabled && (
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
