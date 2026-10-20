import type { DataGridColumn } from "@components";
import type { GroupStat } from "@models";
import { formatAverage, formatPercent } from "../format";

export const groupStatColumns: DataGridColumn<GroupStat>[] = [
  { id: "group", header: "Группа", cell: (g) => g.group_code, width: 120 },
  { id: "students", header: "Студентов", cell: (g) => g.students_count, width: 130, align: "end" },
  { id: "records", header: "Результатов", cell: (g) => g.records, width: 140, align: "end" },
  { id: "average", header: "Средняя оценка", cell: (g) => formatAverage(g.average_grade), width: 160, align: "end" },
  { id: "success", header: "Успеваемость", cell: (g) => formatPercent(g.success_rate), width: 150, align: "end" },
  { id: "quality", header: "Качество", cell: (g) => formatPercent(g.quality_rate), align: "end" },
];
