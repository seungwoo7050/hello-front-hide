import { useState, useCallback, useMemo } from 'react';
import type { Note, NotesFilter, SortOption, NoteFormValues } from './types';
import { sampleNotes } from './sampleData';
import { 
  generateId, 
  searchNotes, 
  sortNotes, 
  filterByCategory, 
  filterByTag,
  extractAllTags,
  extractAllCategories 
} from './utils';

interface UseNotesReturn {
  // 상태
  notes: Note[];
  filteredNotes: Note[];
  filter: NotesFilter;
  selectedNote: Note | null;
  isEditing: boolean;
  
  // 필터/정렬 관련
  allTags: string[];
  allCategories: string[];
  
  // 액션
  createNote: (values: NoteFormValues) => Note;
  updateNote: (id: string, values: Partial<NoteFormValues>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  setSearch: (search: string) => void;
  setCategory: (category: string | null) => void;
  setTag: (tag: string | null) => void;
  setSortBy: (sortBy: SortOption) => void;
  selectNote: (note: Note | null) => void;
  setIsEditing: (editing: boolean) => void;
  clearFilter: () => void;
}

export function useNotes(initialNotes: Note[] = sampleNotes): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [filter, setFilter] = useState<NotesFilter>({
    search: '',
    category: null,
    tag: null,
    sortBy: 'newest',
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 필터링 및 정렬된 노트 목록
  const filteredNotes = useMemo(() => {
    let result = notes;
    
    // 검색
    result = searchNotes(result, filter.search);
    
    // 카테고리 필터
    result = filterByCategory(result, filter.category);
    
    // 태그 필터
    result = filterByTag(result, filter.tag);
    
    // 정렬 (고정된 노트는 항상 상단)
    const pinnedNotes = result.filter((n) => n.isPinned);
    const unpinnedNotes = result.filter((n) => !n.isPinned);
    
    return [
      ...sortNotes(pinnedNotes, filter.sortBy),
      ...sortNotes(unpinnedNotes, filter.sortBy),
    ];
  }, [notes, filter]);

  // 모든 태그/카테고리 추출
  const allTags = useMemo(() => extractAllTags(notes), [notes]);
  const allCategories = useMemo(() => extractAllCategories(notes), [notes]);

  // 노트 생성
  const createNote = useCallback((values: NoteFormValues): Note => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: generateId(),
      title: values.title,
      content: values.content,
      category: values.category,
      tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean),
      isPinned: false,
      color: values.color,
      createdAt: now,
      updatedAt: now,
    };
    
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  }, []);

  // 노트 수정
  const updateNote = useCallback((id: string, values: Partial<NoteFormValues>) => {
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id !== id) return note;
        
        return {
          ...note,
          ...(values.title !== undefined && { title: values.title }),
          ...(values.content !== undefined && { content: values.content }),
          ...(values.category !== undefined && { category: values.category }),
          ...(values.tags !== undefined && { 
            tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean) 
          }),
          ...(values.color !== undefined && { color: values.color }),
          updatedAt: new Date().toISOString(),
        };
      })
    );
    
    // 선택된 노트도 업데이트
    if (selectedNote?.id === id) {
      setSelectedNote((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          ...(values.title !== undefined && { title: values.title }),
          ...(values.content !== undefined && { content: values.content }),
          ...(values.category !== undefined && { category: values.category }),
          ...(values.tags !== undefined && { 
            tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean) 
          }),
          ...(values.color !== undefined && { color: values.color }),
          updatedAt: new Date().toISOString(),
        };
      });
    }
  }, [selectedNote?.id]);

  // 노트 삭제
  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  }, [selectedNote?.id]);

  // 고정 토글
  const togglePin = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, isPinned: !note.isPinned, updatedAt: new Date().toISOString() }
          : note
      )
    );
    
    if (selectedNote?.id === id) {
      setSelectedNote((prev) => 
        prev ? { ...prev, isPinned: !prev.isPinned } : null
      );
    }
  }, [selectedNote?.id]);

  // 필터 설정
  const setSearch = useCallback((search: string) => {
    setFilter((prev) => ({ ...prev, search }));
  }, []);

  const setCategory = useCallback((category: string | null) => {
    setFilter((prev) => ({ ...prev, category }));
  }, []);

  const setTag = useCallback((tag: string | null) => {
    setFilter((prev) => ({ ...prev, tag }));
  }, []);

  const setSortBy = useCallback((sortBy: SortOption) => {
    setFilter((prev) => ({ ...prev, sortBy }));
  }, []);

  const clearFilter = useCallback(() => {
    setFilter({
      search: '',
      category: null,
      tag: null,
      sortBy: 'newest',
    });
  }, []);

  const selectNote = useCallback((note: Note | null) => {
    setSelectedNote(note);
    setIsEditing(false);
  }, []);

  return {
    notes,
    filteredNotes,
    filter,
    selectedNote,
    isEditing,
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
  };
}

export default useNotes;
