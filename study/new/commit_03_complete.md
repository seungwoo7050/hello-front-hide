# Commit #3 — React Router 기반 라우팅 및 반응형 레이아웃 구현

## Meta

- **난이도**: ⭐⭐ 초중급 (Beginner-Intermediate)
- **권장 커밋 메시지**: `feat: add react-router with responsive layout components`

---

## 학습 목표

1. React Router v7을 사용한 SPA 라우팅 시스템을 구축할 수 있다
2. `createBrowserRouter`와 중첩 라우팅 패턴을 이해하고 적용할 수 있다
3. Mobile-first 반응형 레이아웃 시스템을 구현할 수 있다
4. 시맨틱 HTML과 ARIA 속성을 활용한 접근성 있는 레이아웃을 설계할 수 있다

---

## TL;DR

React Router v7을 설치하고 Home, Playground, About, NotFound(404) 페이지를 라우팅한다. Header, Sidebar, Main, Footer, Breadcrumb 레이아웃 컴포넌트를 구현하고, Mobile-first 반응형 브레이크포인트 시스템을 구축한다. ARIA 속성과 시맨틱 HTML로 접근성을 확보한다.

---

## 배경/컨텍스트

### 왜 이 변경이 필요한가?

- **SPA 라우팅**: 페이지 새로고침 없이 URL 기반 네비게이션 구현
- **레이아웃 시스템**: 일관된 UI 구조로 사용자 경험 향상
- **반응형 디자인**: 모바일부터 데스크탑까지 다양한 화면 대응
- **접근성**: 스크린 리더, 키보드 사용자를 위한 표준 준수

### 영향 범위

- App.tsx가 AppRouter를 렌더링하도록 변경
- 새로운 레이아웃 컴포넌트 6개 추가
- 새로운 페이지 컴포넌트 3개 추가
- 테스트 수 63개 → 109개로 증가 (+46)

---

## 변경 파일 목록

### 추가된 파일 (37개)

| 카테고리 | 파일 | 설명 |
|----------|------|------|
| 스타일 | `src/styles/breakpoints.css` | 반응형 브레이크포인트 |
| 라우터 | `src/router/index.tsx` | createBrowserRouter 설정 |
| 레이아웃 | `src/components/layout/Header/*` | 헤더 컴포넌트 (4파일) |
| 레이아웃 | `src/components/layout/Sidebar/*` | 사이드바 컴포넌트 (4파일) |
| 레이아웃 | `src/components/layout/Main/*` | 메인 영역 컴포넌트 (4파일) |
| 레이아웃 | `src/components/layout/Footer/*` | 푸터 컴포넌트 (4파일) |
| 레이아웃 | `src/components/layout/Breadcrumb/*` | 브레드크럼 컴포넌트 (4파일) |
| 레이아웃 | `src/components/layout/AppLayout/*` | 전체 레이아웃 래퍼 (4파일) |
| 페이지 | `src/pages/Home/*` | 홈 페이지 (4파일) |
| 페이지 | `src/pages/About/*` | About 페이지 (4파일) |
| 페이지 | `src/pages/NotFound/*` | 404 페이지 (4파일) |

### 수정된 파일 (5개)

| 파일 | 변경 내용 |
|------|------|
| `package.json` | react-router-dom v7.12.0 추가 |
| `src/App.tsx` | Playground → AppRouter 렌더링 |
| `src/App.test.tsx` | 라우터 기반 테스트로 변경 |
| `src/index.css` | breakpoints.css import 추가 |
| `docs/failures.md` | getByRole 다중 매칭 실패 사례 추가 |

---

## 코드 스니펫

### 1. router/index.tsx — createBrowserRouter 설정

**선택 이유**: React Router v7의 권장 라우터 생성 방식으로, 중첩 라우팅 구조를 명확히 보여줌

```tsx
/* src/router/index.tsx:1..35 */
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { Home } from '../pages/Home';
import { Playground } from '../pages/Playground';
import { About } from '../pages/About';
import { NotFound } from '../pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'playground', element: <Playground /> },
      { path: 'about', element: <About /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
```

