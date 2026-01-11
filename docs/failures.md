# 실패 및 회피 로그

> 이 문서는 프로젝트 진행 중 발생한 실패, 성능 문제, UX 문제를 누적 기록합니다.
> **절대 삭제하지 마세요.**

---

## Stage 0

### 1. npm 패키지 설치 충돌
- **상황**: 기존 node_modules가 있는 상태에서 추가 패키지 설치 시 ENOTEMPTY 에러 발생
- **원인**: eslint/messages 디렉토리가 비어있지 않아 rmdir 실패
- **해결**: `rm -rf node_modules package-lock.json` 후 클린 설치
- **교훈**: 패키지 충돌 시 클린 설치가 가장 확실한 해결책

### 2. Vite 스캐폴딩 대화형 프롬프트
- **상황**: `npm create vite@latest`가 대화형 모드로 실행되어 자동화 방해
- **원인**: create-vite 패키지가 설치되지 않은 상태에서 y/n 확인 필요
- **해결**: `yes |` 파이프로 자동 응답 또는 `--yes` 플래그 사용
- **교훈**: CI/자동화 환경에서는 항상 비대화형 옵션 확인

---

## Stage 1

### 3. CSS Modules 클래스명 해싱으로 테스트 실패
- **상황**: `toHaveClass('primary')` 테스트가 실패
- **원인**: CSS Modules가 클래스명을 `_primary_bf748c` 형식으로 해싱
- **시도**: `className.toContain('primary')` - 부분적으로 작동하나 일관성 부족
- **해결**: 클래스명 검증 대신 렌더링/동작 기반 테스트로 전환
- **교훈**: CSS Modules 프로젝트에서는 구현 세부사항(클래스명) 대신 행동 테스트

### 4. React 19 순수성 규칙 위반
- **상황**: Input 컴포넌트에서 `Math.random()` 사용 시 ESLint 오류
- **원인**: React 컴파일러가 렌더링 중 불순 함수 호출을 금지
- **오류 메시지**: "Cannot call impure function during render"
- **해결**: `useId()` 훅으로 안정적인 고유 ID 생성
- **교훈**: React 18+에서는 컴포넌트 ID 생성에 useId 사용
