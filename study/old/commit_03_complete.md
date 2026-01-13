# Commit #3 — React Router 기반 라우팅 및 반응형 레이아웃 구현

## Meta
- **난이도**: ⭐⭐ 초중급 (Beginner-Intermediate)
- **권장 커밋 메시지**: `feat(router): add React Router, responsive layout, and page components`

## 학습 목표
1. React Router v7을 사용한 SPA 라우팅 시스템을 구축한다
2. Header, Sidebar, Main, Footer로 구성된 레이아웃 컴포넌트를 설계한다
3. Mobile-first 반응형 브레이크포인트 시스템을 구현한다
4. 시맨틱 HTML과 ARIA 속성으로 접근성을 확보한다

## TL;DR
React Router DOM v7을 설치하고 Home, About, NotFound 페이지와 반응형 레이아웃 시스템을 구현한다. 모바일 햄버거 메뉴, 브레드크럼 네비게이션, 109개의 테스트를 포함한다.

## 배경/맥락
SPA(Single Page Application)에서 라우팅은 URL에 따라 다른 컴포넌트를 렌더링하는 핵심 기능이다:
- **클라이언트 사이드 라우팅**: 페이지 새로고침 없이 URL 변경
- **레이아웃 시스템**: 일관된 헤더/푸터/사이드바로 사용자 경험 향상
- **반응형 디자인**: 다양한 화면 크기에서 최적의 UI 제공
- **접근성**: 키보드 탐색, 스크린 리더 지원

## 변경 파일 목록
### 추가된 파일 (30개)
- `src/styles/breakpoints.css` — 반응형 브레이크포인트
- `src/router/index.tsx` — 라우터 설정
- `src/components/layout/Header/` — 헤더 컴포넌트 (4파일)
- `src/components/layout/Sidebar/` — 사이드바 컴포넌트 (4파일)
- `src/components/layout/Main/` — 메인 영역 컴포넌트 (4파일)
- `src/components/layout/Footer/` — 푸터 컴포넌트 (4파일)
- `src/components/layout/Breadcrumb/` — 브레드크럼 컴포넌트 (4파일)
- `src/components/layout/AppLayout/` — 전체 레이아웃 래퍼 (4파일)
- `src/pages/Home/` — 홈 페이지 (4파일)
- `src/pages/About/` — 소개 페이지 (4파일)
- `src/pages/NotFound/` — 404 페이지 (4파일)

### 수정된 파일 (4개)
- `package.json` — react-router-dom 의존성 추가
- `src/App.tsx` — AppRouter 사용으로 변경
- `src/App.test.tsx` — 라우터 적용 테스트
- `src/index.css` — breakpoints.css import

## 코드 스니펫

### 1. 라우터 설정
```tsx
/* src/router/index.tsx:1-50 */
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { Home } from '../pages/Home'
import { About } from '../pages/About'
import { Playground } from '../pages/Playground'
import { NotFound } from '../pages/NotFound'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppLayout>
        <Outlet />
      </AppLayout>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'playground',
        element: <Playground />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
```

**선정 이유**: React Router v7의 새로운 데이터 라우터 API 사용 예시

**로직/흐름 설명**:
- `createBrowserRouter`: 브라우저 History API 기반 라우터 생성
- `Outlet`: 중첩 라우트의 자식 컴포넌트 렌더링 위치
- `index: true`: 부모 경로와 동일한 URL에서 렌더링
- `path: '*'`: 정의되지 않은 모든 경로 매칭 (404)

**런타임 영향**:
- URL 변경 시 전체 페이지 새로고침 없이 컴포넌트만 교체
- 브라우저 뒤로가기/앞으로가기 지원

**학습 포인트**:
- `Outlet`은 Vue의 `<router-view>`와 유사한 역할
- Q: `createBrowserRouter` vs `BrowserRouter`의 차이는?
- A: createBrowserRouter는 데이터 로딩, 에러 바운더리 등 고급 기능 지원

---

### 2. 반응형 브레이크포인트 시스템
```css
/* src/styles/breakpoints.css:1-50 */
:root {
  /* 브레이크포인트 정의 */
  --breakpoint-mobile: 0px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1024px;
  --breakpoint-wide: 1280px;
  
  /* 컨테이너 너비 */
  --container-mobile: 100%;
  --container-tablet: 720px;
  --container-desktop: 960px;
  --container-wide: 1200px;
}

/* 유틸리티 클래스 */
.hide-mobile {
  display: none;
}

@media (min-width: 768px) {
  .hide-mobile {
    display: block;
  }
  
  .hide-tablet {
    display: none;
  }
}

@media (min-width: 1024px) {
  .hide-tablet {
    display: block;
  }
  
  .hide-desktop {
    display: none;
  }
}

/* 모바일 우선 레이아웃 */
.container {
  width: 100%;
  padding: 0 var(--spacing-4);
  margin: 0 auto;
}

@media (min-width: 768px) {
  .container {
    max-width: var(--container-tablet);
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: var(--container-desktop);
  }
}
```

