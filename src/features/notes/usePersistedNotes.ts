import { useCallback, useMemo } from 'react'
import type { Note, NotesFilter, SortOption, NoteFormValues } from './types'
import { sampleNotes } from './sampleData'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import {
  generateId,
  searchNotes,
  sortNotes,
  filterByCategory,
  filterByTag,
  extractAllTags,
  extractAllCategories,
} from './utils'
import { useState } from 'react'

const NOTES_STORAGE_KEY = 'notes-app-data'
const NOTES_VERSION = 1

interface StoredNotesData {
  version: number
  notes: Note[]
  lastUpdated: string
}

interface UsePersistedNotesReturn {
  // 상태
  notes: Note[]
  filteredNotes: Note[]
  filter: NotesFilter
  selectedNote: Note | null
  isEditing: boolean
  isLoaded: boolean

  // 필터/정렬 관련
  allTags: string[]
  allCategories: string[]

  // 액션
  createNote: (values: NoteFormValues) => Note
  updateNote: (id: string, values: Partial<NoteFormValues>) => void
  deleteNote: (id: string) => void
  togglePin: (id: string) => void
  setSearch: (search: string) => void
  setCategory: (category: string | null) => void
  setTag: (tag: string | null) => void
  setSortBy: (sortBy: SortOption) => void
  selectNote: (note: Note | null) => void
  setIsEditing: (editing: boolean) => void
  clearFilter: () => void

  // 영속성 관련
  clearAllNotes: () => void
  resetToSampleData: () => void
  exportNotes: () => string
  importNotes: (jsonString: string) => boolean
}

// 데이터 마이그레이션 함수
function migrateData(data: StoredNotesData): StoredNotesData {
  // 버전 업그레이드 시 마이그레이션 로직 추가
  if (data.version < NOTES_VERSION) {
    // 마이그레이션 로직
    return {
      ...data,
      version: NOTES_VERSION,
    }
  }
  return data
}

// 초기 데이터 생성
function createInitialData(): StoredNotesData {
  return {
    version: NOTES_VERSION,
    notes: sampleNotes,
    lastUpdated: new Date().toISOString(),
  }
}

