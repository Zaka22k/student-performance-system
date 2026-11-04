import type { CSSProperties } from "react";
import styles from "./Login.module.css";

// Фрагмент экзаменационной ведомости: оценки, зачёты («зач») и ещё не
// выставленные ячейки («-»). Чисто декоративный и без случайных значений,
// чтобы серверная и клиентская разметка совпадали.
const SHEET = [
  "5 4 зач 5 - 4 5 зач - 5 - -",
  "4 5 5 3 зач 5 - 4 5 - 4 -",
  "5 зач 4 5 5 - 5 3 4 5 - -",
  "зач 5 4 4 5 зач 4 - 5 4 5 -",
  "5 5 3 зач 4 5 - 5 5 - 4 5",
  "4 зач 5 5 5 4 4 5 зач 5 - 4",
  "5 5 4 3 зач 5 4 4 5 5 5 4",
].map((row) => row.split(" "));

const LAST_ROW = SHEET.length - 1;
const STEP_MS = 40;

function markKind(mark: string): string | undefined {
  if (mark === "5") return "top";
  if (mark === "зач") return "credit";
  return undefined;
}

export default function LoginSheet() {
  return (
    <div className={styles.marks}>
      {SHEET.flatMap((row, r) =>
        row.map((mark, c) => (
          <span
            key={`${r}-${c}`}
            className={styles.mark}
            data-kind={markKind(mark)}
            style={
              {
                // Оценки проявляются по диагонали от нижнего левого угла.
                "--delay": `${(c + (LAST_ROW - r)) * STEP_MS}ms`,
              } as CSSProperties
            }
          >
            {mark === "-" ? "" : mark}
          </span>
        )),
      )}
    </div>
  );
}
