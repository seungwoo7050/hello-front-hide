# Commit #5 — 노트 앱 CRUD 구현

## Meta

- **난이도**: ⭐⭐⭐ 중급 (Intermediate)
- **권장 커밋 메시지**: `feat: implement notes crud with search and filtering`

---

## 학습 목표

1. 완전한 CRUD(Create, Read, Update, Delete) 작업을 React로 구현할 수 있다
2. 커스텀 훅으로 비즈니스 로직을 분리하여 관리할 수 있다
3. 검색, 필터링, 정렬 로직을 구현할 수 있다
4. 마스터-디테일 레이아웃 패턴을 적용할 수 있다

---

## TL;DR

`useNotes` 커스텀 훅으로 노트 CRUD 로직을 관리하고, NoteCard, NoteEditor, NoteList 컴포넌트로 UI를 구성한다. 텍스트 검색, 카테고리/태그 필터, 다양한 정렬 옵션을 제공하며, 마스터-디테일 레이아웃으로 반응형 UX를 구현한다.

---

## 배경/컨텍스트

### 왜 이 변경이 필요한가?

- **실용적 앱 구현**: 실제 사용할 수 있는 노트 관리 앱
- **상태 관리 패턴**: 복잡한 상태를 커스텀 훅으로 캡슐화
- **검색/필터링**: 대량 데이터 처리의 기본 패턴 학습
- **UI/UX 패턴**: 마스터-디테일 레이아웃으로 효율적 네비게이션

### 영향 범위

- 새로운 기능 모듈 `src/features/notes/` 추가
- 노트 관련 컴포넌트 3개 추가
- Notes 페이지 추가
- 테스트 수 211개 → 307개로 증가 (+96)

---

## 변경 파일 목록

### 추가된 파일 (25개)

| 카테고리 | 파일 | 설명 |
|----------|------|------|
| 타입 | `src/features/notes/types.ts` | Note, NoteFilter 등 타입 정의 |
| 유틸 | `src/features/notes/utils.ts` | 검색, 정렬, ID 생성 유틸리티 |
| 유틸 | `src/features/notes/utils.test.ts` | 유틸리티 테스트 (26개) |
| 훅 | `src/features/notes/useNotes.ts` | CRUD 상태 관리 훅 |
| 훅 | `src/features/notes/useNotes.test.ts` | 훅 테스트 (19개) |
| 데이터 | `src/features/notes/sampleData.ts` | 샘플 노트 데이터 |
| 컴포넌트 | `src/features/notes/components/NoteCard/*` | 노트 카드 (4파일) |
| 컴포넌트 | `src/features/notes/components/NoteEditor/*` | 노트 에디터 (4파일) |
| 컴포넌트 | `src/features/notes/components/NoteList/*` | 노트 목록 (4파일) |
| 페이지 | `src/pages/Notes/*` | Notes 페이지 (4파일) |

---

## 코드 스니펫

### 1. types.ts — 노트 도메인 타입

**선택 이유**: 타입 안전한 CRUD 작업의 기반

```typescript
/* src/features/notes/types.ts */
export type NoteColor = 'default' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  color: NoteColor;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteFormValues {
  title: string;
  content: string;
  category: string;
  tags: string;  // 쉼표로 구분된 문자열
  color: NoteColor;
}

export type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'updated';

export interface NotesFilter {
  search: string;
  category: string | null;
  tag: string | null;
  sortBy: SortOption;
}
```

---

### 2. useNotes.ts — CRUD 훅

**선택 이유**: 모든 노트 관련 로직을 캡슐화하는 커스텀 훅

