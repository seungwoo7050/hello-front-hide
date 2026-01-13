# Commit #7 — API 통신 구현 (MSW + TanStack Query)

## Meta

- **난이도**: ⭐⭐⭐ 중급 (Intermediate)
- **권장 커밋 메시지**: `feat: add api layer with msw mocking and tanstack query`

---

## 학습 목표

1. MSW(Mock Service Worker)로 API를 모킹할 수 있다
2. TanStack Query로 서버 상태를 관리할 수 있다
3. 낙관적 업데이트(Optimistic Update)를 구현할 수 있다
4. Query Key 팩토리 패턴으로 캐시를 관리할 수 있다

---

## TL;DR

HTTP 클라이언트와 API 레이어를 구축하고, MSW로 노트 CRUD API를 모킹한다. TanStack Query Provider를 설정하고, `useNotesQuery` 훅으로 조회/생성/수정/삭제를 구현한다. 낙관적 업데이트로 즉각적인 UI 반응을 제공한다.

---

## 배경/컨텍스트

### 왜 이 변경이 필요한가?

- **실제 API 시뮬레이션**: MSW로 프로덕션과 동일한 API 코드 사용
- **서버 상태 관리**: 캐싱, 재시도, 백그라운드 리패치
- **낙관적 업데이트**: 네트워크 지연 없는 즉각적 UI
- **테스트 용이성**: MSW로 네트워크 요청 가로채기

### 영향 범위

- 새로운 패키지: `@tanstack/react-query`, `msw`
- API 레이어 `src/api/` 추가
- MSW 핸들러 `src/mocks/` 추가
- Query Provider 설정
- 테스트 수 334개 → 339개로 증가 (+5)

---

## 변경 파일 목록

### 추가된 파일 (16개)

| 카테고리 | 파일 | 설명 |
|----------|------|------|
| API | `src/api/client.ts` | HTTP 클라이언트 |
| API | `src/api/notes.ts` | 노트 API 함수 |
| MSW | `src/mocks/handlers/notes.ts` | 노트 API 핸들러 |
| MSW | `src/mocks/browser.ts` | 브라우저용 Worker |
| MSW | `src/mocks/server.ts` | 테스트용 서버 |
| Provider | `src/providers/QueryProvider.tsx` | React Query Provider |
| Provider | `src/providers/queryClient.ts` | Query Client 설정 |
| Hook | `src/features/notes/useNotesQuery.ts` | TanStack Query 훅 |
| Hook | `src/features/notes/useNotesQuery.test.tsx` | 훅 테스트 |
| Public | `public/mockServiceWorker.js` | MSW Service Worker |

### 수정된 파일 (5개)

| 파일 | 변경 내용 |
|------|------|
| `package.json` | @tanstack/react-query, msw 추가 |
| `src/main.tsx` | MSW 초기화 |
| `src/App.tsx` | QueryProvider 래핑 |
| `src/test/setup.ts` | MSW 서버 설정 |

---

## 코드 스니펫

### 1. client.ts — HTTP 클라이언트

```typescript
/* src/api/client.ts */
const API_BASE_URL = '/api';

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      message: errorData.message || 'API 요청에 실패했습니다',
      code: errorData.code || 'UNKNOWN_ERROR',
      status: response.status,
    } as ApiError;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) => 
    fetchApi<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: unknown) => 
    fetchApi<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => 
    fetchApi<T>(endpoint, { method: 'DELETE' }),
};
```

---

### 2. MSW 핸들러

```typescript
/* src/mocks/handlers/notes.ts */
import { http, HttpResponse, delay } from 'msw';

const API_DELAY = 300;
let notes: Note[] = [...sampleNotes];

export const notesHandlers = [
  // 목록 조회 (검색, 필터, 정렬 지원)
  http.get('/api/notes', async ({ request }) => {
    await delay(API_DELAY);
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category');
    const sortBy = url.searchParams.get('sortBy') || 'newest';
    
    let result = [...notes];
    
    // 검색
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(lowerSearch) ||
        n.content.toLowerCase().includes(lowerSearch)
      );
    }
    
    // 카테고리 필터
    if (category) {
      result = result.filter(n => n.category === category);
    }
    
    // 정렬
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return 0;
    });
    
    return HttpResponse.json(result);
  }),

  // 생성
  http.post('/api/notes', async ({ request }) => {
    await delay(API_DELAY);
    const body = await request.json() as NoteFormValues;
    
    const newNote: Note = {
      id: generateId(),
      ...body,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    notes.push(newNote);
    return HttpResponse.json(newNote, { status: 201 });
  }),

  // 수정
  http.patch('/api/notes/:id', async ({ params, request }) => {
    await delay(API_DELAY);
    const { id } = params;
    const body = await request.json();
    
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    
    notes[index] = { ...notes[index], ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json(notes[index]);
  }),

  // 삭제
  http.delete('/api/notes/:id', async ({ params }) => {
    await delay(API_DELAY);
    const { id } = params;
    notes = notes.filter(n => n.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),
];
```

