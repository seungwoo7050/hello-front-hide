# Stage 12 — 브랜치 보호 규칙 설정 가이드

이 문서는 `main` 브랜치에 대해 권장되는 브랜치 보호 규칙을 정리합니다. 이 규칙들은 PR이 머지되기 전에 CI(Lint, Unit, E2E)가 통과되도록 강제하여 안정성을 보장합니다.

## 권장 설정
1. Repository → Settings → Branches → Add rule for `main`
2. 체크할 옵션들:
   - Require status checks to pass before merging (체크)
     - Add required checks:
       - `Lint & Unit Tests` (GitHub Actions job 이름과 일치)
       - `Build` (선택)
       - `Playwright E2E` (선택 또는 필수)
   - Require branches to be up to date before merging (체크 권장)
   - Require pull request reviews before merging (팀 규모에 따라 1~2명)
   - Dismiss stale pull request approvals when new commits are pushed (권장)
   - Require signed commits (옵션)

## PR 템플릿과 체크리스트
PR 템플릿에 다음을 포함하세요:
- [ ] Lint 통과
- [ ] Unit tests 통과
- [ ] E2E tests(필요 시) 통과
- [ ] Preview URL(배포된 경우) 제공

## 검증
- PR 생성 후 GitHub Actions가 자동으로 트리거되는지 확인
- 필요한 체크가 모두 녹색(통과)되어야 머지할 수 있음

## 롤백/긴급 머지
- 긴급 수정 필요 시 임시로 브랜치 보호를 해제할 수 있으나, 변경 내용을 PR로 기록하고 팀에 공지할 것
