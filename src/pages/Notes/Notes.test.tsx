import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { Notes } from './Notes';
import { ToastProvider } from '../../components/ui';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        {ui}
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('Notes Page', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('노트 목록과 에디터를 렌더링한다', () => {
    renderWithProviders(<Notes />);
    
    // 노트 목록이 있는지 확인
    expect(screen.getByPlaceholderText('노트 검색...')).toBeInTheDocument();
    
    // 에디터 영역이 있는지 확인 (빈 상태)
    expect(screen.getByText('노트를 선택하세요')).toBeInTheDocument();
  });

  it('샘플 노트가 표시된다', () => {
    renderWithProviders(<Notes />);
    
    // 샘플 노트 제목 확인
    expect(screen.getByText('React 학습 메모')).toBeInTheDocument();
  });

  it('노트를 선택하면 에디터에 표시된다', () => {
    renderWithProviders(<Notes />);
    
    // 노트 선택
    fireEvent.click(screen.getByText('React 학습 메모'));
    
    // 에디터에 내용이 표시되는지 확인
    expect(screen.queryByText('노트를 선택하세요')).not.toBeInTheDocument();
  });

  it('새 노트 버튼을 클릭하면 편집 모드로 전환된다', () => {
    renderWithProviders(<Notes />);
    
    // 새 노트 버튼 클릭
    const newNoteButtons = screen.getAllByRole('button').filter(
      btn => btn.textContent?.includes('새 노트')
    );
    fireEvent.click(newNoteButtons[0]);
    
    // 편집 폼이 표시되는지 확인
    expect(screen.getByPlaceholderText('제목을 입력하세요')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('내용을 입력하세요...')).toBeInTheDocument();
  });

  it('검색을 수행한다', () => {
    renderWithProviders(<Notes />);
    
    const searchInput = screen.getByPlaceholderText('노트 검색...');
    fireEvent.change(searchInput, { target: { value: 'React' } });
    
    // React 관련 노트는 보이고 다른 노트는 안 보여야 함
    expect(screen.getByText('React 학습 메모')).toBeInTheDocument();
  });

  it('정렬 기준을 변경한다', () => {
    renderWithProviders(<Notes />);
    
    const sortSelect = screen.getByLabelText('정렬');
    fireEvent.change(sortSelect, { target: { value: 'title-asc' } });
    
    expect(sortSelect).toHaveValue('title-asc');
  });

  it('노트를 선택하고 수정 버튼을 클릭하면 편집 모드가 된다', () => {
    renderWithProviders(<Notes />);
    
    // 노트 선택
    fireEvent.click(screen.getByText('React 학습 메모'));
    
    // 수정 버튼 클릭
    const editButton = screen.getByRole('button', { name: '수정' });
    fireEvent.click(editButton);
    
    // 편집 폼 표시 확인
    expect(screen.getByPlaceholderText('제목을 입력하세요')).toBeInTheDocument();
  });

  it('노트 개수를 표시한다', () => {
    renderWithProviders(<Notes />);
    
    // 샘플 데이터에 5개의 노트가 있음
    expect(screen.getByText('(5)')).toBeInTheDocument();
  });

  it('카테고리 필터 옵션이 있다', () => {
    renderWithProviders(<Notes />);
    
    const categorySelect = screen.getByLabelText('카테고리 필터');
    expect(categorySelect).toBeInTheDocument();
  });

  it('태그 필터 옵션이 있다', () => {
    renderWithProviders(<Notes />);
    
    const tagSelect = screen.getByLabelText('태그 필터');
    expect(tagSelect).toBeInTheDocument();
  });
});
