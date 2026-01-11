# Stage 2: 라우팅 + 반응형 레이아웃

## 학습 목표

이 단계에서는 React Router를 활용한 SPA 라우팅과 Mobile-first 반응형 레이아웃 시스템을 구축합니다.

## 핵심 개념

### 1. React Router v7

React Router는 React 애플리케이션에서 클라이언트 사이드 라우팅을 구현하는 표준 라이브러리입니다.

#### createBrowserRouter

```typescript
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'playground', element: <Playground /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
```

- **중첩 라우팅**: `children` 배열로 라우트 계층 구조 정의
- **Index Route**: `index: true`로 기본 자식 라우트 지정
- **Catch-all Route**: `path: '*'`로 404 페이지 처리

#### NavLink vs Link

```tsx
// NavLink - 활성 상태 스타일링 지원
<NavLink
  to="/about"
  className={({ isActive }) =>
    isActive ? styles.active : styles.link
  }
>
  About
</NavLink>

// Link - 단순 네비게이션
<Link to="/">홈</Link>
```

### 2. 반응형 디자인

#### Mobile-first 접근

모바일을 기본으로 스타일을 작성하고, 더 큰 화면에 미디어 쿼리를 적용합니다.

```css
/* 모바일 기본 스타일 */
.container {
  padding: 16px;
}

/* 태블릿 (768px 이상) */
@media (min-width: 768px) {
  .container {
    padding: 24px;
  }
}

/* 데스크탑 (1024px 이상) */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
  }
}
```

#### 브레이크포인트 시스템

| 명칭 | 범위 | 용도 |
|------|------|------|
| Mobile | 0 - 767px | 스마트폰 |
| Tablet | 768px - 1023px | 태블릿, 작은 노트북 |
| Desktop | 1024px+ | 데스크탑, 큰 화면 |

### 3. 레이아웃 컴포넌트

#### 구성 요소

- **Header**: 고정 헤더, 로고, 네비게이션, 모바일 메뉴 버튼
- **Sidebar**: 모바일에서는 오버레이, 데스크탑에서는 고정
- **Main**: 메인 콘텐츠 영역, 사이드바 유무에 따른 마진 조절
- **Footer**: 페이지 하단 정보
- **Breadcrumb**: 현재 위치 표시

#### AppLayout 패턴

```tsx
function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Main hasSidebar>
        <Breadcrumb />
        <Outlet /> {/* 자식 라우트 렌더링 */}
      </Main>
      <Footer />
    </div>
  );
}
```

### 4. 접근성 (a11y)

#### ARIA 속성 활용

```tsx
// 메뉴 버튼
<button
  aria-expanded={isOpen}
  aria-controls="sidebar"
  aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
>

// 네비게이션
<nav aria-label="메인 네비게이션">

// 현재 페이지
<span aria-current="page">About</span>
```

#### 시맨틱 역할

- `role="banner"` → `<header>`
- `role="navigation"` → `<nav>`
- `role="main"` → `<main>`
- `role="contentinfo"` → `<footer>`
- `role="complementary"` → `<aside>`

## 파일 구조

```
src/
├── components/
│   └── layout/
│       ├── Header/
│       │   ├── Header.tsx
│       │   ├── Header.module.css
│       │   ├── Header.test.tsx
│       │   └── index.ts
│       ├── Sidebar/
│       ├── Main/
│       ├── Footer/
│       ├── Breadcrumb/
│       ├── AppLayout/
│       └── index.ts
├── pages/
│   ├── Home/
│   ├── Playground/ (Stage 1)
│   ├── About/
│   └── NotFound/
├── router/
│   └── index.tsx
└── styles/
    ├── tokens.css
    └── breakpoints.css
```

## 주요 학습 포인트

1. **Outlet 컴포넌트**: 부모 라우트에서 자식 라우트를 렌더링하는 위치 지정
2. **useNavigate**: 프로그래매틱 네비게이션 (예: 뒤로 가기)
3. **useLocation**: 현재 경로 정보 접근
4. **CSS Variables + Media Queries**: 일관된 반응형 시스템
5. **조건부 클래스 적용**: 배열 필터 패턴

```typescript
const classes = [
  styles.base,
  isActive && styles.active,
  hasSidebar && styles.withSidebar,
].filter(Boolean).join(' ');
```

## 테스트 전략

- **BrowserRouter/MemoryRouter**: 라우터 context 제공
- **역할 기반 쿼리**: `getByRole('banner')`, `getByRole('navigation')`
- **접근성 속성 검증**: `toHaveAttribute('aria-expanded', 'true')`
- **사용자 상호작용**: `userEvent.click()`으로 메뉴 토글 테스트

## 다음 단계

Stage 3에서는 폼 컴포넌트, 유효성 검사, 토스트 알림을 구현합니다.
