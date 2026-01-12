/**
 * UI 스토어 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useUIStore } from './store'

describe('UI 스토어', () => {
  beforeEach(() => {
    // 스토어 초기화
    useUIStore.setState({
      sidebar: {
        isOpen: true,
        isCollapsed: false,
      },
      modal: {
        isOpen: false,
        content: null,
      },
      isLoading: false,
    })
  })

  describe('사이드바 상태', () => {
    it('openSidebar로 사이드바를 열 수 있다', () => {
      // 먼저 닫기
      act(() => {
        useUIStore.getState().closeSidebar()
      })

      act(() => {
        useUIStore.getState().openSidebar()
      })

      expect(useUIStore.getState().sidebar.isOpen).toBe(true)
    })

    it('closeSidebar로 사이드바를 닫을 수 있다', () => {
      act(() => {
        useUIStore.getState().closeSidebar()
      })

      expect(useUIStore.getState().sidebar.isOpen).toBe(false)
    })

    it('toggleSidebar로 사이드바 상태를 토글할 수 있다', () => {
      expect(useUIStore.getState().sidebar.isOpen).toBe(true)

      act(() => {
        useUIStore.getState().toggleSidebar()
      })
      expect(useUIStore.getState().sidebar.isOpen).toBe(false)

      act(() => {
        useUIStore.getState().toggleSidebar()
      })
      expect(useUIStore.getState().sidebar.isOpen).toBe(true)
    })

    it('collapseSidebar로 사이드바를 접을 수 있다', () => {
      act(() => {
        useUIStore.getState().collapseSidebar()
      })

      expect(useUIStore.getState().sidebar.isCollapsed).toBe(true)
    })

    it('expandSidebar로 사이드바를 펼 수 있다', () => {
      act(() => {
        useUIStore.getState().collapseSidebar()
      })

      act(() => {
        useUIStore.getState().expandSidebar()
      })

      expect(useUIStore.getState().sidebar.isCollapsed).toBe(false)
    })
  })

  describe('모달 상태', () => {
    it('openModal로 모달을 열 수 있다', () => {
      act(() => {
        useUIStore.getState().openModal('테스트 콘텐츠')
      })

      const { modal } = useUIStore.getState()
      expect(modal.isOpen).toBe(true)
      expect(modal.content).toBe('테스트 콘텐츠')
    })

    it('closeModal로 모달을 닫을 수 있다', () => {
      act(() => {
        useUIStore.getState().openModal('테스트 콘텐츠')
      })

      act(() => {
        useUIStore.getState().closeModal()
      })

      const { modal } = useUIStore.getState()
      expect(modal.isOpen).toBe(false)
      expect(modal.content).toBeNull()
    })
  })

  describe('글로벌 로딩 상태', () => {
    it('setLoading으로 로딩 상태를 설정할 수 있다', () => {
      expect(useUIStore.getState().isLoading).toBe(false)

      act(() => {
        useUIStore.getState().setLoading(true)
      })

      expect(useUIStore.getState().isLoading).toBe(true)

      act(() => {
        useUIStore.getState().setLoading(false)
      })

      expect(useUIStore.getState().isLoading).toBe(false)
    })
  })
})
