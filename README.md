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

# 코드 포맷팅
npm run format
```

## 프로젝트 구조

```
hello-front-opus/
├── src/                    # 소스 코드
│   ├── test/              # 테스트 설정
│   └── ...
├── docs/                   # 학습 문서
│   ├── stage-*.md         # 스테이지별 학습 노트
│   ├── changes/           # 스테이지별 변경 로그
│   ├── adr/               # 아키텍처 결정 기록
│   └── failures.md        # 실패 로그
├── scripts/               # 오케스트레이션 스크립트
├── state/                 # 스테이지 체크포인트
├── logs/                  # 실행 로그
└── TODO.md               # 전체 스테이지 계획
```

## 학습 스테이지

| 스테이지 | 주제 | 상태 |
|---------|------|------|
| 0 | 프로젝트 초기화 | ✅ 완료 |
| 1 | UI 상태 Playground + UI Kit | 🔄 진행 예정 |
| 2 | 라우팅 + 반응형 레이아웃 | ⏳ 대기 |
| 3 | 폼 + 검증 + 토스트 | ⏳ 대기 |
| 4 | 리스트 / 상세 앱 (노트) | ⏳ 대기 |
| 5 | 로컬 영속화 | ⏳ 대기 |
| 6 | 파일 업로드 + 미리보기 | ⏳ 대기 |
| 7 | 커스텀 타임라인(시킹) | ⏳ 대기 |
| 8 | Web Worker + RPC | ⏳ 대기 |
| 9 | Capstone Mini 통합 | ⏳ 대기 |
| 10 | Frontend API 연동 | ⏳ 대기 |

## 품질 게이트

모든 스테이지는 다음 검증을 통과해야 합니다:

```bash
npm run lint   # ESLint 검사
npm test       # Vitest 테스트
npm run build  # TypeScript 컴파일 + Vite 빌드
```

## 라이선스

MIT
