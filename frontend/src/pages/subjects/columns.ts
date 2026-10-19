import type { DataGridColumn } from "@components";
import type { Subject } from "@models";

export const subjectColumns: DataGridColumn<Subject>[] = [
  {
    id: "subject_code",
    header: "Код",
    cell: (s) => s.subject_code,
    width: 140,
  },
  {
    id: "subject_name",
    header: "Название",
    cell: (s) => s.subject_name,
    width: 380,
  },
  {
    id: "total_hours",
    header: "Часы",
    cell: (s) => s.total_hours,
    width: 110,
    align: "end",
  },
  {
    id: "credits",
    header: "Зачётные единицы",
    cell: (s) => s.credits,
    align: "end",
  },
];