**로직 설명**:
- `createBrowserRouter`: History API 기반 라우터 생성
- `children`: 중첩 라우트로 AppLayout 내부에 페이지 렌더링
- `index: true`: `/` 경로의 기본 자식 라우트
- `path: '*'`: 매칭되지 않는 모든 경로 → 404

**학습 노트**: `<Outlet />`이 AppLayout 내부에서 자식 라우트를 렌더링하는 위치를 지정함.

---

### 2. AppLayout.tsx — 전체 레이아웃 래퍼

**선택 이유**: 상태 관리와 레이아웃 컴포넌트 조합을 보여주는 핵심 패턴

```tsx
/* src/components/layout/AppLayout/AppLayout.tsx:1..55 */
import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';
import { Main } from '../Main';
import { Footer } from '../Footer';
import { Breadcrumb } from '../Breadcrumb';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  /** 사이드바 표시 여부 */
  showSidebar?: boolean;
  /** 푸터 표시 여부 */
  showFooter?: boolean;
  /** Breadcrumb 표시 여부 */
  showBreadcrumb?: boolean;
}

export function AppLayout({
  showSidebar = true,
  showFooter = true,
  showBreadcrumb = true,
}: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className={styles.layout}>
      <Header
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
      />

      {showSidebar && (
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      )}

      <Main hasSidebar={showSidebar}>
        {showBreadcrumb && <Breadcrumb />}
        <Outlet />
      </Main>

      {showFooter && <Footer hasSidebar={showSidebar} />}
    </div>
  );
}
```

**로직 설명**:
- `useState(false)`: 모바일 사이드바 토글 상태
- `useCallback`: 불필요한 리렌더링 방지
- `<Outlet />`: 자식 라우트(Home, About 등)가 렌더링되는 위치
- 조건부 렌더링: `showSidebar`, `showFooter`로 레이아웃 유연성 제공

**학습 노트**: `useCallback`은 자식 컴포넌트에 콜백을 전달할 때 참조 동일성을 유지하여 불필요한 리렌더링 방지.

---

### 3. Header.tsx — ARIA 속성 활용

**선택 이유**: 접근성을 위한 ARIA 속성 사용 패턴 학습

```tsx
/* src/components/layout/Header/Header.tsx:1..70 */
import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  return (
    <header className={styles.header} role="banner">
      <div className={styles.headerContent}>
        <NavLink to="/" className={styles.logo}>
          Hello Front
        </NavLink>

        {/* 데스크탑 네비게이션 */}
        <nav className={styles.desktopNav} aria-label="메인 네비게이션">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            홈
          </NavLink>
          <NavLink
            to="/playground"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Playground
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            About
          </NavLink>
        </nav>

        {/* 모바일 메뉴 버튼 */}
        <button
          className={styles.menuButton}
          onClick={onToggleSidebar}
          aria-expanded={isSidebarOpen}
          aria-controls="sidebar"
          aria-label={isSidebarOpen ? '메뉴 닫기' : '메뉴 열기'}
        >
          <span className={styles.menuIcon} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
```

**로직 설명**:
- `role="banner"`: 시맨틱 `<header>`의 역할 명시
- `NavLink`: 활성 상태 스타일링 지원 (`isActive` 콜백)
- `aria-expanded`: 메뉴 펼침 상태 스크린 리더 전달
- `aria-controls`: 이 버튼이 제어하는 요소 ID
- `aria-label`: 버튼의 접근성 라벨

**학습 노트**: `NavLink`의 `className` 콜백에서 `isActive`를 사용하여 현재 페이지 스타일을 동적으로 적용.

---

### 4. breakpoints.css — 반응형 브레이크포인트 시스템

**선택 이유**: Mobile-first 반응형 디자인의 기준점 정의

```css
/* src/styles/breakpoints.css:1..50 */
:root {
  /* 브레이크포인트 정의 */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;

  /* 컨테이너 최대 너비 */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-wide: 1440px;

  /* 사이드바 너비 */
  --sidebar-width: 240px;
  --header-height: 64px;
}

/* 모바일: 기본 스타일 */
/* 별도 미디어 쿼리 없이 기본 스타일 적용 */

/* 태블릿 (768px 이상) */
@media (min-width: 768px) {
  /* 데스크탑 네비게이션 표시 */
  /* 모바일 메뉴 버튼 숨김 */
}

/* 데스크탑 (1024px 이상) */
@media (min-width: 1024px) {
  /* 사이드바 고정 표시 */
  /* 메인 콘텐츠 마진 조정 */
}
```

