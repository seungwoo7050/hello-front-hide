# Commit #6 — localStorage 영속성 구현

## Meta

- **난이도**: ⭐⭐ 초중급 (Beginner-Intermediate)
- **권장 커밋 메시지**: `feat: add localstorage persistence with cross-tab sync`

---

## 학습 목표

1. `useLocalStorage` 커스텀 훅으로 브라우저 스토리지를 추상화할 수 있다
2. 데이터 직렬화/역직렬화와 에러 핸들링을 구현할 수 있다
3. 크로스 탭 동기화를 위한 `storage` 이벤트를 활용할 수 있다
4. 데이터 버전 관리 및 마이그레이션 전략을 이해할 수 있다

---

## TL;DR

`useLocalStorage` 커스텀 훅으로 localStorage API를 추상화하고, `usePersistedNotes` 훅으로 노트 CRUD에 자동 영속성을 적용한다. 데이터 버전 관리, 크로스 탭 동기화, 내보내기/가져오기 기능을 구현한다.

---

## 배경/컨텍스트

### 왜 이 변경이 필요한가?

- **데이터 영속성**: 페이지 새로고침/브라우저 종료 후에도 데이터 유지
- **사용자 경험**: 작업 내용 자동 저장
- **데이터 관리**: 내보내기/가져오기로 백업 및 복원
- **다중 탭 지원**: 여러 탭에서 동시 사용 시 동기화

### 영향 범위

- 새로운 훅 `useLocalStorage` 추가
- `usePersistedNotes` 훅으로 영속성 적용
- Notes 페이지가 localStorage에 자동 저장
- 테스트 수 307개 → 334개로 증가 (+27)

---

## 변경 파일 목록

### 추가된 파일 (5개)

| 파일 | 설명 |
|------|------|
| `src/hooks/useLocalStorage.ts` | localStorage 커스텀 훅 |
| `src/hooks/useLocalStorage.test.ts` | 훅 테스트 (13개) |
| `src/features/notes/usePersistedNotes.ts` | 영속성 적용 노트 훅 |
| `src/features/notes/usePersistedNotes.test.ts` | 영속성 테스트 (14개) |
| `docs/stage-5.md` | 학습 문서 |

### 수정된 파일 (4개)

| 파일 | 변경 내용 |
|------|------|
| `src/hooks/index.ts` | useLocalStorage export 추가 |
| `src/features/notes/index.ts` | usePersistedNotes export 추가 |
| `src/pages/Notes/Notes.tsx` | usePersistedNotes 사용 |
| `src/pages/Notes/Notes.test.tsx` | localStorage 초기화 추가 |

---

## 코드 스니펫

### 1. useLocalStorage.ts — 스토리지 추상화 훅

**선택 이유**: localStorage API를 타입 안전하고 재사용 가능한 훅으로 추상화

```typescript
/* src/hooks/useLocalStorage.ts */
import { useState, useCallback, useEffect } from 'react';

type SetValue<T> = T | ((prev: T) => T);

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  
  // 초기값 읽기 (lazy initialization)
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 값 저장
  const setValue = useCallback((value: SetValue<T>) => {
    try {
      // 함수형 업데이트 지원
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // 값 삭제
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // 크로스 탭 동기화
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch {
          // 파싱 실패 시 무시
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}
```

**로직 설명**:
- `readValue`: lazy initialization으로 초기 렌더링 시 한 번만 읽기
- `SetValue<T>`: 직접 값 또는 함수형 업데이트 지원
- `removeValue`: 값 삭제 및 초기값으로 복원
- `storage` 이벤트: 다른 탭에서 변경 시 자동 동기화

**학습 노트**: `storage` 이벤트는 **다른 탭**에서 변경했을 때만 발생. 같은 탭에서는 발생하지 않음.

---

### 2. usePersistedNotes.ts — 영속성 적용 노트 훅

**선택 이유**: useNotes와 useLocalStorage를 조합한 실용적 패턴

