import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useModal } from "@components";
import { getErrorMessage } from "@api";
import type { Performance, PerformanceListResponse } from "@models";
import * as api from "./performance.api";

const SEARCH_DEBOUNCE_MS = 300;

export function usePerformancePage() {
  const { openModal } = useModal();
  const navigate = useNavigate();
  const [items, setItems] = useState<Performance[]>([]);
  const [query, setQuery] = useState("");

  // hasMore false, пока не пришла первая порция (её грузит Page через onNavigate):
  // иначе таблица сама запросила бы первую порцию второй раз.
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const cursor = useRef<string | null>(null);
  const reqId = useRef(0); // номер последнего запроса: ответы устаревших игнорируются

  const applyPage = (res: PerformanceListResponse, reset: boolean) => {
    cursor.current = res.nextCursor;
    setItems((prev) => (reset ? res.items : [...prev, ...res.items]));
    setHasMore(res.nextCursor !== null);
  };

  // Первая загрузка для Page: ошибка пробрасывается, Page покажет «Повторить».
  const load = async () => {
    const id = ++reqId.current;
    const res = await api.getPerformanceList({ q: query });
    if (id === reqId.current) applyPage(res, true);
  };

  // Подгрузка и поиск: ошибка не пробрасывается, а показывается в конце таблицы.
  const loadInto = async (reset: boolean, q: string) => {
    const id = ++reqId.current;
    setLoadingMore(true);
    setLoadError(false);
    try {
      const res = await api.getPerformanceList({
        q,
        cursor: reset ? undefined : (cursor.current ?? undefined),
      });
      if (id === reqId.current) applyPage(res, reset);
    } catch (error) {
      console.error("Ошибка загрузки журнала:", error);
      if (id === reqId.current) setLoadError(true);
    } finally {
      if (id === reqId.current) setLoadingMore(false);
    }
  };

  const loadMore = () => void loadInto(false, query);

  // Поиск на сервере: с задержкой, чтобы не слать запрос на каждую букву.
  const skipFirst = useRef(true);
  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    // Пока меняется запрос, старый список нельзя подгружать: курсор уже не от него.
    reqId.current++;
    cursor.current = null;
    setHasMore(false);
    setLoadError(false);
    setLoadingMore(false);
    const timer = setTimeout(() => void loadInto(true, query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Создание и изменение идут на отдельной странице. Когда пользователь возвращается,
  // PerformancePage создаётся заново и сама загружает свежий список.
  const openCreate = () => navigate("/performance/new");
  const openEdit = (row: Performance) => navigate(`/performance/${row.performance_id}/edit`);

  const openAlert = (row: Performance) => {
    openModal({
      title: "Удаление записи",
      actionText: "Удалить",
      actionAppearance: "default",
      errorMessage: getErrorMessage,
      content: (
        <p>
          Вы действительно хотите удалить запись: {row.student_name}, {row.subject_name}?
        </p>
      ),
      onAction: async () => {
        await api.deletePerformance(row.performance_id);
        // Курсор — это дата и id последней записи порции, он остаётся верным и после удаления
        setItems((prev) => prev.filter((r) => r.performance_id !== row.performance_id));
      },
    });
  };

  return {
    items,
    query,
    setQuery,
    hasMore,
    loadingMore,
    loadError,
    load,
    loadMore,
    openCreate,
    openEdit,
    openAlert,
  };
}
