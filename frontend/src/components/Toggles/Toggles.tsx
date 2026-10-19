import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type {
  ChangeEvent,
  CSSProperties,
  InputHTMLAttributes,
  KeyboardEvent,
  ReactNode,
} from "react";
import { GlassPanel } from "../GlassPanel";
import styles from "./Toggles.module.css";

/**
 * Props shared by Checkbox and Switch. Everything else goes to the native <input>.
 * Общие свойства Checkbox и Switch. Всё остальное уходит на нативный <input>.
 */
type ToggleBaseProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "role" | "size" | "children" | "className" | "style"
> & {
  /**
   * Text next to the control. Without it, pass `aria-label`.
   * Подпись рядом с элементом. Если её нет, передайте `aria-label`.
   */
  label?: ReactNode;
  /**
   * Where the label sits: after the control (default, as in HIG) or before it.
   * Где стоит подпись: после элемента (по умолчанию, как в HIG) или перед ним.
   */
  labelPlacement?: "end" | "start";
  /** Class of the root element. / Класс корневого элемента. */
  className?: string;
  /** Style of the root element. / Стиль корневого элемента. */
  style?: CSSProperties;
};

export type CheckboxProps = ToggleBaseProps & {
  /**
   * Mixed state (a dash). Controlled by the parent: clear it in `onChange`.
   * Смешанное состояние (тире). Управляется родителем: сбрасывайте его в `onChange`.
   */
  indeterminate?: boolean;
};

export type SwitchProps = ToggleBaseProps & {
  /**
   * `regular` is as tall as the other controls (32px); `mini` is for dense rows.
   * `regular` по высоте равен остальным элементам (32px); `mini` для плотных строк.
   */
  size?: "regular" | "mini";
};

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(" ");

const hasLabel = (label: ReactNode): boolean =>
  label !== undefined && label !== null && label !== false;

/* ───────────── 1. Чекбокс (Checkbox) ───────────── */

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      label,
      labelPlacement = "end",
      indeterminate = false,
      className,
      style,
      disabled,
      onChange,
      ...rest
    },
    forwardedRef,
  ) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    // `indeterminate` is a DOM property, not an HTML attribute: set it by hand.
    // `indeterminate` — свойство DOM, а не атрибут HTML: выставляем вручную.
    useIsomorphicLayoutEffect(() => {
      if (inputRef.current) inputRef.current.indeterminate = indeterminate;
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      // A click makes the browser clear the mixed state; the parent owns it.
      // Клик заставляет браузер сбросить смешанное состояние; им владеет родитель.
      e.currentTarget.indeterminate = indeterminate;
    };

    return (
      <label
        className={cx(
          styles.root,
          styles.checkboxRoot,
          labelPlacement === "start" && styles.labelStart,
          disabled && styles.disabled,
          className,
        )}
        style={style}
      >
        <span className={styles.control}>
          <input
            {...rest}
            ref={setRefs}
            type="checkbox"
            className={styles.input}
            disabled={disabled}
            onChange={handleChange}
          />
          <span className={styles.box} aria-hidden="true">
            <svg
              className={styles.glyph}
              viewBox="0 0 16 16"
              focusable="false"
              aria-hidden="true"
            >
              <path
                className={styles.check}
                d="M3.5 8.5 6.8 11.5 12.5 4.5"
                pathLength={1}
              />
              <path className={styles.dash} d="M4 8h8" pathLength={1} />
            </svg>
          </span>
        </span>
        {hasLabel(label) && (
          <span className={cx(styles.label, "BodyTextBlockStyle")}>
            {label}
          </span>
        )}
      </label>
    );
  },
);

/* ───────────── 2. Свичер (Switch) ───────────── */

/**
 * Geometry of the switch in px. The only place with these numbers: CSS gets them as variables,
 * GlassPanel gets them as props. The thumb is never resized, only moved, so the glass maps are built once.
 * Геометрия свичера в px. Единственное место с этими числами: CSS получает их переменными,
 * GlassPanel — свойствами. Ползунок не меняет размер, а только двигается, поэтому карты стекла строятся один раз.
 */
const SWITCH_SIZES = {
  regular: {
    width: 56,
    height: 32,
    thumbWidth: 36,
    thumbHeight: 28,
    inset: 2,
    bezel: 12,
    glassHeight: 20,
    specularWidth: 2,
  },
  mini: {
    width: 45,
    height: 22,
    thumbWidth: 22,
    thumbHeight: 18,
    inset: 2,
    bezel: 8,
    glassHeight: 13,
    specularWidth: 1.5,
  },
} as const;

const THUMB_SHADOW = "0 2px 6px rgba(0, 0, 0, 0.35)";

/**
 * If the slide never reports its end (nothing moved, or animations are off), the thumb
 * becomes opaque again after this many ms.
 * Если окончание движения не придёт (ничего не сдвинулось или анимации выключены),
 * ползунок снова станет непрозрачным через столько мс.
 */
const SWITCHING_FALLBACK_MS = 500;

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    label,
    labelPlacement = "end",
    size = "mini",
    className,
    style,
    disabled,
    onChange,
    onKeyDown,
    onKeyUp,
    onBlur,
    ...rest
  },
  ref,
) {
  const g = SWITCH_SIZES[size];

  // The thumb is see-through while it is being pressed and while it slides.
  // Ползунок почти прозрачен, пока его нажимают и пока он едет.
  const [pressed, setPressed] = useState(false);
  const [sliding, setSliding] = useState(false);
  const switching = !disabled && (pressed || sliding);

  useEffect(() => {
    if (!sliding) return;
    const timer = window.setTimeout(
      () => setSliding(false),
      SWITCHING_FALLBACK_MS,
    );
    return () => window.clearTimeout(timer);
  }, [sliding]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    if (!prefersReducedMotion()) setSliding(true);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.key === " " && !disabled) setPressed(true);
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyUp?.(e);
    if (e.key === " ") setPressed(false);
  };

  const rootStyle = {
    "--switch-width": `${g.width}px`,
    "--switch-height": `${g.height}px`,
    "--switch-thumb-width": `${g.thumbWidth}px`,
    "--switch-inset": `${g.inset}px`,
    ...style,
  } as CSSProperties;

  return (
    <label
      className={cx(
        styles.root,
        styles.switchRoot,
        labelPlacement === "start" && styles.labelStart,
        disabled && styles.disabled,
        switching && styles.switching,
        className,
      )}
      style={rootStyle}
      onPointerDown={() => {
        if (!disabled) setPressed(true);
      }}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
    >
      <span className={styles.control}>
        <input
          {...rest}
          ref={ref}
          type="checkbox"
          role="switch"
          className={styles.input}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onBlur={(e) => {
            onBlur?.(e);
            setPressed(false);
          }}
        />
        <span className={styles.track} aria-hidden="true" />
        <span
          className={styles.thumbSlot}
          aria-hidden="true"
          onTransitionEnd={(e) => {
            if (e.propertyName === "transform") setSliding(false);
          }}
        >
          <GlassPanel
            className={styles.thumb}
            width={g.thumbWidth}
            height={g.thumbHeight}
            bezel={g.bezel}
            glassHeight={g.glassHeight}
            specularWidth={g.specularWidth}
            fallbackBlur={8}
            boxShadow={THUMB_SHADOW}
          />
        </span>
      </span>
      {hasLabel(label) && (
        <span className={cx(styles.label, "BodyTextBlockStyle")}>{label}</span>
      )}
    </label>
  );
});
