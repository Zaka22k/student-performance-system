"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { GlassPanel } from "../GlassPanel";
import styles from "./Button.module.css";

export type ButtonAppearance = "normal" | "primary" | "destructive";

const buttonStyles: Record<ButtonAppearance, string> = {
  normal: styles.normal,
  primary: styles.primary,
  destructive: styles.destructive,
};

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
>;

type ButtonContentProps =
  | { children?: ReactNode; icon?: never }
  | { children?: never; icon: ReactNode; "aria-label": string };

export type ButtonProps = NativeButtonProps &
  ButtonContentProps & {
    appearance?: ButtonAppearance;
    width?: number | string;
    height?: number | string;
  };

const cx = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(" ");

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    appearance = "normal",
    icon,
    children,
    className,
    style,
    type = "button",
    width = "auto",
    height = 36,
    ...props
  },
  ref,
) {
  const isIconOnly = icon != null;

  return (
    <GlassPanel
      className={cx(styles.panel, className)}
      style={style}
      width={isIconOnly ? height : width}
      height={height}
    >
      <button
        {...props}
        ref={ref}
        type={type}
        className={cx(
          styles.root,
          buttonStyles[appearance],
          isIconOnly && styles.iconOnly,
          "BodyTextBlockStyle",
        )}
      >
        {isIconOnly ? <span className={styles.icon}>{icon}</span> : children}
      </button>
    </GlassPanel>
  );
});

export default Button;