export function usePersistedNotes(): UsePersistedNotesReturn {
  const [storedData, setStoredData] = useLocalStorage<StoredNotesData>(
    NOTES_STORAGE_KEY,
    createInitialData()
  )

  // 마이그레이션 적용
  const data = useMemo(() => migrateData(storedData), [storedData])
  const notes = data.notes

  const [filter, setFilter] = useState<NotesFilter>({
    search: '',
    category: null,
    tag: null,
    sortBy: 'newest',
  })
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // 노트 업데이트 헬퍼
  const updateNotes = useCallback(
    (updater: (notes: Note[]) => Note[]) => {
      setStoredData((prev) => ({
        ...prev,
        notes: updater(prev.notes),
        lastUpdated: new Date().toISOString(),
      }))
    },
    [setStoredData]
  )

  // 필터링 및 정렬된 노트 목록
  const filteredNotes = useMemo(() => {
    let result = notes

    result = searchNotes(result, filter.search)
    result = filterByCategory(result, filter.category)
    result = filterByTag(result, filter.tag)

    const pinnedNotes = result.filter((n) => n.isPinned)
    const unpinnedNotes = result.filter((n) => !n.isPinned)

    return [
      ...sortNotes(pinnedNotes, filter.sortBy),
      ...sortNotes(unpinnedNotes, filter.sortBy),
    ]
  }, [notes, filter])

  // 모든 태그/카테고리 추출
  const allTags = useMemo(() => extractAllTags(notes), [notes])
  const allCategories = useMemo(() => extractAllCategories(notes), [notes])

  // 노트 생성
  const createNote = useCallback(
    (values: NoteFormValues): Note => {
      const now = new Date().toISOString()
      const newNote: Note = {
        id: generateId(),
        title: values.title,
        content: values.content,
        category: values.category,
        tags: values.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        isPinned: false,
        color: values.color,
        createdAt: now,
        updatedAt: now,
      }

      updateNotes((prev) => [newNote, ...prev])
      return newNote
    },
    [updateNotes]
  )

  // 노트 수정
  const updateNote = useCallback(
    (id: string, values: Partial<NoteFormValues>) => {
      updateNotes((prev) =>
        prev.map((note) => {
          if (note.id !== id) return note

          return {
            ...note,
            ...(values.title !== undefined && { title: values.title }),
            ...(values.content !== undefined && { content: values.content }),
            ...(values.category !== undefined && { category: values.category }),
            ...(values.tags !== undefined && {
              tags: values.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            }),
            ...(values.color !== undefined && { color: values.color }),
            updatedAt: new Date().toISOString(),
          }
        })
      )

      if (selectedNote?.id === id) {
        setSelectedNote((prev) => {
          if (!prev) return null
          return {
            ...prev,
            ...(values.title !== undefined && { title: values.title }),
            ...(values.content !== undefined && { content: values.content }),
            ...(values.category !== undefined && { category: values.category }),
            ...(values.tags !== undefined && {
              tags: values.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            }),
            ...(values.color !== undefined && { color: values.color }),
            updatedAt: new Date().toISOString(),
          }
        })
      }
    },
    [selectedNote?.id, updateNotes]
  )

  // 노트 삭제
  const deleteNote = useCallback(
    (id: string) => {
      updateNotes((prev) => prev.filter((note) => note.id !== id))
      if (selectedNote?.id === id) {
        setSelectedNote(null)
        setIsEditing(false)
      }
    },
    [selectedNote?.id, updateNotes]
  )

  // 고정 토글
  const togglePin = useCallback(
    (id: string) => {
      updateNotes((prev) =>
        prev.map((note) =>
          note.id === id
            ? {
                ...note,
                isPinned: !note.isPinned,
                updatedAt: new Date().toISOString(),
              }
            : note
        )
      )

      if (selectedNote?.id === id) {
        setSelectedNote((prev) =>
          prev ? { ...prev, isPinned: !prev.isPinned } : null
        )
      }
    },
    [selectedNote?.id, updateNotes]
  )

  // 필터 설정
  const setSearch = useCallback((search: string) => {
    setFilter((prev) => ({ ...prev, search }))
  }, [])

  const setCategory = useCallback((category: string | null) => {
    setFilter((prev) => ({ ...prev, category }))
  }, [])

  const setTag = useCallback((tag: string | null) => {
    setFilter((prev) => ({ ...prev, tag }))
  }, [])

  const setSortBy = useCallback((sortBy: SortOption) => {
    setFilter((prev) => ({ ...prev, sortBy }))
  }, [])

  const clearFilter = useCallback(() => {
    setFilter({
      search: '',
      category: null,
      tag: null,
      sortBy: 'newest',
    })
  }, [])

  const selectNote = useCallback((note: Note | null) => {
    setSelectedNote(note)
    setIsEditing(false)
  }, [])

  // 영속성 관련 메서드
  const clearAllNotes = useCallback(() => {
    setStoredData({
      version: NOTES_VERSION,
      notes: [],
      lastUpdated: new Date().toISOString(),
    })
    setSelectedNote(null)
    setIsEditing(false)
  }, [setStoredData])

  const resetToSampleData = useCallback(() => {
    setStoredData(createInitialData())
    setSelectedNote(null)
    setIsEditing(false)
  }, [setStoredData])

  const exportNotes = useCallback((): string => {
    return JSON.stringify(data, null, 2)
  }, [data])

  const importNotes = useCallback(
    (jsonString: string): boolean => {
      try {
        const importedData = JSON.parse(jsonString) as StoredNotesData

        // 기본 유효성 검사
        if (!importedData.notes || !Array.isArray(importedData.notes)) {
          throw new Error('Invalid data format')
        }

        setStoredData(migrateData(importedData))
        setSelectedNote(null)
        setIsEditing(false)
        return true
      } catch {
        console.error('Failed to import notes')
        return false
      }
    },
    [setStoredData]
  )

  return {
    notes,
    filteredNotes,
    filter,
    selectedNote,
    isEditing,
    isLoaded: true,
    allTags,
    allCategories,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    setSearch,
    setCategory,
    setTag,
    setSortBy,
    selectNote,
    setIsEditing,
    clearFilter,
    clearAllNotes,
    resetToSampleData,
    exportNotes,
    importNotes,
  }
}
