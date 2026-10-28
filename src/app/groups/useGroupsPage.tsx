"use client";

import {
  startTransition,
  useEffect,
  useOptimistic,
  useRef,
  useState,
} from "react";
import { useModal, useToast } from "@ui-kit/components";
import { getErrorMessage } from "@/utils";
import * as actions from "@/actions/groups";
import type { Group, GroupInput } from "@/models";
import { useDebounceValue } from "@/hooks";
import GroupForm from "./GroupForm";

const SEARCH_DEBOUNCE_MS = 300;

type OptimisticAction =
  | { type: "create"; data: GroupInput; tempId: Group["group_id"] }
  | { type: "update"; groupId: Group["group_id"]; data: GroupInput }
  | { type: "delete"; groupId: Group["group_id"] };

export function useGroupsPage(initialGroups: Group[]) {
  const { openModal } = useModal();
  const toast = useToast();

  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounceValue(query, SEARCH_DEBOUNCE_MS);
  const [loadFailed, setLoadFailed] = useState(false);

  const [optimisticGroups, applyOptimistic] = useOptimistic<
    Group[],
    OptimisticAction
  >(groups, (currentGroups, action) => {
    switch (action.type) {
      case "create":
        return [
          ...currentGroups,
          { group_id: action.tempId, ...action.data } as Group,
        ];
      case "update":
        return currentGroups.map((g) =>
          g.group_id === action.groupId ? { ...g, ...action.data } : g,
        );
      case "delete":
        return currentGroups.filter((g) => g.group_id !== action.groupId);
    }
  });

  const reqId = useRef(0);

  const refresh = async (q: string = debouncedQuery) => {
    const id = ++reqId.current;
    try {
      const rows = await actions.getGroups(q);
      if (id === reqId.current) {
        setGroups(rows);
        setLoadFailed(false);
      }
    } catch (error) {
      console.error("Ошибка загрузки групп:", error);
      if (id === reqId.current) {
        setGroups([]);
        setLoadFailed(true);
        toast.error("Не удалось обновить список групп", {
          description: getErrorMessage(error),
        });
      }
    }
  };

  // Эффект реагирует только на отложенный поисковый запрос (пропуская начальный пустой ввод)
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    void refresh(debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const handleSubmitForm = async (
    groupId: Group["group_id"] | undefined,
    data: GroupInput,
  ) => {
    if (groupId === undefined) {
      await actions.createGroup(data);
      toast.success("Группа создана", {
        description: `Группа «${data.group_code}» добавлена`,
      });

      startTransition(async () => {
        applyOptimistic({
          type: "create",
          data,
          tempId: `temp-${Date.now()}` as unknown as Group["group_id"],
        });
        await refresh();
      });
    } else {
      await actions.updateGroup(groupId, data);
      toast.success("Группа обновлена", {
        description: `Изменения в группе «${data.group_code}» сохранены`,
      });

      startTransition(async () => {
        applyOptimistic({ type: "update", groupId, data });
        await refresh();
      });
    }
  };

  const openForm = (group?: Group) => {
    const groupId = group?.group_id;

    openModal({
      title:
        groupId === undefined ? "Создание группы" : "Редактирование группы",
      actionText: "Сохранить",
      closeOnBackdropClick: false,
      errorMessage: getErrorMessage,
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
      actionAppearance: "destructive",
      errorMessage: getErrorMessage,
      content: (
        <p className="BodyTextBlockStyle">
          Вы действительно хотите удалить группу{" "}
          <strong className="BodyStrongTextBlockStyle">
            {group.group_code}
          </strong>
          ?
        </p>
      ),
      onAction: () => {
        startTransition(async () => {
          applyOptimistic({ type: "delete", groupId: group.group_id });
          try {
            await actions.deleteGroup(group.group_id);
            toast.success("Группа удалена", {
              description: `Группа «${group.group_code}» удалена`,
            });
            await refresh();
          } catch (error) {
            toast.error("Не удалось удалить группу", {
              description: getErrorMessage(error),
            });
          }
        });
      },
    });
  };

  return {
    groups: optimisticGroups,
    query,
    setQuery,
    loadFailed,
    openForm,
    openAlert,
  };
}
