import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useModal } from "@components";
import { getErrorMessage } from "@api";
import type { Performance, PerformanceInput, PerformanceOptions } from "@models";
import * as api from "../performance.api";

const LIST_PATH = "/performance";

// id нет — создание новой записи, id есть — изменение существующей
export function useEditPerformancePage(id?: string) {
  const navigate = useNavigate();
  const { openModal } = useModal();

  const [options, setOptions] = useState<PerformanceOptions | null>(null);
  const [record, setRecord] = useState<Performance | undefined>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  // Для Page: ошибка пробрасывается, Page покажет «Повторить»
  // (в том числе если запись с таким id не найдена).
  const load = async () => {
    const [opts, rec] = await Promise.all([
      api.getPerformanceOptions(),
      id ? api.getPerformance(id) : Promise.resolve(undefined),
    ]);
    setOptions(opts);
    setRecord(rec);
  };

  // Кнопка «Сохранить» стоит в шапке, вне формы: requestSubmit запускает
  // браузерную проверку полей и затем submit формы.
  const submit = () => formRef.current?.requestSubmit();

  const save = async (data: PerformanceInput) => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      if (id) await api.updatePerformance(id, data);
      else await api.createPerformance(data);
      navigate(LIST_PATH); // список при открытии загрузит свежие данные
    } catch (e) {
      setError(getErrorMessage(e)); // например «Такая запись уже есть…»
      setSaving(false);
    }
  };

  const openAlert = () => {
    if (!id) return;
    openModal({
      title: "Удаление записи",
      actionText: "Удалить",
      actionAppearance: "default",
      errorMessage: getErrorMessage,
      content: <p>Вы действительно хотите удалить эту запись?</p>,
      onAction: async () => {
        await api.deletePerformance(id);
        navigate(LIST_PATH);
      },
    });
  };

  return { options, record, saving, error, formRef, load, submit, save, openAlert };
}
