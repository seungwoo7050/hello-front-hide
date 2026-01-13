# Commit #7 — API 통신 구현 - MSW + TanStack Query

## Meta
- **난이도**: ⭐⭐⭐ 중급 (Intermediate)
- **권장 커밋 메시지**: `feat(api): add MSW mock API, TanStack Query, and optimistic updates`

## 학습 목표
1. MSW(Mock Service Worker)를 사용하여 실제 네트워크 요청을 모킹한다
2. TanStack Query(React Query)로 서버 상태를 관리하고 캐싱한다
3. 낙관적 업데이트(Optimistic Update)로 즉각적인 UI 반응을 구현한다
4. Query Key 관리 패턴과 캐시 무효화 전략을 학습한다

## TL;DR
HTTP 클라이언트와 노트 API 레이어를 구축하고, MSW로 API를 모킹하며, TanStack Query로 서버 상태를 관리한다. 수정/삭제/핀 토글에 낙관적 업데이트를 적용한다. 339개 테스트 통과 (신규 5개).

## 배경/맥락
프론트엔드에서 API 통신은 핵심 요소이며, 개발 환경에서의 API 모킹은 필수이다:
- **MSW**: Service Worker를 사용해 네트워크 레벨에서 요청을 가로채 모킹
- **TanStack Query**: 서버 상태 관리, 캐싱, 재요청, 낙관적 업데이트 제공
- **낙관적 업데이트**: 서버 응답 전에 UI를 먼저 업데이트하여 체감 속도 향상
- **개발-프로덕션 동일 코드**: MSW 덕분에 같은 fetch 코드가 개발/프로덕션에서 작동

## 변경 파일 목록
### 추가된 파일 (12개)
- `src/api/client.ts` — HTTP 클라이언트
- `src/api/notes.ts` — 노트 API 함수
- `src/api/index.ts` — API 배럴 export
- `src/mocks/handlers/notes.ts` — MSW 노트 핸들러
- `src/mocks/handlers/index.ts` — 핸들러 배럴
- `src/mocks/browser.ts` — 브라우저용 Worker
- `src/mocks/server.ts` — 테스트용 서버
- `src/mocks/index.ts` — MSW 배럴
- `src/providers/QueryProvider.tsx` — React Query Provider
- `src/providers/queryClient.ts` — Query Client 설정
- `src/providers/index.ts` — Provider 배럴
- `src/features/notes/useNotesQuery.ts`, `useNotesQuery.test.tsx` — Query 훅

### 수정된 파일 (3개)
- `package.json` — @tanstack/react-query, msw 의존성 추가
- `src/main.tsx` — MSW 초기화
- `src/App.tsx` — QueryProvider 래핑
- `src/test/setup.ts` — MSW 서버 설정

## 코드 스니펫

### 1. HTTP 클라이언트
```typescript
/* src/api/client.ts:1-80 */
// API 응답 타입
export interface ApiResponse<T> {
  data: T
  message?: string
}

// API 에러 타입
export interface ApiError {
  message: string
  code: string
  status: number
}

// API 기본 URL 및 설정
export const API_BASE_URL = '/api'
export const API_DELAY = 500 // 개발 환경 네트워크 지연 시뮬레이션

// HTTP 클라이언트
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let errorData: { message?: string; code?: string } = {}
    try {
      errorData = await response.json()
    } catch {
      // JSON 파싱 실패 시 기본 에러
    }

    throw {
      message: errorData.message || 'API 요청에 실패했습니다',
      code: errorData.code || 'UNKNOWN_ERROR',
      status: response.status,
    } as ApiError
  }

  return response.json()
}

// 편의 메서드
export const api = {
  get: <T>(endpoint: string) => 
    fetchApi<T>(endpoint),
  
  post: <T>(endpoint: string, data: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: <T>(endpoint: string, data: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  patch: <T>(endpoint: string, data: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, {
      method: 'DELETE',
    }),
}
```

