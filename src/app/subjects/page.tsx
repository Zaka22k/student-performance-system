"use client";

import { Page, DataGrid, Button, SearchField } from "@ui-kit/components";
import { PlusIcon, EditIcon, TrashIcon } from "@/icons";
import { subjectColumns } from "./_columns";
import { useSubjectsPage } from "./useSubjectsPage";

export default function SubjectsPage() {
  const p = useSubjectsPage();

  return (
    <Page
      title="Дисциплины"
      onNavigate={p.load}
      toolbar={{
        trailing: (
          <>
            <Button
              icon={<PlusIcon />}
              aria-label="Добавить дисциплину"
              onClick={() => p.openForm()}
            />
            <SearchField
              placeholder="Поиск дисциплин"
              value={p.query}
              onChange={(e) => p.setQuery(e.target.value)}
            />
          </>
        ),
      }}
    >
      <DataGrid
        aria-label="Дисциплины"
        rows={p.subjects}
        columns={subjectColumns}
        getRowId={(r) => r.subject_id}
        resetKey={p.query}
        emptyContent={
          p.loadFailed
            ? "Не удалось загрузить список дисциплин"
            : "Дисциплины не найдены"
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
