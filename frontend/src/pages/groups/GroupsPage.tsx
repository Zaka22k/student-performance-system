import { Page, DataGrid, Button, SearchField } from "@components";
import { PlusIcon, EditIcon, TrashIcon } from "@icons";
import { groupColumns } from "./columns";
import { useGroupsPage } from "./useGroupsPage";

export default function GroupsPage() {
  const p = useGroupsPage();

  return (
    <Page
      title="Группы"
      onNavigate={p.load}
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
        height="calc(100vh - 120px)"
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
