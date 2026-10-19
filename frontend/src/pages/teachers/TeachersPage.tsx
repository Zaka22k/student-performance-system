import { Page, DataGrid, Button, SearchField } from "@components";
import { PlusIcon, EditIcon, TrashIcon } from "@icons";
import { teacherColumns } from "./columns";
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
            <SearchField
              placeholder="Поиск преподавателей"
              value={p.query}
              onChange={(e) => p.setQuery(e.target.value)}
            />
            <Button
              icon={<PlusIcon />}
              aria-label="Добавить преподавателя"
              onClick={() => p.openForm()}
            />
          </>
        ),
      }}
    >
      <DataGrid
        aria-label="Преподаватели"
        height="calc(100vh - 120px)"
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