**로직 설명**:
- Mobile-first: 기본 스타일이 모바일, 미디어 쿼리로 확장
- CSS 변수: 브레이크포인트 값을 변수로 관리 (JavaScript에서도 접근 가능)
- 3단계 브레이크포인트: Mobile(기본), Tablet(768px+), Desktop(1024px+)

**학습 노트**: `min-width` 미디어 쿼리를 사용하면 작은 화면 기준으로 스타일을 작성하고 큰 화면으로 확장.

---

### 5. Breadcrumb.tsx — useLocation 활용

**선택 이유**: React Router의 훅을 사용한 동적 컴포넌트 생성 패턴

```tsx
/* src/components/layout/Breadcrumb/Breadcrumb.tsx:55..119 */
export function Breadcrumb({
  items,
  showHomeIcon = true,
  pathLabels = defaultPathLabels,
}: BreadcrumbProps) {
  const location = useLocation();

  // 커스텀 항목이 없으면 현재 경로에서 자동 생성
  const breadcrumbItems: BreadcrumbItem[] = 
    items || generateBreadcrumbs(location.pathname, pathLabels);

  // 홈만 있으면 표시하지 않음
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className={styles.breadcrumb} aria-label="현재 위치">
      <ol className={styles.breadcrumbList}>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isFirst = index === 0;

          return (
            <li key={item.path ?? index} className={styles.breadcrumbItem}>
              {index > 0 && (
                <span className={styles.breadcrumbSeparator} aria-hidden="true">
                  <ChevronIcon />
                </span>
              )}

              {isLast ? (
                <span className={styles.breadcrumbCurrent} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.path ?? '/'} className={styles.breadcrumbLink}>
                  {isFirst && showHomeIcon ? <HomeIcon /> : item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function generateBreadcrumbs(
  pathname: string,
  pathLabels: Record<string, string>
): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: pathLabels[''] ?? '홈', path: '/' }];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = pathLabels[segment] ?? segment;
    items.push({ label, path: currentPath });
  }

  return items;
}
```

**로직 설명**:
- `useLocation()`: 현재 URL 경로 정보 접근
- `pathname.split('/').filter(Boolean)`: URL 세그먼트 추출
- `aria-current="page"`: 현재 페이지임을 스크린 리더에 전달
- `aria-label="현재 위치"`: 네비게이션 용도 설명

**학습 노트**: Breadcrumb은 홈 페이지(`/`)에서는 표시하지 않음. `length <= 1` 조건으로 제어.

---

## 재현 단계 (CLI 우선)

### 사전 요구사항
- Commit #2 완료 상태

### 1. React Router 설치

```bash
# react-router-dom 설치
npm install react-router-dom
```

### 2. 디렉토리 구조 생성

```bash
# 레이아웃 컴포넌트 디렉토리
mkdir -p src/components/layout/{Header,Sidebar,Main,Footer,Breadcrumb,AppLayout}

# 페이지 컴포넌트 디렉토리
mkdir -p src/pages/{Home,About,NotFound}

# 라우터 디렉토리
mkdir -p src/router
```

### 3. 구현 단계 (코드 작성 순서)

1. **src/styles/breakpoints.css**: 브레이크포인트 CSS 변수 정의
2. **src/index.css**: breakpoints.css import 추가
3. **Header 컴포넌트**: 로고, 네비게이션, 모바일 메뉴 버튼
4. **Sidebar 컴포넌트**: 모바일 오버레이, 네비게이션 링크
5. **Main 컴포넌트**: 메인 콘텐츠 영역
6. **Footer 컴포넌트**: 푸터, 링크, 저작권
7. **Breadcrumb 컴포넌트**: useLocation 기반 자동 생성
8. **AppLayout 컴포넌트**: 전체 레이아웃 조합
9. **Home, About, NotFound 페이지**: 각 페이지 구현
10. **src/router/index.tsx**: createBrowserRouter 설정
11. **src/App.tsx**: AppRouter 렌더링

