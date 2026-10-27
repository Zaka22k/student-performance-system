"use client";

import { Page, DataGrid, Button, SearchField } from "@/components";
import { PlusIcon, EditIcon, TrashIcon } from "@/icons";
import { performanceColumns } from "./_columns";
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
            {p.selectedIds.size > 0 && (
              <form action={p.bulkDeleteAction}>
                {Array.from(p.selectedIds).map((id) => (
                  <input
                    key={id}
                    type="hidden"
                    name="selectedIds"
                    value={String(id)}
                  />
                ))}
                <Button
                  type="submit"
                  appearance="destructive"
                  disabled={p.isBulkDeleting}
                >
                  Удалить ({p.selectedIds.size})
                </Button>
              </form>
            )}
            <Button
              icon={<PlusIcon />}
              aria-label="Добавить запись"
              onClick={p.openCreate}
            />
            <SearchField
              placeholder="Поиск записей"
              value={p.query}
              onChange={(e) => p.setQuery(e.target.value)}
            />
          </>
        ),
      }}
    >
      <DataGrid
        aria-label="Журнал успеваемости"
        rows={p.items}
        selectable
        selectedIds={p.selectedIds}
        onSelectionChange={p.setSelectedIds}
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
