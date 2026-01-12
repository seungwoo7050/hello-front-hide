import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNotes } from './useNotes'
import type { NoteFormValues, Note } from './types'

describe('useNotes', () => {
  beforeEach(() => {
    // 각 테스트 전에 초기 상태로 리셋
  })

  describe('초기 상태', () => {
    it('샘플 노트가 로드된다', () => {
      const { result } = renderHook(() => useNotes())
      expect(result.current.notes.length).toBeGreaterThan(0)
    })

    it('선택된 노트가 없다', () => {
      const { result } = renderHook(() => useNotes())
      expect(result.current.selectedNote).toBeNull()
    })

    it('편집 모드가 아니다', () => {
      const { result } = renderHook(() => useNotes())
      expect(result.current.isEditing).toBe(false)
    })
  })

  describe('createNote', () => {
    it('새 노트를 생성한다', () => {
      const { result } = renderHook(() => useNotes())
      const initialCount = result.current.notes.length

      const newNote: NoteFormValues = {
        title: '새 노트',
        content: '새 노트 내용',
        category: '테스트',
        tags: '태그1, 태그2',
        color: 'blue',
      }

      act(() => {
        result.current.createNote(newNote)
      })

      expect(result.current.notes.length).toBe(initialCount + 1)
    })

    it('생성된 노트를 반환한다', () => {
      const { result } = renderHook(() => useNotes())

      const newNote: NoteFormValues = {
        title: '새 노트',
        content: '새 노트 내용',
        category: '테스트',
        tags: '',
        color: 'default',
      }

      let createdNote: Note | undefined
      act(() => {
        createdNote = result.current.createNote(newNote)
      })

      expect(createdNote).toBeDefined()
      expect(createdNote?.title).toBe('새 노트')
    })

    it('태그가 쉼표로 분리된다', () => {
      const { result } = renderHook(() => useNotes())

      const newNote: NoteFormValues = {
        title: '새 노트',
        content: '내용',
        category: '',
        tags: '태그1, 태그2, 태그3',
        color: 'default',
      }

      let createdNote: Note | undefined
      act(() => {
        createdNote = result.current.createNote(newNote)
      })

      expect(createdNote?.tags).toEqual(['태그1', '태그2', '태그3'])
    })
  })

  describe('updateNote', () => {
    it('노트를 업데이트한다', () => {
      const { result } = renderHook(() => useNotes())
      const firstNote = result.current.notes[0]

      const updates: NoteFormValues = {
        title: '수정된 제목',
        content: '수정된 내용',
        category: firstNote.category,
        tags: firstNote.tags.join(', '),
        color: firstNote.color,
      }

      act(() => {
        result.current.updateNote(firstNote.id, updates)
      })

      const updatedNote = result.current.notes.find(
        (n) => n.id === firstNote.id
      )
      expect(updatedNote?.title).toBe('수정된 제목')
      expect(updatedNote?.content).toBe('수정된 내용')
    })

    it('업데이트 시간이 갱신된다', () => {
      const { result } = renderHook(() => useNotes())
      const firstNote = result.current.notes[0]
      const originalUpdatedAt = firstNote.updatedAt

      const updates: NoteFormValues = {
        title: '수정된 제목',
        content: firstNote.content,
        category: firstNote.category,
        tags: firstNote.tags.join(', '),
        color: firstNote.color,
      }

      act(() => {
        result.current.updateNote(firstNote.id, updates)
      })

      const updatedNote = result.current.notes.find(
        (n) => n.id === firstNote.id
      )
      expect(updatedNote?.updatedAt).not.toBe(originalUpdatedAt)
    })
  })

  describe('deleteNote', () => {
    it('노트를 삭제한다', () => {
      const { result } = renderHook(() => useNotes())
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

    it('선택된 노트가 삭제되면 선택이 해제된다', () => {
      const { result } = renderHook(() => useNotes())
      const firstNote = result.current.notes[0]

      act(() => {
        result.current.selectNote(firstNote)
      })

      expect(result.current.selectedNote?.id).toBe(firstNote.id)

      act(() => {
        result.current.deleteNote(firstNote.id)
      })

      expect(result.current.selectedNote).toBeNull()
    })
  })

  describe('togglePin', () => {
    it('노트를 고정/해제한다', () => {
      const { result } = renderHook(() => useNotes())
      const unpinnedNote = result.current.notes.find((n) => !n.isPinned)

      if (!unpinnedNote) return

      act(() => {
        result.current.togglePin(unpinnedNote.id)
      })

      const toggledNote = result.current.notes.find(
        (n) => n.id === unpinnedNote.id
      )
      expect(toggledNote?.isPinned).toBe(true)

      act(() => {
        result.current.togglePin(unpinnedNote.id)
      })

      const toggledAgain = result.current.notes.find(
        (n) => n.id === unpinnedNote.id
      )
      expect(toggledAgain?.isPinned).toBe(false)
    })
  })

  describe('필터링', () => {
    it('검색어로 필터링한다', () => {
      const { result } = renderHook(() => useNotes())

      act(() => {
        result.current.setSearch('React')
      })

      expect(
        result.current.filteredNotes.every(
          (n) =>
            n.title.toLowerCase().includes('react') ||
            n.content.toLowerCase().includes('react') ||
            n.tags.some((t) => t.toLowerCase().includes('react'))
        )
      ).toBe(true)
    })

    it('정렬 기준을 변경한다', () => {
      const { result } = renderHook(() => useNotes())

      act(() => {
        result.current.setSortBy('title-asc')
      })

      expect(result.current.filter.sortBy).toBe('title-asc')
    })

    it('필터를 초기화한다', () => {
      const { result } = renderHook(() => useNotes())

      act(() => {
        result.current.setSearch('test')
        result.current.setSortBy('oldest')
      })

      act(() => {
        result.current.clearFilter()
      })

      expect(result.current.filter.search).toBe('')
      expect(result.current.filter.sortBy).toBe('newest')
    })
  })

  describe('선택', () => {
    it('노트를 선택한다', () => {
      const { result } = renderHook(() => useNotes())
      const firstNote = result.current.notes[0]

      act(() => {
        result.current.selectNote(firstNote)
      })

      expect(result.current.selectedNote?.id).toBe(firstNote.id)
    })

    it('null로 선택 해제한다', () => {
      const { result } = renderHook(() => useNotes())
      const firstNote = result.current.notes[0]

      act(() => {
        result.current.selectNote(firstNote)
      })

      act(() => {
        result.current.selectNote(null)
      })

      expect(result.current.selectedNote).toBeNull()
    })

    it('편집 모드를 토글한다', () => {
      const { result } = renderHook(() => useNotes())

      act(() => {
        result.current.setIsEditing(true)
      })

      expect(result.current.isEditing).toBe(true)

      act(() => {
        result.current.setIsEditing(false)
      })

      expect(result.current.isEditing).toBe(false)
    })
  })

  describe('allTags와 allCategories', () => {
    it('모든 태그를 추출한다', () => {
      const { result } = renderHook(() => useNotes())
      expect(Array.isArray(result.current.allTags)).toBe(true)
    })

    it('모든 카테고리를 추출한다', () => {
      const { result } = renderHook(() => useNotes())
      expect(Array.isArray(result.current.allCategories)).toBe(true)
    })
  })
})
