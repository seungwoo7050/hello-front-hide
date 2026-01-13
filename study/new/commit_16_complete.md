# Commit #16 — OpenAPI 스펙 및 Contract Testing

## Meta
| 항목 | 내용 |
|------|------|
| 커밋 해시 | `fd7b9fc0484b2fe64dae217de94a8cd40fe9c287` |
| 부모 커밋 | `b7f95c910fd2eb1e8aadbeaa93b52a6caedaae31` |
| 난이도 | ⭐⭐⭐⭐ (고급) |
| 관련 기술 | OpenAPI 3.0, Contract Testing, Dredd, Prism, API Documentation |
| 커밋 메시지 | feat: add OpenAPI spec, contract testing setup, and Dredd hooks |

## 학습 목표
1. OpenAPI 3.0 스펙 문서 작성 방법 이해
2. MSW 모킹과 OpenAPI 스펙의 관계 이해
3. Prism을 활용한 Mock 서버 구축
4. Dredd를 활용한 Contract Testing 설정
5. 프론트엔드-백엔드 협업을 위한 API Handoff 문서화
6. CI/CD 파이프라인에 Contract Testing 통합

## TL;DR
> MSW 모킹을 기반으로 OpenAPI 3.0 스펙을 작성하여 API 계약을 문서화한다. Prism으로 스펙 기반 Mock 서버를 실행하고, Dredd로 실제 구현이 스펙과 일치하는지 Contract Testing을 수행한다. 백엔드 팀에 전달할 Handoff 문서와 CI 워크플로를 함께 제공한다.

## 배경 / 컨텍스트
- **API 계약의 중요성**: 프론트엔드와 백엔드가 동시에 개발할 때 API 계약 필수
- **Consumer-Driven Contract**: 프론트엔드(Consumer)가 필요한 API를 먼저 정의
- **MSW → OpenAPI**: MSW 모킹을 OpenAPI 스펙으로 문서화하여 공식 계약으로 전환
- **Contract Testing**: 구현이 스펙을 준수하는지 자동 검증
- **타입 생성**: OpenAPI 스펙에서 TypeScript 타입 자동 생성 가능

## 변경 파일 목록
| 파일 경로 | 변경 타입 | 설명 |
|-----------|-----------|------|
| `docs/openapi.yaml` | ✨ 추가 | OpenAPI 3.0 스펙 문서 |
| `docs/openapi-README.md` | ✨ 추가 | OpenAPI 사용 가이드 |
| `docs/openapi-contract-testing.md` | ✨ 추가 | Contract Testing 가이드 |
| `docs/openapi-hand-off.md` | ✨ 추가 | 백엔드 Handoff 체크리스트 |
| `.dredd.yml` | ✨ 추가 | Dredd 설정 파일 |
| `dredd-hooks.js` | ✨ 추가 | Dredd 훅 (인증 등) |
| `.github/workflows/openapi-contract.yml` | ✨ 추가 | Contract Testing CI 워크플로 |
| `package.json` | ✏️ 수정 | OpenAPI 관련 스크립트 추가 |

## 코드 스니펫

### 1. OpenAPI 3.0 스펙 - 기본 구조
```yaml
# path: docs/openapi.yaml:1..50
openapi: 3.0.3
info:
  title: Hello Front Opus API (Mock)
  version: 1.0.0
  description: >-
    OpenAPI spec derived from MSW mocks for local/front-first development.
    This spec is intended as a consumer-driven contract and can be used with
    Prism, Stoplight, or other mock/validation tools.

servers:
  - url: http://localhost:3000/api
    description: Local mock server

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
        name:
          type: string
        createdAt:
          type: string
          format: date-time
      required: [id, email, name, createdAt]

    AuthTokens:
      type: object
      properties:
        accessToken:
          type: string
        refreshToken:
          type: string
      required: [accessToken, refreshToken]

    AuthResponse:
      type: object
      properties:
        user:
          $ref: '#/components/schemas/User'
        tokens:
          $ref: '#/components/schemas/AuthTokens'
      required: [user, tokens]
```

### 2. OpenAPI - Note 스키마
```yaml
# path: docs/openapi.yaml:60..100
    Note:
      type: object
      properties:
        id:
          type: string
        title:
          type: string
        content:
          type: string
        category:
          type: string
        tags:
          type: array
          items:
            type: string
        isPinned:
          type: boolean
        color:
          type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required: [id, title, content, category, tags, isPinned, color, createdAt, updatedAt]

    ErrorResponse:
      type: object
      properties:
        message:
          type: string
        code:
          type: string
```

