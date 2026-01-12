# Stage 12 — CI/CD 및 Preview 배포 (Vercel 가이드)

이 문서는 PR마다 자동 Preview를 제공하는 **Vercel** 연동 가이드와 함께 GitHub Actions 워크플로(예시)를 설명합니다.

## 요약
- CI 워크플로(`.github/workflows/ci.yml`)는 다음 단계를 실행합니다:
  1. Lint
  2. Unit tests (Vitest)
  3. Build (Vite)
  4. Playwright E2E (빌드 후 `vite preview`로 서빙)
  5. (옵션) PR에 Vercel Preview 배포 (토큰 필요)

- 참고: GitHub Actions 워크플로는 Node.js **20.x**를 사용하도록 설정되어 있습니다 (일부 의존성이 Node >=20을 요구할 수 있습니다).

## Vercel 연결 옵션
A) 빠르고 권장: Vercel의 **Git Integration**을 사용
- Vercel에 로그인 → New Project → GitHub에서 리포지토리 연결
- Vercel이 자동으로 PR마다 Preview를 생성합니다 (별도 토큰 불필요)

B) GitHub Actions로 배포 (권한/토큰 필요)
- Vercel에서 Personal Token 생성: https://vercel.com/account/tokens
- Vercel에서 조직/프로젝트 ID 확인(프로젝트 Settings)
- GitHub 리포지토리 Settings → Secrets & variables → Actions
  - `VERCEL_TOKEN`: 발급받은 토큰
  - `VERCEL_ORG_ID`: Vercel 조직 ID
  - `VERCEL_PROJECT_ID`: Vercel 프로젝트 ID
  - (선택) `VERCEL_SCOPE`
- 워크플로에 이미 `amondnet/vercel-action` 사용 예시가 포함되어 있으며, PR에 Preview URL을 댓글로 남깁니다.

## GitHub Actions 워크플로(핵심 포인트)
- `lint_and_unit` job: `npm ci`, `npm run lint`, `npm run test -- --run`
- `build` job: `npm run build`
- `e2e` job: `npm run build` → `npm run preview -- --port 5173` → Playwright 실행
- `deploy_preview` job: PR 이벤트에서 `VERCEL_TOKEN`이 설정되어 있으면 Vercel에 배포

## Secrets & 권한
- Vercel Git Integration을 사용하면 별도 secret 없이 Preview 가능
- Action-based deploy 시에는 위에 설명한 secret들을 추가해야 합니다

## PR 보호 규칙 (권장)
- GitHub → Settings → Branches → Add rule for `main`
  - Require status checks to pass before merging: 체크박스 활성화
  - 선택 테스트(예: `Lint & Unit Tests`, `Playwright E2E`)를 필수로 추가

## 검증 방법
1. PR을 열어 Actions가 실행되는지 확인
2. `Lint & Unit Tests`가 파란색으로 통과하는지 확인
3. `E2E` 스텝이 성공하는지 확인
4. Vercel 연동 시 PR에 Preview URL이 노출되는지 확인

## 문제 해결 팁
- Playwright가 서버에 연결하지 못하면 `npm run preview` 포트와 `playwright.config.ts`의 `baseURL`이 일치하는지 체크
- Vercel deploy가 실패하면 `VERCEL_TOKEN`과 프로젝트/조직 ID를 다시 확인

---

만약 Netlify를 선호하시면 Netlify Action 및 `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`를 사용한 템플릿도 제공해 드립니다.