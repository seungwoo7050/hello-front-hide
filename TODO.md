# React + TypeScript 학습 여정 TODO

> ⚠️ 이 문서는 생성 후 **불변(IMMUTABLE)**입니다. 스테이지 정의, 순서, 완료 기준을 수정할 수 없습니다.

---

## Stage 0 — 프로젝트 초기화

### 목적
Vite + React + TypeScript 기반 프로젝트를 표준 CLI로 스캐폴딩하고, ESLint/Prettier/Vitest/Testing Library를 구성하여 품질 게이트를 확립한다.

### 기능 체크리스트
- [ ] `npm create vite@latest`로 React + TypeScript 프로젝트 생성
- [ ] ESLint 설정 (React, TypeScript 규칙 포함)
- [ ] Prettier 설정 및 ESLint 연동
- [ ] Vitest + Testing Library 설치 및 설정
- [ ] `npm run lint`, `npm test`, `npm run build` 스크립트 확인
- [ ] 기본 App 컴포넌트에 대한 스모크 테스트 작성
- [ ] 로컬 오케스트레이션 스크립트 생성 (`scripts/run_stage.sh`, `scripts/verify.sh`)

### 필수 CSS 포인트
- CSS Modules 구조 확인 (`*.module.css`)
- 글로벌 리셋/기본 스타일 설정

### 필수 테스트 포인트
- App 컴포넌트가 렌더링되는지 확인하는 테스트

### 완료 기준
- `npm run lint` PASS
- `npm test` PASS
- `npm run build` PASS
- Git 커밋 완료
- `state/stage-0.json` 체크포인트 생성
- `docs/stage-0.md` 학습 문서 생성
- `docs/changes/stage-0.md` 변경 로그 생성

---

## Stage 1 — UI 상태 Playground + UI Kit

### 목적
재사용 가능한 UI Kit 컴포넌트를 구축하고, 다양한 UI 상태(hover, focus, disabled, loading, error)를 시각적으로 확인할 수 있는 Playground를 만든다.

### 기능 체크리스트
- [ ] Button 컴포넌트 (variant: primary, secondary, ghost)
- [ ] Input 컴포넌트 (상태: default, focus, error, disabled)
- [ ] Card 컴포넌트
- [ ] Badge 컴포넌트
- [ ] Spinner/Loading 컴포넌트
- [ ] UI Playground 페이지에서 모든 컴포넌트 상태 시연

### 필수 CSS 포인트
- 모든 상태에 대한 시각적 피드백 (`:hover`, `:focus-visible`, `:disabled`, `[aria-invalid]`)
- CSS 변수를 활용한 디자인 토큰 시스템
- CSS Modules 네이밍 컨벤션 확립

### 필수 테스트 포인트
- Button 클릭 이벤트 테스트
- Input 값 변경 테스트
- disabled 상태에서 클릭 불가 테스트
- 각 컴포넌트 렌더링 테스트

### 완료 기준
- 모든 품질 게이트 PASS
- UI Playground에서 모든 상태 확인 가능
- 접근성 기준 충족 (키보드, focus-visible, aria-label)

---

## Stage 2 — 라우팅 + 반응형 레이아웃

### 목적
React Router를 사용한 SPA 라우팅을 구현하고, 모바일/태블릿/데스크톱에 대응하는 반응형 레이아웃 시스템을 구축한다.

### 기능 체크리스트
- [ ] React Router DOM 설치 및 설정
- [ ] 레이아웃 컴포넌트 (Header, Sidebar, Main, Footer)
- [ ] 최소 3개 라우트 (Home, Playground, About)
- [ ] 모바일 햄버거 메뉴
- [ ] 브레드크럼 네비게이션
- [ ] 404 페이지

### 필수 CSS 포인트
- 미디어 쿼리 브레이크포인트 (mobile: 0-767px, tablet: 768-1023px, desktop: 1024px+)
- 플렉스박스/그리드 기반 레이아웃
- 모바일 우선 접근법

### 필수 테스트 포인트
- 라우트 이동 테스트
- 현재 경로 활성화 표시 테스트
- 반응형 레이아웃 변경 테스트 (matchMedia mock)

