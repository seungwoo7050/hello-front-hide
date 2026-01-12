import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NoteCard } from './NoteCard'
import type { Note } from '../../types'

const createMockNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'test-1',
  title: '테스트 노트',
  content:
    '테스트 내용입니다. 이것은 노트의 내용을 테스트하기 위한 텍스트입니다.',
  category: '테스트',
  tags: ['태그1', '태그2'],
  isPinned: false,
  color: 'default',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

describe('NoteCard', () => {
  const mockNote = createMockNote()
  const defaultProps = {
    note: mockNote,
    onSelect: vi.fn(),
    onTogglePin: vi.fn(),
    onDelete: vi.fn(),
    isSelected: false,
  }

  it('노트 제목을 렌더링한다', () => {
    render(<NoteCard {...defaultProps} />)
    expect(screen.getByText('테스트 노트')).toBeInTheDocument()
  })

  it('노트 내용을 렌더링한다', () => {
    render(<NoteCard {...defaultProps} />)
    expect(screen.getByText(/테스트 내용입니다/)).toBeInTheDocument()
  })

  it('카테고리를 렌더링한다', () => {
    render(<NoteCard {...defaultProps} />)
    expect(screen.getByText('테스트')).toBeInTheDocument()
  })

  it('태그를 렌더링한다 (# 포함)', () => {
    render(<NoteCard {...defaultProps} />)
    // 태그는 #태그1, #태그2 형태로 렌더링됨
    expect(screen.getByText(/태그1/)).toBeInTheDocument()
    expect(screen.getByText(/태그2/)).toBeInTheDocument()
  })

  it('클릭 시 onSelect가 호출된다', () => {
    const onSelect = vi.fn()
    const { container } = render(
      <NoteCard {...defaultProps} onSelect={onSelect} />
    )

    const article = container.querySelector('article')
    fireEvent.click(article!)
    expect(onSelect).toHaveBeenCalledWith(mockNote)
  })

  it('Enter 키 입력 시 onSelect가 호출된다', () => {
    const onSelect = vi.fn()
    const { container } = render(
      <NoteCard {...defaultProps} onSelect={onSelect} />
    )

    const article = container.querySelector('article')
    fireEvent.keyDown(article!, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith(mockNote)
  })

  it('고정 버튼 클릭 시 onTogglePin이 호출된다', () => {
    const onTogglePin = vi.fn()
    render(<NoteCard {...defaultProps} onTogglePin={onTogglePin} />)

    const pinButton = screen.getByLabelText('고정')
    fireEvent.click(pinButton)
    expect(onTogglePin).toHaveBeenCalledWith('test-1')
  })

  it('삭제 버튼 클릭 시 onDelete가 호출된다', () => {
    const onDelete = vi.fn()
    render(<NoteCard {...defaultProps} onDelete={onDelete} />)

    const deleteButton = screen.getByLabelText('삭제')
    fireEvent.click(deleteButton)
    expect(onDelete).toHaveBeenCalledWith('test-1')
  })

  it('고정된 노트는 고정 아이콘을 표시한다', () => {
    const pinnedNote = createMockNote({ isPinned: true })
    render(<NoteCard {...defaultProps} note={pinnedNote} />)

    const pinButton = screen.getByLabelText('고정 해제')
    expect(pinButton).toBeInTheDocument()
  })

  it('선택된 상태를 표시한다', () => {
    const { container } = render(
      <NoteCard {...defaultProps} isSelected={true} />
    )
    const article = container.querySelector('article')
    expect(article?.className).toContain('selected')
  })

  it('색상에 따른 클래스를 적용한다', () => {
    const blueNote = createMockNote({ color: 'blue' })
    const { container } = render(<NoteCard {...defaultProps} note={blueNote} />)
    const article = container.querySelector('article')
    expect(article?.className).toContain('Blue')
  })

  it('4개 이상의 태그가 있으면 나머지 개수를 표시한다', () => {
    const manyTagsNote = createMockNote({
      tags: ['태그1', '태그2', '태그3', '태그4', '태그5'],
    })
    render(<NoteCard {...defaultProps} note={manyTagsNote} />)
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('카테고리가 없으면 표시하지 않는다', () => {
    const noCategoryNote = createMockNote({ category: '' })
    render(<NoteCard {...defaultProps} note={noCategoryNote} />)
    // 카테고리 '테스트'가 있어야 하는데 없음
    const categoryElements = screen.queryByText('테스트')
    expect(categoryElements).not.toBeInTheDocument()
  })
})
