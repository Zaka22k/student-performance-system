import { Page, DataGrid, Button, SearchField } from "@components";
import { PlusIcon, EditIcon, TrashIcon } from "@icons";
import { semesterColumns } from "./columns";
import { useSemestersPage } from "./useSemestersPage";

export default function SemestersPage() {
  const p = useSemestersPage();

  return (
    <Page
      title="Семестры"
      onNavigate={p.load}
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
        height="calc(100vh - 120px)"
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
