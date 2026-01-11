# Stage 5: 로컬 영속성 (localStorage)

## 개요

Stage 5에서는 브라우저의 localStorage를 활용하여 노트 데이터를 영속적으로 저장합니다. 페이지를 새로고침하거나 브라우저를 닫았다 열어도 데이터가 유지됩니다.

## 학습 목표

- localStorage API 이해 및 활용
- 커스텀 훅으로 스토리지 로직 추상화
- 데이터 직렬화/역직렬화
- 데이터 버전 관리 및 마이그레이션
- 크로스 탭 동기화

## 핵심 개념

### 1. useLocalStorage 커스텀 훅

```typescript
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>, () => void] {
  // 초기 값 읽기
  const readValue = useCallback((): T => {
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
  const setValue: SetValue<T> = useCallback((value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  }, [key, storedValue]);

  // 값 삭제
  const removeValue = useCallback(() => {
    window.localStorage.removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
```

### 2. 데이터 버전 관리

```typescript
const NOTES_VERSION = 1;

interface StoredNotesData {
  version: number;
  notes: Note[];
  lastUpdated: string;
}

// 마이그레이션 함수
function migrateData(data: StoredNotesData): StoredNotesData {
  if (data.version < NOTES_VERSION) {
    // 버전별 마이그레이션 로직
    return {
      ...data,
      version: NOTES_VERSION,
    };
  }
  return data;
}
```

### 3. 크로스 탭 동기화

```typescript
useEffect(() => {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === key && event.newValue !== null) {
      setStoredValue(JSON.parse(event.newValue));
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, [key]);
```

### 4. 데이터 내보내기/가져오기

```typescript
// JSON 내보내기
const exportNotes = (): string => {
  return JSON.stringify(data, null, 2);
};

// JSON 가져오기
const importNotes = (jsonString: string): boolean => {
  try {
    const importedData = JSON.parse(jsonString);
    if (!importedData.notes || !Array.isArray(importedData.notes)) {
      throw new Error('Invalid data format');
    }
    setStoredData(migrateData(importedData));
    return true;
  } catch {
    return false;
  }
};
```

## 파일 구조

```
src/
├── hooks/
│   ├── useLocalStorage.ts       # localStorage 커스텀 훅
│   ├── useLocalStorage.test.ts  # 훅 테스트
│   └── index.ts                 # exports
└── features/notes/
    ├── usePersistedNotes.ts     # 영속성 적용된 노트 훅
    ├── usePersistedNotes.test.ts# 영속성 테스트
    └── index.ts                 # exports
```

## 주요 기능

### useLocalStorage
- 제네릭 타입 지원
- 함수형 업데이트 지원
- 에러 핸들링
- 크로스 탭 동기화
- 값 삭제 기능

### usePersistedNotes
- 모든 CRUD 작업 자동 저장
- 데이터 버전 관리
- 마이그레이션 지원
- 데이터 내보내기/가져오기
- 초기화 기능 (모두 삭제, 샘플 데이터 복원)

## 테스트 커버리지

- **useLocalStorage.test.ts**: 13개 테스트
  - 초기화, 값 저장, 값 삭제
  - 객체/배열 저장
  - 에러 핸들링
  - 크로스 탭 동기화

- **usePersistedNotes.test.ts**: 14개 테스트
  - 영속성 확인
  - CRUD 작업 저장
  - 데이터 관리 (내보내기/가져오기)
  - 필터링

**신규 27개 테스트, 총 334개 테스트**

## 사용 예시

```tsx
// useLocalStorage 직접 사용
const [theme, setTheme] = useLocalStorage('theme', 'light');

// usePersistedNotes 사용 (Notes 페이지에서)
import { usePersistedNotes } from '../../features/notes/usePersistedNotes';

function Notes() {
  const {
    notes,
    createNote,
    updateNote,
    deleteNote,
    exportNotes,
    importNotes,
  } = usePersistedNotes();
  
  // 모든 변경사항이 자동으로 localStorage에 저장됨
}
```

## localStorage 제한사항

- 용량 제한: 약 5-10MB (브라우저마다 다름)
- 동기 API: 큰 데이터 저장 시 성능 저하 가능
- 문자열만 저장: JSON 직렬화 필요
- 보안: 민감한 데이터 저장 부적합

## 다음 단계 (Stage 6)

- Mock API 서버 구축
- React Query를 통한 서버 상태 관리
- 로딩/에러 상태 처리
- 낙관적 업데이트
