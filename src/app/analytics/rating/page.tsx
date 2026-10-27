"use client";

import { Page, DataGrid, SearchField } from "@/components";
import { ratingColumns } from "./_columns";
import { useRatingPage } from "./useRatingPage";

export default function RatingPage() {
  const p = useRatingPage();

  return (
    <Page
      title="Рейтинг студентов"
      onNavigate={p.load}
      toolbar={{
        trailing: (
          <SearchField
            placeholder="Поиск студентов"
            value={p.query}
            onChange={(e) => p.setQuery(e.target.value)}
          />
        ),
      }}
    >
      {/* Порядок строк фиксированный: по убыванию суммы оценок, это смысл рейтинга */}
      <DataGrid
        aria-label="Рейтинг студентов"
        rows={p.items}
        columns={ratingColumns}
        getRowId={(r) => r.student_id}
        resetKey={p.query}
        emptyContent={
          p.loadFailed ? "Не удалось загрузить рейтинг" : "Студенты не найдены"
        }
      />
    </Page>
  );
}
