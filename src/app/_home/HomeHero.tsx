import styles from "./Home.module.css";

const WIDTH = 760;
const HEIGHT = 260;
const BASELINE = 192;
const BAR_X = 72;
const BAR_W = 24;
const BAR_STEP = 47;
const RADIUS = 7;
const HEIGHTS = [28, 42, 36, 52, 46, 61, 54, 74, 68, 88, 80, 106];

const bars = HEIGHTS.map((height, index) => {
  const x = BAR_X + index * BAR_STEP;
  const top = BASELINE - height;
  const d =
    "M" + x + " " + BASELINE +
    "V" + (top + RADIUS) +
    "a" + RADIUS + " " + RADIUS + " 0 0 1 " + RADIUS + " " + -RADIUS +
    "h" + (BAR_W - 2 * RADIUS) +
    "a" + RADIUS + " " + RADIUS + " 0 0 1 " + RADIUS + " " + RADIUS +
    "V" + BASELINE + "Z";

  return { x, top, d, center: x + BAR_W / 2 };
});

const points = bars.map((bar) => ({ x: bar.center, y: bar.top - 14 }));
let trend = "M" + points[0].x + " " + points[0].y;

for (let index = 0; index < points.length - 1; index++) {
  const previous = points[index - 1] ?? points[index];
  const current = points[index];
  const next = points[index + 1];
  const following = points[index + 2] ?? next;

  trend +=
    "C" +
    (current.x + (next.x - previous.x) / 6).toFixed(1) + " " +
    (current.y + (next.y - previous.y) / 6).toFixed(1) + " " +
    (next.x - (following.x - current.x) / 6).toFixed(1) + " " +
    (next.y - (following.y - current.y) / 6).toFixed(1) + " " +
    next.x + " " + next.y;
}

const lastPoint = points[points.length - 1];

export default function HomeHero() {
  return (
    <div className={styles.hero} aria-hidden="true">
      <svg
        className={styles.heroSvg}
        width={WIDTH}
        height={HEIGHT}
        viewBox={"0 0 " + WIDTH + " " + HEIGHT}
        focusable="false"
      >
        <g className={styles.panelShadow}>
          <rect
            className={styles.heroPanel}
            x="26"
            y="34"
            width="670"
            height="202"
            rx="24"
          />
        </g>

        <g className={styles.chartHeader}>
          <circle cx="58" cy="62" r="4" />
          <circle cx="73" cy="62" r="4" />
          <circle cx="88" cy="62" r="4" />
          <path d="M112 62h76" />
          <path d="M620 62h42" />
        </g>

        {[91, 130, 169].map((y) => (
          <line
            key={y}
            className={styles.gridLine}
            x1="52"
            x2="670"
            y1={y}
            y2={y}
          />
        ))}

        <line
          className={styles.baseLine}
          x1="52"
          x2="670"
          y1={BASELINE}
          y2={BASELINE}
        />

        {bars.map((bar, index) => (
          <path
            key={bar.x}
            className={
              index === bars.length - 1
                ? styles.barCurrent
                : index >= bars.length - 4
                  ? styles.barRecent
                  : styles.bar
            }
            d={bar.d}
          />
        ))}

        <path className={styles.trend} d={trend} />
        <circle
          className={styles.pointHalo}
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="12"
        />
        <circle
          className={styles.point}
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="4.5"
        />
      </svg>
    </div>
  );
}
