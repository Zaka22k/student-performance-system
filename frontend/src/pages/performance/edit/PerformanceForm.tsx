import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { ComboBox, TextField } from "@components";
import type { AssessmentType, Performance, PerformanceInput, PerformanceOptions } from "@models";
import { fullName, semesterLabel } from "@utils";
import { ASSESSMENT_TYPES } from "../constants";
import styles from "./EditPerformancePage.module.css";

interface Props {
  initial?: Performance; // нет — создание, есть — изменение
  options: PerformanceOptions;
  formRef: RefObject<HTMLFormElement | null>;
  isSaving: boolean;
  error: string | null;
  onSubmit: (data: PerformanceInput) => void | Promise<void>;
}

const RESULT_OPTIONS = [
  { value: "true", label: "Сдано" },
  { value: "false", label: "Не сдано" },
];

// 2026-01-11 в локальном часовом поясе (toISOString дал бы дату по UTC)
const todayISO = () => new Date().toLocaleDateString("sv-SE");

// ComboBox разрешает ввод своего текста, а нам нужен только вариант из списка
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
  initial,
  options,
  formRef,
  isSaving,
  error,
  onSubmit,
}: Props) {
  const { students, subjects, teachers, semesters } = options;
  const isEdit = initial !== undefined;

  const [studentId, setStudentId] = useState(initial?.student_id ?? "");
  const [subjectId, setSubjectId] = useState(initial?.subject_id ?? "");
  const [teacherId, setTeacherId] = useState(initial?.teacher_id ?? "");
  // Для новой записи предлагаем последний семестр (справочник упорядочен по времени)
  const [semesterId, setSemesterId] = useState(
    initial?.semester_id ?? semesters.at(-1)?.semester_id ?? "",
  );
  const [type, setType] = useState<string>(initial?.assessment_type ?? "exam");
  const [grade, setGrade] = useState(initial?.grade != null ? String(initial.grade) : "");
  const [passed, setPassed] = useState(initial?.passed === false ? "false" : "true");
  const [attempt, setAttempt] = useState(String(initial?.attempt_number ?? 1));
  const [date, setDate] = useState(initial?.assessment_date ?? todayISO());

  const isCredit = type === "credit";

  const studentRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const teacherRef = useRef<HTMLInputElement>(null);
  const semesterRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLInputElement>(null);

  useOptionValidity(
    studentRef,
    students.some((s) => s.student_id === studentId),
    "Выберите студента из списка",
  );
  useOptionValidity(
    subjectRef,
    subjects.some((s) => s.subject_id === subjectId),
    "Выберите дисциплину из списка",
  );
  useOptionValidity(
    teacherRef,
    teachers.some((t) => t.teacher_id === teacherId),
    "Выберите преподавателя из списка",
  );
  useOptionValidity(
    semesterRef,
    semesters.some((s) => s.semester_id === semesterId),
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); // браузер уже проверил поля, страницу перезагружать не нужно
    void onSubmit({
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
  };

  return (
    <form ref={formRef} className={styles.form} onSubmit={handleSubmit}>
      <section className={styles.section}>
        <h2 className={`BodyStrongTextBlockStyle ${styles.sectionTitle}`}>Что оценивается</h2>
        <div className={styles.grid}>
          <ComboBox
            ref={studentRef}
            className={`${styles.field} ${styles.fullRow}`}
            label="Студент"
            options={students}
            getOptionValue={(s) => s.student_id}
            getOptionLabel={(s) => `${fullName(s)} (${s.student_number})`}
            value={studentId}
            required
            placeholder="Начните вводить фамилию"
            onChange={(value) => setStudentId(value)}
            disabled={isSaving || isEdit}
          />
          <ComboBox
            ref={subjectRef}
            className={`${styles.field} ${styles.fullRow}`}
            label="Дисциплина"
            options={subjects}
            getOptionValue={(s) => s.subject_id}
            getOptionLabel={(s) => s.subject_name}
            value={subjectId}
            required
            placeholder="Выберите дисциплину"
            onChange={(value) => setSubjectId(value)}
            disabled={isSaving || isEdit}
          />
          <ComboBox
            ref={semesterRef}
            className={styles.field}
            label="Семестр"
            options={semesters}
            getOptionValue={(s) => s.semester_id}
            getOptionLabel={(s) => semesterLabel(s)}
            value={semesterId}
            required
            placeholder="Выберите семестр"
            onChange={(value) => setSemesterId(value)}
            disabled={isSaving || isEdit}
          />
          <ComboBox
            ref={typeRef}
            className={styles.field}
            label="Вид контроля"
            options={ASSESSMENT_TYPES}
            valueKey="value"
            labelKey="label"
            value={type}
            required
            placeholder="Выберите вид контроля"
            onChange={(value) => setType(value)}
            disabled={isSaving || isEdit}
          />
        </div>
        {isEdit && (
          <p className={`CaptionTextBlockStyle ${styles.hint}`}>
            Студент, дисциплина, семестр и вид контроля после создания записи не меняются. Чтобы
            изменить их, удалите запись и создайте новую.
          </p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={`BodyStrongTextBlockStyle ${styles.sectionTitle}`}>Результат</h2>
        <div className={styles.grid}>
          <ComboBox
            ref={teacherRef}
            className={`${styles.field} ${styles.fullRow}`}
            label="Преподаватель"
            options={teachers}
            getOptionValue={(t) => t.teacher_id}
            getOptionLabel={(t) => fullName(t)}
            value={teacherId}
            required
            placeholder="Выберите преподавателя"
            onChange={(value) => setTeacherId(value)}
            disabled={isSaving}
          />
          {isCredit ? (
            <ComboBox
              ref={resultRef}
              className={styles.field}
              label="Результат"
              options={RESULT_OPTIONS}
              valueKey="value"
              labelKey="label"
              value={passed}
              required
              onChange={(value) => setPassed(value)}
              disabled={isSaving}
            />
          ) : (
            <TextField
              className={styles.field}
              label="Оценка (от 2 до 5)"
              type="number"
              value={grade}
              required
              min={2}
              max={5}
              step={1}
              onChange={(e) => setGrade(e.target.value)}
              disabled={isSaving}
            />
          )}
          <TextField
            className={styles.field}
            label="Номер попытки (от 1 до 3)"
            type="number"
            value={attempt}
            required
            min={1}
            max={3}
            step={1}
            onChange={(e) => setAttempt(e.target.value)}
            disabled={isSaving}
          />
          <TextField
            className={styles.field}
            label="Дата"
            type="date"
            value={date}
            required
            onChange={(e) => setDate(e.target.value)}
            disabled={isSaving}
          />
        </div>
      </section>

      {error && (
        <div role="alert" className={`BodyTextBlockStyle ${styles.error}`}>
          {error}
        </div>
      )}
    </form>
  );
}
