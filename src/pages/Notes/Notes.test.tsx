import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { Notes } from './Notes'
import { ToastProvider } from '../../components/ui'
import { QueryProvider } from '../../providers'
import { setTokens } from '../../features/auth/tokenStorage'
import { createMockJwt } from '../../features/auth/jwt'

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <QueryProvider>
        <ToastProvider>{ui}</ToastProvider>
      </QueryProvider>
    </BrowserRouter>
  )
}

function seedTokens() {
  const access = createMockJwt({ sub: 'user-1', email: 'test@example.com' })
  const refresh = createMockJwt({ sub: 'user-1', type: 'refresh' }, 60 * 60)
  setTokens(access, refresh)
}

describe('Notes Page', () => {
  beforeEach(() => {
    window.localStorage.clear()
    seedTokens()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('노트 목록과 에디터를 렌더링한다', async () => {
    renderWithProviders(<Notes />)

    // 노트 목록이 있는지 확인
    expect(
      await screen.findByPlaceholderText('노트 검색...')
    ).toBeInTheDocument()

    // 에디터 영역이 있는지 확인 (빈 상태)
    expect(await screen.findByText('노트를 선택하세요')).toBeInTheDocument()
  })

  it('샘플 노트가 표시된다', async () => {
    renderWithProviders(<Notes />)

    // 샘플 노트 제목 확인
    expect(await screen.findByText('React 학습 메모')).toBeInTheDocument()
  })

  it('노트를 선택하면 에디터에 표시된다', async () => {
    renderWithProviders(<Notes />)

    // 노트 선택
    fireEvent.click(await screen.findByText('React 학습 메모'))

    // 에디터에 내용이 표시되는지 확인
    expect(await screen.findByText('노트 상세')).toBeInTheDocument()
  })

  it('새 노트 버튼을 클릭하면 편집 모드로 전환된다', async () => {
    renderWithProviders(<Notes />)

    // 새 노트 버튼 클릭
    const newNoteButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.textContent?.includes('새 노트'))
    fireEvent.click(newNoteButtons[0])

    // 편집 폼이 표시되는지 확인
    expect(
      await screen.findByPlaceholderText('제목을 입력하세요')
    ).toBeInTheDocument()
    expect(
      await screen.findByPlaceholderText('내용을 입력하세요...')
    ).toBeInTheDocument()
  })

  it('검색을 수행한다', async () => {
    renderWithProviders(<Notes />)

    const searchInput = screen.getByPlaceholderText('노트 검색...')
    fireEvent.change(searchInput, { target: { value: 'React' } })

    // React 관련 노트는 보이고 다른 노트는 안 보여야 함
    expect(await screen.findByText('React 학습 메모')).toBeInTheDocument()
  })

  it('정렬 기준을 변경한다', async () => {
    renderWithProviders(<Notes />)

    const sortSelect = await screen.findByLabelText('정렬')
    fireEvent.change(sortSelect, { target: { value: 'title-asc' } })

    expect(sortSelect).toHaveValue('title-asc')
  })

  it('노트를 선택하고 수정 버튼을 클릭하면 편집 모드가 된다', async () => {
    renderWithProviders(<Notes />)

    // 노트 선택
    fireEvent.click(await screen.findByText('React 학습 메모'))

    // 수정 버튼 클릭
    const editButton = screen.getByRole('button', { name: '수정' })
    fireEvent.click(editButton)

    // 편집 폼 표시 확인
    expect(
      await screen.findByPlaceholderText('제목을 입력하세요')
    ).toBeInTheDocument()
  })

  it('노트 개수를 표시한다', () => {
    renderWithProviders(<Notes />)

    // 샘플 데이터에 3개의 노트가 있음
    expect(screen.getByText('(3)')).toBeInTheDocument()
  })

  it('카테고리 필터 옵션이 있다', async () => {
    renderWithProviders(<Notes />)

    const categorySelect = await screen.findByLabelText('카테고리 필터')
    expect(categorySelect).toBeInTheDocument()
  })

  it('태그 필터 옵션이 있다', async () => {
    renderWithProviders(<Notes />)

    const tagSelect = await screen.findByLabelText('태그 필터')
    expect(tagSelect).toBeInTheDocument()
  })
})