**선정 이유**: Mobile-first 반응형 디자인의 기초

**로직/흐름 설명**:
- **Mobile-first**: 기본 스타일은 모바일, `min-width` 미디어 쿼리로 확장
- **브레이크포인트**: mobile(0-767), tablet(768-1023), desktop(1024+)
- **유틸리티 클래스**: 특정 화면 크기에서 요소 숨기기

**빌드 영향**:
- CSS 파일 크기 약간 증가, 하지만 JavaScript 번들에 영향 없음

**학습 포인트**:
- Mobile-first는 성능에 유리 (모바일에 불필요한 스타일 로드 안 함)
- Q: `min-width` vs `max-width` 미디어 쿼리 차이는?
- A: min-width는 해당 크기 이상, max-width는 해당 크기 이하에 적용

---

### 3. Header 컴포넌트 (모바일 메뉴)
```tsx
/* src/components/layout/Header/Header.tsx:1-80 */
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import styles from './Header.module.css'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  const navLinks = [
    { to: '/', label: '홈' },
    { to: '/playground', label: 'Playground' },
    { to: '/about', label: '소개' },
  ]

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          Hello Front Opus
        </Link>

        {/* 데스크톱 네비게이션 */}
        <nav className={styles.desktopNav} aria-label="메인 네비게이션">
          <ul className={styles.navList}>
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ''}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* 모바일 메뉴 버튼 */}
        <button
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
        >
          <span className={styles.menuIcon} />
        </button>
      </div>

      {/* 모바일 네비게이션 */}
      {isMenuOpen && (
        <nav
          id="mobile-menu"
          className={styles.mobileNav}
          aria-label="모바일 네비게이션"
        >
          <ul className={styles.mobileNavList}>
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `${styles.mobileNavLink} ${isActive ? styles.active : ''}`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
```

**선정 이유**: 반응형 네비게이션과 접근성 속성의 실제 적용 예시

**로직/흐름 설명**:
- `NavLink`: 현재 경로와 매칭되면 `isActive: true` 제공
- `aria-expanded`: 메뉴 토글 상태를 스크린 리더에 전달
- `aria-controls`: 버튼이 제어하는 요소의 ID 지정
- 모바일 링크 클릭 시 자동으로 메뉴 닫힘

**접근성 영향**:
- 스크린 리더가 "메뉴 열기/닫기" 상태를 음성으로 전달
- 키보드로 모든 네비게이션 링크 접근 가능

**학습 포인트**:
- `NavLink` vs `Link`: NavLink는 활성 상태 스타일링 지원
- Q: `aria-controls`는 왜 필요한가?
- A: 스크린 리더가 버튼과 제어 대상의 관계를 이해하도록 도움

---

### 4. AppLayout 컴포넌트
```tsx
/* src/components/layout/AppLayout/AppLayout.tsx:1-60 */
import { useState, type ReactNode } from 'react'
import { Header } from '../Header'
import { Sidebar } from '../Sidebar'
import { Main } from '../Main'
import { Footer } from '../Footer'
import styles from './AppLayout.module.css'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)
  const closeSidebar = () => setIsSidebarOpen(false)
  const toggleCollapse = () => setIsSidebarCollapsed((prev) => !prev)

  return (
    <div className={styles.layout}>
      <Header onMenuClick={toggleSidebar} />
      
      <div className={styles.body}>
        <Sidebar
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onClose={closeSidebar}
          onToggleCollapse={toggleCollapse}
        />
        
        <Main hasSidebar={!isSidebarCollapsed}>
          {children}
        </Main>
      </div>
      
      <Footer />
    </div>
  )
}
```

**선정 이유**: 레이아웃 상태 관리와 컴포넌트 구성의 패턴

**로직/흐름 설명**:
- 사이드바 열림/닫힘, 접힘 상태를 AppLayout에서 중앙 관리
- `children`으로 각 페이지 컴포넌트가 Main 영역에 렌더링
- 상태 변경 함수를 자식 컴포넌트에 props로 전달

**런타임 영향**:
- 사이드바 상태 변경 시 관련 컴포넌트만 리렌더링

**학습 포인트**:
- 레이아웃 컴포넌트는 페이지 간 공통 UI를 관리
- Q: 왜 상태를 AppLayout에서 관리하는가?
- A: Header의 메뉴 버튼이 Sidebar를 제어해야 하므로 공통 부모에서 관리

---