### 완료 기준
- 모든 품질 게이트 PASS
- 3개 이상 라우트 정상 작동
- 반응형 레이아웃 전환 확인

---

## Stage 3 — 폼 + 검증 + 토스트

### 목적
제어 컴포넌트 기반 폼을 구현하고, 실시간 유효성 검사와 피드백 시스템(토스트 알림)을 구축한다.

### 기능 체크리스트
- [ ] 범용 Form 컴포넌트
- [ ] TextField, TextArea, Select, Checkbox, Radio 컴포넌트
- [ ] 유효성 검사 로직 (필수값, 이메일, 최소/최대 길이, 패턴)
- [ ] 인라인 에러 메시지 표시
- [ ] Toast 컴포넌트 (success, error, warning, info)
- [ ] Toast Context/Provider
- [ ] 폼 제출 성공/실패 시 토스트 표시

### 필수 CSS 포인트
- 유효성 상태에 따른 Input 스타일 변화
- Toast 애니메이션 (enter/exit)
- 에러 메시지 접근성 (`aria-live`, `role="alert"`)

### 필수 테스트 포인트
- 유효성 검사 통과/실패 테스트
- 폼 제출 테스트
- 토스트 표시/자동 닫힘 테스트
- 키보드로 폼 조작 테스트

### 완료 기준
- 모든 품질 게이트 PASS
- 복잡한 폼 시나리오 정상 작동
- 토스트 시스템 정상 작동

---

## Stage 4 — 리스트 / 상세 앱 (노트)

### 목적
CRUD 기능을 갖춘 노트 앱을 구현하여 리스트-상세 패턴과 상태 관리를 학습한다.

### 기능 체크리스트
- [ ] 노트 목록 표시 (제목, 요약, 생성일)
- [ ] 노트 생성 폼
- [ ] 노트 상세 보기
- [ ] 노트 수정 기능
- [ ] 노트 삭제 기능 (확인 모달)
- [ ] 빈 상태 UI
- [ ] 검색/필터 기능

### 필수 CSS 포인트
- 리스트 아이템 hover/선택 상태
- 모달 오버레이 및 포커스 트랩
- 빈 상태 일러스트레이션

### 필수 테스트 포인트
- 노트 생성 후 목록에 표시되는지 테스트
- 노트 수정 후 내용 반영 테스트
- 노트 삭제 후 목록에서 제거 테스트
- 검색 필터링 테스트

### 완료 기준
- 모든 품질 게이트 PASS
- 완전한 CRUD 기능
- 사용자 친화적 빈 상태/로딩 상태

---

## Stage 5 — 로컬 영속화

### 목적
localStorage를 활용하여 노트 데이터를 영속화하고, 커스텀 훅을 통한 추상화를 학습한다.

### 기능 체크리스트
- [ ] `useLocalStorage` 커스텀 훅
- [ ] 노트 데이터 localStorage 저장/복원
- [ ] 저장 상태 표시 (저장 중, 저장됨)
- [ ] 데이터 마이그레이션 버전 관리
- [ ] 저장소 용량 초과 처리

### 필수 CSS 포인트
- 저장 상태 인디케이터
- 용량 경고 UI

### 필수 테스트 포인트
- localStorage 읽기/쓰기 테스트 (mock)
- 페이지 새로고침 후 데이터 유지 시뮬레이션
- 용량 초과 에러 핸들링 테스트

### 완료 기준
- 모든 품질 게이트 PASS
- 브라우저 새로고침 후 데이터 유지
- 에러 상황 graceful 처리

---

## Stage 6 — 파일 업로드 + 미리보기

### 목적
파일 업로드 UI를 구현하고, 이미지/비디오 미리보기 및 드래그 앤 드롭을 학습한다.

### 기능 체크리스트
- [ ] FileUpload 컴포넌트 (클릭 + 드래그앤드롭)
- [ ] 이미지 미리보기 (썸네일)
- [ ] 비디오 미리보기 (인라인 플레이어)
- [ ] 파일 타입/크기 검증
- [ ] 업로드 진행률 표시
- [ ] 다중 파일 업로드
- [ ] 노트에 첨부파일 기능 추가