**선정 이유**: API 호출을 추상화하는 클라이언트 패턴

**로직/흐름 설명**:
- `fetchApi`: fetch API 래퍼로 에러 처리 표준화
- `ApiError`: 일관된 에러 형식으로 catch 블록에서 사용
- `api` 객체: HTTP 메서드별 편의 함수 제공

**런타임 영향**:
- 모든 API 호출이 동일한 에러 처리 로직을 거침
- JSON 응답만 지원 (바이너리 등은 별도 처리 필요)

**학습 포인트**:
- `response.ok`: HTTP 상태 코드 200-299인지 확인
- Q: 왜 fetch 대신 axios를 안 쓰는가?
- A: fetch는 네이티브 API로 추가 의존성 없음, MSW와 더 자연스럽게 통합

---

### 2. MSW 핸들러
```typescript
/* src/mocks/handlers/notes.ts:1-120 */
import { http, HttpResponse, delay } from 'msw'
import type { Note, NoteFormValues } from '../../features/notes/types'
import { sampleNotes } from '../../features/notes/sampleData'

const API_DELAY = 300

// 인메모리 데이터 저장소
let notes: Note[] = [...sampleNotes]
let nextId = notes.length + 1

export const notesHandlers = [
  // GET /api/notes - 목록 조회 (필터링, 정렬 지원)
  http.get('/api/notes', async ({ request }) => {
    await delay(API_DELAY)
    
    const url = new URL(request.url)
    const search = url.searchParams.get('search') || ''
    const category = url.searchParams.get('category') || ''
    const tag = url.searchParams.get('tag') || ''
    const sortBy = url.searchParams.get('sortBy') || 'newest'

    let result = [...notes]

    // 검색 필터
    if (search) {
      const lowerSearch = search.toLowerCase()
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(lowerSearch) ||
          note.content.toLowerCase().includes(lowerSearch)
      )
    }

    // 카테고리 필터
    if (category) {
      result = result.filter((note) => note.category === category)
    }

    // 태그 필터
    if (tag) {
      result = result.filter((note) => note.tags.includes(tag))
    }

    // 정렬
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'title-asc':
          return a.title.localeCompare(b.title)
        case 'title-desc':
          return b.title.localeCompare(a.title)
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return HttpResponse.json({ data: result })
  }),

  // POST /api/notes - 생성
  http.post('/api/notes', async ({ request }) => {
    await delay(API_DELAY)
    
    const body = (await request.json()) as NoteFormValues
    const now = new Date().toISOString()
    
    const newNote: Note = {
      id: `note-${nextId++}`,
      ...body,
      tags: typeof body.tags === 'string' 
        ? body.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : body.tags,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    }
    
    notes.push(newNote)
    return HttpResponse.json({ data: newNote }, { status: 201 })
  }),

  // PATCH /api/notes/:id - 수정
  http.patch('/api/notes/:id', async ({ params, request }) => {
    await delay(API_DELAY)
    
    const { id } = params
    const body = (await request.json()) as Partial<NoteFormValues>
    
    const index = notes.findIndex((n) => n.id === id)
    if (index === -1) {
      return HttpResponse.json(
        { message: '노트를 찾을 수 없습니다', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }
    
    notes[index] = {
      ...notes[index],
      ...body,
      updatedAt: new Date().toISOString(),
    }
    
    return HttpResponse.json({ data: notes[index] })
  }),

  // DELETE /api/notes/:id - 삭제
  http.delete('/api/notes/:id', async ({ params }) => {
    await delay(API_DELAY)
    
    const { id } = params
    const index = notes.findIndex((n) => n.id === id)
    
    if (index === -1) {
      return HttpResponse.json(
        { message: '노트를 찾을 수 없습니다', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }
    
    notes.splice(index, 1)
    return HttpResponse.json({ data: { id } })
  }),
]
```

**선정 이유**: MSW를 사용한 RESTful API 모킹의 완전한 예시