### 5. 역할 기반 테스트 (getByRole level 옵션)
```tsx
/* src/pages/Home/Home.test.tsx:1-40 */
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { Home } from './Home'

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('Home', () => {
  it('히어로 제목이 표시되어야 한다', () => {
    renderWithRouter(<Home />)
    // level 옵션으로 특정 제목 레벨 지정 (h1)
    expect(
      screen.getByRole('heading', { level: 1, name: /Hello Front/i })
    ).toBeInTheDocument()
  })

  it('기능 카드들이 표시되어야 한다', () => {
    renderWithRouter(<Home />)
    expect(screen.getByText(/React 19/i)).toBeInTheDocument()
    expect(screen.getByText(/TypeScript/i)).toBeInTheDocument()
    expect(screen.getByText(/Vite/i)).toBeInTheDocument()
  })

  it('시작하기 링크가 Playground로 연결되어야 한다', () => {
    renderWithRouter(<Home />)
    const link = screen.getByRole('link', { name: /시작하기/i })
    expect(link).toHaveAttribute('href', '/playground')
  })
})
```

**선정 이유**: 다중 heading 요소 매칭 문제 해결 방법

**로직/흐름 설명**:
- `level: 1`: h1 요소만 선택 (h3 제외)
- `renderWithRouter`: 라우터 컨텍스트 제공 래퍼
- `toHaveAttribute`: href 속성 검증

**테스트 영향**:
- 동일 텍스트의 여러 제목 중 특정 레벨만 선택 가능
- 실패 로그: "Found multiple elements with the role 'heading'"

**학습 포인트**:
- getByRole의 추가 옵션: `level`, `pressed`, `checked` 등
- Q: h1과 h3에 같은 텍스트가 있을 때 어떻게 구분하는가?
- A: `{ level: 1 }` 옵션으로 제목 레벨 지정

## 재현 단계 (CLI 우선)

### CLI 명령어
```bash
# 1. React Router DOM 설치
npm install react-router-dom

# 2. 개발 서버 실행
npm run dev

# 3. 테스트 실행 (109개)
npm test -- --run

# 4. 린트 및 빌드
npm run lint && npm run build
```

### 구현 단계 (코드 작성 순서)
1. **의존성 설치**: `npm install react-router-dom`
2. **브레이크포인트 정의**: `src/styles/breakpoints.css` 작성
3. **index.css 수정**: `@import './styles/breakpoints.css';` 추가
4. **레이아웃 컴포넌트 구현** (순서대로):
   - `Header` — 로고, 데스크톱 nav, 모바일 메뉴 버튼
   - `Sidebar` — 네비게이션 링크, 오버레이
   - `Main` — 메인 콘텐츠 영역
   - `Footer` — 링크, 저작권
   - `Breadcrumb` — 현재 위치 표시
   - `AppLayout` — 전체 래퍼, 상태 관리
5. **페이지 컴포넌트 구현**: Home, About, NotFound
6. **라우터 설정**: `src/router/index.tsx` 작성
7. **App.tsx 수정**: `<AppRouter />` 렌더링
8. **테스트 작성**: 각 컴포넌트별 테스트 (46개 신규)
9. **검증**: `npm test -- --run` (109개 통과)

## 설명

### 설계 결정
1. **createBrowserRouter**: React Router v7의 데이터 라우터 API 사용
2. **Mobile-first**: 기본 스타일은 모바일, 점진적 확장
3. **시맨틱 HTML**: `<header>`, `<nav>`, `<main>`, `<footer>` 사용

### 트레이드오프
- **CSS Media Query vs CSS-in-JS**: 미디어 쿼리는 서버 사이드에서 작동, CSS-in-JS는 런타임에 계산
- **Sidebar 상태 위치**: AppLayout vs Context — 간단한 경우 props drilling이 더 명확

### 실패에서 배운 것
1. **getByRole 다중 매칭**: "Found multiple elements" → `level` 옵션으로 해결
2. **미사용 import 빌드 에러**: TypeScript strict 모드에서 `vi` import 제거

## 검증 체크리스트

### 자동 검증
```bash
npm run lint     # PASS 예상
npm test -- --run  # 109 tests passed 예상
npm run build    # 성공 예상
```

### 수동 검증
- [ ] `/` 경로에서 홈 페이지 표시
- [ ] `/playground` 경로에서 Playground 표시
- [ ] `/about` 경로에서 About 페이지 표시
- [ ] `/invalid` 경로에서 404 페이지 표시
- [ ] 모바일 뷰포트에서 햄버거 메뉴 표시
- [ ] 네비게이션 링크 클릭 시 페이지 전환 (새로고침 없음)
- [ ] 현재 페이지에 해당하는 네비게이션 링크 활성화 스타일

## 누락 정보
- 없음
