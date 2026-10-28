"use client";

import {
  startTransition,
  useEffect,
  useOptimistic,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useModal, useToast } from "@ui-kit/components";
import { getErrorMessage } from "@/utils";
import type { Performance, PerformanceListResponse } from "@/models";
import { getPerformances, deletePerformance } from "@/actions/performance";
import { useDebounceValue } from "@/hooks";

const SEARCH_DEBOUNCE_MS = 300;

type OptimisticPerformanceAction = {
  type: "delete";
  performanceId: Performance["performance_id"];
};

export function usePerformancePage(initialData: PerformanceListResponse) {
  const { openModal } = useModal();
  const toast = useToast();
  const router = useRouter();

  const [items, setItems] = useState<Performance[]>(initialData.items);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounceValue(query, SEARCH_DEBOUNCE_MS);

  const [hasMore, setHasMore] = useState(initialData.nextCursor !== null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const [optimisticItems, applyOptimistic] = useOptimistic<
    Performance[],
    OptimisticPerformanceAction
  >(items, (current, action) => {
    switch (action.type) {
      case "delete":
        return current.filter((r) => r.performance_id !== action.performanceId);
    }
  });

  const cursor = useRef<string | null>(initialData.nextCursor);
  const reqId = useRef(0);

  const applyPage = (res: PerformanceListResponse, reset: boolean) => {
    cursor.current = res.nextCursor;
    setItems((prev) => (reset ? res.items : [...prev, ...res.items]));
    setHasMore(res.nextCursor !== null);
  };

  const loadInto = async (reset: boolean, q: string) => {
    const id = ++reqId.current;
    setLoadingMore(true);
    setLoadError(false);
    try {
      const res = await getPerformances({
        q,
        cursor: reset ? undefined : (cursor.current ?? undefined),
      });
      if (id === reqId.current) applyPage(res, reset);
    } catch (error) {
      console.error("Ошибка загрузки журнала:", error);
      if (id === reqId.current) {
        setLoadError(true);
        toast.error("Не удалось загрузить данные", {
          description: getErrorMessage(error),
        });
      }
    } finally {
      if (id === reqId.current) setLoadingMore(false);
    }
  };

  const loadMore = () => void loadInto(false, debouncedQuery);

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    cursor.current = null;
    setHasMore(false);
    setLoadError(false);
    setLoadingMore(false);
    void loadInto(true, debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const openCreate = () => router.push("/performance/new");
  const openEdit = (row: Performance) =>
    router.push(`/performance/${row.performance_id}/edit`);

  const openAlert = (row: Performance) => {
    openModal({
      title: "Удаление записи",
      actionText: "Удалить",
      actionAppearance: "destructive",
      errorMessage: getErrorMessage,
      content: (
        <p className="BodyTextBlockStyle">
          Вы действительно хотите удалить запись:{" "}
          <strong className="BodyStrongTextBlockStyle">
            {row.student_name}
          </strong>{" "}
          ({row.subject_name})?
        </p>
      ),
      onAction: () => {
        startTransition(async () => {
          applyOptimistic({
            type: "delete",
            performanceId: row.performance_id,
          });

          try {
            await deletePerformance(row.performance_id);
            setItems((prev) =>
              prev.filter((r) => r.performance_id !== row.performance_id),
            );
            toast.success("Запись удалена", {
              description: `${row.student_name} — ${row.subject_name}`,
            });
          } catch (error) {
            toast.error("Не удалось удалить запись", {
              description: getErrorMessage(error),
            });
          }
        });
      },
    });
  };

  return {
    items: optimisticItems,
    query,
    setQuery,
    hasMore,
    loadingMore,
    loadError,
    loadMore,
    openCreate,
    openEdit,
    openAlert,
  };
}
