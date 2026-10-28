"use client";

import { Page, DataGrid, Button, SearchField } from "@ui-kit/components";
import { PlusIcon, EditIcon, TrashIcon } from "@/icons";
import type { Semester } from "@/models";
import { semesterColumns } from "./_columns";
import { useSemestersPage } from "./useSemestersPage";

interface SemestersPageViewProps {
  initialSemesters: Semester[];
}

export default function SemestersPageView({
  initialSemesters,
}: SemestersPageViewProps) {
  const p = useSemestersPage(initialSemesters);

  return (
    <Page
      title="Семестры"
      toolbar={{
        trailing: (
          <>
            <SearchField
              placeholder="Поиск семестров"
              value={p.query}
              onChange={(e) => p.setQuery(e.target.value)}
            />
            <Button
              icon={<PlusIcon />}
              aria-label="Добавить семестр"
              onClick={() => p.openForm()}
            />
          </>
        ),
      }}
    >
      <DataGrid
        aria-label="Семестры"
        rows={p.semesters}
        columns={semesterColumns}
        getRowId={(r) => r.semester_id}
        resetKey={p.query}
        emptyContent={
          p.loadFailed
            ? "Не удалось загрузить список семестров"
            : "Семестры не найдены"
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
