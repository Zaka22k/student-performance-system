import type { DataGridColumn } from "@components";
import type { ScheduleItem } from "@models";
import { formatDate } from "@utils";
import { ASSESSMENT_LABELS } from "../../performance/constants";

// Одна и та же дата, группа, дисциплина, вид и преподаватель не повторяются, поэтому ключ строки составной
export const scheduleRowId = (r: ScheduleItem) =>
  [r.assessment_date, r.group_id, r.subject_id, r.assessment_type, r.attempt_number, r.teacher_id].join("|");

export const scheduleColumns: DataGridColumn<ScheduleItem>[] = [
  { id: "date", header: "Дата", cell: (r) => formatDate(r.assessment_date), width: 120 },
  { id: "group", header: "Группа", cell: (r) => r.group_code, width: 110 },
  { id: "subject", header: "Дисциплина", cell: (r) => r.subject_name, width: 280 },
  {
    id: "type",
    header: "Вид контроля",
    cell: (r) =>
      r.attempt_number > 1
        ? `${ASSESSMENT_LABELS[r.assessment_type]}, попытка ${r.attempt_number}`
        : ASSESSMENT_LABELS[r.assessment_type],
    width: 240,
  },
  { id: "teacher", header: "Преподаватель", cell: (r) => r.teacher_name, width: 220 },
  { id: "count", header: "Студентов", cell: (r) => r.students_count, align: "end" },
];
