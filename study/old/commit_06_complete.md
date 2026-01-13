# Commit #6 — localStorage 영속성 구현

## Meta
- **난이도**: ⭐⭐ 초중급 (Beginner-Intermediate)
- **권장 커밋 메시지**: `feat(persistence): add useLocalStorage hook and persisted notes with cross-tab sync`

## 학습 목표
1. `useLocalStorage` 커스텀 훅으로 브라우저 저장소 로직을 추상화한다
2. 데이터 버전 관리와 마이그레이션 전략을 이해한다
3. `storage` 이벤트를 활용한 크로스 탭 동기화를 구현한다
4. 데이터 내보내기/가져오기 기능을 추가한다

## TL;DR
`useLocalStorage` 커스텀 훅과 `usePersistedNotes` 훅을 구현하여 노트 데이터를 localStorage에 영속화한다. 데이터 버전 관리, 크로스 탭 동기화, JSON 내보내기/가져오기 기능을 포함한다. 334개 테스트 통과 (신규 27개).

## 배경/맥락
웹 애플리케이션에서 클라이언트 측 데이터 영속화는 사용자 경험의 핵심이다:
- **데이터 보존**: 페이지 새로고침이나 브라우저 재시작 후에도 데이터 유지
- **오프라인 지원**: 네트워크 연결 없이도 기존 데이터 접근 가능
- **버전 관리**: 스키마 변경 시 기존 데이터 마이그레이션 지원
- **동기화**: 여러 탭에서 동일한 데이터 상태 유지

## 변경 파일 목록
### 추가된 파일 (4개)
- `src/hooks/useLocalStorage.ts` — localStorage 커스텀 훅
- `src/hooks/useLocalStorage.test.ts` — 테스트 (13개)
- `src/features/notes/usePersistedNotes.ts` — 영속성 적용 노트 훅
- `src/features/notes/usePersistedNotes.test.ts` — 테스트 (14개)

### 수정된 파일 (4개)
- `src/hooks/index.ts` — useLocalStorage export 추가
- `src/features/notes/index.ts` — usePersistedNotes export 추가
- `src/pages/Notes/Notes.tsx` — usePersistedNotes 사용으로 변경
- `src/pages/Notes/Notes.test.tsx` — localStorage 초기화 추가

## 코드 스니펫

### 1. useLocalStorage 훅
```typescript
/* src/hooks/useLocalStorage.ts:1-100 */
import { useState, useCallback, useEffect } from 'react'

type SetValue<T> = T | ((prevValue: T) => T)

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  // 초기 값 읽기 함수
  const readValue = useCallback((): T => {
    // SSR 환경 체크
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }, [key, initialValue])

  const [storedValue, setStoredValue] = useState<T>(readValue)

  // 값 저장 함수
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        // 함수형 업데이트 지원
        const valueToStore =
          value instanceof Function ? value(storedValue) : value

        setStoredValue(valueToStore)
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  // 값 삭제 함수
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
      setStoredValue(initialValue)
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  // 크로스 탭 동기화
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue))
        } catch {
          console.warn(`Error parsing storage event for key "${key}"`)
        }
      } else if (event.key === key && event.newValue === null) {
        setStoredValue(initialValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}
```

**선정 이유**: localStorage API를 React 훅으로 추상화하는 핵심 패턴

**로직/흐름 설명**:
- `readValue`: 컴포넌트 마운트 시 localStorage에서 초기값 로드
- `setValue`: React 상태와 localStorage를 동시에 업데이트
- `removeValue`: 저장된 데이터 삭제 및 초기값으로 복원
- `storage` 이벤트: 다른 탭에서 변경 시 현재 탭 상태 동기화

**런타임 영향**:
- 초기 렌더링 시 localStorage 동기 읽기 (블로킹)
- storage 이벤트는 같은 탭에서는 발생하지 않음 (다른 탭만)

**학습 포인트**:
- `typeof window === 'undefined'`: SSR 환경 대응
- Q: 왜 `storage` 이벤트 리스너가 필요한가?
- A: 사용자가 여러 탭을 열었을 때 데이터 일관성 유지

---

