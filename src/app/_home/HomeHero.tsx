import styles from "./Home.module.css";

const BAR_X = 600;
const BAR_WIDTH = 34;
const BAR_STEP = 56;
const BASE_Y = 262;

const BAR_HEIGHTS = [44, 64, 58, 88, 80, 112, 104, 140, 128];
const BAR_TONES = [styles.barAccent, styles.barTeal, styles.barIndigo];

const bars = BAR_HEIGHTS.map((height, i) => {
  const x = BAR_X + i * BAR_STEP;
  return {
    x,
    top: BASE_Y - height,
    tone: BAR_TONES[i % BAR_TONES.length],
    center: x + BAR_WIDTH / 2,
  };
});
const trend = bars.map((b) => ({ x: b.center, y: b.top - 22 }));
const last = trend[trend.length - 1];

const CHIPS = [
  { x: 300, y: 92, grade: "3" },
  { x: 372, y: 148, grade: "4" },
  { x: 300, y: 200, grade: "5" },
];

export default function HomeHero() {
  return (
    <div className={styles.hero} aria-hidden="true">
      <svg
        className={styles.heroSvg}
        viewBox="0 0 1200 280"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <circle className={styles.blobAccent} cx="170" cy="310" r="200" />
        <circle className={styles.blobIndigo} cx="1010" cy="0" r="170" />
        <circle className={styles.blobTeal} cx="600" cy="360" r="140" />

        {[110, 170, 230].map((y) => (
          <line
            key={y}
            className={styles.gridLine}
            x1="0"
            x2="1200"
            y1={y}
            y2={y}
          />
        ))}

        {bars.map((b) => (
          <rect
            key={b.x}
            className={b.tone}
            x={b.x}
            y={b.top}
            width={BAR_WIDTH}
            height={BASE_Y - b.top + 40}
            rx="9"
          />
        ))}

        <polyline
          className={styles.trend}
          points={trend.map((p) => `${p.x},${p.y}`).join(" ")}
        />
        {trend.slice(0, -1).map((p) => (
          <circle key={p.x} className={styles.dot} cx={p.x} cy={p.y} r="5" />
        ))}
        <g transform={`translate(${last.x} ${last.y})`}>
          <circle className={styles.badge} r="16" />
          <path className={styles.check} d="M-6 0.5 -1.5 5 6.5 -4.5" />
        </g>

        {CHIPS.map((c) => (
          <g
            key={`${c.x}-${c.y}`}
            transform={`translate(${c.x} ${c.y})`}
            className={styles.chip}
          >
            <rect className={styles.chipBox} width="48" height="48" rx="14" />
            <text className={styles.chipText} x="24" y="33" textAnchor="middle">
              {c.grade}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