### 3. OpenAPI - Auth 엔드포인트
```yaml
# path: docs/openapi.yaml:110..180
paths:
  /auth/login:
    post:
      summary: Login with email/password
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
              required: [email, password]
      responses:
        '200':
          description: Authenticated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /auth/refresh:
    post:
      summary: Refresh tokens
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                refreshToken:
                  type: string
              required: [refreshToken]
      responses:
        '200':
          description: Refreshed tokens
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          description: Invalid or expired refresh token
```

### 4. OpenAPI - Notes CRUD
```yaml
# path: docs/openapi.yaml:200..280
  /notes:
    get:
      summary: Get list of notes
      parameters:
        - in: query
          name: search
          schema:
            type: string
        - in: query
          name: category
          schema:
            type: string
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Notes list
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Note'
        '401':
          description: Unauthorized

    post:
      summary: Create a note
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                content:
                  type: string
                category:
                  type: string
                tags:
                  type: array
                  items:
                    type: string
                color:
                  type: string
              required: [title, content, category, tags, color]
      responses:
        '201':
          description: Created note
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Note'
```

### 5. OpenAPI - Security Scheme
```yaml
# path: docs/openapi.yaml:350..365
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### 6. Dredd 설정 파일
```yaml
# path: .dredd.yml:1..16
dry-run: null
hookfiles: null
language: nodejs
server: null
server-wait: 3
init: false
title: Hello Front Opus API contract
names: false
only: []
reporter: markdown
output: ./reports/dredd-report.md
details: true
header:
  Authorization: 'Bearer <TOKEN>'
path: docs/openapi.yaml
hooks: ./dredd-hooks.js
```

### 7. Dredd Hooks
```javascript
// path: dredd-hooks.js:1..20
// Example Dredd hooks placeholder
// Implement hooks for authentication or setup if needed

const hooks = require('hooks')

// Before all transactions
hooks.beforeAll((transactions, done) => {
  // 인증 토큰 설정 등
  console.log('Running contract tests...')
  done()
})

// Before each transaction
hooks.beforeEach((transaction, done) => {
  // 필요시 Authorization 헤더 동적 설정
  // transaction.request.headers['Authorization'] = `Bearer ${token}`
  done()
})

module.exports = hooks
```

### 8. Contract Testing CI 워크플로
```yaml
# path: .github/workflows/openapi-contract.yml:1..40
name: OpenAPI Contract

on:
  workflow_dispatch:
    inputs:
      target-url:
        description: 'Base URL of API implementation to test'
        required: true
        default: 'http://localhost:3000'

jobs:
  validate-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v5

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install deps
        run: npm ci

      - name: Validate OpenAPI (Redocly)
        run: |
          npx @redocly/openapi-cli lint docs/openapi.yaml || \
          npx @apidevtools/swagger-cli validate docs/openapi.yaml

      - name: Run Dredd contract tests
        run: |
          npx dredd docs/openapi.yaml ${{ github.event.inputs['target-url'] }} \
            --hookfiles=./dredd-hooks.js || true

      - name: Upload Dredd report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: dredd-report
          path: reports/dredd-report.md
```

### 9. npm 스크립트
```json
// path: package.json (scripts 부분)
{
  "scripts": {
    "mock:openapi": "npx @stoplight/prism-cli mock docs/openapi.yaml -p 3000",
    "openapi:types": "npx openapi-typescript docs/openapi.yaml --output src/api/openapi-types.ts",
    "openapi:validate": "npx @redocly/openapi-cli lint docs/openapi.yaml || npx @apidevtools/swagger-cli validate docs/openapi.yaml",
    "contract:test": "npx dredd docs/openapi.yaml http://localhost:3000"
  }
}
```

### 10. Backend Handoff 문서
```markdown
# path: docs/openapi-hand-off.md:1..50
# OpenAPI Handoff Checklist (for backend)

This OpenAPI spec (`docs/openapi.yaml`) was produced by the front-end team
from their local MSW mocks.

## What to review
- [ ] Confirm the **paths** and **methods** match backend intentions
- [ ] Review **request bodies**, **query params** and **headers**
- [ ] Confirm **response schemas** (success and error) and **status codes**
- [ ] Confirm **authentication**: spec uses `Bearer` token (JWT)
- [ ] Ensure **edge cases** and **error responses** are included

