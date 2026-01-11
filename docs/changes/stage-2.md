# Stage 2 변경 로그

## 개요

React Router 기반 라우팅 시스템과 반응형 레이아웃을 구현했습니다.

## 의존성 추가

| 패키지 | 버전 | 용도 |
|--------|------|------|
| react-router-dom | ^7.12.0 | SPA 라우팅 |

## 새로 생성된 파일

### 스타일 시스템

| 파일 | 설명 |
|------|------|
| `src/styles/breakpoints.css` | 반응형 브레이크포인트 및 유틸리티 클래스 |

### 레이아웃 컴포넌트

| 컴포넌트 | 파일들 | 설명 |
|----------|--------|------|
| Header | `Header.tsx`, `.module.css`, `.test.tsx` | 고정 헤더, 로고, 데스크탑 네비게이션, 모바일 메뉴 버튼 |
| Sidebar | `Sidebar.tsx`, `.module.css`, `.test.tsx` | 사이드바, 모바일 오버레이, 네비게이션 링크 |
| Main | `Main.tsx`, `.module.css`, `.test.tsx` | 메인 콘텐츠 영역, 사이드바 유무 대응 |
| Footer | `Footer.tsx`, `.module.css`, `.test.tsx` | 푸터, 링크, 저작권 |
| Breadcrumb | `Breadcrumb.tsx`, `.module.css`, `.test.tsx` | 현재 위치 표시, 자동 생성/커스텀 지원 |
| AppLayout | `AppLayout.tsx`, `.module.css`, `.test.tsx` | 전체 레이아웃 래퍼, 상태 관리 |

### 페이지 컴포넌트

| 페이지 | 파일들 | 설명 |
|--------|--------|------|
| Home | `Home.tsx`, `.module.css`, `.test.tsx` | 홈페이지, 히어로 섹션, 기능 카드 |
| About | `About.tsx`, `.module.css`, `.test.tsx` | 프로젝트 소개, 기술 스택, 학습 단계 |
| NotFound | `NotFound.tsx`, `.module.css`, `.test.tsx` | 404 페이지, 뒤로 가기, 홈 이동 |

### 라우터

| 파일 | 설명 |
|------|------|
| `src/router/index.tsx` | createBrowserRouter 설정, 라우트 정의 |

## 수정된 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/App.tsx` | Playground 직접 렌더링 → AppRouter 사용 |
| `src/App.test.tsx` | 라우터 적용에 따른 테스트 업데이트 |
| `src/index.css` | breakpoints.css import 추가 |

## 라우트 구조

```
/                 → Home
/playground       → Playground (Stage 1)
/about            → About
/*                → NotFound (404)
```

## 반응형 브레이크포인트

| 명칭 | 범위 | CSS 변수 |
|------|------|----------|
| Mobile | 0 - 767px | 기본 |
| Tablet | 768px+ | `@media (min-width: 768px)` |
| Desktop | 1024px+ | `@media (min-width: 1024px)` |

## 접근성 구현

- 시맨틱 HTML 요소 사용 (`header`, `nav`, `main`, `aside`, `footer`)
- ARIA 속성: `aria-expanded`, `aria-controls`, `aria-label`, `aria-current`
- 키보드 탐색: `:focus-visible` 스타일
- 스크린 리더 지원: 역할 기반 쿼리로 테스트

## 테스트 현황

- 새로운 테스트: 46개
- 총 테스트: 109개
- 모든 테스트 통과

## 품질 게이트

- ✅ Lint: PASS
- ✅ Test: 109 passed
- ✅ Build: PASS
