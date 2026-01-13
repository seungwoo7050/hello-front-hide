# Commit #5 — 노트 앱 CRUD 구현

## Meta
- **난이도**: ⭐⭐⭐ 중급 (Intermediate)
- **권장 커밋 메시지**: `feat(notes): implement Notes CRUD with list, create, edit, delete, search, and filter`

## 학습 목표
1. CRUD(Create, Read, Update, Delete) 작업을 React로 구현한다
2. 마스터-디테일 레이아웃 패턴을 적용한다
3. 검색, 카테고리 필터, 태그 필터, 정렬 로직을 구현한다
4. 커스텀 훅(`useNotes`)으로 비즈니스 로직을 분리한다

## TL;DR
노트 CRUD 기능을 구현하고 NoteCard, NoteEditor, NoteList 컴포넌트를 만든다. 텍스트 검색, 카테고리/태그 필터링, 다양한 정렬 옵션, 핀 고정 기능을 포함한다. 307개 테스트 통과 (신규 96개).

## 배경/맥락
노트 앱은 프론트엔드 학습에서 CRUD 패턴을 익히기에 이상적인 프로젝트이다:
- **상태 관리**: 노트 목록, 선택된 노트, 필터 상태 등 복잡한 상태 관리
- **마스터-디테일**: 목록과 상세/편집 영역을 나란히 배치하는 UI 패턴
- **검색/필터링**: 대량의 데이터를 사용자가 쉽게 탐색할 수 있도록 지원
- **피처 모듈**: `src/features/notes/`로 관련 코드를 모듈화

## 변경 파일 목록
### 추가된 파일 (23개)
- `src/features/notes/types.ts` — Note, NoteColor, NoteFormValues, NotesFilter 타입
- `src/features/notes/utils.ts`, `utils.test.ts` — 유틸리티 함수 (26개 테스트)
- `src/features/notes/useNotes.ts`, `useNotes.test.ts` — CRUD 훅 (19개 테스트)
- `src/features/notes/sampleData.ts` — 샘플 노트 데이터
- `src/features/notes/components/NoteCard/` — 노트 카드 컴포넌트 (4파일, 13개 테스트)
- `src/features/notes/components/NoteEditor/` — 노트 편집기 (4파일, 15개 테스트)
- `src/features/notes/components/NoteList/` — 노트 목록 (4파일, 13개 테스트)
- `src/pages/Notes/` — 노트 페이지 (4파일, 10개 테스트)

### 수정된 파일 (2개)
- `src/router/index.tsx` — `/notes` 라우트 추가
- `src/components/layout/Header/Header.tsx` — 노트 네비게이션 링크

## 코드 스니펫

### 1. Note 타입 정의
```typescript
/* src/features/notes/types.ts:1-50 */
export type NoteColor = 'default' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple'

export interface Note {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  color: NoteColor
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export interface NoteFormValues {
  title: string
  content: string
  category: string
  tags: string  // 쉼표로 구분된 문자열 (입력용)
  color: NoteColor
}

export interface NotesFilter {
  search: string
  category: string
  tag: string
  sortBy: SortOption
}

export type SortOption = 
  | 'newest' 
  | 'oldest' 
  | 'title-asc' 
  | 'title-desc' 
  | 'updated'

export interface NotesState {
  notes: Note[]
  selectedNote: Note | null
  filter: NotesFilter
  isEditing: boolean
}
```

**선정 이유**: 노트 앱의 핵심 데이터 구조와 상태 타입 정의

**로직/흐름 설명**:
- `Note`: 노트의 완전한 데이터 모델
- `NoteFormValues`: 폼 입력값 (tags는 문자열로 받아서 배열로 변환)
- `NotesFilter`: 검색, 카테고리, 태그, 정렬 조건
- `NoteColor`: 노트 배경색 7가지 옵션

