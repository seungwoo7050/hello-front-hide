import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteEditor } from './NoteEditor';
import type { Note } from '../../types';

const createMockNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'test-1',
  title: '테스트 노트',
  content: '테스트 내용입니다.',
  category: '테스트',
  tags: ['태그1', '태그2'],
  isPinned: false,
  color: 'default',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('NoteEditor', () => {
  const defaultProps = {
    note: null,
    isEditing: false,
    onSave: vi.fn(),
    onCancel: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  describe('빈 상태', () => {
    it('노트가 없으면 빈 상태를 표시한다', () => {
      render(<NoteEditor {...defaultProps} />);
      expect(screen.getByText('노트를 선택하세요')).toBeInTheDocument();
    });
  });

  describe('보기 모드', () => {
    it('노트 제목을 표시한다', () => {
      const note = createMockNote();
      render(<NoteEditor {...defaultProps} note={note} />);
      expect(screen.getByText('테스트 노트')).toBeInTheDocument();
    });

    it('노트 내용을 표시한다', () => {
      const note = createMockNote();
      render(<NoteEditor {...defaultProps} note={note} />);
      expect(screen.getByText('테스트 내용입니다.')).toBeInTheDocument();
    });

    it('수정 버튼을 표시한다', () => {
      const note = createMockNote();
      const onEdit = vi.fn();
      render(<NoteEditor {...defaultProps} note={note} onEdit={onEdit} />);
      
      const editButton = screen.getByRole('button', { name: '수정' });
      fireEvent.click(editButton);
      expect(onEdit).toHaveBeenCalled();
    });

    it('삭제 버튼을 클릭하면 확인 다이얼로그가 표시된다', () => {
      const note = createMockNote();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const onDelete = vi.fn();
      render(<NoteEditor {...defaultProps} note={note} onDelete={onDelete} />);
      
      const deleteButton = screen.getByRole('button', { name: '삭제' });
      fireEvent.click(deleteButton);
      
      expect(confirmSpy).toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('삭제 확인 시 onDelete가 호출된다', () => {
      const note = createMockNote();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const onDelete = vi.fn();
      render(<NoteEditor {...defaultProps} note={note} onDelete={onDelete} />);
      
      fireEvent.click(screen.getByRole('button', { name: '삭제' }));
      
      expect(onDelete).toHaveBeenCalledWith('test-1');
      confirmSpy.mockRestore();
    });
  });

  describe('편집 모드', () => {
    it('편집 폼을 표시한다', () => {
      const note = createMockNote();
      render(<NoteEditor {...defaultProps} note={note} isEditing={true} />);
      
      expect(screen.getByPlaceholderText('제목을 입력하세요')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('내용을 입력하세요...')).toBeInTheDocument();
    });

    it('기존 노트 값이 폼에 채워진다', () => {
      const note = createMockNote();
      render(<NoteEditor {...defaultProps} note={note} isEditing={true} />);
      
      expect(screen.getByPlaceholderText('제목을 입력하세요')).toHaveValue('테스트 노트');
      expect(screen.getByPlaceholderText('내용을 입력하세요...')).toHaveValue('테스트 내용입니다.');
    });

    it('색상 선택기를 표시한다', () => {
      const note = createMockNote();
      render(<NoteEditor {...defaultProps} note={note} isEditing={true} />);
      
      expect(screen.getByText('색상')).toBeInTheDocument();
    });

    it('저장 버튼 클릭 시 onSave가 호출된다', () => {
      const note = createMockNote();
      const onSave = vi.fn();
      render(<NoteEditor {...defaultProps} note={note} isEditing={true} onSave={onSave} />);
      
      fireEvent.click(screen.getByRole('button', { name: '저장' }));
      expect(onSave).toHaveBeenCalled();
    });

    it('취소 버튼 클릭 시 onCancel이 호출된다', () => {
      const note = createMockNote();
      const onCancel = vi.fn();
      render(<NoteEditor {...defaultProps} note={note} isEditing={true} onCancel={onCancel} />);
      
      fireEvent.click(screen.getByRole('button', { name: '취소' }));
      expect(onCancel).toHaveBeenCalled();
    });

    it('새 노트 작성 시 빈 폼을 표시한다', () => {
      render(<NoteEditor {...defaultProps} note={null} isEditing={true} />);
      
      expect(screen.getByPlaceholderText('제목을 입력하세요')).toHaveValue('');
      expect(screen.getByPlaceholderText('내용을 입력하세요...')).toHaveValue('');
    });

    it('색상을 변경할 수 있다', () => {
      const note = createMockNote();
      render(<NoteEditor {...defaultProps} note={note} isEditing={true} />);
      
      const colorButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-label')?.includes('색상')
      );
      
      expect(colorButtons.length).toBeGreaterThan(0);
    });
  });

  describe('메타 정보', () => {
    it('생성 일시를 표시한다', () => {
      const note = createMockNote({ createdAt: '2025-01-20T10:00:00Z' });
      render(<NoteEditor {...defaultProps} note={note} />);
      
      expect(screen.getByText(/생성:/)).toBeInTheDocument();
    });

    it('수정 일시를 표시한다', () => {
      const note = createMockNote({ updatedAt: '2025-01-21T10:00:00Z' });
      render(<NoteEditor {...defaultProps} note={note} />);
      
      expect(screen.getByText(/수정:/)).toBeInTheDocument();
    });
  });
});