```typescript
/* src/features/notes/usePersistedNotes.ts */
import { useCallback, useMemo } from 'react';
import { useLocalStorage } from '../../hooks';
import type { Note, NoteFormValues, NotesFilter, SortOption } from './types';
import { sampleNotes } from './sampleData';
import { generateId, parseTags, searchNotes, sortNotes, filterByCategory, filterByTag, separatePinnedNotes } from './utils';

const NOTES_KEY = 'hello-front-notes';
const NOTES_VERSION = 1;

interface StoredNotesData {
  version: number;
  notes: Note[];
  lastUpdated: string;
}

const initialData: StoredNotesData = {
  version: NOTES_VERSION,
  notes: sampleNotes,
  lastUpdated: new Date().toISOString(),
};

export function usePersistedNotes() {
  const [data, setData, removeData] = useLocalStorage<StoredNotesData>(
    NOTES_KEY,
    initialData
  );

  // 마이그레이션 (버전 업그레이드 시)
  const migratedData = useMemo(() => {
    if (data.version < NOTES_VERSION) {
      // 버전별 마이그레이션 로직
      return { ...data, version: NOTES_VERSION };
    }
    return data;
  }, [data]);

  // CRUD 작업 (자동 저장)
  const createNote = useCallback((values: NoteFormValues): Note => {
    const newNote: Note = {
      id: generateId(),
      ...values,
      tags: parseTags(values.tags),
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setData(prev => ({
      ...prev,
      notes: [...prev.notes, newNote],
      lastUpdated: new Date().toISOString(),
    }));
    
    return newNote;
  }, [setData]);

  const updateNote = useCallback((id: string, values: NoteFormValues) => {
    setData(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        note.id === id
          ? { ...note, ...values, tags: parseTags(values.tags), updatedAt: new Date().toISOString() }
          : note
      ),
      lastUpdated: new Date().toISOString(),
    }));
  }, [setData]);

  const deleteNote = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      notes: prev.notes.filter(note => note.id !== id),
      lastUpdated: new Date().toISOString(),
    }));
  }, [setData]);

  // 데이터 내보내기 (JSON)
  const exportNotes = useCallback((): string => {
    return JSON.stringify(migratedData, null, 2);
  }, [migratedData]);

  // 데이터 가져오기 (JSON)
  const importNotes = useCallback((jsonString: string): boolean => {
    try {
      const importedData = JSON.parse(jsonString) as StoredNotesData;
      
      if (!importedData.notes || !Array.isArray(importedData.notes)) {
        throw new Error('Invalid data format');
      }
      
      setData({
        version: NOTES_VERSION,
        notes: importedData.notes,
        lastUpdated: new Date().toISOString(),
      });
      
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }, [setData]);

  // 모든 노트 삭제
  const clearAllNotes = useCallback(() => {
    setData({
      version: NOTES_VERSION,
      notes: [],
      lastUpdated: new Date().toISOString(),
    });
  }, [setData]);

  // 샘플 데이터로 초기화
  const resetToSampleData = useCallback(() => {
    setData(initialData);
  }, [setData]);

  return {
    notes: migratedData.notes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    exportNotes,
    importNotes,
    clearAllNotes,
    resetToSampleData,
    // ... 필터링 관련 메서드
  };
}
```

**로직 설명**:
- `NOTES_VERSION`: 스키마 변경 시 마이그레이션 트리거
- `StoredNotesData`: 버전 + 노트 배열 + 마지막 업데이트 시간
- `setData`: 함수형 업데이트로 이전 상태 기반 변경
- `exportNotes`: JSON 문자열로 내보내기 (백업용)
- `importNotes`: JSON 파싱 후 유효성 검사

**학습 노트**: 마이그레이션은 `useMemo`로 계산하여 매 렌더링마다 실행되지 않도록 최적화.

---

### 3. 크로스 탭 동기화 테스트