---

### 3. TanStack Query 훅 (낙관적 업데이트)

```typescript
/* src/features/notes/useNotesQuery.ts */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '../../api/notes';
import type { Note, NoteFormValues } from './types';

// Query Key 팩토리
export const notesKeys = {
  all: ['notes'] as const,
  lists: () => [...notesKeys.all, 'list'] as const,
  list: (filters: Record<string, string>) => [...notesKeys.lists(), filters] as const,
  details: () => [...notesKeys.all, 'detail'] as const,
  detail: (id: string) => [...notesKeys.details(), id] as const,
};

// 목록 조회
export function useNotesQuery(filters: NotesFilter) {
  return useQuery({
    queryKey: notesKeys.list(filters),
    queryFn: () => notesApi.getAll(filters),
  });
}

// 낙관적 업데이트 - 수정
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: NoteFormValues }) =>
      notesApi.update(id, values),
    
    onMutate: async ({ id, values }) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: notesKeys.lists() });
      
      // 이전 데이터 스냅샷
      const previousNotes = queryClient.getQueryData<Note[]>(notesKeys.lists());
      
      // 낙관적 업데이트
      queryClient.setQueryData<Note[]>(notesKeys.lists(), (old) =>
        old?.map(note =>
          note.id === id ? { ...note, ...values, updatedAt: new Date().toISOString() } : note
        )
      );
      
      return { previousNotes };
    },
    
    onError: (err, variables, context) => {
      // 에러 시 롤백
      if (context?.previousNotes) {
        queryClient.setQueryData(notesKeys.lists(), context.previousNotes);
      }
    },
    
    onSettled: () => {
      // 완료 후 캐시 무효화
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() });
    },
  });
}

// 낙관적 업데이트 - 삭제
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notesKeys.lists() });
      const previousNotes = queryClient.getQueryData<Note[]>(notesKeys.lists());
      
      queryClient.setQueryData<Note[]>(notesKeys.lists(), (old) =>
        old?.filter(note => note.id !== id)
      );
      
      return { previousNotes };
    },
    
    onError: (err, id, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(notesKeys.lists(), context.previousNotes);
      }
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() });
    },
  });
}
```

---

## 재현 단계 (CLI 우선)

### 1. 패키지 설치

```bash
npm install @tanstack/react-query msw --save
npx msw init public/ --save
```

### 2. 디렉토리 구조 생성

```bash
mkdir -p src/api
mkdir -p src/mocks/handlers
mkdir -p src/providers
```

### 3. 구현 단계

1. **src/api/client.ts**: HTTP 클라이언트
2. **src/api/notes.ts**: 노트 API 함수
3. **src/mocks/handlers/notes.ts**: MSW 핸들러
4. **src/mocks/browser.ts, server.ts**: Worker 설정
5. **src/main.tsx**: MSW 초기화 (개발 환경)
6. **src/providers/queryClient.ts**: Query Client 설정
7. **src/providers/QueryProvider.tsx**: Provider 컴포넌트
8. **src/App.tsx**: QueryProvider 래핑
9. **src/features/notes/useNotesQuery.ts**: Query 훅
10. **src/test/setup.ts**: MSW 서버 설정

### 4. MSW 초기화 (main.tsx)

```typescript
async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    return worker.start({ onUnhandledRequest: 'bypass' });
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(<App />);
});
```

---

## 검증 체크리스트

- [ ] `npm test -- --run` 실행 시 339개 테스트 통과
- [ ] 개발 서버에서 Network 탭에 `/api/notes` 요청 확인
- [ ] 노트 생성 시 즉각적 UI 반영 (낙관적 업데이트)
- [ ] 노트 삭제 시 즉각적 UI 반영
- [ ] API 에러 시 이전 상태로 롤백

---

## 누락 정보

- ✅ 커밋 해시: `3360a6ee924cf4c2057c949276c447cf4f99736d`
- ✅ 테스트 결과: 339개 통과 (+5)

**핵심 학습 포인트**:
- MSW `delay()`로 네트워크 지연 시뮬레이션
- Query Key 팩토리 패턴으로 일관된 캐시 관리
- 낙관적 업데이트: `onMutate` → 스냅샷 → 업데이트 → `onError` 롤백
- `onSettled`에서 캐시 무효화로 서버 상태와 동기화