```typescript
/* src/features/notes/useNotes.ts:1..80 */
import { useState, useMemo, useCallback } from 'react';
import type { Note, NoteFormValues, NotesFilter, SortOption } from './types';
import { generateId, searchNotes, sortNotes, filterByCategory, filterByTag, separatePinnedNotes, parseTags } from './utils';
import { sampleNotes } from './sampleData';

export function useNotes(initialNotes: Note[] = sampleNotes) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filter, setFilter] = useState<NotesFilter>({
    search: '',
    category: null,
    tag: null,
    sortBy: 'newest',
  });

  // Create
  const createNote = useCallback((values: NoteFormValues): Note => {
    const newNote: Note = {
      id: generateId(),
      title: values.title,
      content: values.content,
      category: values.category,
      tags: parseTags(values.tags),
      color: values.color,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [...prev, newNote]);
    return newNote;
  }, []);

  // Update
  const updateNote = useCallback((id: string, values: NoteFormValues): void => {
    setNotes(prev => prev.map(note =>
      note.id === id
        ? {
            ...note,
            ...values,
            tags: parseTags(values.tags),
            updatedAt: new Date().toISOString(),
          }
        : note
    ));
  }, []);

  // Delete
  const deleteNote = useCallback((id: string): void => {
    setNotes(prev => prev.filter(note => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  }, [selectedNote]);

  // Toggle Pin
  const togglePin = useCallback((id: string): void => {
    setNotes(prev => prev.map(note =>
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    ));
  }, []);

  // 필터링된 노트 (메모이제이션)
  const filteredNotes = useMemo(() => {
    let result = notes;
    result = searchNotes(result, filter.search);
    result = filterByCategory(result, filter.category);
    result = filterByTag(result, filter.tag);
    result = sortNotes(result, filter.sortBy);
    return separatePinnedNotes(result);
  }, [notes, filter]);

  // 메타데이터
  const allTags = useMemo(() => 
    [...new Set(notes.flatMap(n => n.tags))].sort(),
    [notes]
  );
  const allCategories = useMemo(() => 
    [...new Set(notes.map(n => n.category).filter(Boolean))].sort(),
    [notes]
  );

  return {
    notes, filteredNotes, filter, selectedNote, isEditing,
    allTags, allCategories,
    createNote, updateNote, deleteNote, togglePin,
    selectNote: setSelectedNote,
    setSearch: (search: string) => setFilter(prev => ({ ...prev, search })),
    setCategoryFilter: (category: string | null) => setFilter(prev => ({ ...prev, category })),
    setTagFilter: (tag: string | null) => setFilter(prev => ({ ...prev, tag })),
    setSortBy: (sortBy: SortOption) => setFilter(prev => ({ ...prev, sortBy })),
    startEditing: () => setIsEditing(true),
    stopEditing: () => setIsEditing(false),
  };
}
```

**로직 설명**:
- `useMemo`: 필터링된 노트를 메모이제이션하여 불필요한 재계산 방지
- `separatePinnedNotes`: 핀 고정 노트를 상단에 배치
- `parseTags`: 쉼표로 구분된 문자열을 배열로 변환
- 삭제 시 선택된 노트면 선택 해제

---

### 3. utils.ts — 검색/정렬 유틸리티

**선택 이유**: 테스트 가능한 순수 함수로 비즈니스 로직 분리

```typescript
/* src/features/notes/utils.ts */
// 텍스트 검색 (제목, 내용, 태그)
export function searchNotes(notes: Note[], query: string): Note[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return notes;
  
  return notes.filter(note =>
    note.title.toLowerCase().includes(lowerQuery) ||
    note.content.toLowerCase().includes(lowerQuery) ||
    note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

// 정렬
export function sortNotes(notes: Note[], sortBy: SortOption): Note[] {
  const sorted = [...notes];
  
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'oldest':
      return sorted.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    case 'title-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title, 'ko'));
    case 'updated':
      return sorted.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    default:
      return sorted;
  }
}

// 핀 고정 노트 분리 (상단 배치)
export function separatePinnedNotes(notes: Note[]): Note[] {
  const pinned = notes.filter(n => n.isPinned);
  const unpinned = notes.filter(n => !n.isPinned);
  return [...pinned, ...unpinned];
}

// 태그 파싱 (쉼표 구분 문자열 → 배열)
export function parseTags(tagsString: string): string[] {
  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);
}

// 고유 ID 생성
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

---

### 4. Notes.tsx — 마스터-디테일 레이아웃

**선택 이유**: 목록과 상세를 함께 보여주는 일반적인 UI 패턴

```tsx
/* src/pages/Notes/Notes.tsx */
import { useNotes } from '../../features/notes';
import { NoteList, NoteEditor } from '../../features/notes/components';
import styles from './Notes.module.css';

