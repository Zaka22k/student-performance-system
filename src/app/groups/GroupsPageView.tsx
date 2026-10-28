"use client";

import { Page, DataGrid, Button, SearchField } from "@ui-kit/components";
import { PlusIcon, EditIcon, TrashIcon } from "@/icons";
import type { Group } from "@/models";
import { groupColumns } from "./_columns";
import { useGroupsPage } from "./useGroupsPage";

interface GroupsPageViewProps {
  initialGroups: Group[];
}

export default function GroupsPageView({ initialGroups }: GroupsPageViewProps) {
  const p = useGroupsPage(initialGroups);

  return (
    <Page
      title="Группы"
      toolbar={{
        trailing: (
          <>
            <SearchField
              placeholder="Поиск групп"
              value={p.query}
              onChange={(e) => p.setQuery(e.target.value)}
            />
            <Button
              icon={<PlusIcon />}
              aria-label="Добавить группу"
              onClick={() => p.openForm()}
            />
          </>
        ),
      }}
    >
      <DataGrid
        aria-label="Группы"
        rows={p.groups}
        columns={groupColumns}
        getRowId={(g) => g.group_id}
        resetKey={p.query}
        emptyContent={
          p.loadFailed
            ? "Не удалось загрузить список групп"
            : "Группы не найдены"
        }
        onRowActivate={(g) => p.openForm(g)}
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
