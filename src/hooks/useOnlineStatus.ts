"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useToast } from "@ui-kit/components";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot(): boolean {
  return navigator.onLine;
}

function getServerSnapshot(): boolean {
  return true;
}

export function useOnlineStatus(): boolean {
  const isOnline = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const toast = useToast();
  const offlineToastIdRef = useRef<string | null>(null);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;

      offlineToastIdRef.current = toast.error("Нет подключения к интернету", {
        description:
          "Проверьте сетевое соединение. Данные могут не сохраняться.",
        duration: 0,
      });
    } else if (wasOfflineRef.current) {
      wasOfflineRef.current = false;

      if (offlineToastIdRef.current) {
        toast.dismiss(offlineToastIdRef.current);
        offlineToastIdRef.current = null;
      }
      toast.success("Подключение восстановлено", {
        duration: 3000,
      });
    }
  }, [isOnline, toast]);

  return isOnline;
}