### 필수 CSS 포인트
- 드래그 오버 상태 스타일
- 업로드 진행률 바
- 썸네일 그리드 레이아웃

### 필수 테스트 포인트
- 파일 선택 시 미리보기 표시 테스트
- 드래그앤드롭 이벤트 테스트
- 파일 타입 검증 테스트
- 파일 크기 제한 테스트

### 완료 기준
- 모든 품질 게이트 PASS
- 이미지/비디오 미리보기 정상 작동
- 드래그앤드롭 UX 완성

---

## Stage 7 — 커스텀 타임라인(시킹)

### 목적
requestAnimationFrame 기반의 커스텀 미디어 타임라인을 구현하여 시간 기반 UI 제어를 학습한다.

### 기능 체크리스트
- [ ] 커스텀 타임라인 컴포넌트
- [ ] 재생/일시정지 버튼
- [ ] 시킹(seeking) 슬라이더
- [ ] 현재 시간/전체 시간 표시
- [ ] rAF 기반 부드러운 애니메이션
- [ ] 키보드 단축키 (Space, ←/→)
- [ ] 비디오 첨부파일과 타임라인 연동

### 필수 CSS 포인트
- 타임라인 트랙 및 프로그레스 바
- 드래그 핸들 스타일
- 버퍼링/로딩 상태 표시

### 필수 테스트 포인트
- 재생/일시정지 상태 전환 테스트
- 시킹 동작 테스트
- 키보드 단축키 테스트
- rAF 정리(cleanup) 테스트

### 완료 기준
- 모든 품질 게이트 PASS
- 부드러운 타임라인 애니메이션
- 키보드 완전 접근성

---

## Stage 8 — Web Worker + RPC

### 목적
Web Worker를 활용한 오프메인스레드 연산과 RPC 패턴을 학습한다.

### 기능 체크리스트
- [ ] Web Worker 설정 (Vite 환경)
- [ ] Worker RPC 추상화 (`createWorkerRPC`)
- [ ] 노트 전문 검색(full-text search) Worker로 이전
- [ ] 마크다운 파싱 Worker로 이전
- [ ] Worker 상태 모니터링 UI
- [ ] Worker 에러 핸들링

### 필수 CSS 포인트
- Worker 상태 인디케이터
- 처리 중 스피너/프로그레스

### 필수 테스트 포인트
- Worker 메시지 송수신 테스트 (mock)
- RPC 호출/응답 테스트
- Worker 에러 전파 테스트

### 완료 기준
- 모든 품질 게이트 PASS
- 무거운 연산이 메인 스레드를 블로킹하지 않음
- Worker 에러 graceful 처리

---

## Stage 9 — Capstone Mini 통합

### 목적
지금까지 구현한 모든 기능을 통합하여 완성도 높은 노트 앱을 만든다.

### 기능 체크리스트
- [ ] 대시보드 홈 화면 (통계, 최근 노트)
- [ ] 노트 태그 시스템
- [ ] 마크다운 에디터 + 실시간 미리보기
- [ ] 노트 내보내기 (JSON, Markdown)
- [ ] 다크 모드 토글
- [ ] 전체 기능 통합 테스트
- [ ] 성능 최적화 (React.memo, useMemo, useCallback)

### 필수 CSS 포인트
- 다크 모드 CSS 변수 전환
- 마크다운 렌더링 스타일
- 대시보드 카드 레이아웃

### 필수 테스트 포인트
- 통합 시나리오 테스트 (노트 생성 → 편집 → 태그 → 내보내기)
- 다크 모드 전환 테스트
- 성능 리그레션 없음 확인

### 완료 기준
- 모든 품질 게이트 PASS
- 모든 기능 유기적 통합
- 프로덕션 수준 완성도

---

## Stage 10 — Frontend API 연동 (Auth + Server State)

### 목적
Mock API를 활용하여 인증 흐름과 서버 상태 관리를 학습한다.

