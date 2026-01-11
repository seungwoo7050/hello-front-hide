# Stage 1 – UI 상태 Playground + UI Kit

## Goal
재사용 가능한 UI Kit 컴포넌트들을 구축하고, 다양한 UI 상태(hover, focus, disabled, loading, error)를 시각적으로 확인할 수 있는 Playground 페이지를 만들었다. CSS Modules를 활용한 스타일 캡슐화와 접근성 기준을 준수한 컴포넌트 설계를 학습했다.

## Key Decisions

### 1. forwardRef 패턴 채택
- 모든 UI 컴포넌트에 `forwardRef` 적용
- 부모 컴포넌트에서 DOM 노드에 직접 접근 가능
- 폼 라이브러리나 포커스 관리와의 호환성 확보

### 2. CSS 변수 기반 디자인 토큰 시스템
- `tokens.css`에 모든 디자인 변수 중앙 집중화
- 색상 팔레트(50~900), 스페이싱, 타이포그래피, 그림자 등 정의
- 다크 모드 대응을 위한 시맨틱 색상 변수 분리

### 3. 행동 기반 테스트 전략
- CSS Modules 해싱으로 인해 클래스명 직접 검증 대신 동작 검증
- 사용자 관점의 테스트 (클릭, 입력, 접근성 속성 확인)
- `userEvent`를 활용한 실제 사용자 상호작용 시뮬레이션

## Pitfalls

### CSS Modules 클래스명 해싱
- **문제**: `toHaveClass('primary')`가 `_primary_bf748c` 형식으로 해싱되어 실패
- **시도**: `className.toContain()` 사용했으나 일관성 부족
- **해결**: 클래스명 검증 대신 렌더링/동작 기반 테스트로 전환

### React 19 순수성 규칙
- **문제**: Input 컴포넌트에서 `Math.random()` 사용 시 ESLint 오류
- **원인**: React 컴파일러가 렌더링 중 불순 함수 호출 감지
- **해결**: React 18+ `useId()` 훅으로 안정적인 고유 ID 생성

### 디자인 토큰 중복 정의
- **문제**: `index.css`와 `tokens.css`에 변수 중복
- **해결**: `tokens.css`로 통합하고 `@import`로 참조

## What I'd Do Differently

### 컴포넌트 문서화 자동화
Storybook이나 Styleguidist 같은 문서화 도구를 초기에 도입했으면 컴포넌트 상태 시연이 더 체계적이었을 것

### CSS 변수 타입 안전성
`vanilla-extract`나 `css-in-ts` 라이브러리로 타입 안전한 스타일 시스템을 구축했으면 실수를 줄일 수 있었을 것

### 컴포넌트 API 설계 리뷰
`variant`, `size` 등의 prop 네이밍과 값들을 다른 UI 라이브러리(Radix, shadcn/ui)와 비교 검토했으면 더 직관적인 API가 되었을 것
