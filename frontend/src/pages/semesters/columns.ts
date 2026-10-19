import type { DataGridColumn } from "@components";
import type { Semester } from "@models/semester";
import { formatDate } from "@utils";

export const semesterColumns: DataGridColumn<Semester>[] = [
  {
    id: "academic_year",
    header: "Учебный год",
    cell: (s) => `${s.academic_year_start}/${s.academic_year_start + 1}`,
    width: 160,
  },
  {
    id: "term_number",
    header: "Семестр",
    cell: (s) => s.term_number,
    width: 120,
    align: "end",
  },
  {
    id: "start_date",
    header: "Начало",
    cell: (s) => formatDate(s.start_date),
    width: 160,
  },
  { id: "end_date", header: "Окончание", cell: (s) => formatDate(s.end_date) },
];
