# 📚 hello-front-opus 클론 코딩 학습 가이드

> React + TypeScript 프론트엔드 프로젝트를 처음부터 프로덕션까지 단계별로 학습하는 완벽 가이드

## 🎯 개요

이 가이드는 **16개의 커밋**을 통해 React + TypeScript 프론트엔드 프로젝트를 점진적으로 구축하는 과정을 담고 있습니다. 각 가이드는 실제 코드 변경사항을 기반으로 작성되어 있으며, 클론 코딩을 통해 학습할 수 있습니다.

## 📋 목차

| # | 가이드 | 난이도 | 주요 토픽 |
|---|-------|--------|----------|
| 1 | [프로젝트 초기화](commit_01_complete.md) | ⭐ 입문 | Vite, React 19, TypeScript, Vitest |
| 2 | [UI Kit 컴포넌트](commit_02_complete.md) | ⭐⭐ 초급 | CSS Modules, 컴포넌트 설계 |
| 3 | [라우팅 및 레이아웃](commit_03_complete.md) | ⭐⭐ 초급 | React Router v7, 반응형 디자인 |
| 4 | [폼 및 유효성 검사](commit_04_complete.md) | ⭐⭐⭐ 중급 | useForm 훅, 폼 검증, Toast |
| 5 | [노트 앱 CRUD](commit_05_complete.md) | ⭐⭐⭐ 중급 | CRUD, 검색/필터링 |
| 6 | [localStorage 영속성](commit_06_complete.md) | ⭐⭐ 초급 | useLocalStorage, 데이터 영속성 |
| 7 | [API 통신](commit_07_complete.md) | ⭐⭐⭐ 중급 | MSW, TanStack Query, 낙관적 업데이트 |
| 8 | [인증/권한 관리](commit_08_complete.md) | ⭐⭐⭐⭐ 고급 | Protected Route, AuthContext |
| 9 | [전역 상태 관리](commit_09_complete.md) | ⭐⭐⭐ 중급 | Zustand, 테마 토글 |
| 10 | [성능 최적화](commit_10_complete.md) | ⭐⭐⭐⭐ 고급 | useDebounce, useThrottle |
| 11 | [프로덕션 준비](commit_11_complete.md) | ⭐⭐⭐ 중급 | 환경 변수, Error Boundary |
| 12 | [E2E 테스트](commit_12_complete.md) | ⭐⭐⭐⭐ 고급 | Playwright, Page Object Model |
| 13 | [CI/CD 설정](commit_13_complete.md) | ⭐⭐⭐ 중급 | GitHub Actions |
| 14 | [코드 포맷팅](commit_14_complete.md) | ⭐⭐ 초급 | ESLint Flat Config, Prettier |
| 15 | [JWT 인증](commit_15_complete.md) | ⭐⭐⭐⭐⭐ 전문가 | JWT, Token Refresh |
| 16 | [Contract Testing](commit_16_complete.md) | ⭐⭐⭐⭐⭐ 전문가 | OpenAPI, Dredd |

## 🗺️ 학습 경로

### 입문자 (Beginner)
1. [Commit #1](commit_01_complete.md) - 프로젝트 초기화
2. [Commit #2](commit_02_complete.md) - UI 컴포넌트
3. [Commit #3](commit_03_complete.md) - 라우팅
4. [Commit #6](commit_06_complete.md) - localStorage
5. [Commit #14](commit_14_complete.md) - 코드 포맷팅

### 중급자 (Intermediate)
1. [Commit #4](commit_04_complete.md) - 폼/검증
2. [Commit #5](commit_05_complete.md) - CRUD
3. [Commit #7](commit_07_complete.md) - API 통신
4. [Commit #9](commit_09_complete.md) - 상태 관리
5. [Commit #11](commit_11_complete.md) - 프로덕션 설정
6. [Commit #13](commit_13_complete.md) - CI/CD

### 고급자 (Advanced)
1. [Commit #8](commit_08_complete.md) - 인증
2. [Commit #10](commit_10_complete.md) - 성능 최적화
3. [Commit #12](commit_12_complete.md) - E2E 테스트

### 전문가 (Expert)
1. [Commit #15](commit_15_complete.md) - JWT 토큰 관리
2. [Commit #16](commit_16_complete.md) - Contract Testing

## 🛠️ 기술 스택

### Core
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구

### Testing
- **Vitest** - 단위 테스트
- **Testing Library** - 컴포넌트 테스트
- **Playwright** - E2E 테스트
- **MSW** - API 모킹
- **Dredd** - Contract Testing

### State Management
- **TanStack Query** - 서버 상태
- **Zustand** - 클라이언트 상태
- **Context API** - 인증 상태

### Styling
- **CSS Modules** - 스코프 CSS

### Tooling
- **ESLint** - 린팅
- **Prettier** - 포맷팅
- **Husky** - Git 훅
- **GitHub Actions** - CI/CD

## 📖 가이드 구조

각 가이드는 다음 섹션으로 구성되어 있습니다:

```
# Commit #N — 제목

## Meta
- 난이도
- 권장 커밋 메시지

## 학습 목표
- 이 커밋에서 배울 내용

## TL;DR
- 한 문단 요약

## 배경/맥락
- 왜 이 변경이 필요한지

## 변경 파일 목록
- 추가/수정된 파일

## 코드 스니펫
- 주요 코드와 설명

## 재현 단계
- CLI 명령어
- 구현 단계

## 설명
- 설계 결정
- 트레이드오프

## 검증 체크리스트
- 자동/수동 검증 방법
```

## 🚀 시작하기

```bash
# 1. 저장소 클론
git clone <repository-url>
cd hello-front-opus

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 테스트 실행
npm test
```

## 📁 프로젝트 구조

```
hello-front-opus/
├── src/
│   ├── api/           # API 클라이언트, 인터셉터
│   ├── components/    # 공통 컴포넌트
│   ├── features/      # 기능별 모듈 (auth, notes)
│   ├── hooks/         # 커스텀 훅
│   ├── mocks/         # MSW 핸들러
│   ├── pages/         # 페이지 컴포넌트
│   ├── providers/     # React Context Provider
│   ├── router/        # 라우팅 설정
│   ├── stores/        # Zustand 스토어
│   └── styles/        # 전역 스타일, CSS 변수
├── tests/             # E2E 테스트
├── docs/              # 문서 (OpenAPI 등)
└── study/complete/    # 📚 학습 가이드 (이 디렉토리)
```

## 💡 학습 팁

1. **순서대로 진행**: 각 커밋은 이전 커밋을 기반으로 합니다
2. **직접 타이핑**: 코드를 복사하지 말고 직접 타이핑하세요
3. **테스트 실행**: 각 단계마다 테스트를 실행하여 검증하세요
4. **에러 이해**: 에러가 발생하면 메시지를 읽고 이해하세요
5. **Q&A 참고**: 각 가이드의 "학습 포인트"에서 Q&A를 확인하세요

## 📊 진행 상황

모든 16개 가이드가 완성되었습니다.

---

**Happy Coding! 🎉**
