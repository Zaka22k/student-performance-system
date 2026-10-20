import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { ComboBox, TextField } from "@components";
import type { AssessmentType, SheetInput, SheetOptions } from "@models";
import { fullName, semesterLabel } from "@utils";
import { ASSESSMENT_TYPES } from "../../performance/constants";
import styles from "./SheetPage.module.css";

interface Props {
  options: SheetOptions;
  formRef: RefObject<HTMLFormElement | null>;
  isSaving: boolean;
  error: string | null;
  onSubmit: (data: SheetInput) => void | Promise<void>;
}

// 2026-01-11 в локальном часовом поясе (toISOString дал бы дату по UTC)
const todayISO = () => new Date().toLocaleDateString("sv-SE");

// ComboBox разрешает ввод своего текста, а нам нужен только вариант из списка
function useOptionValidity(ref: RefObject<HTMLInputElement | null>, valid: boolean, message: string) {
  useEffect(() => {
    ref.current?.setCustomValidity(valid ? "" : message);
  }, [ref, valid, message]);
}

export default function SheetForm({ options, formRef, isSaving, error, onSubmit }: Props) {
  const { groups, students, subjects, teachers, semesters } = options;

  const [groupId, setGroupId] = useState("");
  // По умолчанию последний семестр (справочник упорядочен по времени)
  const [semesterId, setSemesterId] = useState(semesters.at(-1)?.semester_id ?? "");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [type, setType] = useState<string>("exam");
  const [attempt, setAttempt] = useState("1");
  const [date, setDate] = useState(todayISO());
  const [grades, setGrades] = useState<Record<string, string>>({}); // id студента → оценка

  const isCredit = type === "credit";
  const groupSelected = groups.some((g) => g.group_id === groupId);
  // В ведомость попадают только студенты со статусом «Учится»
  const groupStudents = groupSelected
    ? students.filter((s) => s.group_id === groupId && s.status === "active")
    : [];

  const groupRef = useRef<HTMLInputElement>(null);
  const semesterRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const teacherRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLInputElement>(null);

  useOptionValidity(groupRef, groupSelected, "Выберите группу из списка");
  useOptionValidity(
    semesterRef,
    semesters.some((s) => s.semester_id === semesterId),
    "Выберите семестр из списка",
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
    typeRef,
    ASSESSMENT_TYPES.some((t) => t.value === type),
    "Выберите вид контроля из списка",
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); // браузер уже проверил поля, страницу перезагружать не нужно
    if (groupStudents.length === 0) return; // причина показана в карточке «Студенты»
    void onSubmit({
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
            grade: Number(grades[s.student_id]),
          })),
    });
  };

  return (
    <form ref={formRef} className={styles.form} onSubmit={handleSubmit}>
      <section className={styles.section}>
        <h2 className={`BodyStrongTextBlockStyle ${styles.sectionTitle}`}>Параметры ведомости</h2>
        <div className={styles.grid}>
          <ComboBox
            ref={groupRef}
            className={styles.field}
            label="Группа"
            options={groups}
            getOptionValue={(g) => g.group_id}
            getOptionLabel={(g) => g.group_code}
            value={groupId}
            required
            placeholder="Выберите группу"
            onChange={(value) => setGroupId(value)}
            disabled={isSaving}
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
            disabled={isSaving}
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
            disabled={isSaving}
          />
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
            disabled={isSaving}
          />
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

      <section className={styles.section}>
        <h2 className={`BodyStrongTextBlockStyle ${styles.sectionTitle}`}>Студенты</h2>

        {!groupSelected && (
          <p className={`BodyTextBlockStyle ${styles.hint}`}>
            Выберите группу, чтобы увидеть список студентов.
          </p>
        )}
        {groupSelected && groupStudents.length === 0 && (
          <p className={`BodyTextBlockStyle ${styles.hint}`}>
            В этой группе нет студентов со статусом «Учится», ведомость сформировать нельзя.
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
                    <td>{fullName(s)}</td>
                    <td className={styles.studentNumber}>{s.student_number}</td>
                    {!isCredit && (
                      <td className={styles.gradeCell}>
                        <TextField
                          className={styles.gradeInput}
                          aria-label={`Оценка: ${fullName(s)}`}
                          type="number"
                          value={grades[s.student_id] ?? ""}
                          required
                          min={2}
                          max={5}
                          step={1}
                          onChange={(e) =>
                            setGrades((prev) => ({ ...prev, [s.student_id]: e.target.value }))
                          }
                          disabled={isSaving}
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

      {error && (
        <div role="alert" className={`BodyTextBlockStyle ${styles.error}`}>
          {error}
        </div>
      )}
    </form>
  );
}