## Quick local validation steps

1. Lint/validate the spec
```bash
npx @redocly/openapi-cli lint docs/openapi.yaml
npx @apidevtools/swagger-cli validate docs/openapi.yaml
```

2. Run a mock server
```bash
npm run mock:openapi
# or
npx @stoplight/prism-cli mock docs/openapi.yaml -p 3000
```

3. Run Dredd contract test
```bash
npm run contract:test
npx dredd docs/openapi.yaml http://your-deployed-api
```

## Minimal acceptance test list
- Login with valid credentials → 200 + tokens + user
- Login with invalid credentials → 401 + error message
- Get `/auth/me` with valid token → 200 + user
- Get `/auth/me` with expired token → 401
- Get `/notes` with valid token → 200 + array
- Create note → 201 + created note
- Get note not found → 404 + error code `NOT_FOUND`
```

## 재현 단계 (CLI 우선)

### Step 1: OpenAPI 스펙 파일 생성
```bash
# docs/openapi.yaml 생성
# MSW 핸들러를 참고하여 모든 엔드포인트 정의
```

### Step 2: OpenAPI 스펙 검증
```bash
# Redocly CLI로 린트
npx @redocly/openapi-cli lint docs/openapi.yaml

# 또는 Swagger CLI로 검증
npx @apidevtools/swagger-cli validate docs/openapi.yaml
```

### Step 3: Prism Mock 서버 실행
```bash
# OpenAPI 스펙 기반 Mock 서버
npx @stoplight/prism-cli mock docs/openapi.yaml -p 3000
```

### Step 4: Dredd 설정 파일 생성
```bash
cat > .dredd.yml << 'EOF'
dry-run: null
language: nodejs
reporter: markdown
output: ./reports/dredd-report.md
details: true
path: docs/openapi.yaml
hooks: ./dredd-hooks.js
EOF
```

### Step 5: Dredd Hooks 생성
```bash
cat > dredd-hooks.js << 'EOF'
module.exports = function(hooks) {
  hooks.beforeAll((transactions, done) => {
    console.log('Running contract tests...')
    done()
  })
}
EOF
```

### Step 6: Contract Testing 실행
```bash
# 로컬 서버에 대해 실행
npm run contract:test

# 또는 배포된 API에 대해 실행
npx dredd docs/openapi.yaml https://staging.example.com
```

### Step 7: TypeScript 타입 생성 (선택)
```bash
# OpenAPI 스펙에서 타입 자동 생성
npm run openapi:types
# 또는
npx openapi-typescript docs/openapi.yaml --output src/api/openapi-types.ts
```

### Step 8: npm 스크립트 추가
```bash
# package.json에 스크립트 추가
npm pkg set scripts.mock:openapi="npx @stoplight/prism-cli mock docs/openapi.yaml -p 3000"
npm pkg set scripts.openapi:validate="npx @redocly/openapi-cli lint docs/openapi.yaml"
npm pkg set scripts.contract:test="npx dredd docs/openapi.yaml http://localhost:3000"
```

### Step 9: CI 워크플로 생성
```bash
mkdir -p .github/workflows
# openapi-contract.yml 생성 (위 코드 스니펫 참조)
```

### Step 10: 커밋
```bash
git add .
git commit -m "feat: add OpenAPI spec, contract testing setup, and Dredd hooks"
```

## 상세 설명

### OpenAPI 기반 개발 워크플로

```
┌──────────────────────────────────────────────────────────────────┐
│                    Consumer-Driven Contract                       │
└──────────────────────────────────────────────────────────────────┘

Frontend Team                                      Backend Team
     │                                                  │
     │  1. MSW로 API 모킹                              │
     │  ┌──────────────────┐                           │
     │  │ MSW Handlers     │                           │
     │  └────────┬─────────┘                           │
     │           │                                      │
     │  2. OpenAPI 스펙 작성                           │
     │  ┌──────────────────┐                           │
     │  │ openapi.yaml     │──────────────────────────►│
     │  └────────┬─────────┘       Handoff            │
     │           │                                      │
     │  3. Prism Mock 서버                             │  4. API 구현
     │  ┌──────────────────┐                           │  ┌──────────────────┐
     │  │ npm run mock     │                           │  │ Backend Server   │
     │  └──────────────────┘                           │  └────────┬─────────┘
     │                                                  │           │
     │                   5. Contract Testing            │           │
     │                  ┌──────────────────┐           │           │
     │                  │ Dredd / Pact     │◄──────────┼───────────┘
     │                  └──────────────────┘           │
     │                                                  │
     │  6. 통합 테스트                                 │
     │  ┌──────────────────┐                           │
     │  │ Frontend + API   │                           │
     │  └──────────────────┘                           │
