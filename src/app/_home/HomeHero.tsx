import { createElement as h } from "react";
import styles from "./HomeHero.module.css";

export default function HomeHero() {
  return h(
    "div",
    { className: styles.hero, "aria-hidden": "true" },
    h(
      "div",
      { className: styles.meshContainer },
      h("div", { className: styles.blobAccent }),
      h("div", { className: styles.blobCyan }),
      h("div", { className: styles.blobTeal }),
      h("div", { className: styles.blobIndigoPurple }),
      h("div", { className: styles.blobWarm }),
    ),
    h(
      "svg",
      {
        className: styles.fluidSvg,
        viewBox: "0 0 1440 240",
        fill: "none",
        preserveAspectRatio: "none",
      },
      h("path", {
        className: styles.waveBack,
        d: "M -60 170 C 280 230, 480 30, 880 140 C 1140 210, 1320 60, 1500 120 L 1500 240 L -60 240 Z",
      }),
      h("path", {
        className: styles.waveGlow,
        d: "M -40 190 C 240 70, 520 220, 880 60 C 1120 -50, 1340 140, 1480 40",
      }),
      h("path", {
        className: styles.waveRibbon,
        d: "M -40 190 C 240 70, 520 220, 880 60 C 1120 -50, 1340 140, 1480 40",
      }),
    ),
    h("div", { className: styles.vignetteOverlay }),
  );
}