### 2. 데이터 버전 관리와 마이그레이션
```typescript
/* src/features/notes/usePersistedNotes.ts:1-80 */
import { useMemo, useCallback } from 'react'
import { useLocalStorage } from '../../hooks'
import type { Note, NoteFormValues } from './types'
import { sampleNotes } from './sampleData'
import { generateId, parseTags } from './utils'

const STORAGE_KEY = 'hello-front-opus-notes'
const NOTES_VERSION = 1

interface StoredNotesData {
  version: number
  notes: Note[]
  lastUpdated: string
}

// 마이그레이션 함수
function migrateData(data: StoredNotesData): StoredNotesData {
  // 버전별 마이그레이션 로직
  if (data.version < 1) {
    // v0 → v1: 예시 마이그레이션
    // 새 필드 추가, 데이터 형식 변환 등
    return {
      ...data,
      version: 1,
      notes: data.notes.map((note) => ({
        ...note,
        // 새 필드가 없으면 기본값 추가
        color: note.color || 'default',
      })),
    }
  }
  return data
}

const defaultData: StoredNotesData = {
  version: NOTES_VERSION,
  notes: sampleNotes,
  lastUpdated: new Date().toISOString(),
}

export function usePersistedNotes() {
  const [data, setData, removeData] = useLocalStorage<StoredNotesData>(
    STORAGE_KEY,
    defaultData
  )

  // 저장된 데이터 마이그레이션 적용
  const migratedData = useMemo(() => {
    if (data.version < NOTES_VERSION) {
      const migrated = migrateData(data)
      // 마이그레이션된 데이터 저장
      setData(migrated)
      return migrated
    }
    return data
  }, [data, setData])

  const notes = migratedData.notes

  // CRUD 작업 (useNotes와 동일한 인터페이스)
  const createNote = useCallback(
    (values: NoteFormValues): Note => {
      const now = new Date().toISOString()
      const newNote: Note = {
        id: generateId(),
        ...values,
        tags: parseTags(values.tags),
        isPinned: false,
        createdAt: now,
        updatedAt: now,
      }
      setData((prev) => ({
        ...prev,
        notes: [...prev.notes, newNote],
        lastUpdated: now,
      }))
      return newNote
    },
    [setData]
  )

  // updateNote, deleteNote, togglePin 등 동일 패턴...

  return {
    notes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    // 추가 기능
    exportNotes,
    importNotes,
    clearAllNotes,
    resetToSampleData,
  }
}
```

**선정 이유**: 데이터 스키마 변경에 대응하는 버전 관리 패턴

**로직/흐름 설명**:
- `StoredNotesData`: 버전 번호와 함께 데이터 저장
- `migrateData`: 이전 버전 데이터를 현재 버전으로 변환
- `useMemo`로 마이그레이션 적용 후 결과 캐싱
- CRUD 작업 시 자동으로 localStorage 업데이트

**학습 포인트**:
- 버전 관리로 하위 호환성 유지
- Q: 마이그레이션은 언제 실행되는가?
- A: 저장된 데이터의 버전이 현재 버전보다 낮을 때 자동 실행

---

### 3. 데이터 내보내기/가져오기
```typescript
/* src/features/notes/usePersistedNotes.ts:100-150 */
// JSON으로 내보내기
const exportNotes = useCallback((): string => {
  const exportData = {
    version: NOTES_VERSION,
    notes: notes,
    exportedAt: new Date().toISOString(),
  }
  return JSON.stringify(exportData, null, 2)
}, [notes])

// 다운로드 트리거
const downloadNotes = useCallback(() => {
  const json = exportNotes()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `notes-backup-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  URL.revokeObjectURL(url)
}, [exportNotes])

