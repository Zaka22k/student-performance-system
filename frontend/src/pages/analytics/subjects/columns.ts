import type { DataGridColumn } from "@components";
import type { SubjectStat } from "@models";
import { formatAverage, formatPercent } from "../format";

export const subjectStatColumns: DataGridColumn<SubjectStat>[] = [
  { id: "subject", header: "Дисциплина", cell: (s) => s.subject_name, width: 280 },
  { id: "records", header: "Результатов", cell: (s) => s.records, width: 130, align: "end" },
  { id: "average", header: "Средняя оценка", cell: (s) => formatAverage(s.average_grade), width: 150, align: "end" },
  { id: "g2", header: "«2»", cell: (s) => s.grade_2, width: 70, align: "end" },
  { id: "g3", header: "«3»", cell: (s) => s.grade_3, width: 70, align: "end" },
  { id: "g4", header: "«4»", cell: (s) => s.grade_4, width: 70, align: "end" },
  { id: "g5", header: "«5»", cell: (s) => s.grade_5, width: 70, align: "end" },
  { id: "success", header: "Успеваемость", cell: (s) => formatPercent(s.success_rate), width: 150, align: "end" },
  { id: "quality", header: "Качество", cell: (s) => formatPercent(s.quality_rate), align: "end" },
];