### 기능 체크리스트
- [ ] Mock API 서버 설정 (MSW 또는 json-server)
- [ ] 로그인/로그아웃 UI
- [ ] JWT 토큰 관리 (메모리 + refresh token)
- [ ] 인증 상태 Context
- [ ] Protected Route 구현
- [ ] API 에러 핸들링 (401, 403, 500)
- [ ] 낙관적 업데이트(Optimistic Update)
- [ ] 데이터 페칭 라이브러리 연동 (선택: TanStack Query 또는 SWR)

### 필수 CSS 포인트
- 로그인 폼 레이아웃
- 인증 상태에 따른 UI 변화
- API 에러 메시지 스타일

### 필수 테스트 포인트
- 로그인 성공/실패 테스트
- 토큰 만료 시 리프레시 테스트
- Protected Route 리다이렉트 테스트
- 낙관적 업데이트 롤백 테스트

### 완료 기준
- 모든 품질 게이트 PASS
- 완전한 인증 흐름
- 서버 상태와 클라이언트 상태 분리
- `docs/adr/` 에 API 연동 결정 문서화

---

## Stage 11 — E2E 테스트 도입 (Playwright)

### 목적
실제 사용자 시나리오를 브라우저 환경에서 검증하여 회귀를 줄이고 배포 신뢰도를 높인다.

### 기능 체크리스트
- [x] `@playwright/test` 설치 및 기본 설정
- [x] `playwright.config.ts` 생성 (dev 서버 자동 시작)
- [x] 핵심 시나리오 E2E 테스트 작성: 노트 생성 → 편집 → 삭제
- [ ] CI에서 E2E 실행하도록 워크플로 구성
- [ ] 추가 시나리오(로그인, 오프라인 시나리오) 확장

### 필수 테스트 포인트
- 노트 생성 시 목록에 정상 표시되는지
- 노트 수정 후 상세/목록 반영 확인
- 노트 삭제 시 목록에서 제거되는지
- 브라우저 대기/재시작 상황에서 안정성 확보

### 완료 기준
- 로컬에서 `npm run test:e2e` 성공
- 테스트가 안정적이면 CI에 통합

---

## 향후 예정 스테이지 (우선순위 기반)
아래 스테이지는 Stage 11 이후에 우선적으로 진행할 예정입니다. 각 스테이지는 "1 stage = 1 commit" 원칙을 준수하여 독립적으로 커밋됩니다.

### Stage 12 — CI/CD 및 Preview 배포 (우선)
- 목적: PR 신뢰도를 높이고, 자동화된 린트/유닛/E2E 검증과 스테이징 미리보기를 구현
- 주요 체크리스트:
  - [x] GitHub Actions 워크플로(`.github/workflows/ci.yml`) 생성: lint → unit tests → build → E2E → deploy preview(예: Vercel/Netlify)
  - [x] Preview 배포 (Vercel / Netlify / Preview deploy) 설정 가이드 문서 추가 (`docs/stage-12-preview-deploy.md`, `docs/stage-12-netlify-deploy.md`)
  - [x] Netlify 액션 템플릿 추가 (`.github/workflows/netlify-deploy.yml`)
  - [ ] PR 보호 규칙(테스트 성공 시만 머지 허용) 설정
- 완료 기준: PR에서 CI 통과 후 자동 미리보기 URL 제공 및 PR 머지 보호 활성화 (가이드 및 템플릿 추가 완료)

### Stage 13 — 접근성 자동화 (A11y)
- 목적: 접근성(키보드 네비게이션, aria, 색 대비)을 자동화하고 수동 점검을 보완
- 주요 체크리스트:
  - [ ] `jest-axe`로 핵심 컴포넌트의 접근성 테스트 추가
  - [ ] 스크린리더/키보드 내비게이션 수동 점검 체크리스트 문서화
  - [ ] 접근성 회귀 감지를 위한 CI 단계 추가
- 완료 기준: A11y 자동화 테스트 통과 및 접근성 체크리스트 문서화

