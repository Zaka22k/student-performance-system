// src/schemas/dictionaries.ts
import { z } from "zod";

const requiredString = (max: number, name: string) =>
  z
    .string()
    .trim()
    .min(1, `Поле «${name}» обязательно для заполнения`)
    .max(max, `Поле «${name}»: максимум ${max} символов`);

const nullableString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .default(null);

// Соответствует chk_students_email и chk_teachers_email из init.sql
const nullableEmail = z
  .string()
  .trim()
  .max(254)
  .refine(
    (v) =>
      v === "" || /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i.test(v),
    "Некорректный адрес электронной почты",
  )
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional()
  .default(null);

const isValidIsoDate = (v: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
};

const isoDateToDate = (label: string) =>
  z
    .string()
    .trim()
    .refine(isValidIsoDate, `Укажите корректную дату (${label})`)
    .transform((v) => new Date(`${v}T00:00:00.000Z`));

// 1. Группы (public.student_groups)
export const groupSchema = z.object({
  group_code: requiredString(20, "Код группы"),
  group_name: requiredString(100, "Название группы"),
  education_program: requiredString(200, "Направление"),
  admission_year: z.coerce
    .number()
    .int()
    .min(2000, "Год набора должен быть от 2000 до 2100")
    .max(2100, "Год набора должен быть от 2000 до 2100"),
});

// 2. Преподаватели (public.teachers)
export const teacherSchema = z.object({
  last_name: requiredString(50, "Фамилия"),
  first_name: requiredString(50, "Имя"),
  middle_name: nullableString(50),
  email: nullableEmail,
});

// 3. Дисциплины (public.subjects: chk_subjects_hours > 0, chk_subjects_credits 0..30)
export const subjectSchema = z.object({
  subject_code: requiredString(20, "Код дисциплины"),
  subject_name: requiredString(150, "Название дисциплины"),
  total_hours: z.coerce
    .number()
    .int()
    .min(1, "Количество часов должно быть больше 0")
    .max(32767, "Слишком большое количество часов"),
  credits: z.coerce
    .number()
    .min(0, "Зачётные единицы не могут быть меньше 0")
    .max(30, "Зачётные единицы не могут превышать 30")
    .transform((v) => Math.round(v * 10) / 10),
});

// 4. Семестры (public.semesters: chk_semesters_year 2000..2100, chk_semesters_term 1|2, start_date < end_date)
export const semesterSchema = z
  .object({
    academic_year_start: z.coerce
      .number()
      .int()
      .min(2000, "Год начала должен быть от 2000 до 2100")
      .max(2100, "Год начала должен быть от 2000 до 2100"),
    term_number: z.coerce
      .number()
      .int()
      .refine(
        (v): v is 1 | 2 => v === 1 || v === 2,
        "Номер семестра должен быть 1 или 2",
      ),
    start_date: isoDateToDate("начало семестра"),
    end_date: isoDateToDate("окончание семестра"),
  })
  .refine((data) => data.start_date < data.end_date, {
    message: "Дата окончания семестра должна быть позже даты начала",
    path: ["end_date"],
  });

// 5. Студенты (public.students: student_number varchar(20), chk_students_birth_date 1900..2100)
export const studentSchema = z.object({
  student_number: requiredString(20, "Номер студенческого"),
  last_name: requiredString(50, "Фамилия"),
  first_name: requiredString(50, "Имя"),
  middle_name: nullableString(50),
  birth_date: z
    .string()
    .trim()
    .refine(isValidIsoDate, "Укажите корректную дату рождения")
    .refine(
      (v) => v >= "1900-01-01" && v <= "2100-12-31",
      "Дата рождения должна быть в пределах 1900–2100 гг.",
    )
    .transform((v) => new Date(`${v}T00:00:00.000Z`)),
  email: nullableEmail,
  status: z.enum(["active", "academic_leave", "expelled", "graduated"]),
  group_id: z.coerce
    .number()
    .int()
    .min(1, "Выберите группу")
    .transform((v) => BigInt(v)),
});
