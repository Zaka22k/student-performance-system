import { Page, DataGrid, Button, SearchField } from "@components";
import { PlusIcon, EditIcon, TrashIcon } from "@icons";
import { studentColumns } from "./columns";
import { useStudentsPage } from "./useStudentsPage";

export default function StudentsPage() {
  const p = useStudentsPage();

  return (
    <Page
      title="Студенты"
      onNavigate={p.load}
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
        height="calc(100vh - 120px)"
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
