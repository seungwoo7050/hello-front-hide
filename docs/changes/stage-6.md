# Stage 6 변경 사항

## 변경 일시
2024년 Stage 6 완료

## 테스트 결과
- 전체 테스트: 339개 통과
- Stage 6 신규 테스트: 5개
- 빌드: 성공

## 설치된 패키지
- `@tanstack/react-query` - 서버 상태 관리
- `msw` - API 모킹

## 추가된 파일

### API 레이어 (src/api/)
- `client.ts` - HTTP 클라이언트 및 타입 정의
- `notes.ts` - 노트 API 함수
- `index.ts`

### MSW 핸들러 (src/mocks/)
- `handlers/notes.ts` - 노트 API 핸들러 (CRUD + 필터링)
- `handlers/index.ts`
- `browser.ts` - 브라우저용 Service Worker
- `server.ts` - 테스트용 서버
- `index.ts`

### Providers (src/providers/)
- `QueryProvider.tsx` - React Query Provider
- `queryClient.ts` - Query Client 설정
- `index.ts`

### Query Hooks (src/features/notes/)
- `useNotesQuery.ts` - TanStack Query 훅 (조회, 생성, 수정, 삭제, 핀 토글)
- `useNotesQuery.test.tsx` - 테스트 (5개)

### Public 파일
- `public/mockServiceWorker.js` - MSW Service Worker

## 수정된 파일
- `src/main.tsx` - MSW 초기화 추가
- `src/App.tsx` - QueryProvider 래핑
- `src/test/setup.ts` - MSW 서버 설정 추가
- `src/features/notes/index.ts` - useNotesQuery export 추가

## 구현된 기능

### API 클라이언트
- ✅ 제네릭 HTTP 메서드 (GET, POST, PUT, PATCH, DELETE)
- ✅ 에러 핸들링 (ApiError 타입)
- ✅ 타입 안전한 API 응답

### MSW Mock API
- ✅ 노트 CRUD 엔드포인트
- ✅ 검색, 카테고리, 태그 필터링
- ✅ 정렬 (최신순, 오래된순, 제목순 등)
- ✅ 네트워크 지연 시뮬레이션

### TanStack Query Hooks
- ✅ useNotesQuery - 목록 조회
- ✅ useNoteQuery - 단일 조회
- ✅ useCreateNote - 생성
- ✅ useUpdateNote - 수정 (낙관적 업데이트)
- ✅ useDeleteNote - 삭제 (낙관적 업데이트)
- ✅ useTogglePin - 핀 토글 (낙관적 업데이트)

## 테스트 요약

| 파일 | 테스트 수 |
|-----|----------|
| useNotesQuery.test.tsx | 5 |
| **합계** | **5** |

## 기술적 결정

1. **MSW**: 실제 네트워크 요청을 모킹하여 프로덕션과 동일한 코드 사용
2. **TanStack Query**: 서버 상태 관리, 캐싱, 낙관적 업데이트 지원
3. **Query Keys Factory**: 일관된 쿼리 키 관리로 캐시 무효화 용이
4. **낙관적 업데이트**: 즉각적인 UI 반응으로 사용자 경험 향상
