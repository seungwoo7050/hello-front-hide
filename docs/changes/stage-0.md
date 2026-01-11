# Stage 0 변경 로그

## 작업 요약
- Vite CLI로 React + TypeScript 프로젝트 스캐폴딩
- ESLint + Prettier 설정 및 연동
- Vitest + Testing Library 테스트 환경 구성
- CSS Modules 구조로 전환 (App.css → App.module.css)
- 글로벌 CSS 변수 기반 디자인 토큰 정의
- App 컴포넌트 스모크 테스트 작성
- 로컬 오케스트레이션 스크립트 생성

## 파일/구조 변경

### 추가된 파일
- `TODO.md` - 전체 스테이지 계획 (불변)
- `scripts/verify.sh` - 품질 게이트 검증 스크립트
- `scripts/run_stage.sh` - 스테이지 실행 스크립트
- `src/App.module.css` - App 컴포넌트 CSS Modules
- `src/App.test.tsx` - App 컴포넌트 테스트
- `src/test/setup.ts` - Vitest 설정 파일
- `.prettierrc` - Prettier 설정
- `.prettierignore` - Prettier 제외 파일
- `docs/stage-0.md` - 스테이지 학습 문서
- `docs/failures.md` - 실패 로그
- `docs/changes/stage-0.md` - 이 파일

### 수정된 파일
- `package.json` - 프로젝트명, 스크립트 추가 (test, format)
- `vite.config.ts` - Vitest 설정 추가
- `tsconfig.app.json` - vitest/globals 타입 추가
- `eslint.config.js` - Prettier 연동, node globals 추가
- `src/App.tsx` - CSS Modules 적용
- `src/index.css` - CSS 변수 기반 디자인 토큰 정의

### 삭제된 파일
- `src/App.css` - CSS Modules로 대체됨

## 핵심 결정

### 1. CSS Modules 전면 채택
- **이유**: 스타일 캡슐화로 대규모 앱에서도 클래스명 충돌 방지
- **대안**: Tailwind (금지됨), Styled Components (런타임 오버헤드)

### 2. 글로벌 CSS 변수 정의
- **이유**: 일관된 디자인 시스템의 기초, 다크 모드 전환 용이
- **범위**: 색상, 스페이싱, 타이포그래피, 포커스 스타일

### 3. Vitest globals 모드 사용
- **이유**: Jest와 유사한 API로 학습 곡선 감소
- **설정**: `vite.config.ts`에서 `globals: true`

## 검증 결과
- ✅ `npm run lint` - PASS
- ✅ `npm test` - PASS (5 tests)
- ✅ `npm run build` - PASS

## 따라하기 체크포인트
1. 📺 `npm run dev` 실행 후 브라우저에서 Vite + React 로고 확인
2. 🔢 카운터 버튼 클릭 시 숫자 증가 확인
3. 🎨 라이트/다크 모드에서 색상 전환 확인

## 효율성/도구 사용

### 사용한 CLI
- `npm create vite@latest` - 프로젝트 스캐폴딩
- `npm install -D` - 개발 의존성 설치
- `chmod +x` - 스크립트 실행 권한

### 수동 편집 사유
- `vite.config.ts` - Vitest 설정은 CLI로 추가 불가
- `eslint.config.js` - Prettier 플러그인 연동은 수동 필요
- CSS 파일들 - 디자인 토큰 정의는 자동화 도구 없음