```

### OpenAPI vs MSW 비교

| 항목 | MSW | OpenAPI |
|------|-----|---------|
| 목적 | 런타임 API 모킹 | API 명세 문서화 |
| 형식 | JavaScript/TypeScript | YAML/JSON |
| 실행 | 브라우저/Node.js | 도구 필요 (Prism 등) |
| 타입 생성 | 불가 | 가능 |
| 계약 검증 | 불가 | Dredd/Pact로 가능 |
| 협업 | 코드 공유 필요 | 문서 공유 |

### Prism vs MSW Mock 서버

**Prism (OpenAPI 기반)**
```bash
# 장점: 스펙과 100% 일치하는 응답
npx @stoplight/prism-cli mock docs/openapi.yaml -p 3000
```

**MSW (코드 기반)**
```typescript
// 장점: 동적 로직 구현 가능
http.post('/api/login', async ({ request }) => {
  const { email, password } = await request.json()
  if (password !== 'correct') {
    return HttpResponse.json({ error: '...' }, { status: 401 })
  }
  return HttpResponse.json({ user, tokens })
})
```

### Contract Testing 도구 비교

| 도구 | 방식 | 장점 | 단점 |
|------|------|------|------|
| **Dredd** | Spec → Implementation | 설정 간단 | 동적 시나리오 어려움 |
| **Pact** | Consumer → Provider | 양방향 검증 | 설정 복잡 |
| **Spectral** | Linting only | 빠름 | 검증 범위 제한 |

### OpenAPI에서 TypeScript 타입 생성

```bash
# openapi-typescript 사용
npx openapi-typescript docs/openapi.yaml --output src/api/openapi-types.ts
```

생성된 타입 예시:
```typescript
// src/api/openapi-types.ts
export interface paths {
  "/auth/login": {
    post: {
      requestBody: {
        content: {
          "application/json": {
            email: string
            password: string
          }
        }
      }
      responses: {
        200: {
          content: {
            "application/json": components["schemas"]["AuthResponse"]
          }
        }
      }
    }
  }
}

export interface components {
  schemas: {
    User: {
      id: string
      email: string
      name: string
      createdAt: string
    }
    Note: {
      id: string
      title: string
      content: string
      // ...
    }
  }
}
```

## 검증 체크리스트
- [ ] `docs/openapi.yaml` 파일이 존재하는가?
- [ ] `npm run openapi:validate`가 통과하는가?
- [ ] `npm run mock:openapi`로 Mock 서버가 실행되는가?
- [ ] 모든 엔드포인트가 스펙에 정의되어 있는가?
- [ ] Request/Response 스키마가 MSW 핸들러와 일치하는가?
- [ ] 에러 응답 (401, 404, 409 등)이 정의되어 있는가?
- [ ] Security Scheme (bearerAuth)이 정의되어 있는가?
- [ ] Backend Handoff 문서가 준비되어 있는가?

## 누락 정보
| 항목 | 설명 | 대안 |
|------|------|------|
| Dredd 실제 실행 결과 | 구현된 서버가 없어 테스트 불가 | MSW나 Prism으로 대체 |
| Pact 설정 | Consumer-Driven Contract의 다른 방식 | Dredd로 기본 검증 |
| OpenAPI Generator | 클라이언트 SDK 자동 생성 | 수동 구현 또는 openapi-fetch |

---

## 학습 포인트 요약

1. **OpenAPI 3.0**: REST API의 표준 명세 형식
2. **Consumer-Driven Contract**: 프론트엔드가 필요한 API를 먼저 정의
3. **Prism**: OpenAPI 스펙 기반 Mock 서버
4. **Dredd**: 스펙과 구현의 일치 여부 자동 검증
5. **타입 생성**: OpenAPI에서 TypeScript 타입 자동 생성 가능
6. **협업**: Handoff 문서로 백엔드 팀과 명확한 계약 공유

## 관련 도구 및 링크
- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.3)
- [Prism](https://stoplight.io/open-source/prism)
- [Dredd](https://dredd.org/)
- [openapi-typescript](https://github.com/drwpow/openapi-typescript)
- [Redocly CLI](https://redocly.com/docs/cli/)
