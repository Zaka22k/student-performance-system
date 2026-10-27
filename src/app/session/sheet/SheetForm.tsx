"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { ComboBox, TextField } from "@ui-kit/components";
import { getErrorMessage, fullName, semesterLabel } from "@/utils";
import type { AssessmentType, SheetInput, SheetOptions } from "@/models";
import { ASSESSMENT_TYPES } from "../../performance/constants";
import styles from "./SheetPage.module.css";

interface Props {
  formId: string;
  options: SheetOptions;
  onPendingChange?: (isPending: boolean) => void;
  onSubmit: (data: SheetInput) => void | Promise<void>;
}

interface FormState {
  attempt: string;
  date: string;
  grades: Record<string, string>;
  error: string | null;
}

// YYYY-MM-DD в локальном часовом поясе
const todayISO = () => new Date().toLocaleDateString("sv-SE");

// ComboBox разрешает ввод своего текста, а нам нужен только вариант из списка
function useOptionValidity(
  ref: RefObject<HTMLInputElement | null>,
  valid: boolean,
  message: string,
) {
  useEffect(() => {
    ref.current?.setCustomValidity(valid ? "" : message);
  }, [ref, valid, message]);
}
export default function SheetForm({
  formId,
  options,
  onPendingChange,
  onSubmit,
}: Props) {
  const { groups, students, subjects, teachers, semesters } = options;

  // Управляемые состояния для фильтрации студентов выбранной группы и вида контроля
  const [groupId, setGroupId] = useState("");
  // В semesters.actions сортировка desc, поэтому первый элемент — самый свежий семестр
  const [semesterId, setSemesterId] = useState(semesters[0]?.semester_id ?? "");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [type, setType] = useState<string>("exam");

  const isCredit = type === "credit";
  const groupSelected = groups.some((g) => String(g.group_id) === groupId);

  // В ведомость попадают только студенты со статусом «Учится»
  const groupStudents = groupSelected
    ? students.filter(
        (s) => String(s.group_id) === groupId && s.status === "active",
      )
    : [];

  const groupRef = useRef<HTMLInputElement>(null);
  const semesterRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const teacherRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLInputElement>(null);

  useOptionValidity(groupRef, groupSelected, "Выберите группу из списка");
  useOptionValidity(
    semesterRef,
    semesters.some((s) => String(s.semester_id) === semesterId),
    "Выберите семестр из списка",
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
    typeRef,
    ASSESSMENT_TYPES.some((t) => t.value === type),
    "Выберите вид контроля из списка",
  );

  const submitRef = useRef(onSubmit);
  useEffect(() => {
    submitRef.current = onSubmit;
  });

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (prev, formData) => {
      const attempt = String(formData.get("attempt_number") ?? "1");
      const date = String(formData.get("assessment_date") ?? todayISO());

      const nextGrades: Record<string, string> = { ...prev.grades };
      for (const s of groupStudents) {
        const val = formData.get(`grade_${s.student_id}`);
        if (val !== null) {
          nextGrades[s.student_id] = String(val);
        }
      }

      if (groupStudents.length === 0) {
        return {
          attempt,
          date,
          grades: nextGrades,
          error:
            "В этой группе нет студентов со статусом «Учится», ведомость сформировать нельзя.",
        };
      }

      try {
        await submitRef.current({
          group_id: Number(groupId),
          subject_id: Number(subjectId),
          teacher_id: Number(teacherId),
          semester_id: Number(semesterId),
          assessment_type: type as AssessmentType,
          attempt_number: Number(attempt),
          assessment_date: date,
          grades: isCredit
            ? []
            : groupStudents.map((s) => ({
                student_id: Number(s.student_id),
                grade: Number(nextGrades[s.student_id]),
              })),
        });
        return { attempt, date, grades: nextGrades, error: null };
      } catch (e) {
        return {
          attempt,
          date,
          grades: nextGrades,
          error: getErrorMessage(e),
        };
      }
    },
    {
      attempt: "1",
      date: todayISO(),
      grades: {},
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
          Параметры ведомости
        </h2>
        <div className={styles.grid}>
          <ComboBox
            ref={groupRef}
            className={styles.field}
            label="Группа"
            name="group_id"
            options={groups}
            getOptionValue={(g) => String(g.group_id)}
            getOptionLabel={(g) => g.group_code}
            value={groupId}
            required
            placeholder="Выберите группу"
            onChange={(value) => setGroupId(value)}
            disabled={isPending}
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
            disabled={isPending}
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
            disabled={isPending}
          />
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
            disabled={isPending}
          />
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

      <section className={styles.section}>
        <h2 className={`BodyStrongTextBlockStyle ${styles.sectionTitle}`}>
          Студенты
        </h2>

        {!groupSelected && (
          <p className={`BodyTextBlockStyle ${styles.hint}`}>
            Выберите группу, чтобы увидеть список студентов.
          </p>
        )}
        {groupSelected && groupStudents.length === 0 && (
          <p className={`BodyTextBlockStyle ${styles.hint}`}>
            В этой группе нет студентов со статусом «Учится», ведомость
            сформировать нельзя.
          </p>
        )}

        {groupStudents.length > 0 && (
          <>
            <p className={`CaptionTextBlockStyle ${styles.hint}`}>
              {isCredit
                ? "Каждому студенту будет выставлено «Сдано». Изменить результат можно в журнале успеваемости."
                : "Укажите оценку каждому студенту. Запись без оценки база данных не принимает."}
            </p>
            <table className={`BodyTextBlockStyle ${styles.table}`}>
              <thead>
                <tr>
                  <th className={styles.num}>№</th>
                  <th>Студент</th>
                  <th>Номер</th>
                  {!isCredit && <th className={styles.gradeCell}>Оценка</th>}
                </tr>
              </thead>
              <tbody>
                {groupStudents.map((s, i) => (
                  <tr key={s.student_id}>
                    <td className={styles.num}>{i + 1}</td>
                    <td className="BodyStrongTextBlockStyle">{fullName(s)}</td>
                    <td className={styles.studentNumber}>
                      <span
                        className={`CaptionTextBlockStyle ${styles.numberBadge}`}
                      >
                        {s.student_number}
                      </span>
                    </td>
                    {!isCredit && (
                      <td className={styles.gradeCell}>
                        <TextField
                          className={styles.gradeInput}
                          aria-label={`Оценка: ${fullName(s)}`}
                          name={`grade_${s.student_id}`}
                          type="number"
                          defaultValue={state.grades[s.student_id] ?? ""}
                          required
                          min={2}
                          max={5}
                          step={1}
                          disabled={isPending}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      {state.error && (
        <div role="alert" className={`BodyTextBlockStyle ${styles.error}`}>
          {state.error}
        </div>
      )}
    </form>
  );
}
