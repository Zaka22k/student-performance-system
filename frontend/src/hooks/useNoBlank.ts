import { useEffect, type RefObject } from "react";

// required пропускает строку из одних пробелов, поэтому проверяем это отдельно
export function useNoBlank(ref: RefObject<HTMLInputElement | null>, value: string) {
  useEffect(() => {
    ref.current?.setCustomValidity(
      value.length > 0 && value.trim() === ""
        ? "Поле не может состоять из одних пробелов"
        : "",
    );
  }, [ref, value]);
}
