"use client";

import { useEffect, type RefObject } from "react";

export function useOptionValidity(
  ref: RefObject<HTMLInputElement | null>,
  valid: boolean,
  message: string,
) {
  useEffect(() => {
    ref.current?.setCustomValidity(valid ? "" : message);
  }, [ref, valid, message]);
}