**학습 포인트**:
- 입력용 타입(NoteFormValues)과 저장용 타입(Note) 분리
- Q: tags를 왜 문자열로 입력받는가?
- A: 사용자가 쉼표로 구분하여 입력하면 `parseTags()`로 배열 변환

---

### 2. useNotes 훅 — CRUD 로직
```typescript
/* src/features/notes/useNotes.ts:1-120 */
import { useState, useMemo, useCallback } from 'react'
import type { Note, NoteFormValues, NotesFilter, SortOption } from './types'
import { 
  generateId, 
  parseTags, 
  searchNotes, 
  filterByCategory, 
  filterByTag, 
  sortNotes,
  separatePinnedNotes 
} from './utils'
import { sampleNotes } from './sampleData'

const defaultFilter: NotesFilter = {
  search: '',
  category: '',
  tag: '',
  sortBy: 'newest',
}

export function useNotes(initialNotes: Note[] = sampleNotes) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [filter, setFilter] = useState<NotesFilter>(defaultFilter)
  const [isEditing, setIsEditing] = useState(false)

  // 필터링된 노트 목록 (메모이제이션)
  const filteredNotes = useMemo(() => {
    let result = notes

    if (filter.search) {
      result = searchNotes(result, filter.search)
    }
    if (filter.category) {
      result = filterByCategory(result, filter.category)
    }
    if (filter.tag) {
      result = filterByTag(result, filter.tag)
    }

    result = sortNotes(result, filter.sortBy)
    return separatePinnedNotes(result)
  }, [notes, filter])

  // Create
  const createNote = useCallback((values: NoteFormValues): Note => {
    const now = new Date().toISOString()
    const newNote: Note = {
      id: generateId(),
      title: values.title,
      content: values.content,
      category: values.category,
      tags: parseTags(values.tags),
      color: values.color,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    }
    setNotes((prev) => [...prev, newNote])
    return newNote
  }, [])

  // Update
  const updateNote = useCallback((id: string, values: NoteFormValues): void => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? {
              ...note,
              ...values,
              tags: parseTags(values.tags),
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    )
  }, [])

  // Delete
  const deleteNote = useCallback((id: string): void => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
    if (selectedNote?.id === id) {
      setSelectedNote(null)
      setIsEditing(false)
    }
  }, [selectedNote])

  // Toggle Pin
  const togglePin = useCallback((id: string): void => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, isPinned: !note.isPinned, updatedAt: new Date().toISOString() }
          : note
      )
    )
  }, [])

  // ... updateFilter, selectNote, startEditing, cancelEditing

  return {
    notes: filteredNotes,
    allNotes: notes,
    selectedNote,
    filter,
    isEditing,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    selectNote,
    updateFilter,
    startEditing,
    cancelEditing,
    // 메타데이터
    categories: useMemo(() => [...new Set(notes.map((n) => n.category))], [notes]),
    tags: useMemo(() => [...new Set(notes.flatMap((n) => n.tags))], [notes]),
  }
}
```

**선정 이유**: 비즈니스 로직을 훅으로 분리하는 패턴

**로직/흐름 설명**:
- `filteredNotes`: useMemo로 필터/정렬 결과 캐싱
- `separatePinnedNotes`: 핀 고정된 노트를 상단에 배치
- CRUD 함수들은 useCallback으로 메모이제이션
- `categories`, `tags`: 필터 UI에서 사용할 옵션 목록

**런타임 영향**:
- 필터 변경 시에만 `filteredNotes` 재계산
- 개별 CRUD 함수는 참조 안정성 유지

**학습 포인트**:
- 상태와 파생 데이터(filteredNotes)의 분리
- Q: 왜 `allNotes`와 `notes`(filteredNotes)를 둘 다 반환하는가?
- A: 필터 UI에서 전체 카테고리/태그 목록이 필요하기 때문

---