export function Notes() {
  const {
    filteredNotes, filter, selectedNote, isEditing,
    allTags, allCategories,
    createNote, updateNote, deleteNote, togglePin,
    selectNote, setSearch, setCategoryFilter, setTagFilter, setSortBy,
    startEditing, stopEditing,
  } = useNotes();

  const handleSave = (values: NoteFormValues) => {
    if (selectedNote) {
      updateNote(selectedNote.id, values);
    } else {
      const newNote = createNote(values);
      selectNote(newNote);
    }
    stopEditing();
  };

  return (
    <div className={styles.container}>
      {/* 마스터: 노트 목록 */}
      <aside className={styles.listPanel}>
        <NoteList
          notes={filteredNotes}
          selectedNote={selectedNote}
          filter={filter}
          allTags={allTags}
          allCategories={allCategories}
          onSelectNote={selectNote}
          onSearch={setSearch}
          onCategoryFilter={setCategoryFilter}
          onTagFilter={setTagFilter}
          onSortChange={setSortBy}
          onNewNote={() => { selectNote(null); startEditing(); }}
        />
      </aside>

      {/* 디테일: 노트 에디터 */}
      <main className={styles.editorPanel}>
        <NoteEditor
          note={selectedNote}
          isEditing={isEditing}
          onSave={handleSave}
          onEdit={startEditing}
          onCancel={stopEditing}
          onDelete={() => selectedNote && deleteNote(selectedNote.id)}
          onTogglePin={() => selectedNote && togglePin(selectedNote.id)}
        />
      </main>
    </div>
  );
}
```

**로직 설명**:
- `aside`: 목록 패널 (마스터)
- `main`: 에디터 패널 (디테일)
- 새 노트 생성 시 `selectedNote`를 null로 설정
- 저장 시 선택된 노트 유무로 Create/Update 분기

---

## 재현 단계 (CLI 우선)

### 1. 디렉토리 구조 생성

```bash
mkdir -p src/features/notes/components/{NoteCard,NoteEditor,NoteList}
mkdir -p src/pages/Notes
```

### 2. 구현 단계

1. **types.ts**: Note, NoteFormValues, NotesFilter, SortOption 타입
2. **utils.ts**: 검색, 정렬, ID 생성 유틸리티
3. **utils.test.ts**: 유틸리티 테스트 (26개)
4. **sampleData.ts**: 샘플 노트 5개
5. **useNotes.ts**: CRUD 상태 관리 훅
6. **NoteCard**: 단일 노트 카드 컴포넌트
7. **NoteEditor**: 노트 생성/수정 폼
8. **NoteList**: 노트 목록 + 검색/필터 UI
9. **Notes 페이지**: 마스터-디테일 레이아웃
10. **라우터**: `/notes` 라우트 추가
11. **Header**: Notes 네비게이션 링크 추가

### 3. 품질 게이트 검증

```bash
npm run lint
npm test -- --run   # 307개 테스트
npm run build
```

---

## 검증 체크리스트

- [ ] `/notes` 페이지에서 샘플 노트 목록 표시
- [ ] 새 노트 버튼 클릭 시 에디터 표시
- [ ] 노트 생성 후 목록에 추가
- [ ] 노트 선택 시 상세 내용 표시
- [ ] 노트 수정 후 변경사항 반영
- [ ] 노트 삭제 후 목록에서 제거
- [ ] 검색어 입력 시 필터링 동작
- [ ] 카테고리/태그 필터 동작
- [ ] 정렬 옵션 변경 시 순서 변경
- [ ] 핀 고정 노트 상단 배치

---

## 누락 정보

- ✅ 커밋 해시: `4208f5ec1b92a3fb98715dfcfcaf51865eb6ba53`
- ✅ 테스트 결과: 307개 통과 (+96)

**핵심 학습 포인트**:
- `useMemo`로 필터링 결과 메모이제이션
- 순수 함수(utils)로 비즈니스 로직 분리 → 테스트 용이
- 마스터-디테일 레이아웃 패턴
- `localeCompare('ko')`로 한글 정렬
