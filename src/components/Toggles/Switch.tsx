"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type {
  ChangeEvent,
  CSSProperties,
  KeyboardEvent,
  ReactNode,
} from "react";
import { GlassPanel } from "../GlassPanel";
import { type ToggleBaseProps } from "./ToggeBaseProps";
import styles from "./Toggles.module.css";

/**
 * Props shared by Checkbox and Switch. Everything else goes to the native <input>.
 * Общие свойства Checkbox и Switch. Всё остальное уходит на нативный <input>.
 */

export type SwitchProps = ToggleBaseProps & {
  /**
   * `regular` is as tall as the other controls (32px); `mini` is for dense rows.
   * `regular` по высоте равен остальным элементам (32px); `mini` для плотных строк.
   */
  size?: "regular" | "mini";
};

const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(" ");

const hasLabel = (label: ReactNode): boolean =>
  label !== undefined && label !== null && label !== false;

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

const SWITCHING_FALLBACK_MS = 500;

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    label,
    labelPlacement = "end",
    size = "regular",
    className,
    style,
    disabled,
    checked,
    defaultChecked,
    onChange,
    onKeyDown,
    onKeyUp,
    onBlur,
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

  const g = SWITCH_SIZES[size];

  const [pressed, setPressed] = useState(false);
  const [sliding, setSliding] = useState(false);
  const switching = !disabled && (pressed || sliding);

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
          ref={setRefs}
          type="checkbox"
          role="switch"
          className={styles.input}
          disabled={disabled}
          checked={checked}
          defaultChecked={defaultChecked}
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
