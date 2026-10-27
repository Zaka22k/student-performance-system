import type { AssessmentType, Performance } from "@/models";

export const ASSESSMENT_TYPES: { value: AssessmentType; label: string }[] = [
  { value: "exam", label: "Экзамен" },
  { value: "credit", label: "Зачёт" },
  { value: "differentiated_credit", label: "Дифференцированный зачёт" },
  { value: "coursework", label: "Курсовая работа" },
];

export const ASSESSMENT_LABELS = Object.fromEntries(
  ASSESSMENT_TYPES.map((t) => [t.value, t.label]),
) as Record<AssessmentType, string>;

export const formatResult = (
  p: Pick<Performance, "assessment_type" | "grade" | "passed">,
) =>
  p.assessment_type === "credit"
    ? p.passed
      ? "Сдано"
      : "Не сдано"
    : String(p.grade ?? "—");