**로직/흐름 설명**:
- `http.get`, `http.post` 등: HTTP 메서드별 핸들러 정의
- `delay(API_DELAY)`: 네트워크 지연 시뮬레이션
- `request.url`, `request.json()`: 쿼리 파라미터, 요청 본문 접근
- `HttpResponse.json()`: JSON 응답 생성

**테스트 영향**:
- 개발 환경과 테스트에서 동일한 핸들러 사용
- 인메모리 저장소로 테스트 간 격리 가능

**학습 포인트**:
- MSW v2 문법: `http.get()` (v1의 `rest.get()`에서 변경)
- Q: 왜 실제 백엔드 대신 MSW를 쓰는가?
- A: 프론트엔드 독립 개발, 네트워크 없이 테스트, 에지 케이스 시뮬레이션

---

### 3. TanStack Query 훅 — 낙관적 업데이트
```typescript
/* src/features/notes/useNotesQuery.ts:1-150 */
import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { notesApi } from '../../api'
import type { Note, NoteFormValues, NotesFilter } from './types'

// Query Keys Factory
export const notesKeys = {
  all: ['notes'] as const,
  lists: () => [...notesKeys.all, 'list'] as const,
  list: (filter: NotesFilter) => [...notesKeys.lists(), filter] as const,
  details: () => [...notesKeys.all, 'detail'] as const,
  detail: (id: string) => [...notesKeys.details(), id] as const,
}

// 노트 목록 조회
export function useNotesQuery(filter: NotesFilter = defaultFilter) {
  return useQuery({
    queryKey: notesKeys.list(filter),
    queryFn: () => notesApi.getNotes(filter),
  })
}

// 단일 노트 조회
export function useNoteQuery(id: string) {
  return useQuery({
    queryKey: notesKeys.detail(id),
    queryFn: () => notesApi.getNoteById(id),
    enabled: !!id,
  })
}

// 노트 생성
export function useCreateNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (values: NoteFormValues) => notesApi.createNote(values),
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() })
    },
  })
}

// 노트 수정 (낙관적 업데이트)
export function useUpdateNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<NoteFormValues> }) =>
      notesApi.updateNote(id, values),
    
    // 낙관적 업데이트
    onMutate: async ({ id, values }) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: notesKeys.lists() })
      
      // 이전 데이터 스냅샷
      const previousNotes = queryClient.getQueryData<Note[]>(notesKeys.lists())
      
      // 캐시 즉시 업데이트
      queryClient.setQueryData<Note[]>(notesKeys.lists(), (old) =>
        old?.map((note) =>
          note.id === id
            ? { ...note, ...values, updatedAt: new Date().toISOString() }
            : note
        )
      )
      
      return { previousNotes }
    },
    
    // 에러 시 롤백
    onError: (err, variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(notesKeys.lists(), context.previousNotes)
      }
    },
    
    // 성공/실패 후 캐시 재검증
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() })
    },
  })
}

// 노트 삭제 (낙관적 업데이트)
export function useDeleteNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => notesApi.deleteNote(id),
    
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notesKeys.lists() })
      
      const previousNotes = queryClient.getQueryData<Note[]>(notesKeys.lists())
      
      queryClient.setQueryData<Note[]>(notesKeys.lists(), (old) =>
        old?.filter((note) => note.id !== id)
      )
      
      return { previousNotes }
    },
    
    onError: (err, id, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(notesKeys.lists(), context.previousNotes)
      }
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() })
    },
  })
}
```

**선정 이유**: TanStack Query의 낙관적 업데이트 패턴

**로직/흐름 설명**:
- **Query Keys Factory**: 일관된 쿼리 키 관리로 캐시 제어 용이
- **useQuery**: 데이터 조회 + 캐싱 + 재요청 자동화
- **useMutation + onMutate**: 서버 응답 전 캐시 선 업데이트
- **onError**: 실패 시 이전 상태로 롤백
- **onSettled**: 성공/실패와 관계없이 최종 서버 상태로 동기화

