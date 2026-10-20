import type { DataGridColumn } from "@components";
import type { RatingItem } from "@models";
import { formatAverage } from "../format";

export const ratingColumns: DataGridColumn<RatingItem>[] = [
  { id: "place", header: "Место", cell: (r) => r.place, width: 90, align: "end" },
  { id: "student", header: "Студент", cell: (r) => r.student_name, width: 280 },
  { id: "number", header: "Номер", cell: (r) => r.student_number, width: 130 },
  { id: "group", header: "Группа", cell: (r) => r.group_code, width: 120 },
  { id: "sum", header: "Сумма оценок", cell: (r) => r.summ_balls, width: 150, align: "end" },
  { id: "average", header: "Средний балл", cell: (r) => formatAverage(r.average_grade), align: "end" },
];
