import { describe, it, expect } from 'vitest'
import {
  generateId,
  formatDate,
  formatRelativeTime,
  searchNotes,
  sortNotes,
  filterByCategory,
  filterByTag,
  extractAllTags,
  extractAllCategories,
  summarizeText,
} from './utils'
import type { Note } from './types'

const createMockNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'test-1',
  title: '테스트 노트',
  content: '테스트 내용입니다.',
  category: '테스트',
  tags: ['태그1', '태그2'],
  isPinned: false,
  color: 'default',
  createdAt: '2025-01-20T10:00:00Z',
  updatedAt: '2025-01-20T10:00:00Z',
  ...overrides,
})

describe('utils', () => {
  describe('generateId', () => {
    it('고유한 ID를 생성한다', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })

    it('문자열 ID를 반환한다', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })
  })

  describe('formatDate', () => {
    it('Date 객체를 한국어 형식으로 포맷한다', () => {
      const date = new Date('2025-01-20T14:30:00')
      const formatted = formatDate(date)
      expect(formatted).toContain('2025')
      expect(formatted).toContain('1월')
      expect(formatted).toContain('20일')
    })

    it('문자열 날짜도 처리한다', () => {
      const formatted = formatDate('2025-01-20T14:30:00')
      expect(formatted).toContain('2025')
    })
  })

  describe('formatRelativeTime', () => {
    it('방금 전을 표시한다', () => {
      const now = new Date()
      const result = formatRelativeTime(now)
      expect(result).toBe('방금 전')
    })

    it('분 단위를 표시한다', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000)
      const result = formatRelativeTime(date)
      expect(result).toBe('5분 전')
    })

    it('시간 단위를 표시한다', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000)
      const result = formatRelativeTime(date)
      expect(result).toBe('3시간 전')
    })

    it('일 단위를 표시한다', () => {
      const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      const result = formatRelativeTime(date)
      expect(result).toBe('2일 전')
    })
  })

  describe('searchNotes', () => {
    const notes: Note[] = [
      createMockNote({
        id: '1',
        title: 'React 학습',
        content: '컴포넌트 기초',
      }),
      createMockNote({
        id: '2',
        title: 'TypeScript',
        content: '타입 시스템',
        tags: ['타입스크립트'],
      }),
      createMockNote({
        id: '3',
        title: '할일 목록',
        content: 'React 프로젝트',
      }),
    ]

    it('제목으로 검색한다', () => {
      const result = searchNotes(notes, 'React')
      expect(result).toHaveLength(2)
    })

    it('내용으로 검색한다', () => {
      const result = searchNotes(notes, '컴포넌트')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('태그로 검색한다', () => {
      const result = searchNotes(notes, '타입스크립트')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })

    it('대소문자 구분 없이 검색한다', () => {
      const result = searchNotes(notes, 'react')
      expect(result).toHaveLength(2)
    })

    it('빈 검색어는 전체를 반환한다', () => {
      const result = searchNotes(notes, '')
      expect(result).toHaveLength(3)
    })
  })

  describe('sortNotes', () => {
    const notes: Note[] = [
      createMockNote({
        id: '1',
        title: '가나다',
        createdAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-21T10:00:00Z',
      }),
      createMockNote({
        id: '2',
        title: '라마바',
        createdAt: '2025-01-19T10:00:00Z',
        updatedAt: '2025-01-22T10:00:00Z',
      }),
      createMockNote({
        id: '3',
        title: '아자차',
        createdAt: '2025-01-21T10:00:00Z',
        updatedAt: '2025-01-20T10:00:00Z',
      }),
    ]

    it('newest로 정렬한다', () => {
      const result = sortNotes(notes, 'newest')
      expect(result[0].id).toBe('3')
      expect(result[2].id).toBe('2')
    })

    it('oldest로 정렬한다', () => {
      const result = sortNotes(notes, 'oldest')
      expect(result[0].id).toBe('2')
      expect(result[2].id).toBe('3')
    })

    it('title-asc로 정렬한다', () => {
      const result = sortNotes(notes, 'title-asc')
      expect(result[0].title).toBe('가나다')
      expect(result[2].title).toBe('아자차')
    })

    it('title-desc로 정렬한다', () => {
      const result = sortNotes(notes, 'title-desc')
      expect(result[0].title).toBe('아자차')
      expect(result[2].title).toBe('가나다')
    })

    it('updated로 정렬한다', () => {
      const result = sortNotes(notes, 'updated')
      expect(result[0].id).toBe('2')
    })
  })

  describe('filterByCategory', () => {
    const notes: Note[] = [
      createMockNote({ id: '1', category: '학습' }),
      createMockNote({ id: '2', category: '업무' }),
      createMockNote({ id: '3', category: '학습' }),
    ]

    it('카테고리로 필터링한다', () => {
      const result = filterByCategory(notes, '학습')
      expect(result).toHaveLength(2)
    })

    it('null이면 전체를 반환한다', () => {
      const result = filterByCategory(notes, null)
      expect(result).toHaveLength(3)
    })
  })

  describe('filterByTag', () => {
    const notes: Note[] = [
      createMockNote({ id: '1', tags: ['React', 'JavaScript'] }),
      createMockNote({ id: '2', tags: ['TypeScript'] }),
      createMockNote({ id: '3', tags: ['React', 'TypeScript'] }),
    ]

    it('태그로 필터링한다', () => {
      const result = filterByTag(notes, 'React')
      expect(result).toHaveLength(2)
    })

    it('null이면 전체를 반환한다', () => {
      const result = filterByTag(notes, null)
      expect(result).toHaveLength(3)
    })
  })

  describe('extractAllTags', () => {
    it('모든 태그를 추출한다', () => {
      const notes: Note[] = [
        createMockNote({ tags: ['React', 'JavaScript'] }),
        createMockNote({ tags: ['TypeScript', 'React'] }),
      ]
      const tags = extractAllTags(notes)
      expect(tags).toContain('React')
      expect(tags).toContain('JavaScript')
      expect(tags).toContain('TypeScript')
      expect(tags).toHaveLength(3) // 중복 제거
    })
  })

  describe('extractAllCategories', () => {
    it('모든 카테고리를 추출한다', () => {
      const notes: Note[] = [
        createMockNote({ category: '학습' }),
        createMockNote({ category: '업무' }),
        createMockNote({ category: '학습' }),
      ]
      const categories = extractAllCategories(notes)
      expect(categories).toContain('학습')
      expect(categories).toContain('업무')
      expect(categories).toHaveLength(2)
    })
  })

  describe('summarizeText', () => {
    it('긴 텍스트를 요약한다', () => {
      const text = '가'.repeat(200)
      const result = summarizeText(text, 100)
      expect(result.length).toBeLessThanOrEqual(103) // 100 + ...
      expect(result.endsWith('...')).toBe(true)
    })

    it('짧은 텍스트는 그대로 반환한다', () => {
      const text = '짧은 텍스트'
      const result = summarizeText(text, 100)
      expect(result).toBe(text)
    })
  })
})
