import type { DataGridColumn } from "@components";
import type { Student } from "@models";
import { formatDate, fullName } from "@utils";
import { STATUS_LABELS } from "./statuses";

export const studentColumns: DataGridColumn<Student>[] = [
  {
    id: "student_number",
    header: "Номер",
    cell: (s) => s.student_number,
    width: 130,
  },
  { id: "full_name", header: "ФИО", cell: (s) => fullName(s), width: 280 },
  {
    id: "birth_date",
    header: "Дата рождения",
    cell: (s) => formatDate(s.birth_date),
    width: 160,
  },
  { id: "group_code", header: "Группа", cell: (s) => s.group_code, width: 130 },
  { id: "status", header: "Статус", cell: (s) => STATUS_LABELS[s.status] },
];