// JSON에서 가져오기
const importNotes = useCallback(
  (jsonString: string): { success: boolean; message: string; count?: number } => {
    try {
      const importData = JSON.parse(jsonString)
      
      // 유효성 검사
      if (!importData.notes || !Array.isArray(importData.notes)) {
        return { success: false, message: '유효하지 않은 데이터 형식입니다.' }
      }
      
      // 노트 유효성 검사 및 ID 재생성
      const validNotes = importData.notes
        .filter((note: unknown) => isValidNote(note))
        .map((note: Note) => ({
          ...note,
          id: generateId(), // 충돌 방지를 위해 새 ID
          createdAt: note.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))
      
      setData((prev) => ({
        ...prev,
        notes: [...prev.notes, ...validNotes],
        lastUpdated: new Date().toISOString(),
      }))
      
      return { 
        success: true, 
        message: `${validNotes.length}개의 노트를 가져왔습니다.`,
        count: validNotes.length,
      }
    } catch {
      return { success: false, message: 'JSON 파싱에 실패했습니다.' }
    }
  },
  [setData]
)

// 모든 노트 삭제
const clearAllNotes = useCallback(() => {
  setData({
    version: NOTES_VERSION,
    notes: [],
    lastUpdated: new Date().toISOString(),
  })
}, [setData])

// 샘플 데이터로 초기화
const resetToSampleData = useCallback(() => {
  setData(defaultData)
}, [setData])
```

**선정 이유**: 데이터 백업/복원 기능의 실용적인 구현

**로직/흐름 설명**:
- `exportNotes`: 현재 노트를 JSON 문자열로 변환
- `downloadNotes`: Blob API로 파일 다운로드 트리거
- `importNotes`: JSON 파싱, 유효성 검사, ID 재생성 후 병합
- `clearAllNotes`, `resetToSampleData`: 데이터 초기화 옵션

**학습 포인트**:
- Blob API로 클라이언트에서 파일 다운로드 생성
- Q: 왜 import 시 ID를 재생성하는가?
- A: 기존 노트와 ID 충돌 방지

---

### 4. 크로스 탭 동기화 테스트
```typescript
/* src/hooks/useLocalStorage.test.ts:60-90 */
describe('크로스 탭 동기화', () => {
  it('다른 탭에서 변경 시 상태가 업데이트되어야 한다', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    )

    // 초기값 확인
    expect(result.current[0]).toBe('initial')

    // 다른 탭에서의 변경 시뮬레이션
    act(() => {
      window.localStorage.setItem('test-key', '"updated from other tab"')
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'test-key',
          newValue: '"updated from other tab"',
          storageArea: window.localStorage,
        })
      )
    })

    // 상태가 업데이트되었는지 확인
    expect(result.current[0]).toBe('updated from other tab')
  })

  it('다른 탭에서 삭제 시 초기값으로 복원되어야 한다', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'default')
    )

    act(() => {
      result.current[1]('stored value')
    })

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'test-key',
          newValue: null, // 삭제됨
          storageArea: window.localStorage,
        })
      )
    })

    expect(result.current[0]).toBe('default')
  })
})
```

**선정 이유**: storage 이벤트 기반 동기화 테스트 방법

**로직/흐름 설명**:
- `StorageEvent` 생성자로 이벤트 시뮬레이션
- `newValue: null`은 항목 삭제를 의미
- `act()`로 이벤트 발생 후 상태 업데이트 대기

**학습 포인트**:
- 브라우저 이벤트를 테스트 환경에서 시뮬레이션하는 방법
- renderHook과 act의 조합

## 재현 단계 (CLI 우선)

### CLI 명령어
```bash
# 1. 개발 서버 실행
npm run dev

# 2. 테스트 실행 (334개)
npm test -- --run

# 3. 빌드 확인
npm run build
```

### 구현 단계 (코드 작성 순서)
1. **useLocalStorage 훅 구현**: `src/hooks/useLocalStorage.ts`
   - 읽기/쓰기/삭제 함수
   - storage 이벤트 리스너
2. **useLocalStorage 테스트**: 13개 테스트 작성
3. **hooks index 업데이트**: export 추가
4. **usePersistedNotes 훅 구현**: `src/features/notes/usePersistedNotes.ts`
   - 버전 관리, 마이그레이션
   - CRUD + 내보내기/가져오기
5. **usePersistedNotes 테스트**: 14개 테스트 작성
6. **Notes 페이지 수정**: useNotes → usePersistedNotes
7. **Notes 테스트 수정**: beforeEach에서 localStorage 초기화
8. **검증**: `npm test` (334개 통과)

## 설명

### 설계 결정
1. **localStorage vs IndexedDB**: 노트 앱 규모에서는 localStorage로 충분 (5MB 제한)
2. **버전 관리**: 스키마 변경 시 기존 사용자 데이터 보존
3. **크로스 탭 동기화**: storage 이벤트로 구현 (추가 라이브러리 불필요)

### 트레이드오프
- **동기 API**: localStorage는 동기식이라 대용량 데이터 시 UI 블로킹 가능
- **JSON 직렬화**: 함수, Symbol 등은 저장 불가

### 테스트 통계
| 파일 | 테스트 수 |
|-----|----------|
| useLocalStorage.test.ts | 13 |
| usePersistedNotes.test.ts | 14 |
| **Stage 5 추가** | **27** |
| **전체 누적** | **334** |

## 검증 체크리스트

### 자동 검증
```bash
npm run lint      # PASS
npm test -- --run # 334 tests passed
npm run build     # 성공
```

### 수동 검증
- [ ] 노트 생성 후 페이지 새로고침 → 데이터 유지 확인
- [ ] 브라우저 개발자 도구 > Application > Local Storage에서 데이터 확인
- [ ] 두 개의 탭에서 같은 페이지 열기 → 한쪽에서 수정 시 다른 탭 동기화
- [ ] 노트 내보내기(JSON 다운로드) 동작 확인
- [ ] 내보낸 JSON 파일로 가져오기 동작 확인

## 누락 정보
- 없음
