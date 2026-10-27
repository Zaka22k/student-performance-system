import type { DataGridColumn } from "@ui-kit/components";
import type { Group } from "@/models";
import styles from "./columns.module.css";

export const groupColumns: DataGridColumn<Group>[] = [
  {
    id: "group_code",
    header: "Код",
    width: 140,
    cell: (g) => (
      <span className={`CaptionTextBlockStyle ${styles.codeBadge}`}>
        {g.group_code}
      </span>
    ),
  },
  {
    id: "group_name",
    header: "Название",
    width: 220,
    cell: (g) => (
      <span
        className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.nameText}`}
        title={g.group_name}
      >
        {g.group_name}
      </span>
    ),
  },
  {
    id: "education_program",
    header: "Направление",
    width: 300,
    cell: (g) => (
      <span
        className={`BodyTextBlockStyle ${styles.programText}`}
        title={g.education_program}
      >
        {g.education_program}
      </span>
    ),
  },
  {
    id: "admission_year",
    header: "Год набора",
    width: 130,
    align: "end",
    cell: (g) => (
      <span className={`CaptionTextBlockStyle ${styles.yearTag}`}>
        {g.admission_year}
      </span>
    ),
  },
  {
    id: "students_count",
    header: "Студентов",
    align: "end",
    cell: (g) => {
      const count = g.students_count ?? 0;
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
