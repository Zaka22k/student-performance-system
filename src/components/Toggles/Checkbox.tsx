"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import type { ChangeEvent, ReactNode } from "react";
import { type ToggleBaseProps } from "./ToggeBaseProps";
import styles from "./Toggles.module.css";

export type CheckboxProps = ToggleBaseProps & {
  /**
   * Mixed state (a dash). Controlled by the parent: clear it in `onChange`.
   * Смешанное состояние (тире). Управляется родителем: сбрасывайте его в `onChange`.
   */
  indeterminate?: boolean;
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
      checked,
      defaultChecked,
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

    // Синхронизируем defaultChecked при обновлении стейта из useActionState
    useEffect(() => {
      if (
        checked === undefined &&
        defaultChecked !== undefined &&
        inputRef.current
      ) {
        inputRef.current.checked = defaultChecked;
      }
    }, [checked, defaultChecked]);

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
            checked={checked}
            defaultChecked={defaultChecked}
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
