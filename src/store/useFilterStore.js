import { create } from "zustand";
import { persist } from "zustand/middleware";

const useStore = create(
  persist(
    (set) => ({
      currentPage: "D3Treemap",
      setCurrentPage: (page) => set({ currentPage: page }),
    }),
    {
      name: "page-storage",
    }
  )
);

export default useStore;
