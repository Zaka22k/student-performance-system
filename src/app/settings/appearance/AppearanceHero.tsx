import { createElement as h } from "react";
import styles from "./AppearancePage.module.css";

export default function AppearanceHero() {
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
        d: "M -60 200 C 280 260, 480 40, 880 170 C 1140 240, 1320 70, 1500 140 L 1500 280 L -60 280 Z",
      }),
      h("path", {
        className: styles.waveGlow,
        d: "M -40 210 C 240 80, 520 250, 880 70 C 1120 -50, 1340 160, 1480 50",
      }),
      h("path", {
        className: styles.waveRibbon,
        d: "M -40 210 C 240 80, 520 250, 880 70 C 1120 -50, 1340 160, 1480 50",
      }),
    ),
    h(
      "div",
      { className: styles.windowPreview },
      h("div", { className: styles.windowTitlebar }),
      h(
        "div",
        { className: styles.windowBody },
        h(
          "div",
          { className: styles.previewTopRow },
          h("span", { className: styles.previewPillPrimary }),
          h("span", { className: styles.previewAccentBadge }),
        ),
        h(
          "div",
          { className: styles.previewCenterBlock },
          h("span", { className: styles.previewLine, style: { width: "88%" } }),
          h("span", { className: styles.previewLine, style: { width: "62%" } }),
        ),
        h(
          "div",
          { className: styles.previewBottomRow },
          h(
            "div",
            { className: styles.previewSegment },
            h("span", {
              className: `${styles.previewSegmentItem} ${styles.previewSegmentActive}`,
            }),
            h("span", { className: styles.previewSegmentItem }),
          ),
          h("span", { className: styles.previewToggle }),
        ),
      ),
    ),
    h("div", { className: styles.vignetteOverlay }),
  );
}
