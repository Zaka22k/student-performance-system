import styles from "./SettingsPage.module.css";

const WIDTH = 720;
const HEIGHT = 260;
const PX = 330;
const PW = 340;
const ACCENTS = [
  "green",
  "blue",
  "indigo",
  "purple",
  "pink",
  "red",
  "orange",
  "yellow",
] as const;

export default function SettingsHero() {
  return (
    <div className={styles.hero} aria-hidden="true">
      <svg
        className={styles.heroSvg}
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        focusable="false"
      >
        <circle className={styles.ringSolid} cx="250" cy="120" r="92" />
        <circle className={styles.ringDashed} cx="250" cy="120" r="122" />

        <g className={styles.panelShadow}>
          <rect
            className={styles.panel}
            x={PX}
            y="62"
            width={PW}
            height="220"
            rx="22"
          />
        </g>

        <rect
          className={styles.track}
          x={PX + 20}
          y="82"
          width={PW - 40}
          height="32"
          rx="10"
        />
        <rect
          className={styles.segment}
          x={PX + 20 + (PW - 40) / 3 + 2}
          y="84"
          width={(PW - 40) / 3 - 4}
          height="28"
          rx="8"
        />
        {[0, 1, 2].map((i) => {
          const cx = PX + 20 + ((PW - 40) / 3) * (i + 0.5);
          return (
            <rect
              key={i}
              className={i === 1 ? styles.segLabelActive : styles.segLabel}
              x={cx - 22}
              y="95"
              width="44"
              height="6"
              rx="3"
            />
          );
        })}

        <line
          className={styles.sep}
          x1={PX + 20}
          x2={PX + PW - 20}
          y1="134"
          y2="134"
        />

        {ACCENTS.map((name, i) => {
          const cx = PX + 34 + i * 38;
          return (
            <g key={name}>
              <circle
                cx={cx}
                cy="160"
                r="8"
                style={{ fill: `var(--system-${name})` }}
              />
            </g>
          );
        })}

        <line
          className={styles.sep}
          x1={PX + 20}
          x2={PX + PW - 20}
          y1="186"
          y2="186"
        />

        <rect
          className={styles.segLabel}
          x={PX + 20}
          y="208"
          width="96"
          height="7"
          rx="3.5"
        />
        <rect
          className={styles.switchOn}
          x={PX + PW - 66}
          y="199"
          width="46"
          height="26"
          rx="13"
        />
        <circle className={styles.knob} cx={PX + PW - 30} cy="212" r="10" />
      </svg>
    </div>
  );
}
