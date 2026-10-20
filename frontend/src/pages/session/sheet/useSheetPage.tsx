import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useModal } from "@components";
import { getErrorMessage } from "@api";
import type { SheetInput, SheetOptions } from "@models";
import * as api from "./sheet.api";

export function useSheetPage() {
  const navigate = useNavigate();
  const { openModal } = useModal();

  const [options, setOptions] = useState<SheetOptions | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Меняется после успешного формирования: форма создаётся заново, оценки очищаются
  const [formKey, setFormKey] = useState(0);

  const formRef = useRef<HTMLFormElement>(null);

  // Для Page: ошибка пробрасывается, Page покажет «Повторить»
  const load = async () => {
    setOptions(await api.getSheetOptions());
  };

  // Кнопка «Сформировать» стоит в шапке, вне формы: requestSubmit запускает
  // браузерную проверку полей и затем submit формы.
  const submit = () => formRef.current?.requestSubmit();

  const save = async (data: SheetInput) => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const { created } = await api.createSheet(data);
      setFormKey((k) => k + 1);
      openModal({
        title: "Ведомость сформирована",
        actionText: "К журналу",
        content: <p>Создано записей в журнале: {created}.</p>,
        onAction: () => navigate("/performance"),
      });
    } catch (e) {
      setError(getErrorMessage(e)); // например «Ведомость уже сформирована…»
    } finally {
      setSaving(false);
    }
  };

  return { options, saving, error, formRef, formKey, load, submit, save };
}
