# Hello Front Opus

> React + TypeScript 학습 여정 프로젝트

## 개요

이 프로젝트는 React와 TypeScript를 활용한 프론트엔드 개발 학습을 위한 단계별 학습 여정입니다. 빈 디렉토리에서 시작하여 완성도 높은 노트 앱을 구축하는 과정을 통해 현대 프론트엔드 개발의 핵심 개념을 학습합니다.

## 기술 스택

- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구
- **CSS Modules** - 스타일 캡슐화
- **Vitest** - 테스트 프레임워크
- **Testing Library** - 컴포넌트 테스트
- **TanStack Query** - 서버 상태 관리
- **Zustand** - 전역 상태 관리
- **MSW** - API 모킹
- **React Router** - 라우팅

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 테스트 실행
npm test

# 빌드
npm run build

# 린트 검사
npm run lint
```

## 프로젝트 구조

```
hello-front-opus/
├── src/
│   ├── api/               # API 클라이언트
│   ├── components/
│   │   ├── ErrorBoundary/ # 에러 경계
│   │   ├── ProtectedRoute/# 인증 라우트
│   │   ├── layout/        # 레이아웃 컴포넌트
│   │   └── ui/            # UI 컴포넌트 라이브러리
│   ├── features/
│   │   ├── auth/          # 인증 기능
│   │   └── notes/         # 노트 기능
│   ├── hooks/             # 커스텀 훅
│   ├── mocks/             # MSW 모킹
│   ├── pages/             # 페이지 컴포넌트
│   ├── providers/         # Context 프로바이더
│   ├── router/            # 라우터 설정
│   ├── stores/            # Zustand 스토어
│   ├── styles/            # 전역 스타일
│   └── types/             # 타입 정의
├── docs/                  # 학습 문서
│   └── stage-*.md         # 스테이지별 학습 노트
└── public/                # 정적 파일
```

## 학습 스테이지

| 스테이지 | 주제 | 상태 | 테스트 |
|---------|------|------|--------|
| 0 | 프로젝트 초기화 | ✅ 완료 | - |
| 1 | 기초 컴포넌트 | ✅ 완료 | - |
| 2 | UI 컴포넌트 라이브러리 | ✅ 완료 | - |
| 3 | 레이아웃 시스템 | ✅ 완료 | - |
| 4 | 라우팅 + 노트 기능 | ✅ 완료 | - |
| 5 | 고급 컴포넌트 + 폼 | ✅ 완료 | - |
| 6 | MSW + TanStack Query | ✅ 완료 | 339 |
| 7 | 인증/인가 | ✅ 완료 | 370 |
| 8 | 전역 상태 (Zustand) | ✅ 완료 | 387 |
| 9 | 성능 최적화 | ✅ 완료 | 402 |
| 10 | 프로덕션 준비 | ✅ 완료 | 408 |

## 주요 기능

- 📝 **노트 관리**: 생성, 수정, 삭제, 검색, 필터링
- 🔐 **인증 시스템**: 로그인, 회원가입, 토큰 관리
- 🌓 **다크 모드**: 시스템/라이트/다크 테마 지원
- ⚡ **성능 최적화**: 코드 스플리팅, 메모이제이션
- 🧪 **테스트**: 408개 이상의 단위/통합 테스트

## 품질 게이트

모든 스테이지는 다음 검증을 통과합니다:

```bash
npm run lint   # ESLint 검사
npm test       # Vitest 테스트
npm run build  # 프로덕션 빌드
```

## 라이선스

MIT
