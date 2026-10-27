"use client";

import { useEffect, useRef, useState } from "react";
import { useModal, useToast } from "@ui-kit/components";
import { getErrorMessage } from "@/utils";
import * as actions from "@/actions/groups";
import type { Group, GroupInput } from "@/models";
import GroupForm from "./GroupForm";

const SEARCH_DEBOUNCE_MS = 300;

export function useGroupsPage() {
  const { openModal } = useModal();
  const toast = useToast();

  const [groups, setGroups] = useState<Group[]>([]);
  const [query, setQuery] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);

  const reqId = useRef(0);

  const queryRef = useRef(query);
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const load = async () => {
    const id = ++reqId.current;
    const rows = await actions.getGroups(queryRef.current);
    if (id === reqId.current) {
      setGroups(rows);
      setLoadFailed(false);
    }
  };

  const refresh = async (q: string = queryRef.current) => {
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

  const skipFirst = useRef(true);
  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    reqId.current++;
    const timer = setTimeout(() => void refresh(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSubmitForm = async (
    groupId: Group["group_id"] | undefined,
    data: GroupInput,
  ) => {
    if (groupId === undefined) {
      await actions.createGroup(data);
      toast.success("Группа создана", {
        description: `Группа «${data.group_code}» добавлена`,
      });
    } else {
      await actions.updateGroup(groupId, data);
      toast.success("Группа обновлена", {
        description: `Изменения в группе «${data.group_code}» сохранены`,
      });
    }
    void refresh();
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
      onAction: async () => {
        await actions.deleteGroup(group.group_id);
        toast.success("Группа удалена", {
          description: `Группа «${group.group_code}» удалена`,
        });
        void refresh();
      },
    });
  };

  return { groups, query, setQuery, loadFailed, load, openForm, openAlert };
}
