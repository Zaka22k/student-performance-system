// src/schemas/performance.ts
import { z } from "zod";

const bigIntId = (label: string) =>
  z.coerce
    .number()
    .int()
    .min(1, `Укажите: ${label}`)
    .transform((v) => BigInt(v));

const isValidIsoDate = (v: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
};

const assessmentDateSchema = z
  .string()
  .trim()
  .refine(isValidIsoDate, "Укажите корректную дату")
  .transform((v) => new Date(`${v}T00:00:00.000Z`));

export const assessmentTypeSchema = z.enum([
  "exam",
  "credit",
  "differentiated_credit",
  "coursework",
]);

const optionalGradeSchema = z
  .preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z
      .number()
      .int("Укажите оценку от 2 до 5")
      .min(2, "Укажите оценку от 2 до 5")
      .max(5, "Укажите оценку от 2 до 5")
      .nullable(),
  )
  .optional();

// Схема создания/редактирования записи успеваемости (сразу заменяет normalize() из performance.js)
export const performanceInputSchema = z
  .object({
    student_id: bigIntId("студент"),
    subject_id: bigIntId("дисциплина"),
    teacher_id: bigIntId("преподаватель"),
    semester_id: bigIntId("семестр"),
    assessment_type: assessmentTypeSchema,
    grade: optionalGradeSchema,
    passed: z.boolean().nullable().optional(),
    attempt_number: z.coerce.number().int().min(1).max(3),
    assessment_date: assessmentDateSchema,
  })
  .superRefine((val, ctx) => {
    if (val.assessment_type === "credit") {
      if (typeof val.passed !== "boolean") {
        ctx.addIssue({
          code: "custom",
          message: "Укажите, сдан ли зачёт",
          path: ["passed"],
        });
      }
    } else {
      if (typeof val.grade !== "number") {
        ctx.addIssue({
          code: "custom",
          message: "Укажите оценку от 2 до 5",
          path: ["grade"],
        });
      }
    }
  })
  .transform((val) => ({
    ...val,
    grade: val.assessment_type === "credit" ? null : (val.grade ?? null),
    passed: val.assessment_type === "credit" ? (val.passed ?? null) : null,
  }));

// Схема формирования ведомости группы (session/sheet)
export const sheetInputSchema = z.object({
  group_id: bigIntId("группа"),
  subject_id: bigIntId("дисциплина"),
  teacher_id: bigIntId("преподаватель"),
  semester_id: bigIntId("семестр"),
  assessment_type: assessmentTypeSchema,
  attempt_number: z.coerce.number().int().min(1).max(3),
  assessment_date: assessmentDateSchema,
  grades: z
    .array(
      z.object({
        student_id: z.coerce.number().int().min(1),
        grade: z.coerce.number().int().min(2).max(5),
      }),
    )
    .max(500)
    .optional()
    .default([]),
});
