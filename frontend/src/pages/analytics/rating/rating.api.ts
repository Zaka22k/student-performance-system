import { http } from "@api";
import type { RatingItem } from "@models";

// Если задан q, backend ищет по ФИО, номеру студенческого и коду группы
export const getRating = (q?: string, signal?: AbortSignal) =>
  http
    .get<RatingItem[]>("/analytics/rating", { params: q ? { q } : undefined, signal })
    .then((r) => r.data);
