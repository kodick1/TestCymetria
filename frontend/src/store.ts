import { create } from "zustand";

type UserViewState = {
  search: string;
  page: number;
  pageSize: number;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
};

export const useUserView = create<UserViewState>((set) => ({
  search: "",
  page: 1,
  pageSize: 10,
  setSearch: (search) => set({ search, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
}));