**선택 이유**: storage 이벤트 시뮬레이션 방법 학습

```typescript
/* src/hooks/useLocalStorage.test.ts (일부) */
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('크로스 탭 동기화', () => {
  it('다른 탭에서 변경 시 값이 업데이트된다', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    );

    // 다른 탭에서 변경 시뮬레이션
    act(() => {
      const event = new StorageEvent('storage', {
        key: 'test-key',
        newValue: JSON.stringify('updated-from-other-tab'),
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('updated-from-other-tab');
  });

  it('다른 키의 변경은 무시한다', () => {
    const { result } = renderHook(() => 
      useLocalStorage('my-key', 'initial')
    );

    act(() => {
      const event = new StorageEvent('storage', {
        key: 'other-key',
        newValue: JSON.stringify('should-ignore'),
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('initial');
  });
});
```

---

## 재현 단계 (CLI 우선)

### 1. 파일 생성

```bash
# useLocalStorage 훅
touch src/hooks/useLocalStorage.ts
touch src/hooks/useLocalStorage.test.ts

# usePersistedNotes 훅
touch src/features/notes/usePersistedNotes.ts
touch src/features/notes/usePersistedNotes.test.ts
```

### 2. 구현 단계

1. **useLocalStorage.ts**: 제네릭 타입, 읽기/쓰기/삭제, 크로스 탭 동기화
2. **useLocalStorage.test.ts**: 초기화, 저장, 삭제, 에러 핸들링, 동기화 테스트
3. **usePersistedNotes.ts**: useNotes 로직 + useLocalStorage 통합
4. **usePersistedNotes.test.ts**: 영속성, 내보내기/가져오기 테스트
5. **Notes.tsx 수정**: `useNotes` → `usePersistedNotes`로 변경
6. **Notes.test.tsx 수정**: `beforeEach`에 localStorage 초기화 추가

### 3. 품질 게이트 검증

```bash
npm run lint
npm test -- --run   # 334개 테스트
npm run build
```

---

## 설명

### localStorage vs IndexedDB

| 특성 | localStorage | IndexedDB |
|------|-------------|-----------|
| 용량 | 5-10MB | 수백 MB+ |
| API | 동기 | 비동기 |
| 데이터 타입 | 문자열만 | 객체, Blob 등 |
| 적합 대상 | 작은 설정, 간단한 데이터 | 대용량, 복잡한 쿼리 |

노트 앱 규모에서는 localStorage로 충분.

### 트레이드오프

| 선택 | 장점 | 단점 |
|------|------|------|
| localStorage | 간단한 API, 동기 | 용량 제한, 문자열만 |
| 데이터 버전 관리 | 스키마 변경 대응 | 마이그레이션 로직 필요 |
| 크로스 탭 동기화 | 다중 탭 지원 | 같은 탭에서는 이벤트 미발생 |

---

## 검증 체크리스트

- [ ] `npm test -- --run` 실행 시 334개 테스트 통과
- [ ] 노트 생성 후 페이지 새로고침 → 데이터 유지
- [ ] 브라우저 개발자 도구 > Application > Local Storage에서 데이터 확인
- [ ] 다른 탭에서 노트 변경 시 현재 탭에 반영
- [ ] 내보내기 기능으로 JSON 파일 다운로드
- [ ] 가져오기 기능으로 JSON 파일 복원
- [ ] 모든 노트 삭제 후 샘플 데이터로 초기화

---

## 누락 정보

- ✅ 커밋 해시: `e76b6b37c15b8ca8366568ee7194a10ee012b51e`
- ✅ 테스트 결과: 334개 통과 (+27)

**핵심 학습 포인트**:
- `storage` 이벤트는 다른 탭에서만 발생
- JSON 직렬화/역직렬화 에러 핸들링 필수
- 데이터 버전 관리로 향후 스키마 변경 대비
- `StorageEvent` 생성자로 테스트 시 이벤트 시뮬레이션
