import type { DataGridColumn } from "@ui-kit/components";
import type { Student } from "@/models";
import { formatDate, fullName } from "@/utils";
import { STATUS_LABELS } from "../statuses";
import styles from "./columns.module.css";

export const studentColumns: DataGridColumn<Student>[] = [
  {
    id: "student_number",
    header: "Номер",
    width: 130,
    cell: (s) => (
      <span className={`CaptionTextBlockStyle ${styles.numberBadge}`}>
        {s.student_number}
      </span>
    ),
  },
  {
    id: "full_name",
    header: "ФИО",
    width: 280,
    cell: (s) => {
      const name = fullName(s);
      return (
        <div
          className={styles.nameCell}
          title={s.email ? `${name} (${s.email})` : name}
        >
          <span
            className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.fullName}`}
          >
            {name}
          </span>
          {s.email && (
            <span className={`CaptionTextBlockStyle ${styles.emailSubtext}`}>
              {s.email}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "birth_date",
    header: "Дата рождения",
    width: 160,
    cell: (s) => (
      <span className={`BodyTextBlockStyle ${styles.dateText}`}>
        {formatDate(s.birth_date)}
      </span>
    ),
  },
  {
    id: "group_code",
    header: "Группа",
    width: 130,
    cell: (s) => (
      <span
        className={`CaptionTextBlockStyle ${styles.groupBadge}`}
        title={s.group_name}
      >
        {s.group_code}
      </span>
    ),
  },
  {
    id: "status",
    header: "Статус",
    cell: (s) => (
      <span
        className={`CaptionTextBlockStyle ${styles.statusPill} ${
          styles[`status_${s.status}`] ?? ""
        }`}
      >
        <span className={styles.statusDot} aria-hidden="true" />
        {STATUS_LABELS[s.status]}
      </span>
    ),
  },
];
