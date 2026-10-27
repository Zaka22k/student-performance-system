import type { StudentStatus } from "@/models";

export const STATUS_OPTIONS: { value: StudentStatus; label: string }[] = [
  { value: "active", label: "Учится" },
  { value: "academic_leave", label: "Академический отпуск" },
  { value: "expelled", label: "Отчислен" },
  { value: "graduated", label: "Выпустился" },
];

export const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map((o) => [o.value, o.label]),
) as Record<StudentStatus, string>;
