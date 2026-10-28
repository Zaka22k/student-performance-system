"use client";

import { Page, DataGrid, Button, SearchField } from "@ui-kit/components";
import { PlusIcon, EditIcon, TrashIcon } from "@/icons";
import type { PerformanceListResponse } from "@/models";
import { performanceColumns } from "./_columns";
import { usePerformancePage } from "./usePerformancePage";

interface PerformancePageViewProps {
  initialData: PerformanceListResponse;
}

export default function PerformancePageView({
  initialData,
}: PerformancePageViewProps) {
  const p = usePerformancePage(initialData);

  return (
    <Page
      title="Журнал успеваемости"
      toolbar={{
        trailing: (
          <>
            <SearchField
              placeholder="Поиск записей"
              value={p.query}
              onChange={(e) => p.setQuery(e.target.value)}
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
