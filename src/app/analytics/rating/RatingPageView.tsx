"use client";

import { Page, DataGrid, SearchField } from "@ui-kit/components";
import type { RatingItem } from "@/models";
import { ratingColumns } from "./_columns";
import { useRatingPage } from "./useRatingPage";

interface RatingPageViewProps {
  initialItems: RatingItem[];
}

export default function RatingPageView({ initialItems }: RatingPageViewProps) {
  const p = useRatingPage(initialItems);

  return (
    <Page
      title="Рейтинг студентов"
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
