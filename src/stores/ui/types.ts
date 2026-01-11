/**
 * UI 상태 타입 정의
 */

export interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
}

export interface ModalState {
  isOpen: boolean;
  content: string | null;
}

export interface UIState {
  sidebar: SidebarState;
  modal: ModalState;
  isLoading: boolean;
}

export interface UIActions {
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  collapseSidebar: () => void;
  expandSidebar: () => void;
  openModal: (content: string) => void;
  closeModal: () => void;
  setLoading: (loading: boolean) => void;
}

export type UIStore = UIState & UIActions;
