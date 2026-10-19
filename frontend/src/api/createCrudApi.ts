import { http } from "./http";

export function createCrudApi<T, TInput>(resource: string) {
  return {
    list: (q?: string, signal?: AbortSignal) =>
      http
        .get<T[]>(`/${resource}`, { params: q ? { q } : undefined, signal })
        .then((r) => r.data),

    get: (id: string) => http.get<T>(`/${resource}/${id}`).then((r) => r.data),

    create: (data: TInput) =>
      http.post<T>(`/${resource}`, data).then((r) => r.data),

    update: (id: string, data: TInput) =>
      http.put<T>(`/${resource}/${id}`, data).then((r) => r.data),

    remove: (id: string) =>
      http.delete(`/${resource}/${id}`).then(() => undefined),
  };
}
