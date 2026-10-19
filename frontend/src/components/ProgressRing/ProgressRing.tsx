import { type SVGProps } from "react";
import styles from "./ProgressRing.module.css";

interface ProgressRingProps extends SVGProps<SVGSVGElement> {
  loading?: boolean;
  size?: number | string;
  progress?: number;
  strokeWidth?: number;
}

const ProgressRing = ({
  loading = false,
  size = 28,
  progress,
  strokeWidth = 2.5,
  className = "",
  ...props
}: ProgressRingProps) => {
  const isDeterminate = typeof progress === "number";

  const clampedProgress = isDeterminate
    ? Math.min(100, Math.max(0, progress))
    : 75;

  const radius = (24 - strokeWidth) / 2;

  const combinedClassName = [
    styles.ring,
    loading ? styles.visible : "",
    isDeterminate ? styles.determinate : styles.indeterminate,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      viewBox="0 0 24 24"
      className={combinedClassName}
      fill="none"
      role="progressbar"
      aria-hidden={!loading}
      aria-valuenow={isDeterminate ? clampedProgress : undefined}
      aria-valuemin={isDeterminate ? 0 : undefined}
      aria-valuemax={isDeterminate ? 100 : undefined}
      focusable="false"
      width={size}
      height={size}
      {...props}
    >
      {isDeterminate && (
        <circle
          className={styles.track}
          cx="12"
          cy="12"
          r={radius}
          strokeWidth={strokeWidth}
        />
      )}

      <circle
        className={styles.indicator}
        cx="12"
        cy="12"
        r={radius}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={100 - clampedProgress}
      />
    </svg>
  );
};

export default ProgressRing;
