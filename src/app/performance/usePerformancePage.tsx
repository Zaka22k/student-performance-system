"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useModal, useToast, type DataGridRowId } from "@/components";
import { getErrorMessage } from "@/utils";
import type { Performance, PerformanceListResponse } from "@/models";
import {
  getPerformances,
  deletePerformance,
  deletePerformancesAction,
} from "@/actions/performance";

const SEARCH_DEBOUNCE_MS = 300;

export function usePerformancePage() {
  const { openModal } = useModal();
  const toast = useToast();
  const router = useRouter();

  const [items, setItems] = useState<Performance[]>([]);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<DataGridRowId>>(
    new Set(),
  );

  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const cursor = useRef<string | null>(null);
  const reqId = useRef(0);

  const [, bulkDeleteAction, isBulkDeleting] = useActionState(
    async (prev: unknown, formData: FormData) => {
      const res = await deletePerformancesAction(prev, formData);
      if (res.ok) {
        const deletedSet = new Set<DataGridRowId>(res.deletedIds);
        setItems((curr) =>
          curr.filter((r) => !deletedSet.has(r.performance_id)),
        );
        setSelectedIds(new Set());
        toast.success("Записи удалены", {
          description: `Удалено записей из журнала: ${res.count}`,
        });
      } else if (res.error) {
        toast.error("Ошибка удаления", { description: res.error });
      }
      return res;
    },
    null,
  );

  const applyPage = (res: PerformanceListResponse, reset: boolean) => {
    cursor.current = res.nextCursor;
    setItems((prev) => (reset ? res.items : [...prev, ...res.items]));
    setHasMore(res.nextCursor !== null);
  };

  const load = async () => {
    const id = ++reqId.current;
    const res = await getPerformances({ q: query });
    if (id === reqId.current) applyPage(res, true);
    setLoadError(false);
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

  const loadMore = () => void loadInto(false, query);

  const skipFirst = useRef(true);
  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    reqId.current++;
    cursor.current = null;
    setHasMore(false);
    setLoadError(false);
    setLoadingMore(false);
    const timer = setTimeout(
      () => void loadInto(true, query),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

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
        <p>
          Вы действительно хотите удалить запись: <b>{row.student_name}</b> (
          {row.subject_name})?
        </p>
      ),
      onAction: async () => {
        await deletePerformance(row.performance_id);
        setItems((prev) =>
          prev.filter((r) => r.performance_id !== row.performance_id),
        );
        setSelectedIds((prev) => {
          if (!prev.has(row.performance_id)) return prev;
          const next = new Set(prev);
          next.delete(row.performance_id);
          return next;
        });
        toast.success("Запись удалена", {
          description: `${row.student_name} — ${row.subject_name}`,
        });
      },
    });
  };

  return {
    items,
    query,
    setQuery,
    selectedIds,
    setSelectedIds,
    bulkDeleteAction,
    isBulkDeleting,
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
