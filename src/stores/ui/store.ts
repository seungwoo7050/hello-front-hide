/**
 * UI 스토어 (Zustand)
 * 사이드바, 모달, 로딩 등 UI 상태 관리
 */
import { create } from 'zustand';
import type { UIStore } from './types';

export const useUIStore = create<UIStore>()((set) => ({
  // 사이드바 상태
  sidebar: {
    isOpen: true,
    isCollapsed: false,
  },

  // 모달 상태
  modal: {
    isOpen: false,
    content: null,
  },

  // 전역 로딩 상태
  isLoading: false,

  // 사이드바 액션
  toggleSidebar: () =>
    set((state) => ({
      sidebar: { ...state.sidebar, isOpen: !state.sidebar.isOpen },
    })),

  openSidebar: () =>
    set((state) => ({
      sidebar: { ...state.sidebar, isOpen: true },
    })),

  closeSidebar: () =>
    set((state) => ({
      sidebar: { ...state.sidebar, isOpen: false },
    })),

  collapseSidebar: () =>
    set((state) => ({
      sidebar: { ...state.sidebar, isCollapsed: true },
    })),

  expandSidebar: () =>
    set((state) => ({
      sidebar: { ...state.sidebar, isCollapsed: false },
    })),

  // 모달 액션
  openModal: (content: string) =>
    set({
      modal: { isOpen: true, content },
    }),

  closeModal: () =>
    set({
      modal: { isOpen: false, content: null },
    }),

  // 로딩 액션
  setLoading: (loading: boolean) =>
    set({ isLoading: loading }),
}));

// 선택자 훅들 (성능 최적화를 위한 세분화된 구독)
export const useSidebarOpen = () => useUIStore((state) => state.sidebar.isOpen);
export const useSidebarCollapsed = () => useUIStore((state) => state.sidebar.isCollapsed);
export const useModalState = () => useUIStore((state) => state.modal);
export const useIsLoading = () => useUIStore((state) => state.isLoading);
