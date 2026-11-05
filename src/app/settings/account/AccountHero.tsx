import { createElement as h } from "react";
import styles from "./AccountPage.module.css";

export default function AccountHero() {
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
        viewBox: "0 0 1440 260",
        fill: "none",
        preserveAspectRatio: "none",
      },
      h("path", {
        className: styles.waveBack,
        d: "M -60 210 C 240 120, 560 260, 920 140 C 1180 60, 1340 180, 1500 100 L 1500 280 L -60 280 Z",
      }),
      h("path", {
        className: styles.waveGlow,
        d: "M -40 150 C 280 240, 560 50, 900 170 C 1150 250, 1320 70, 1480 120",
      }),
      h("path", {
        className: styles.waveRibbon,
        d: "M -40 150 C 280 240, 560 50, 900 170 C 1150 250, 1320 70, 1480 120",
      }),
    ),
    h(
      "div",
      { className: styles.identityGlassCard },
      h(
        "div",
        { className: styles.identityOrbWrapper },
        h("span", { className: styles.identityOrbRing }),
        h(
          "div",
          { className: styles.identityOrb },
          h(
            "svg",
            {
              className: styles.identityShieldSvg,
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "1.8",
              strokeLinecap: "round",
              strokeLinejoin: "round",
            },
            h("path", {
              d: "M12 3l7 3v5c0 4.8-3 8.9-7 10-4-1.1-7-5.2-7-10V6l7-3z",
            }),
            h("path", { d: "m9.5 12 1.8 1.8 3.7-3.8" }),
          ),
        ),
        h("span", { className: styles.identityStatusDot }),
      ),
      h(
        "div",
        { className: styles.identityMeta },
        h("span", { className: styles.identityPrimaryBar }),
        h("span", { className: styles.identitySecondaryBar }),
        h(
          "div",
          { className: styles.identityKeyPills },
          h("span", { className: styles.identityKeyPillAccent }),
          h("span", { className: styles.identityKeyPill }),
          h("span", { className: styles.identityKeyPill }),
        ),
      ),
    ),
    h("div", { className: styles.vignetteOverlay }),
  );
}