### 3. 유틸리티 함수 — 검색/필터/정렬
```typescript
/* src/features/notes/utils.ts:1-80 */
import type { Note, SortOption } from './types'

// 고유 ID 생성
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 날짜 포맷팅
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 태그 파싱 (쉼표 구분 문자열 → 배열)
export function parseTags(tagsString: string): string[] {
  return tagsString
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

// 텍스트 검색 (제목, 내용, 태그)
export function searchNotes(notes: Note[], query: string): Note[] {
  const lowerQuery = query.toLowerCase()
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}

// 카테고리 필터
export function filterByCategory(notes: Note[], category: string): Note[] {
  if (!category) return notes
  return notes.filter((note) => note.category === category)
}

// 태그 필터
export function filterByTag(notes: Note[], tag: string): Note[] {
  if (!tag) return notes
  return notes.filter((note) => note.tags.includes(tag))
}

// 정렬
export function sortNotes(notes: Note[], sortBy: SortOption): Note[] {
  const sorted = [...notes]
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    case 'oldest':
      return sorted.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'title-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    case 'updated':
      return sorted.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    default:
      return sorted
  }
}

// 핀 고정된 노트를 상단으로
export function separatePinnedNotes(notes: Note[]): Note[] {
  const pinned = notes.filter((note) => note.isPinned)
  const unpinned = notes.filter((note) => !note.isPinned)
  return [...pinned, ...unpinned]
}
```

**선정 이유**: 순수 함수로 분리된 유틸리티 로직

**로직/흐름 설명**:
- 모든 함수가 순수 함수 (side effect 없음)
- `searchNotes`: 제목, 내용, 태그를 모두 검색
- `sortNotes`: 스프레드로 새 배열 생성 후 정렬 (원본 불변)
- `separatePinnedNotes`: 핀 고정 노트를 항상 상단에 배치

**테스트 영향**:
- 순수 함수라 입력/출력만 테스트하면 됨 (26개 테스트)

**학습 포인트**:
- `[...notes]`로 복사 후 정렬하여 원본 배열 보존
- Q: 왜 `.sort()`를 직접 호출하지 않고 스프레드하는가?
- A: React 상태 불변성 원칙 — 원본 배열 수정 금지

---

### 4. Notes 페이지 — 마스터-디테일 레이아웃
```tsx
/* src/pages/Notes/Notes.tsx:1-100 (부분) */
import { useNotes } from '../../features/notes'
import { NoteList, NoteEditor, NoteCard } from '../../features/notes/components'
import styles from './Notes.module.css'

export function Notes() {
  const {
    notes,
    selectedNote,
    filter,
    isEditing,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    selectNote,
    updateFilter,
    startEditing,
    cancelEditing,
    categories,
    tags,
  } = useNotes()

  const handleSave = (values: NoteFormValues) => {
    if (selectedNote && isEditing) {
      updateNote(selectedNote.id, values)
    } else {
      const newNote = createNote(values)
      selectNote(newNote)
    }
    cancelEditing()
  }

  return (
    <div className={styles.notesPage}>
      {/* 좌측: 필터 + 노트 목록 */}
      <aside className={styles.sidebar}>
        <div className={styles.filters}>
          <input
            type="search"
            placeholder="검색..."
            value={filter.search}
            onChange={(e) => updateFilter({ search: e.target.value })}
          />
          <select
            value={filter.category}
            onChange={(e) => updateFilter({ category: e.target.value })}
          >
            <option value="">모든 카테고리</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {/* 태그 필터, 정렬 옵션 ... */}
        </div>

        <NoteList
          notes={notes}
          selectedId={selectedNote?.id}
          onSelect={selectNote}
          onDelete={deleteNote}
          onTogglePin={togglePin}
        />

        <button onClick={() => { selectNote(null); startEditing(); }}>
          새 노트 작성
        </button>
      </aside>

      {/* 우측: 노트 상세/편집 */}
      <main className={styles.main}>
        {isEditing ? (
          <NoteEditor
            note={selectedNote}
            onSave={handleSave}
            onCancel={cancelEditing}
          />
        ) : selectedNote ? (
          <NoteCard
            note={selectedNote}
            onEdit={startEditing}
            onDelete={() => deleteNote(selectedNote.id)}
            onTogglePin={() => togglePin(selectedNote.id)}
            isDetailed
          />
        ) : (
          <div className={styles.empty}>노트를 선택하거나 새로 작성하세요</div>
        )}
      </main>
    </div>
  )
}
```

