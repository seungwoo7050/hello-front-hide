# Stage 0 – 프로젝트 초기화

## Goal
이 단계에서는 Vite + React + TypeScript 기반의 견고한 프로젝트 기반을 구축했다. 표준 CLI 도구를 사용하여 프로젝트를 스캐폴딩하고, 코드 품질을 보장하기 위한 ESLint, Prettier, Vitest 설정을 완료했다.

## Key Decisions

### 1. Vite를 빌드 도구로 선택
- CRA(Create React App) 대비 빠른 개발 서버 시작 시간
- ES 모듈 기반 HMR(Hot Module Replacement)로 즉각적인 피드백
- 간결한 설정과 확장성

### 2. CSS Modules 채택
- 스타일 캡슐화로 클래스명 충돌 방지
- 컴포넌트 단위 스타일 관리
- TypeScript와 함께 사용 시 타입 안전성 확보 가능

### 3. CSS 변수 기반 디자인 토큰
- `:root`에 색상, 스페이싱, 타이포그래피 변수 정의
- 다크 모드 지원을 위한 기반 마련
- 일관된 디자인 시스템 구축의 시작점

## Pitfalls

### Vite 스캐폴딩 시 기존 파일 충돌
- 빈 디렉토리가 아닌 경우 `npm create vite@latest .`가 실패할 수 있음
- 해결: 임시 디렉토리에 생성 후 파일 이동

### ESLint Flat Config 마이그레이션
- ESLint 9.x부터 flat config가 기본값
- 기존 `.eslintrc` 형식과 다르므로 플러그인 호환성 확인 필요

### Vitest globals 타입 설정
- `tsconfig.app.json`에 `"vitest/globals"` 타입 추가 필요
- 그렇지 않으면 `describe`, `it`, `expect` 등에서 타입 에러 발생

## What I'd Do Differently

### 패키지 설치 순서 최적화
한 번에 모든 dev dependencies를 설치하기보다, 카테고리별로 나누어 설치하면 문제 발생 시 디버깅이 쉬움:
1. 빌드 도구 (vite, typescript)
2. 테스트 도구 (vitest, testing-library)
3. 린팅 도구 (eslint, prettier)

### CSS 변수 네이밍 컨벤션 문서화
프로젝트 초기에 CSS 변수 네이밍 규칙을 문서화했으면 팀 협업 시 일관성 유지가 더 쉬웠을 것
