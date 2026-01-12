import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useNotesQuery, useCreateNote, useDeleteNote } from './useNotesQuery'
import { resetNotes } from '../../mocks/handlers/notes'
import type { Note, NoteFormValues } from './types'
import { tokenStorage } from '../auth/tokenStorage'
import { createMockJwt } from '../auth/jwt'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

function createWrapper() {
  const queryClient = createTestQueryClient()
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe('useNotesQuery', () => {
  beforeEach(() => {
    resetNotes()
    tokenStorage.clearTokens()
    const accessToken = createMockJwt({ sub: 'user-1', type: 'access' })
    const refreshToken = createMockJwt({ sub: 'user-1', type: 'refresh' }, 3600)
    tokenStorage.setTokens(accessToken, refreshToken)
  })

  afterEach(() => {
    tokenStorage.clearTokens()
  })

  describe('조회', () => {
    it('노트 목록을 조회한다', async () => {
      const { result } = renderHook(() => useNotesQuery(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toBeDefined()
      expect(result.current.data!.length).toBeGreaterThan(0)
    })

    it('로딩 상태를 반환한다', () => {
      const { result } = renderHook(() => useNotesQuery(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('검색 파라미터로 필터링된 결과를 반환한다', async () => {
      const { result } = renderHook(() => useNotesQuery({ search: 'React' }), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toBeDefined()
      result.current.data!.forEach((note: Note) => {
        const matchesSearch =
          note.title.toLowerCase().includes('react') ||
          note.content.toLowerCase().includes('react') ||
          note.tags.some((t: string) => t.toLowerCase().includes('react'))
        expect(matchesSearch).toBe(true)
      })
    })
  })

  describe('생성', () => {
    it('새 노트를 생성하고 성공 상태를 반환한다', async () => {
      resetNotes()
      const { result } = renderHook(() => useCreateNote(), {
        wrapper: createWrapper(),
      })

      const newNote: NoteFormValues = {
        title: '새로 생성한 노트',
        content: '테스트 내용',
        category: '테스트',
        tags: '태그1, 태그2',
        color: 'green',
      }

      result.current.mutate(newNote)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toBeDefined()
      expect(result.current.data!.title).toBe('새로 생성한 노트')
      expect(result.current.data!.id).toBeDefined()
    })
  })

  describe('삭제', () => {
    it('노트를 삭제한다', async () => {
      resetNotes()
      const wrapper = createWrapper()
      const { result: queryResult } = renderHook(() => useNotesQuery(), {
        wrapper,
      })
      const { result: mutationResult } = renderHook(() => useDeleteNote(), {
        wrapper,
      })

      await waitFor(() => {
        expect(queryResult.current.isSuccess).toBe(true)
        expect(queryResult.current.data).toBeDefined()
        expect(queryResult.current.data!.length).toBeGreaterThan(0)
      })

      const initialCount = queryResult.current.data!.length
      const noteToDelete = queryResult.current.data![0]

      mutationResult.current.mutate(noteToDelete.id)

      await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true))

      // 낙관적 업데이트로 즉시 반영
      await waitFor(() => {
        return queryResult.current.data!.length < initialCount
      })

      expect(
        queryResult.current.data!.find((n: Note) => n.id === noteToDelete.id)
      ).toBeUndefined()
    })
  })
})
