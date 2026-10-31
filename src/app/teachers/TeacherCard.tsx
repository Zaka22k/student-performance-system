import type { Teacher } from "@/models";
import styles from "./TeachersPage.module.css";

interface TeacherCardProps {
  teacher: Teacher;
  selected: boolean;
  active: boolean;
}

// Фамилия и Имя Отчество на разных строках: так читается быстрее, чем одна длинная строка
const givenNames = (t: Teacher): string =>
  [t.first_name, t.middle_name].filter(Boolean).join(" ");

// «Смирнов Олег» → «СО»
const initials = (t: Teacher): string =>
  `${t.last_name?.[0] ?? ""}${t.first_name?.[0] ?? ""}`.toUpperCase();

export default function TeacherCard({ teacher, selected, active }: TeacherCardProps) {
  const fullName = `${teacher.last_name} ${givenNames(teacher)}`.trim();
  const count = teacher.attestations_count ?? 0;

  return (
    <article
      className={styles.teacherCard}
      data-selected={selected || undefined}
      data-active={active || undefined}
    >
      <div className={styles.identity}>
        <div className={styles.avatar} aria-hidden="true">
          {initials(teacher) || "?"}
        </div>
        <div className={styles.names} title={fullName}>
          <span className={styles.lastName}>{teacher.last_name}</span>
          <span className={`BodyTextBlockStyle ${styles.givenNames}`}>
            {givenNames(teacher)}
          </span>
        </div>
      </div>

      <div className={styles.footer}>
        <span
          className={`CaptionTextBlockStyle ${styles.email} ${
            teacher.email ? "" : styles.emailMissing
          }`}
          title={teacher.email || undefined}
        >
          {teacher.email || "Почта не указана"}
        </span>
        <span
          className={`CaptionTextBlockStyle ${styles.count} ${
            count > 0 ? "" : styles.countEmpty
          }`}
          title={`Проведено аттестаций: ${count}`}
        >
          {count} аттест.
        </span>
      </div>
    </article>
  );
}
