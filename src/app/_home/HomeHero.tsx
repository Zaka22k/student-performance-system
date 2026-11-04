import styles from "./Home.module.css";

const WIDTH = 720;
const HEIGHT = 260;
const BASELINE = 150;
const BAR_X = 134;
const BAR_W = 24;
const BAR_STEP = 46;
const RADIUS = 7;
const HEIGHTS = [24, 34, 30, 46, 42, 58, 52, 70, 64, 82];

const bars = HEIGHTS.map((h, i) => {
  const x = BAR_X + i * BAR_STEP;
  const top = BASELINE - h;
  const d =
    `M${x} ${BASELINE}V${top + RADIUS}a${RADIUS} ${RADIUS} 0 0 1 ${RADIUS} ${-RADIUS}` +
    `h${BAR_W - 2 * RADIUS}a${RADIUS} ${RADIUS} 0 0 1 ${RADIUS} ${RADIUS}V${BASELINE}Z`;
  return { x, top, d, center: x + BAR_W / 2 };
});

const pts = bars.map((b) => ({ x: b.center, y: b.top - 16 }));
let trend = `M${pts[0].x} ${pts[0].y}`;
for (let i = 0; i < pts.length - 1; i++) {
  const p0 = pts[i - 1] ?? pts[i];
  const p1 = pts[i];
  const p2 = pts[i + 1];
  const p3 = pts[i + 2] ?? p2;
  trend +=
    `C${(p1.x + (p2.x - p0.x) / 6).toFixed(1)} ${(p1.y + (p2.y - p0.y) / 6).toFixed(1)} ` +
    `${(p2.x - (p3.x - p1.x) / 6).toFixed(1)} ${(p2.y - (p3.y - p1.y) / 6).toFixed(1)} ${p2.x} ${p2.y}`;
}
const last = pts[pts.length - 1];

export default function HomeHero() {
  return (
    <div className={styles.hero} aria-hidden="true">
      <svg
        className={styles.heroSvg}
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        focusable="false"
      >
        <g className={styles.panelShadow}>
          <rect
            className={styles.panel}
            x="96"
            y="40"
            width="520"
            height="240"
            rx="22"
          />
        </g>

        {[84, 117].map((y) => (
          <line
            key={y}
            className={styles.gridLine}
            x1="116"
            x2="596"
            y1={y}
            y2={y}
          />
        ))}
        <line
          className={styles.baseLine}
          x1="116"
          x2="596"
          y1={BASELINE}
          y2={BASELINE}
        />

        {bars.map((b, i) => (
          <path
            key={b.x}
            className={
              i === bars.length - 1
                ? styles.barCurrent
                : i >= bars.length - 3
                  ? styles.barRecent
                  : styles.bar
            }
            d={b.d}
          />
        ))}

        <path className={styles.trend} d={trend} />
        <circle className={styles.pointHalo} cx={last.x} cy={last.y} r="10" />
        <circle className={styles.point} cx={last.x} cy={last.y} r="4.5" />
      </svg>
    </div>
  );
}