### 4. 품질 게이트 검증

```bash
# 린트 검사
npm run lint

# 테스트 실행 (109개 테스트)
npm test -- --run

# 빌드 검증
npm run build

# 개발 서버에서 확인
npm run dev
```

---

## 설명

### 설계 고려사항

1. **중첩 라우팅**: AppLayout이 공통 레이아웃, 페이지는 Outlet으로 렌더링
2. **Mobile-first**: 모바일 기본 스타일, 데스크탑으로 확장
3. **시맨틱 HTML**: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>` 사용

### 트레이드오프

| 선택 | 장점 | 단점 |
|------|------|------|
| createBrowserRouter | 데이터 로딩 지원, 더 나은 에러 핸들링 | 설정 복잡도 증가 |
| CSS 변수 브레이크포인트 | JS에서도 접근 가능 | 미디어 쿼리에서 직접 사용 불가 |
| useCallback | 불필요한 리렌더링 방지 | 코드 복잡도 증가 |

### 잠재적 위험

- **getByRole 다중 매칭**: 동일 텍스트가 여러 요소에 있으면 `{ level: 1 }` 등으로 구체화
- **미사용 import**: TypeScript strict 모드에서 빌드 에러 발생
- **히드레이션 불일치**: SSR 환경에서 URL 상태 주의

---

## 검증 체크리스트

- [ ] `npm run lint` 실행 시 에러 없음
- [ ] `npm test -- --run` 실행 시 109개 테스트 통과
- [ ] `npm run build` 실행 시 빌드 성공
- [ ] `/` 경로에서 Home 페이지 표시
- [ ] `/playground` 경로에서 Playground 페이지 표시
- [ ] `/about` 경로에서 About 페이지 표시
- [ ] `/asdfasdf` 존재하지 않는 경로에서 404 페이지 표시
- [ ] 모바일 화면에서 메뉴 버튼 표시
- [ ] 메뉴 버튼 클릭 시 사이드바 토글
- [ ] Tab 키로 모든 네비게이션 링크 포커스 이동
- [ ] Breadcrumb이 현재 경로 표시

### 예상 결과

```bash
# npm test -- --run 출력 예시
 ✓ src/App.test.tsx (5 tests)
 ✓ src/components/layout/Header/Header.test.tsx (8 tests)
 ✓ src/components/layout/Sidebar/Sidebar.test.tsx (7 tests)
 ✓ src/components/layout/Main/Main.test.tsx (4 tests)
 ✓ src/components/layout/Footer/Footer.test.tsx (5 tests)
 ✓ src/components/layout/Breadcrumb/Breadcrumb.test.tsx (5 tests)
 ✓ src/components/layout/AppLayout/AppLayout.test.tsx (7 tests)
 ✓ src/pages/Home/Home.test.tsx (4 tests)
 ✓ src/pages/About/About.test.tsx (4 tests)
 ✓ src/pages/NotFound/NotFound.test.tsx (4 tests)
 # ... UI Kit 테스트 포함

Test Files  16 passed (16)
Tests       109 passed (109)
```

---

## 누락 정보

이 가이드는 `study/commit-summary/commit_3_summary.txt`를 기반으로 작성되었으며:

- ✅ 커밋 해시: `f860d4a848aa3be271684525b4d82eae4661f8b3`
- ✅ 변경 파일 목록: 48개 파일
- ✅ 테스트 결과: 109개 테스트 통과

**핵심 학습 포인트**:
- `getByRole` 다중 매칭 → `{ level: 1 }` 옵션으로 구체화
- TypeScript 미사용 import → 빌드 에러 발생, 제거 필요
- `useLocation`, `NavLink({ isActive })` 활용

**참고 파일**:
- [src/router/index.tsx](../src/router/index.tsx)
- [src/components/layout/AppLayout/AppLayout.tsx](../src/components/layout/AppLayout/AppLayout.tsx)
- [src/components/layout/Header/Header.tsx](../src/components/layout/Header/Header.tsx)
- [src/styles/breakpoints.css](../src/styles/breakpoints.css)
