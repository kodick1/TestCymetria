export type User = { id: string; name: string; email: string };
export type UserPage = { data: User[]; page: number; pageSize: number; total: number; totalPages: number };
export type UserInput = { name: string; email: string };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message ?? body?.message ?? "No se pudo completar la solicitud.");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const usersApi = {
  list: (page: number, pageSize: number, search: string) =>
    request<UserPage>(`/api/v1/users?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`),
  get: (id: string) => request<{ data: User }>(`/api/v1/users/${id}`),
  create: (input: UserInput) => request<{ data: User }>("/api/v1/users", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, input: UserInput) => request<{ data: User }>(`/api/v1/users/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  remove: (id: string) => request<void>(`/api/v1/users/${id}`, { method: "DELETE" }),
  exportUrl: (search: string) => `/api/v1/users/export.csv?search=${encodeURIComponent(search)}`,
};