**런타임 영향**:
- 낙관적 업데이트로 UI가 즉시 반응 (체감 속도 향상)
- 실패 시 자동 롤백으로 데이터 정합성 유지

**학습 포인트**:
- `cancelQueries`: 진행 중인 요청이 낙관적 업데이트를 덮어쓰지 않도록
- Q: onSettled에서 왜 다시 invalidate하는가?
- A: 서버의 실제 데이터로 캐시를 동기화 (다른 클라이언트 변경 반영)

---

### 4. MSW 브라우저/서버 설정
```typescript
/* src/mocks/browser.ts */
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

/* src/mocks/server.ts */
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

/* src/test/setup.ts (추가 부분) */
import { server } from '../mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

**선정 이유**: 개발 환경과 테스트 환경의 MSW 설정

**로직/흐름 설명**:
- `setupWorker`: 브라우저에서 Service Worker로 요청 가로채기
- `setupServer`: Node.js(테스트)에서 요청 가로채기
- `onUnhandledRequest: 'error'`: 핸들러 없는 요청 시 에러 발생

**학습 포인트**:
- 같은 handlers를 브라우저/Node에서 공유
- Q: Service Worker와 Node 서버의 차이는?
- A: 브라우저에서는 SW가 네트워크 요청을 가로채고, Node에서는 fetch를 패치

## 재현 단계 (CLI 우선)

### CLI 명령어
```bash
# 1. 의존성 설치
npm install @tanstack/react-query msw

# 2. MSW Service Worker 생성
npx msw init public --save

# 3. 개발 서버 실행
npm run dev

# 4. 테스트 실행 (339개)
npm test -- --run

# 5. 빌드 확인
npm run build
```

### 구현 단계 (코드 작성 순서)
1. **의존성 설치**: `npm install @tanstack/react-query msw`
2. **API 클라이언트 구현**: `src/api/client.ts`
3. **노트 API 함수**: `src/api/notes.ts`
4. **MSW 핸들러 작성**: `src/mocks/handlers/notes.ts`
5. **MSW 설정**: browser.ts, server.ts, index.ts
6. **Service Worker 생성**: `npx msw init public --save`
7. **Query Client 설정**: `src/providers/queryClient.ts`
8. **QueryProvider 구현**: `src/providers/QueryProvider.tsx`
9. **useNotesQuery 훅 구현**: 낙관적 업데이트 포함
10. **main.tsx 수정**: MSW worker 시작
11. **App.tsx 수정**: QueryProvider 래핑
12. **test/setup.ts 수정**: MSW 서버 설정
13. **검증**: `npm test` (339개 통과)

## 설명

### 설계 결정
1. **MSW v2**: 최신 버전 사용 (http.get 문법)
2. **Query Keys Factory**: 패턴화된 쿼리 키로 캐시 관리 용이
3. **낙관적 업데이트**: 수정/삭제/핀 토글에 적용

### 트레이드오프
- **MSW vs Mirage.js**: MSW는 Service Worker 기반으로 더 현실적인 네트워크 시뮬레이션
- **낙관적 vs 비관적 업데이트**: 낙관적은 빠르지만 롤백 로직 필요

### 테스트 통계
| 파일 | 테스트 수 |
|-----|----------|
| useNotesQuery.test.tsx | 5 |
| **Stage 6 추가** | **5** |
| **전체 누적** | **339** |

## 검증 체크리스트

### 자동 검증
```bash
npm run lint      # PASS
npm test -- --run # 339 tests passed
npm run build     # 성공
```

### 수동 검증
- [ ] 개발 서버 시작 시 MSW 활성화 메시지 확인 (콘솔)
- [ ] Network 탭에서 `/api/notes` 요청 확인
- [ ] 노트 수정 시 UI가 즉시 업데이트되는지 확인 (낙관적)
- [ ] 네트워크 탭에서 API 지연(300ms) 확인
- [ ] DevTools > Application > Service Workers에서 MSW 확인

## 누락 정보
- 없음
