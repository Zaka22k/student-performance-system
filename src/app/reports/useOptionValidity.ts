"use client";

import { useEffect, type RefObject } from "react";

// ComboBox разрешает ввод своего текста, а параметру отчёта нужен вариант из списка
export function useOptionValidity(
  ref: RefObject<HTMLInputElement | null>,
  valid: boolean,
  message: string,
) {
  useEffect(() => {
    ref.current?.setCustomValidity(valid ? "" : message);
  }, [ref, valid, message]);
}
