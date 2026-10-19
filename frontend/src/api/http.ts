import axios, { isAxiosError } from "axios";

export const http = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export function getErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    if (!error.response) return "Нет связи с сервером";
    return error.response.data?.message ?? "Ошибка сервера";
  }
  return error instanceof Error ? error.message : "Неизвестная ошибка";
}