### Stage 14 — PWA & 오프라인 개선
- 목적: 오프라인에서 읽기/쓰기 경험 개선 및 앱 설치 가능성 제공
- 주요 체크리스트:
  - [ ] `manifest.json` 추가 및 서비스 워커(Workbox 등) 설정
  - [ ] 오프라인에서의 읽기(캐싱) 및 쓰기(큐잉/동기화) UX 설계
  - [ ] Lighthouse 오프라인/PWA 점수 개선
- 완료 기준: 오프라인 읽기/기본 쓰기 지원 및 PWA 설치 가능

### Stage 15 — 성능 예산 & Lighthouse CI
- 목적: 성능 회귀를 자동으로 검출하고 기준 유지
- 주요 체크리스트:
  - [ ] Lighthouse CI 도입 또는 GitHub Actions에서 Lighthouse 실행
  - [ ] 번들 크기/First Contentful Paint 등 성능 예산 설정
  - [ ] 예산 초과 시 실패하도록 빌드 파이프라인에 통합
- 완료 기준: PR에서 성능 리포트 확인 가능 및 예산 위반 시 실패

### Stage 16 — 런타임 검증 & 계약 테스트 (zod)
- 목적: 외부 API 변경으로 인한 런타임 오류를 방지
- 주요 체크리스트:
  - [ ] `zod` 도입으로 API 응답/폼 입력 스키마 검증
  - [ ] MSW 핸들러와의 계약 테스트 추가
- 완료 기준: 잘못된 응답을 안전하게 처리하고 계약 위반 테스트가 실패함

### Stage 17 — 에러 모니터링 & 사용자 분석
- 목적: 프로덕션에서의 에러/사용자 행동을 추적하여 운영 품질 개선
- 주요 체크리스트:
  - [ ] Sentry(또는 비슷한 서비스) 설정 및 소스맵 업로드
  - [ ] 주요 이벤트(노트 생성/삭제 등) 트래킹(옵트인 정책 포함)
- 완료 기준: 실시간 에러 수집 및 익명화된 이벤트 집계 가능

### Stage 18 — Storybook + 시각 회귀
- 목적: 컴포넌트 문서화 및 UI 변경에 대한 시각 검증
- 주요 체크리스트:
  - [ ] Storybook 설정 및 주요 컴포넌트 스토리 작성
  - [ ] Chromatic/Percy로 시각 회귀 파이프라인 추가
- 완료 기준: 컴포넌트 문서화 및 시각 회귀 자동화

### Stage 19 — 보안 자동화 (Dependabot 등)
- 목적: 의존성 취약점 및 보안 리스크 자동화
- 주요 체크리스트:
  - [ ] Dependabot 설정
  - [ ] 정기적인 `npm audit` 스캔과 알림
- 완료 기준: 취약점 자동 PR 및 주기적 보안 리포트

### Stage 20 — 릴리즈 체크리스트 및 문서화
- 목적: 배포 프로세스 및 릴리즈 체크리스트 완성
- 주요 체크리스트:
  - [ ] 릴리즈 체크리스트 문서화 (QA, 테스트, 배포, 모니터링)
  - [ ] `docs/release.md` 작성
- 완료 기준: 릴리즈 시 체크리스트 기반 배포 수행 가능

---

## 규칙: 커밋 정책
- **원칙**: "1 stage = 1 commit" (각 스테이지 작업은 단일 커밋으로 묶어 기록)
- 예외: 매우 작은 문서·오타 수정은 별도 핫픽스 커밋 허용

---

## 최종 산출물

프로젝트 완료 시 다음 산출물이 생성됩니다:

- `/src` — 전체 소스 코드
- `/docs/stage-*.md` — 각 스테이지 학습 문서
- `/docs/changes/stage-*.md` — 각 스테이지 변경 로그
- `/docs/failures.md` — 실패 로그
- `/docs/adr/*.md` — 아키텍처 결정 기록
- `/state/stage-*.json` — 스테이지 체크포인트
- `/logs/stage-*.log` — 실행 로그
- `/scripts/` — 오케스트레이션 스크립트
- 깔끔한 커밋 히스토리 (clone-coding friendly)
