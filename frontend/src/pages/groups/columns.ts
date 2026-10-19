import type { DataGridColumn } from "@components";
import type { Group } from "@models";

export const groupColumns: DataGridColumn<Group>[] = [
  { id: "group_code", header: "Код", cell: (g) => g.group_code, width: 140 },
  {
    id: "group_name",
    header: "Название",
    cell: (g) => g.group_name,
    width: 220,
  },
  {
    id: "education_program",
    header: "Направление",
    cell: (g) => g.education_program,
    width: 300,
  },
  {
    id: "admission_year",
    header: "Год набора",
    cell: (g) => g.admission_year,
    width: 130,
    align: "end",
  },
  {
    id: "students_count",
    header: "Студентов",
    cell: (g) => g.students_count,
    align: "end",
  },
];
