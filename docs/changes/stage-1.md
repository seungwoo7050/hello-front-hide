# Stage 1 변경 로그

## 작업 요약
- Button 컴포넌트 구현 (primary, secondary, ghost 변형)
- Input 컴포넌트 구현 (라벨, 에러, 도움말, 아이콘 지원)
- Card 컴포넌트 구현 (elevated, outlined 변형 + 서브 컴포넌트)
- Badge 컴포넌트 구현 (6가지 색상 변형, 도트 옵션)
- Spinner 컴포넌트 구현 (3가지 크기/색상, fullPage 모드)
- 통합 디자인 토큰 시스템 구축 (`tokens.css`)
- UI Playground 페이지 구현

## 파일/구조 변경

### 추가된 파일
- `src/styles/tokens.css` - 디자인 토큰 정의
- `src/components/ui/Button/` - Button 컴포넌트 (3 파일)
- `src/components/ui/Input/` - Input 컴포넌트 (3 파일)
- `src/components/ui/Card/` - Card 컴포넌트 (3 파일)
- `src/components/ui/Badge/` - Badge 컴포넌트 (3 파일)
- `src/components/ui/Spinner/` - Spinner 컴포넌트 (3 파일)
- `src/components/ui/index.ts` - UI Kit 통합 export
- `src/pages/Playground/` - Playground 페이지 (3 파일)
- `docs/stage-1.md` - 스테이지 학습 문서
- `docs/changes/stage-1.md` - 이 파일

### 수정된 파일
- `src/index.css` - tokens.css import, 글로벌 스타일 정리
- `src/App.tsx` - Playground 페이지 렌더링으로 변경
- `src/App.test.tsx` - Playground 기반 테스트로 변경

### 삭제된 파일
- 없음

## 핵심 결정

### 1. useId 훅으로 안정적인 ID 생성
- **이유**: React 19의 순수성 규칙 준수, Math.random() 사용 금지
- **효과**: SSR 호환성 확보, hydration 불일치 방지

### 2. 행동 기반 테스트로 전환
- **이유**: CSS Modules 해싱으로 클래스명 직접 검증 불가
- **효과**: 더 견고하고 리팩토링에 강한 테스트

### 3. 통합 디자인 토큰 시스템
- **이유**: 일관된 디자인 언어, 다크 모드 지원 기반
- **범위**: 색상 팔레트, 스페이싱, 타이포그래피, 그림자, 포커스 링

## 검증 결과
- ✅ `npm run lint` - PASS
- ✅ `npm test` - PASS (63 tests)
- ✅ `npm run build` - PASS

## 따라하기 체크포인트
1. 📺 `npm run dev` 실행 후 UI Playground 페이지 확인
2. 🎨 Button의 3가지 변형(primary, secondary, ghost) 확인
3. ⌨️ 모든 버튼에 Tab 키로 포커스 이동 후 Enter로 클릭 가능 확인
4. 🔴 Input 에러 상태에서 빨간 테두리와 에러 메시지 확인
5. 🔄 "클릭하여 로딩" 버튼 클릭 시 스피너 표시 확인

## 효율성/도구 사용

### 사용한 CLI
- `npm install` - 의존성 관리
- `npm run lint` / `npm test` / `npm run build` - 품질 검증

### 수동 편집 사유
- 모든 컴포넌트 파일 - 커스텀 UI Kit이므로 CLI 생성 도구 해당 없음
- `tokens.css` - 디자인 토큰은 프로젝트별 맞춤 정의 필요
- Playground 페이지 - 데모/학습용 페이지로 수동 작성 필수
