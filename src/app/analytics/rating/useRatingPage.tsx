"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@ui-kit/components";
import { getErrorMessage } from "@/utils";
import { getRating } from "@/actions/analytics";
import type { RatingItem } from "@/models";
import { useDebounceValue } from "@/hooks";

const SEARCH_DEBOUNCE_MS = 300;

export function useRatingPage(initialItems: RatingItem[]) {
  const toast = useToast();

  const [items, setItems] = useState<RatingItem[]>(initialItems);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounceValue(query, SEARCH_DEBOUNCE_MS);
  const [loadFailed, setLoadFailed] = useState(false);

  const reqId = useRef(0);

  const refresh = async (q: string) => {
    const id = ++reqId.current;
    try {
      const rows = await getRating(q);
      if (id === reqId.current) {
        setItems(rows);
        setLoadFailed(false);
      }
    } catch (error) {
      console.error("Ошибка загрузки рейтинга:", error);
      if (id === reqId.current) {
        setItems([]);
        setLoadFailed(true);
        toast.error("Не удалось обновить рейтинг", {
          description: getErrorMessage(error),
        });
      }
    }
  };

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    void refresh(debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  return { items, query, setQuery, loadFailed };
}
