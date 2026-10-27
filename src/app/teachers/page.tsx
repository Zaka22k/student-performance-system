"use client";

import { Page, DataGrid, Button, SearchField } from "@ui-kit/components";
import { PlusIcon, EditIcon, TrashIcon } from "@/icons";
import { teacherColumns } from "./_columns";
import { useTeachersPage } from "./useTeachersPage";

export default function TeachersPage() {
  const p = useTeachersPage();

  return (
    <Page
      title="Преподаватели"
      onNavigate={p.load}
      toolbar={{
        trailing: (
          <>
            <Button
              icon={<PlusIcon />}
              aria-label="Добавить преподавателя"
              onClick={() => p.openForm()}
            />
            <SearchField
              placeholder="Поиск преподавателей"
              value={p.query}
              onChange={(e) => p.setQuery(e.target.value)}
            />
          </>
        ),
      }}
    >
      <DataGrid
        aria-label="Преподаватели"
        rows={p.teachers}
        columns={teacherColumns}
        getRowId={(r) => r.teacher_id}
        resetKey={p.query}
        emptyContent={
          p.loadFailed
            ? "Не удалось загрузить список преподавателей"
            : "Преподаватели не найдены"
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
