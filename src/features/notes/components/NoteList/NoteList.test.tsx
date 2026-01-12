import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NoteList } from './NoteList'
import type { Note, NotesFilter } from '../../types'

const createMockNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'test-1',
  title: '테스트 노트',
  content: '테스트 내용입니다.',
  category: '테스트',
  tags: ['태그1'],
  isPinned: false,
  color: 'default',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

const defaultFilter: NotesFilter = {
  search: '',
  category: null,
  tag: null,
  sortBy: 'newest',
}

describe('NoteList', () => {
  const defaultProps = {
    notes: [
      createMockNote({ id: '1', title: '노트 1' }),
      createMockNote({ id: '2', title: '노트 2' }),
    ],
    selectedNote: null,
    filter: defaultFilter,
    allCategories: ['학습', '업무'],
    allTags: ['태그1', '태그2'],
    onSelectNote: vi.fn(),
    onTogglePin: vi.fn(),
    onDeleteNote: vi.fn(),
    onSearchChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onTagChange: vi.fn(),
    onSortChange: vi.fn(),
    onClearFilter: vi.fn(),
    onCreateNote: vi.fn(),
  }

  it('노트 목록을 렌더링한다', () => {
    render(<NoteList {...defaultProps} />)
    expect(screen.getByText('노트 1')).toBeInTheDocument()
    expect(screen.getByText('노트 2')).toBeInTheDocument()
  })

  it('헤더와 노트 개수를 표시한다', () => {
    render(<NoteList {...defaultProps} />)
    expect(screen.getByText('(2)')).toBeInTheDocument()
  })

  it('검색 입력을 처리한다', () => {
    const onSearchChange = vi.fn()
    render(<NoteList {...defaultProps} onSearchChange={onSearchChange} />)

    const searchInput = screen.getByPlaceholderText('노트 검색...')
    fireEvent.change(searchInput, { target: { value: 'React' } })

    expect(onSearchChange).toHaveBeenCalledWith('React')
  })

  it('카테고리 필터를 변경한다', () => {
    const onCategoryChange = vi.fn()
    render(<NoteList {...defaultProps} onCategoryChange={onCategoryChange} />)

    const categorySelect = screen.getByLabelText('카테고리 필터')
    fireEvent.change(categorySelect, { target: { value: '학습' } })

    expect(onCategoryChange).toHaveBeenCalledWith('학습')
  })

  it('태그 필터를 변경한다', () => {
    const onTagChange = vi.fn()
    render(<NoteList {...defaultProps} onTagChange={onTagChange} />)

    const tagSelect = screen.getByLabelText('태그 필터')
    fireEvent.change(tagSelect, { target: { value: '태그1' } })

    expect(onTagChange).toHaveBeenCalledWith('태그1')
  })

  it('정렬 기준을 변경한다', () => {
    const onSortChange = vi.fn()
    render(<NoteList {...defaultProps} onSortChange={onSortChange} />)

    const sortSelect = screen.getByLabelText('정렬')
    fireEvent.change(sortSelect, { target: { value: 'oldest' } })

    expect(onSortChange).toHaveBeenCalledWith('oldest')
  })

  it('새 노트 버튼 클릭을 처리한다', () => {
    const onCreateNote = vi.fn()
    render(<NoteList {...defaultProps} onCreateNote={onCreateNote} />)

    const newButton = screen.getByRole('button', { name: /새 노트/ })
    fireEvent.click(newButton)

    expect(onCreateNote).toHaveBeenCalled()
  })

  it('필터가 활성화되면 초기화 버튼을 표시한다', () => {
    const filterWithSearch: NotesFilter = { ...defaultFilter, search: 'test' }
    const onClearFilter = vi.fn()
    render(
      <NoteList
        {...defaultProps}
        filter={filterWithSearch}
        onClearFilter={onClearFilter}
      />
    )

    const clearButton = screen.getByRole('button', { name: '필터 초기화' })
    fireEvent.click(clearButton)

    expect(onClearFilter).toHaveBeenCalled()
  })

  it('필터가 활성화되지 않으면 초기화 버튼이 없다', () => {
    render(<NoteList {...defaultProps} />)
    expect(
      screen.queryByRole('button', { name: '필터 초기화' })
    ).not.toBeInTheDocument()
  })

  it('노트가 없으면 빈 상태를 표시한다', () => {
    render(<NoteList {...defaultProps} notes={[]} />)
    expect(screen.getByText(/노트가 없습니다/)).toBeInTheDocument()
  })

  it('필터 적용 후 노트가 없으면 다른 메시지를 표시한다', () => {
    const filterWithSearch: NotesFilter = {
      ...defaultFilter,
      search: 'nonexistent',
    }
    render(<NoteList {...defaultProps} notes={[]} filter={filterWithSearch} />)
    expect(screen.getByText(/검색 결과가 없습니다/)).toBeInTheDocument()
  })

  it('노트 선택 시 onSelectNote가 호출된다', () => {
    const onSelectNote = vi.fn()
    const notes = [createMockNote({ id: '1', title: '노트 1' })]
    render(
      <NoteList {...defaultProps} notes={notes} onSelectNote={onSelectNote} />
    )

    fireEvent.click(screen.getByText('노트 1'))
    expect(onSelectNote).toHaveBeenCalledWith(notes[0])
  })

  it('선택된 노트를 표시한다', () => {
    const selectedNote = createMockNote({ id: '1', title: '노트 1' })
    const { container } = render(
      <NoteList {...defaultProps} selectedNote={selectedNote} />
    )
    const selectedCard = container.querySelector('[class*="selected"]')
    expect(selectedCard).toBeInTheDocument()
  })
})
