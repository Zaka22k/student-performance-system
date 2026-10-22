import { useEffect, useRef, useState } from "react";
import { useModal } from "@components";
import { getErrorMessage } from "@api";
import * as api from "./groups.api";
import type { Group, GroupInput } from "@models";
import GroupForm from "./GroupForm";

const SEARCH_DEBOUNCE_MS = 300;

export function useGroupsPage() {
  const { openModal } = useModal();
  const [groups, setGroups] = useState<Group[]>([]);
  const [query, setQuery] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);

  const reqId = useRef(0); // номер последнего запроса: ответы устаревших игнорируются

  // Актуальный запрос поиска. Окна из openModal хранят значения на момент открытия,
  // поэтому после сохранения список перезапрашивается с текущим текстом поиска из ref.
  const queryRef = useRef(query);
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  // Первая загрузка для Page: ошибка пробрасывается, Page покажет «Повторить».
  const load = async () => {
    const id = ++reqId.current;
    const rows = await api.getGroups(queryRef.current);
    if (id === reqId.current) {
      setGroups(rows);
      setLoadFailed(false);
    }
  };

  // Обновление списка после поиска и сохранения: ошибка не пробрасывается,
  // а показывается вместо пустой таблицы.
  const refresh = async (q: string = queryRef.current) => {
    const id = ++reqId.current;
    try {
      const rows = await api.getGroups(q);
      if (id === reqId.current) {
        setGroups(rows);
        setLoadFailed(false);
      }
    } catch (error) {
      console.error("Ошибка загрузки групп:", error);
      if (id === reqId.current) {
        setGroups([]);
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

  const handleSubmitForm = async (
    groupId: Group["group_id"] | undefined,
    data: GroupInput,
  ) => {
    if (groupId === undefined) await api.createGroup(data);
    else await api.updateGroup(groupId, data);
    await refresh(); // порядок и число студентов считает сервер
  };

  const openForm = (group?: Group) => {
    const groupId = group?.group_id;

    openModal({
      title:
        groupId === undefined ? "Создание группы" : "Редактирование группы",
      actionText: "Сохранить",
      closeOnBackdropClick: false,
      errorMessage: getErrorMessage, // например «Группа с таким кодом уже существует»
      content: (form) => (
        <GroupForm
          {...form}
          initial={group}
          onSubmit={(data) => handleSubmitForm(groupId, data)}
        />
      ),
    });
  };

  const openAlert = (group: Group) => {
    openModal({
      title: "Удаление группы",
      actionText: "Удалить",
      actionAppearance: "normal",
      errorMessage: getErrorMessage, // например «В ней есть студенты»
      content: (
        <p>Вы действительно хотите удалить группу {group.group_code}?</p>
      ),
      onAction: async () => {
        await api.deleteGroup(group.group_id);
        await refresh();
      },
    });
  };

  return { groups, query, setQuery, loadFailed, load, openForm, openAlert };
}
