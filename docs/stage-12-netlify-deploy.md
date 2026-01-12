# Stage 12 — Netlify 배포 가이드 (선택)

Vercel 외에 Netlify로 Preview 배포를 설정하려면 다음 절차를 따르세요.

## 빠른 연결(권장)
- Netlify 계정 생성 → New site from Git → GitHub 리포지토리 연결 → 브랜치 선택
- Netlify는 PR마다 자동 Preview를 생성합니다.

## GitHub Actions 기반 배포 (토큰 사용)
- Netlify에서 Personal Access Token 생성
- GitHub → Settings → Secrets → Actions 에 아래 Secret 등록:
  - `NETLIFY_AUTH_TOKEN`
  - `NETLIFY_SITE_ID`
- 예시 워크플로(`.github/workflows/netlify-deploy.yml`)를 추가하면 PR 이벤트 시 빌드/배포 가능

## Netlify Action 예시
```yaml
name: Netlify Deploy
on:
  pull_request:
    types: [opened, synchronize, reopened]
jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1
        with:
          publish-dir: ./dist
          production-deploy: false
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 검증 방법
- PR을 열고 Actions가 실행되는지 확인
- Netlify가 배포된 Preview URL을 회수하는지 확인(로그 및 댓글)
