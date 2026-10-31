import type { Student } from "@/models";
import { STATUS_LABELS } from "./statuses";
import styles from "./StudentsPage.module.css";

interface StudentCardProps {
  student: Student;
  selected: boolean;
  active: boolean;
}

// В карточке мало места: «Академический отпуск» вытеснил бы номер, поэтому там короче
const STATUS_SHORT: Partial<Record<Student["status"], string>> = {
  academic_leave: "Отпуск",
};

// Фамилия и Имя Отчество на разных строках: так читается быстрее, чем одна длинная строка
const givenNames = (s: Student): string =>
  [s.first_name, s.middle_name].filter(Boolean).join(" ");

// «Иванов Иван» → «ИИ»
const initials = (s: Student): string =>
  `${s.last_name?.[0] ?? ""}${s.first_name?.[0] ?? ""}`.toUpperCase();

export default function StudentCard({ student, selected, active }: StudentCardProps) {
  const fullName = `${student.last_name} ${givenNames(student)}`.trim();
  const isActive = student.status === "active";

  return (
    <article
      className={styles.studentCard}
      data-selected={selected || undefined}
      data-active={active || undefined}
    >
      <div className={styles.identity}>
        <div className={styles.avatar} aria-hidden="true">
          {initials(student) || "?"}
        </div>
        <div className={styles.names} title={fullName}>
          <span className={styles.lastName}>{student.last_name}</span>
          <span className={`BodyTextBlockStyle ${styles.givenNames}`}>
            {givenNames(student)}
          </span>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={`CaptionTextBlockStyle ${styles.meta}`}>
          <span className={styles.groupTag}>{student.group_code}</span>
          <span className={styles.number}>№ {student.student_number}</span>
        </span>

        {/* Статус «Учится» — норма, его не показываем */}
        {!isActive && (
          <span
            className={`CaptionTextBlockStyle ${styles.status}`}
            title={STATUS_LABELS[student.status]}
          >
            <span
              className={`${styles.statusDot} ${styles[`status_${student.status}`] ?? ""}`}
              aria-hidden="true"
            />
            {STATUS_SHORT[student.status] ?? STATUS_LABELS[student.status]}
          </span>
        )}
      </div>
    </article>
  );
}
