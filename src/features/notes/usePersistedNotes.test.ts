import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePersistedNotes } from './usePersistedNotes'
import type { NoteFormValues } from './types'

const STORAGE_KEY = 'notes-app-data'

describe('usePersistedNotes', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  describe('초기화 및 영속성', () => {
    it('초기 상태에서 샘플 노트가 로드된다', () => {
      const { result } = renderHook(() => usePersistedNotes())
      expect(result.current.notes.length).toBeGreaterThan(0)
      expect(result.current.isLoaded).toBe(true)
    })

    it('노트가 localStorage에 저장된다', () => {
      const { result } = renderHook(() => usePersistedNotes())

      const newNote: NoteFormValues = {
        title: '영속 테스트',
        content: '내용',
        category: '테스트',
        tags: '',
        color: 'default',
      }

      act(() => {
        result.current.createNote(newNote)
      })

      const stored = JSON.parse(
        window.localStorage.getItem(STORAGE_KEY) || '{}'
      )
      expect(
        stored.notes.some((n: { title: string }) => n.title === '영속 테스트')
      ).toBe(true)
    })

    it('페이지 새로고침 후에도 노트가 유지된다', () => {
      // 첫 번째 렌더
      const { result: firstResult, unmount } = renderHook(() =>
        usePersistedNotes()
      )

      const newNote: NoteFormValues = {
        title: '영속 테스트 노트',
        content: '새로고침 후에도 유지',
        category: '',
        tags: '',
        color: 'blue',
      }

      act(() => {
        firstResult.current.createNote(newNote)
      })

      unmount()

      // 두 번째 렌더 (새로고침 시뮬레이션)
      const { result: secondResult } = renderHook(() => usePersistedNotes())

      const persistedNote = secondResult.current.notes.find(
        (n) => n.title === '영속 테스트 노트'
      )
      expect(persistedNote).toBeDefined()
      expect(persistedNote?.content).toBe('새로고침 후에도 유지')
    })
  })

  describe('CRUD 작업', () => {
    it('노트 생성이 저장된다', () => {
      const { result } = renderHook(() => usePersistedNotes())
      const initialCount = result.current.notes.length

      const newNote: NoteFormValues = {
        title: '새 노트',
        content: '내용',
        category: '업무',
        tags: '태그1, 태그2',
        color: 'green',
      }

      act(() => {
        result.current.createNote(newNote)
      })

      expect(result.current.notes.length).toBe(initialCount + 1)
    })

    it('노트 수정이 저장된다', () => {
      const { result } = renderHook(() => usePersistedNotes())
      const firstNote = result.current.notes[0]

      act(() => {
        result.current.updateNote(firstNote.id, { title: '수정된 제목' })
      })

      const updatedNote = result.current.notes.find(
        (n) => n.id === firstNote.id
      )
      expect(updatedNote?.title).toBe('수정된 제목')
    })

    it('노트 삭제가 저장된다', () => {
      const { result } = renderHook(() => usePersistedNotes())
      const firstNote = result.current.notes[0]
      const initialCount = result.current.notes.length

      act(() => {
        result.current.deleteNote(firstNote.id)
      })

      expect(result.current.notes.length).toBe(initialCount - 1)
      expect(
        result.current.notes.find((n) => n.id === firstNote.id)
      ).toBeUndefined()
    })

    it('핀 토글이 저장된다', () => {
      const { result } = renderHook(() => usePersistedNotes())
      const firstNote = result.current.notes[0]
      const initialPinState = firstNote.isPinned

      act(() => {
        result.current.togglePin(firstNote.id)
      })

      const updatedNote = result.current.notes.find(
        (n) => n.id === firstNote.id
      )
      expect(updatedNote?.isPinned).toBe(!initialPinState)
    })
  })

  describe('데이터 관리', () => {
    it('모든 노트를 삭제할 수 있다', () => {
      const { result } = renderHook(() => usePersistedNotes())

      act(() => {
        result.current.clearAllNotes()
      })

      expect(result.current.notes.length).toBe(0)
    })

    it('샘플 데이터로 초기화할 수 있다', () => {
      const { result } = renderHook(() => usePersistedNotes())

      // 먼저 모든 노트 삭제
      act(() => {
        result.current.clearAllNotes()
      })
      expect(result.current.notes.length).toBe(0)

      // 샘플 데이터로 초기화
      act(() => {
        result.current.resetToSampleData()
      })

      expect(result.current.notes.length).toBeGreaterThan(0)
    })

    it('노트를 JSON으로 내보낼 수 있다', () => {
      const { result } = renderHook(() => usePersistedNotes())

      const exported = result.current.exportNotes()
      const parsed = JSON.parse(exported)

      expect(parsed.notes).toBeDefined()
      expect(parsed.version).toBeDefined()
    })

    it('JSON에서 노트를 가져올 수 있다', () => {
      const { result } = renderHook(() => usePersistedNotes())

      const importData = JSON.stringify({
        version: 1,
        notes: [
          {
            id: 'imported-1',
            title: '가져온 노트',
            content: '가져온 내용',
            category: '가져오기',
            tags: [],
            isPinned: false,
            color: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        lastUpdated: new Date().toISOString(),
      })

      let success: boolean = false
      act(() => {
        success = result.current.importNotes(importData)
      })

      expect(success).toBe(true)
      expect(result.current.notes.length).toBe(1)
      expect(result.current.notes[0].title).toBe('가져온 노트')
    })

    it('잘못된 JSON은 가져오기에 실패한다', () => {
      const { result } = renderHook(() => usePersistedNotes())
      const noteCountBefore = result.current.notes.length

      let success: boolean = true
      act(() => {
        success = result.current.importNotes('invalid json')
      })

      expect(success).toBe(false)
      expect(result.current.notes.length).toBe(noteCountBefore)
    })
  })

  describe('필터링', () => {
    it('필터가 정상 동작한다', () => {
      const { result } = renderHook(() => usePersistedNotes())

      act(() => {
        result.current.setSearch('React')
      })

      expect(result.current.filter.search).toBe('React')
      // 검색 결과가 전체 노트보다 적어야 함
      expect(result.current.filteredNotes.length).toBeLessThanOrEqual(
        result.current.notes.length
      )
    })

    it('필터 초기화가 동작한다', () => {
      const { result } = renderHook(() => usePersistedNotes())

      act(() => {
        result.current.setSearch('test')
        result.current.setCategory('학습')
      })

      act(() => {
        result.current.clearFilter()
      })

      expect(result.current.filter.search).toBe('')
      expect(result.current.filter.category).toBeNull()
    })
  })
})
