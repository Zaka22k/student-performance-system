"use client";

import { Page, DataGrid, Button, SearchField } from "@ui-kit/components";
import { PlusIcon, EditIcon, TrashIcon } from "@/icons";
import type { Student, Group } from "@/models";
import { studentColumns } from "./_columns";
import { useStudentsPage } from "./useStudentsPage";

interface StudentsPageViewProps {
  initialStudents: Student[];
  groups: Group[];
}

export default function StudentsPageView({
  initialStudents,
  groups,
}: StudentsPageViewProps) {
  const p = useStudentsPage(initialStudents, groups);

  return (
    <Page
      title="Студенты"
      toolbar={{
        trailing: (
          <>
            <SearchField
              placeholder="Поиск студентов"
              value={p.query}
              onChange={(e) => p.setQuery(e.target.value)}
            />
            <Button
              icon={<PlusIcon />}
              aria-label="Добавить студента"
              onClick={() => p.openForm()}
            />
          </>
        ),
      }}
    >
      <DataGrid
        aria-label="Студенты"
        rows={p.students}
        columns={studentColumns}
        getRowId={(r) => r.student_id}
        resetKey={p.query}
        emptyContent={
          p.loadFailed
            ? "Не удалось загрузить список студентов"
            : "Студенты не найдены"
        }
        onRowActivate={(r) => p.openForm(r)}
        rowMenu={({ row }) => [
          {
            id: "edit",
            label: "Редактировать",
            icon: <EditIcon />,
            onSelect: () => p.openForm(row),
          },
          { type: "separator" },
          {
            id: "delete",
            danger: true,
            label: "Удалить",
            icon: <TrashIcon />,
            onSelect: () => p.openAlert(row),
          },
        ]}
      />
    </Page>
  );
}
