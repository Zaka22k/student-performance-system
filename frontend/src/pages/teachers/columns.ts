import type { DataGridColumn } from "@components";
import type { Teacher } from "@models";
import { fullName } from "@utils";

export const teacherColumns: DataGridColumn<Teacher>[] = [
  { id: "full_name", header: "ФИО", cell: (t) => fullName(t), width: 300 },
  { id: "email", header: "Email", cell: (t) => t.email ?? "—", width: 280 },
  {
    id: "attestations_count",
    header: "Аттестаций",
    cell: (t) => t.attestations_count,
    align: "end",
  },
];
