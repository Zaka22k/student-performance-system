import { Page, DataGrid, Button, SearchField } from "@components";
import { PlusIcon, EditIcon, TrashIcon } from "@icons";
import { performanceColumns } from "./columns";
import { usePerformancePage } from "./usePerformancePage";

export default function PerformancePage() {
  const p = usePerformancePage();

  return (
    <Page
      title="Журнал успеваемости"
      onNavigate={p.load}
      toolbar={{
        trailing: (
          <>
            <SearchField
              placeholder="Поиск записей"
              value={p.query}
              onChange={(e) => p.setQuery(e.target.value)}
              mode="auto"
            />
            <Button
              icon={<PlusIcon />}
              aria-label="Добавить запись"
              onClick={p.openCreate}
            />
          </>
        ),
      }}
    >
      <DataGrid
        aria-label="Журнал успеваемости"
        height="calc(100vh - 120px)"
        rows={p.items}
        columns={performanceColumns}
        getRowId={(r) => r.performance_id}
        resetKey={p.query}
        hasMore={p.hasMore}
        loadingMore={p.loadingMore}
        loadMoreError={p.loadError}
        onEndReached={p.loadMore}
        emptyContent="Записи не найдены"
        onRowActivate={(r) => p.openEdit(r)}
        rowMenu={({ row }) => [
          {
            id: "edit",
            label: "Редактировать",
            icon: <EditIcon />,
            onSelect: () => p.openEdit(row),
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
