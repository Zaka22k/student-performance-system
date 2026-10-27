import type { DataGridColumn } from "@/components";
import type { Teacher } from "@/models";
import { fullName } from "@/utils";
import styles from "./columns.module.css";

function getInitials(t: Teacher): string {
  const first = t.last_name?.[0] ?? "";
  const second = t.first_name?.[0] ?? "";
  return `${first}${second}`;
}

export const teacherColumns: DataGridColumn<Teacher>[] = [
  {
    id: "full_name",
    header: "ФИО",
    width: 300,
    cell: (t) => {
      const name = fullName(t);
      return (
        <div className={styles.teacherCell} title={name}>
          <span
            className={`CaptionTextBlockStyle ${styles.avatar}`}
            aria-hidden="true"
          >
            {getInitials(t)}
          </span>
          <span
            className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.fullName}`}
          >
            {name}
          </span>
        </div>
      );
    },
  },
  {
    id: "email",
    header: "Email",
    width: 280,
    cell: (t) =>
      t.email ? (
        <span
          className={`CaptionTextBlockStyle ${styles.emailBadge}`}
          title={t.email}
        >
          {t.email}
        </span>
      ) : (
        <span className={`BodyTextBlockStyle ${styles.emptyText}`}>—</span>
      ),
  },
  {
    id: "attestations_count",
    header: "Аттестаций",
    align: "end",
    cell: (t) => {
      const count = t.attestations_count ?? 0;
      return (
        <span
          className={`CaptionTextBlockStyle ${styles.countPill} ${
            count > 0 ? styles.countActive : styles.countEmpty
          }`}
        >
          {count}
        </span>
      );
    },
  },
];
