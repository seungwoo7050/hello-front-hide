# Stage 4: 노트 앱 CRUD

## 개요

Stage 4에서는 완전한 CRUD(Create, Read, Update, Delete) 기능을 갖춘 노트 앱을 구현합니다. 사용자는 노트를 생성, 조회, 수정, 삭제할 수 있으며, 검색, 필터링, 정렬 기능도 제공됩니다.

## 학습 목표

- 복잡한 상태 관리 패턴 이해
- CRUD 작업의 React 구현
- 검색 및 필터링 로직 구현
- 반응형 마스터-디테일 레이아웃 패턴
- 커스텀 훅으로 비즈니스 로직 분리

## 핵심 개념

### 1. CRUD 작업

```typescript
// Create - 새 노트 생성
const createNote = (values: NoteFormValues): Note => {
  const newNote: Note = {
    id: generateId(),
    ...values,
    tags: parseTags(values.tags),
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  setNotes(prev => [...prev, newNote]);
  return newNote;
};

// Read - 노트 조회 (필터링 적용)
const filteredNotes = useMemo(() => {
  let result = notes;
  result = searchNotes(result, filter.search);
  result = filterByCategory(result, filter.category);
  result = filterByTag(result, filter.tag);
  result = sortNotes(result, filter.sortBy);
  return separatePinnedNotes(result);
}, [notes, filter]);

// Update - 노트 수정
const updateNote = (id: string, values: NoteFormValues): void => {
  setNotes(prev => prev.map(note =>
    note.id === id
      ? { ...note, ...values, updatedAt: new Date().toISOString() }
      : note
  ));
};

// Delete - 노트 삭제
const deleteNote = (id: string): void => {
  setNotes(prev => prev.filter(note => note.id !== id));
};
```

### 2. 검색 및 필터링

```typescript
// 텍스트 검색
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
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    // ...
  }
}
```

### 3. 마스터-디테일 레이아웃

```tsx
function Notes() {
  return (
    <div className={styles.container}>
      {/* 마스터: 노트 목록 */}
      <div className={styles.listPanel}>
        <NoteList
          notes={filteredNotes}
          selectedNote={selectedNote}
          onSelectNote={selectNote}
          // ...
        />
      </div>
      
      {/* 디테일: 노트 에디터 */}
      <div className={styles.editorPanel}>
        <NoteEditor
          note={selectedNote}
          isEditing={isEditing}
          onSave={handleSave}
          // ...
        />
      </div>
    </div>
  );
}
```

### 4. 커스텀 훅 패턴

`useNotes` 훅은 모든 노트 관련 상태와 로직을 캡슐화합니다:

```typescript
interface UseNotesReturn {
  // 상태
  notes: Note[];
  filteredNotes: Note[];
  filter: NotesFilter;
  selectedNote: Note | null;
  isEditing: boolean;
  
  // 필터 메타데이터
  allTags: string[];
  allCategories: string[];
  
  // 필터 액션
  setSearch: (query: string) => void;
  setCategoryFilter: (category: string | null) => void;
  setTagFilter: (tag: string | null) => void;
  setSortBy: (sortBy: SortOption) => void;
  
  // CRUD 액션
  createNote: (values: NoteFormValues) => Note;
  updateNote: (id: string, values: NoteFormValues) => void;
  deleteNote: (id: string) => void;
  
  // 노트 선택/편집
  selectNote: (note: Note | null) => void;
  startEditing: () => void;
  cancelEditing: () => void;
  startNewNote: () => void;
  
  // 기타
  togglePin: (id: string) => void;
}
```

## 파일 구조

```
src/features/notes/
├── types.ts              # 타입 정의
├── utils.ts              # 유틸리티 함수
├── utils.test.ts         # 유틸리티 테스트
├── useNotes.ts           # 메인 CRUD 훅
├── useNotes.test.ts      # 훅 테스트
├── sampleData.ts         # 샘플 데이터
├── index.ts              # Public exports
└── components/
    ├── NoteCard/
    │   ├── NoteCard.tsx
    │   ├── NoteCard.module.css
    │   ├── NoteCard.test.tsx
    │   └── index.ts
    ├── NoteEditor/
    │   ├── NoteEditor.tsx
    │   ├── NoteEditor.module.css
    │   ├── NoteEditor.test.tsx
    │   └── index.ts
    └── NoteList/
        ├── NoteList.tsx
        ├── NoteList.module.css
        ├── NoteList.test.tsx
        └── index.ts

src/pages/Notes/
├── Notes.tsx             # 메인 페이지
├── Notes.module.css      # 스타일
├── Notes.test.tsx        # 페이지 테스트
└── index.ts
```

## 주요 컴포넌트

### NoteCard
- 개별 노트를 카드 형태로 표시
- 제목, 미리보기, 카테고리, 태그 표시
- 핀/삭제 액션 버튼
- 선택 상태 시각화
- 노트 색상에 따른 스타일링

### NoteEditor
- 빈 상태, 보기 모드, 편집 모드 지원
- 제목, 내용, 카테고리, 태그, 색상 편집
- 마크다운 형식 내용 지원
- 저장/취소/삭제 액션

### NoteList
- 노트 카드 목록 렌더링
- 검색 입력
- 카테고리/태그 필터 드롭다운
- 정렬 옵션
- 새 노트 생성 버튼
- 고정된 노트 우선 표시

## 테스트 커버리지

- **utils.test.ts**: 26개 테스트
  - generateId, formatDate, formatRelativeTime
  - searchNotes, sortNotes
  - filterByCategory, filterByTag
  - extractAllTags, extractAllCategories
  - summarizeText

- **useNotes.test.ts**: 19개 테스트
  - 초기 상태 확인
  - CRUD 작업 (생성, 수정, 삭제)
  - 필터링 (검색, 카테고리, 태그)
  - 정렬, 핀 토글, 노트 선택

- **NoteCard.test.tsx**: 13개 테스트
- **NoteEditor.test.tsx**: 15개 테스트
- **NoteList.test.tsx**: 13개 테스트
- **Notes.test.tsx**: 10개 테스트

**총 96개 테스트**

## 사용 예시

```tsx
import { Notes } from './pages/Notes';

// 라우터에 등록
<Route path="/notes" element={<Notes />} />
```

## 다음 단계 (Stage 5)

- localStorage를 활용한 데이터 영속성
- IndexedDB를 통한 대용량 데이터 저장
- 데이터 동기화 전략
