# Stage 6: API 통신 (Mock Service Worker + TanStack Query)

## 개요

Stage 6에서는 MSW(Mock Service Worker)를 사용한 API 모킹과 TanStack Query(React Query)를 활용한 서버 상태 관리를 구현합니다.

## 학습 목표

- RESTful API 설계 및 구현
- MSW로 API 모킹
- TanStack Query로 서버 상태 관리
- 낙관적 업데이트(Optimistic Update) 구현
- 로딩/에러 상태 처리
- Query Key 관리 패턴

## 핵심 개념

### 1. API 클라이언트

```typescript
// src/api/client.ts
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
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
  post: <T>(endpoint: string, data: unknown) => fetchApi<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: unknown) => fetchApi<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'DELETE' }),
};
```

### 2. MSW 핸들러

```typescript
// src/mocks/handlers/notes.ts
import { http, HttpResponse, delay } from 'msw';

export const notesHandlers = [
  http.get('/api/notes', async ({ request }) => {
    await delay(API_DELAY); // 네트워크 지연 시뮬레이션
    
    // 쿼리 파라미터 처리
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    
    // 필터링, 정렬 로직...
    
    return HttpResponse.json({
      data: result,
      success: true,
    });
  }),
  
  http.post('/api/notes', async ({ request }) => {
    await delay(API_DELAY);
    const body = await request.json();
    
    const newNote = { id: generateId(), ...body };
    notes.push(newNote);
    
    return HttpResponse.json({
      data: newNote,
      success: true,
    });
  }),
];
```

### 3. TanStack Query 설정

```typescript
// src/providers/QueryProvider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1분
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 4. Query Hooks

```typescript
// Query Keys
export const notesKeys = {
  all: ['notes'] as const,
  lists: () => [...notesKeys.all, 'list'] as const,
  list: (params?: NotesQueryParams) => [...notesKeys.lists(), params] as const,
  detail: (id: string) => [...notesKeys.all, 'detail', id] as const,
};

// 조회 훅
export function useNotesQuery(params?: NotesQueryParams) {
  return useQuery({
    queryKey: notesKeys.list(params),
    queryFn: async () => {
      const response = await notesApi.getAll(params);
      return response.data;
    },
  });
}

// Mutation with Optimistic Update
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }) => {
      const response = await notesApi.update(id, values);
      return response.data;
    },
    onMutate: async ({ id, values }) => {
      // 쿼리 취소
      await queryClient.cancelQueries({ queryKey: notesKeys.lists() });
      
      // 이전 데이터 저장
      const previousNotes = queryClient.getQueryData(notesKeys.list());
      
      // 낙관적 업데이트
      queryClient.setQueryData(notesKeys.list(), (old) =>
        old?.map((note) => note.id === id ? { ...note, ...values } : note)
      );
      
      return { previousNotes };
    },
    onError: (_err, _variables, context) => {
      // 롤백
      if (context?.previousNotes) {
        queryClient.setQueryData(notesKeys.list(), context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() });
    },
  });
}
```

## 파일 구조

```
src/
├── api/
│   ├── client.ts         # HTTP 클라이언트
│   ├── notes.ts          # 노트 API
│   └── index.ts
├── mocks/
│   ├── handlers/
│   │   ├── notes.ts      # 노트 API 핸들러
│   │   └── index.ts
│   ├── browser.ts        # 브라우저용 MSW
│   ├── server.ts         # 테스트용 MSW
│   └── index.ts
├── providers/
│   ├── QueryProvider.tsx # React Query Provider
│   ├── queryClient.ts    # Query Client 설정
│   └── index.ts
└── features/notes/
    ├── useNotesQuery.ts      # Query Hooks
    └── useNotesQuery.test.tsx
```

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/notes | 노트 목록 조회 (검색, 필터, 정렬 지원) |
| GET | /api/notes/:id | 단일 노트 조회 |
| POST | /api/notes | 노트 생성 |
| PATCH | /api/notes/:id | 노트 수정 |
| DELETE | /api/notes/:id | 노트 삭제 |
| PATCH | /api/notes/:id/pin | 핀 토글 |

## 테스트 커버리지

- **useNotesQuery.test.tsx**: 5개 테스트
  - 노트 목록 조회
  - 로딩 상태
  - 검색 필터링
  - 노트 생성
  - 노트 삭제

**신규 5개 테스트, 총 339개 테스트**

## 사용 예시

```tsx
function NotesPage() {
  const { data: notes, isLoading, error } = useNotesQuery();
  const createNote = useCreateNote();
  
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage />;
  
  const handleCreate = async (values: NoteFormValues) => {
    try {
      await createNote.mutateAsync(values);
      toast.success('노트가 생성되었습니다');
    } catch {
      toast.error('생성에 실패했습니다');
    }
  };
  
  return (
    <NoteList
      notes={notes}
      onCreateNote={handleCreate}
    />
  );
}
```

## 다음 단계 (Stage 7)

- 사용자 인증/인가
- Protected Routes
- JWT 토큰 관리
- 로그인/로그아웃 기능
