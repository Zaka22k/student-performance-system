import { createElement as h } from "react";
import styles from "./Login.module.css";

export default function LoginSheet() {
  return h(
    "div",
    { className: styles.heroCanvas, "aria-hidden": "true" },
    // 1. Многоцветные дрейфующие пятна Aurora
    h(
      "div",
      { className: styles.meshContainer },
      h("div", { className: styles.blobAccent }),
      h("div", { className: styles.blobCyan }),
      h("div", { className: styles.blobTeal }),
      h("div", { className: styles.blobIndigoPurple }),
      h("div", { className: styles.blobWarm }),
    ),

    // 2. Полноэкранные каустические волны Apple
    h(
      "svg",
      {
        className: styles.fluidSvg,
        viewBox: "0 0 1200 900",
        fill: "none",
        preserveAspectRatio: "none",
      },
      h(
        "defs",
        null,
        h(
          "linearGradient",
          { id: "loginWave1", x1: "0%", y1: "100%", x2: "100%", y2: "0%" },
          h("stop", {
            offset: "0%",
            stopColor: "var(--control-accent)",
            stopOpacity: "0.48",
          }),
          h("stop", {
            offset: "50%",
            stopColor: "var(--system-cyan)",
            stopOpacity: "0.28",
          }),
          h("stop", {
            offset: "100%",
            stopColor: "var(--system-indigo)",
            stopOpacity: "0.05",
          }),
        ),
        h(
          "linearGradient",
          { id: "loginWave2", x1: "100%", y1: "90%", x2: "0%", y2: "10%" },
          h("stop", {
            offset: "0%",
            stopColor: "var(--system-purple)",
            stopOpacity: "0.35",
          }),
          h("stop", {
            offset: "55%",
            stopColor: "var(--system-pink)",
            stopOpacity: "0.22",
          }),
          h("stop", {
            offset: "100%",
            stopColor: "var(--system-teal)",
            stopOpacity: "0.04",
          }),
        ),
        h(
          "linearGradient",
          { id: "loginRibbon", x1: "0%", y1: "100%", x2: "100%", y2: "0%" },
          h("stop", {
            offset: "0%",
            stopColor: "var(--control-accent)",
            stopOpacity: "0.75",
          }),
          h("stop", {
            offset: "45%",
            stopColor: "var(--system-cyan)",
            stopOpacity: "0.85",
          }),
          h("stop", {
            offset: "80%",
            stopColor: "var(--system-purple)",
            stopOpacity: "0.65",
          }),
          h("stop", {
            offset: "100%",
            stopColor: "var(--system-orange)",
            stopOpacity: "0.4",
          }),
        ),
      ),
      h("path", {
        d: "M -80 780 C 260 880, 520 420, 880 560 C 1060 630, 1160 360, 1280 420 L 1280 960 L -80 960 Z",
        fill: "url(#loginWave2)",
      }),
      h("path", {
        d: "M -60 820 C 220 520, 480 760, 820 420 C 1020 220, 1140 460, 1260 240",
        stroke: "url(#loginWave1)",
        strokeWidth: "110",
        strokeLinecap: "round",
        style: { filter: "blur(36px)" },
      }),
      h("path", {
        d: "M -60 820 C 220 520, 480 760, 820 420 C 1020 220, 1140 460, 1260 240",
        stroke: "url(#loginRibbon)",
        strokeWidth: "2.5",
        strokeLinecap: "round",
        opacity: "0.65",
      }),
    ),

    // 3. Текстурный плёночный шум (Grain)
    h(
      "svg",
      { className: styles.grainOverlay, width: "100%", height: "100%" },
      h(
        "filter",
        { id: "loginGrainFilter" },
        h("feTurbulence", {
          type: "fractalNoise",
          baseFrequency: "0.75",
          numOctaves: "3",
          stitchTiles: "stitch",
        }),
        h("feColorMatrix", { type: "saturate", values: "0" }),
      ),
      h("rect", {
        width: "100%",
        height: "100%",
        filter: "url(#loginGrainFilter)",
      }),
    ),

    // 4. Мягкая виньетка
    h("div", { className: styles.vignetteOverlay }),
  );
}
