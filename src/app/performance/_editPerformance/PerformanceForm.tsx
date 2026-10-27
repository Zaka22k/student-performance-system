"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { ComboBox, TextField, Button } from "@/components";
import { getErrorMessage, fullName, semesterLabel } from "@/utils";
import type {
  AssessmentType,
  Performance,
  PerformanceInput,
  PerformanceOptions,
} from "@/models";
import { ASSESSMENT_TYPES } from "../constants";
import styles from "./EditPerformancePage.module.css";

interface Props {
  formId: string;
  initial?: Performance; // нет — создание, есть — изменение
  options: PerformanceOptions;
  onPendingChange?: (isPending: boolean) => void;
  onSubmit: (data: PerformanceInput) => void | Promise<void>;
  onDelete: () => void;
}

interface FormState {
  grade: string;
  attempt: string;
  date: string;
  error: string | null;
}

const RESULT_OPTIONS = [
  { value: "true", label: "Сдано" },
  { value: "false", label: "Не сдано" },
];

const todayISO = () => new Date().toLocaleDateString("sv-SE");

function useOptionValidity(
  ref: RefObject<HTMLInputElement | null>,
  valid: boolean,
  message: string,
  active = true,
) {
  useEffect(() => {
    ref.current?.setCustomValidity(active && !valid ? message : "");
  }, [ref, valid, message, active]);
}
export default function PerformanceForm({
  formId,
  initial,
  options,
  onPendingChange,
  onSubmit,
  onDelete,
}: Props) {
  const { students, subjects, teachers, semesters } = options;
  const isEdit = initial !== undefined;

  const [studentId, setStudentId] = useState(initial?.student_id ?? "");
  const [subjectId, setSubjectId] = useState(initial?.subject_id ?? "");
  const [teacherId, setTeacherId] = useState(initial?.teacher_id ?? "");

  const [semesterId, setSemesterId] = useState(
    initial?.semester_id ?? semesters[0]?.semester_id ?? "",
  );
  const [type, setType] = useState<string>(initial?.assessment_type ?? "exam");
  const [passed, setPassed] = useState(
    initial?.passed === false ? "false" : "true",
  );

  const isCredit = type === "credit";

  const studentRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const teacherRef = useRef<HTMLInputElement>(null);
  const semesterRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLInputElement>(null);

  useOptionValidity(
    studentRef,
    students.some((s) => String(s.student_id) === studentId),
    "Выберите студента из списка",
  );
  useOptionValidity(
    subjectRef,
    subjects.some((s) => String(s.subject_id) === subjectId),
    "Выберите дисциплину из списка",
  );
  useOptionValidity(
    teacherRef,
    teachers.some((t) => String(t.teacher_id) === teacherId),
    "Выберите преподавателя из списка",
  );
  useOptionValidity(
    semesterRef,
    semesters.some((s) => String(s.semester_id) === semesterId),
    "Выберите семестр из списка",
  );
  useOptionValidity(
    typeRef,
    ASSESSMENT_TYPES.some((t) => t.value === type),
    "Выберите вид контроля из списка",
  );
  useOptionValidity(
    resultRef,
    RESULT_OPTIONS.some((o) => o.value === passed),
    "Выберите результат из списка",
    isCredit,
  );

  const submitRef = useRef(onSubmit);
  useEffect(() => {
    submitRef.current = onSubmit;
  });

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (prev, formData) => {
      const grade = isCredit ? prev.grade : String(formData.get("grade") ?? "");
      const attempt = String(formData.get("attempt_number") ?? "1");
      const date = String(formData.get("assessment_date") ?? todayISO());

      try {
        await submitRef.current({
          student_id: Number(studentId),
          subject_id: Number(subjectId),
          teacher_id: Number(teacherId),
          semester_id: Number(semesterId),
          assessment_type: type as AssessmentType,
          grade: isCredit ? null : Number(grade),
          passed: isCredit ? passed === "true" : null,
          attempt_number: Number(attempt),
          assessment_date: date,
        });
        return { grade, attempt, date, error: null };
      } catch (e) {
        return {
          grade,
          attempt,
          date,
          error: getErrorMessage(e),
        };
      }
    },
    {
      grade: initial?.grade != null ? String(initial.grade) : "",
      attempt: String(initial?.attempt_number ?? 1),
      date: initial?.assessment_date ?? todayISO(),
      error: null,
    },
  );

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);
  return (
    <form id={formId} action={formAction} className={styles.form}>
      <section className={styles.section}>
        <h2 className={`BodyStrongTextBlockStyle ${styles.sectionTitle}`}>
          Что оценивается
        </h2>
        <div className={styles.grid}>
          <ComboBox
            ref={studentRef}
            className={`${styles.field} ${styles.fullRow}`}
            label="Студент"
            name="student_id"
            options={students}
            getOptionValue={(s) => String(s.student_id)}
            getOptionLabel={(s) => `${fullName(s)} (${s.student_number})`}
            value={studentId}
            required
            placeholder="Начните вводить фамилию"
            onChange={(value) => setStudentId(value)}
            disabled={isPending || isEdit}
          />
          <ComboBox
            ref={subjectRef}
            className={`${styles.field} ${styles.fullRow}`}
            label="Дисциплина"
            name="subject_id"
            options={subjects}
            getOptionValue={(s) => String(s.subject_id)}
            getOptionLabel={(s) => s.subject_name}
            value={subjectId}
            required
            placeholder="Выберите дисциплину"
            onChange={(value) => setSubjectId(value)}
            disabled={isPending || isEdit}
          />
          <ComboBox
            ref={semesterRef}
            className={styles.field}
            label="Семестр"
            name="semester_id"
            options={semesters}
            getOptionValue={(s) => String(s.semester_id)}
            getOptionLabel={(s) => semesterLabel(s)}
            value={semesterId}
            required
            placeholder="Выберите семестр"
            onChange={(value) => setSemesterId(value)}
            disabled={isPending || isEdit}
          />
          <ComboBox
            ref={typeRef}
            className={styles.field}
            label="Вид контроля"
            name="assessment_type"
            options={ASSESSMENT_TYPES}
            valueKey="value"
            labelKey="label"
            value={type}
            required
            placeholder="Выберите вид контроля"
            onChange={(value) => setType(value)}
            disabled={isPending || isEdit}
          />
        </div>
        {isEdit && (
          <p className={`CaptionTextBlockStyle ${styles.hint}`}>
            Студент, дисциплина, семестр и вид контроля после создания записи не
            меняются. Чтобы изменить их, удалите запись и создайте новую.
          </p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={`BodyStrongTextBlockStyle ${styles.sectionTitle}`}>
          Результат
        </h2>
        <div className={styles.grid}>
          <ComboBox
            ref={teacherRef}
            className={`${styles.field} ${styles.fullRow}`}
            label="Преподаватель"
            name="teacher_id"
            options={teachers}
            getOptionValue={(t) => String(t.teacher_id)}
            getOptionLabel={(t) => fullName(t)}
            value={teacherId}
            required
            placeholder="Выберите преподавателя"
            onChange={(value) => setTeacherId(value)}
            disabled={isPending}
          />
          {isCredit ? (
            <ComboBox
              ref={resultRef}
              className={styles.field}
              label="Результат"
              name="passed"
              options={RESULT_OPTIONS}
              valueKey="value"
              labelKey="label"
              value={passed}
              required
              onChange={(value) => setPassed(value)}
              disabled={isPending}
            />
          ) : (
            <TextField
              className={styles.field}
              label="Оценка (от 2 до 5)"
              name="grade"
              type="number"
              defaultValue={state.grade}
              required
              min={2}
              max={5}
              step={1}
              disabled={isPending}
            />
          )}
          <TextField
            className={styles.field}
            label="Номер попытки (от 1 до 3)"
            name="attempt_number"
            type="number"
            defaultValue={state.attempt}
            required
            min={1}
            max={3}
            step={1}
            disabled={isPending}
          />
          <TextField
            className={styles.field}
            label="Дата"
            name="assessment_date"
            type="date"
            defaultValue={state.date}
            required
            disabled={isPending}
          />
        </div>
      </section>

      {isEdit && (
        <Button
          type="button"
          appearance="destructive"
          onClick={onDelete}
          disabled={isPending}
          width="max-content"
        >
          Удалить запись
        </Button>
      )}

      {state.error && (
        <div role="alert" className={`BodyTextBlockStyle ${styles.error}`}>
          {state.error}
        </div>
      )}
    </form>
  );
}
