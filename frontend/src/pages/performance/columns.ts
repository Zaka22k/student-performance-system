import type { DataGridColumn } from "@components";
import type { Performance } from "@models";
import { formatDate, semesterLabel } from "@utils";
import { ASSESSMENT_LABELS, formatResult } from "./constants";

export const performanceColumns: DataGridColumn<Performance>[] = [
  { id: "student", header: "Студент", cell: (p) => p.student_name, width: 240 },
  { id: "group", header: "Группа", cell: (p) => p.group_code, width: 110 },
  {
    id: "subject",
    header: "Дисциплина",
    cell: (p) => p.subject_name,
    width: 260,
  },
  {
    id: "teacher",
    header: "Преподаватель",
    cell: (p) => p.teacher_name,
    width: 200,
  },
  {
    id: "semester",
    header: "Семестр",
    cell: (p) => semesterLabel(p),
    width: 200,
  },
  {
    id: "type",
    header: "Вид контроля",
    cell: (p) => ASSESSMENT_LABELS[p.assessment_type],
    width: 220,
  },
  {
    id: "result",
    header: "Результат",
    cell: (p) => formatResult(p),
    width: 110,
    align: "end",
  },
  {
    id: "attempt",
    header: "Попытка",
    cell: (p) => p.attempt_number,
    width: 100,
    align: "end",
  },
  {
    id: "date",
    header: "Дата",
    cell: (p) => formatDate(p.assessment_date),
    width: 120,
  },
];
