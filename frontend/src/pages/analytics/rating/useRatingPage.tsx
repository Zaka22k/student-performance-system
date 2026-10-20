import { useEffect, useRef, useState } from "react";
import type { RatingItem } from "@models";
import * as api from "./rating.api";

const SEARCH_DEBOUNCE_MS = 300;

export function useRatingPage() {
  const [items, setItems] = useState<RatingItem[]>([]);
  const [query, setQuery] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);

  const reqId = useRef(0); // номер последнего запроса: ответы устаревших игнорируются

  // Первая загрузка для Page: ошибка пробрасывается, Page покажет «Повторить».
  const load = async () => {
    const id = ++reqId.current;
    const rows = await api.getRating(query);
    if (id === reqId.current) {
      setItems(rows);
      setLoadFailed(false);
    }
  };

  // Поиск: ошибка не пробрасывается, а показывается вместо пустой таблицы.
  const refresh = async (q: string) => {
    const id = ++reqId.current;
    try {
      const rows = await api.getRating(q);
      if (id === reqId.current) {
        setItems(rows);
        setLoadFailed(false);
      }
    } catch (error) {
      console.error("Ошибка загрузки рейтинга:", error);
      if (id === reqId.current) {
        setItems([]);
        setLoadFailed(true);
      }
    }
  };

  // Поиск на сервере: с задержкой, чтобы не слать запрос на каждую букву.
  const skipFirst = useRef(true);
  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    reqId.current++; // ответ на прежний запрос уже не нужен
    const timer = setTimeout(() => void refresh(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return { items, query, setQuery, loadFailed, load };
}
