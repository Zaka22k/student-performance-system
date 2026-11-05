import type { DataGridColumn } from "@ui-kit/components";
import type { Group } from "@/models";
import styles from "./columns.module.css";

function getCourse(admissionYear: number): number | null {
  const now = new Date();
  const academicYearStart =
    now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const course = academicYearStart - admissionYear + 1;
  return course >= 1 && course <= 6 ? course : null;
}

export const groupColumns: DataGridColumn<Group>[] = [
  {
    id: "group_code",
    header: "Код",
    width: 140,
    cell: (g) => (
      <span className={`CaptionTextBlockStyle ${styles.codeTag}`}>
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
    cell: (g) => {
      const course = getCourse(g.admission_year);
      return (
        <div className={styles.yearCell}>
          <span className={`BodyTextBlockStyle ${styles.yearValue}`}>
            {g.admission_year}
          </span>
          {course !== null && (
            <span className={`CaptionTextBlockStyle ${styles.course}`}>
              {course} курс
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "students_count",
    header: "Студентов",
    align: "end",
    cell: (g) => {
      const count = g.students_count ?? 0;
      return (
        <span
          className={`BodyTextBlockStyle ${styles.count} ${
            count > 0 ? "" : styles.countEmpty
          }`}
          title={count > 0 ? undefined : "В группе нет студентов"}
        >
          {count}
        </span>
      );
    },
  },
];