**선정 이유**: 마스터-디테일 패턴과 상태 흐름의 완전한 예시

**로직/흐름 설명**:
- 좌측(aside): 필터 컨트롤 + 노트 목록
- 우측(main): 선택된 노트 상세 또는 편집 폼
- `handleSave`: 신규 생성 vs 기존 수정 분기
- 빈 상태 UI: 노트 미선택 시 안내 메시지

**학습 포인트**:
- 마스터-디테일: 목록(마스터)과 상세(디테일)가 동시에 표시
- Q: 왜 `isEditing`과 `selectedNote`를 별도로 관리하는가?
- A: 신규 작성(selectedNote=null, isEditing=true)과 기존 편집(둘 다 true) 구분

## 재현 단계 (CLI 우선)

### CLI 명령어
```bash
# 1. 개발 서버 실행
npm run dev

# 2. 테스트 실행 (307개)
npm test -- --run

# 3. 빌드 확인
npm run build
```

### 구현 단계 (코드 작성 순서)
1. **타입 정의**: `src/features/notes/types.ts` — Note, Filter, SortOption
2. **유틸리티 함수**: `src/features/notes/utils.ts` + 테스트 (26개)
3. **샘플 데이터**: `src/features/notes/sampleData.ts`
4. **useNotes 훅**: `src/features/notes/useNotes.ts` + 테스트 (19개)
5. **NoteCard 컴포넌트**: 노트 카드 UI + 테스트 (13개)
6. **NoteEditor 컴포넌트**: 폼 기반 편집기 + 테스트 (15개)
7. **NoteList 컴포넌트**: 목록 렌더링 + 테스트 (13개)
8. **Notes 페이지**: 마스터-디테일 레이아웃 + 테스트 (10개)
9. **라우터 업데이트**: `/notes` 라우트 추가
10. **Header 업데이트**: 노트 네비게이션 링크 추가
11. **검증**: `npm test` (307개 통과)

## 설명

### 설계 결정
1. **Feature 모듈**: `src/features/notes/`에 노트 관련 코드 집중
2. **훅으로 로직 분리**: UI 컴포넌트는 표현에만 집중
3. **순수 유틸리티 함수**: 테스트 용이, 재사용 가능

### 테스트 통계
| 파일 | 테스트 수 |
|-----|----------|
| utils.test.ts | 26 |
| useNotes.test.ts | 19 |
| NoteCard.test.tsx | 13 |
| NoteEditor.test.tsx | 15 |
| NoteList.test.tsx | 13 |
| Notes.test.tsx | 10 |
| **Stage 4 추가** | **96** |
| **전체 누적** | **307** |

## 검증 체크리스트

### 자동 검증
```bash
npm run lint      # PASS
npm test -- --run # 307 tests passed
npm run build     # 성공
```

### 수동 검증
- [ ] `/notes` 페이지 접속
- [ ] "새 노트 작성" 클릭 후 노트 생성
- [ ] 노트 목록에서 노트 선택 시 우측에 상세 표시
- [ ] 노트 편집 후 저장 시 목록에 반영
- [ ] 노트 삭제 시 목록에서 제거
- [ ] 검색어 입력 시 제목/내용/태그로 필터링
- [ ] 카테고리/태그 필터 작동 확인
- [ ] 핀 고정 시 상단으로 이동

## 누락 정보
- 없음
