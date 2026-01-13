# Commit #16 — OpenAPI Spec, Contract Testing, Dredd Hooks

## Meta
- **난이도**: ⭐⭐⭐⭐⭐ 전문가 (Expert)
- **권장 커밋 메시지**: `test(contract): add OpenAPI spec and Dredd contract testing`

## 학습 목표
1. OpenAPI(Swagger) 명세 작성법을 학습한다
2. Contract Testing의 개념과 필요성을 이해한다
3. Dredd를 사용한 API 계약 테스트를 구현한다
4. MSW와 OpenAPI 명세의 일관성을 유지하는 방법을 학습한다

## TL;DR
OpenAPI 3.0 명세를 작성하고, Dredd로 API 계약 테스트를 실행한다. MSW 핸들러가 OpenAPI 명세와 일치하는지 검증한다. 프론트엔드와 백엔드 간 API 계약을 문서화하고 테스트한다.

## 배경/맥락
Contract Testing이 필요한 이유:
- **Frontend ↔ Backend 계약**: API 스펙 합의 및 검증
- **조기 발견**: API 변경으로 인한 통합 문제를 조기에 발견
- **문서화**: OpenAPI 명세로 API 자동 문서화
- **코드 생성**: 명세로부터 클라이언트 코드 자동 생성 가능

```
OpenAPI Spec (계약)
       ↓
    ┌──────┐
    │ Dredd │ ← Contract Testing Tool
    └──────┘
       ↓
MSW Handlers (Mock Server)
       ↓
✓ 계약 준수 확인
```

## 변경 파일 목록
### 추가된 파일 (5개)
- `docs/openapi.yaml` — OpenAPI 3.0 명세
- `dredd-hooks.js` — Dredd 훅 (테스트 설정)
- `docs/openapi-README.md` — OpenAPI 사용 가이드
- `docs/openapi-contract-testing.md` — Contract Testing 가이드
- `Dockerfile.ci` — CI용 Dredd 실행 환경

### 수정된 파일 (2개)
- `package.json` — dredd 의존성 및 스크립트
- `.github/workflows/ci.yml` — Contract Test job 추가

## 코드 스니펫

### 1. OpenAPI 명세 (Notes API)
```yaml
# docs/openapi.yaml
openapi: 3.0.3
info:
  title: Notes API
  description: 노트 관리 REST API
  version: 1.0.0
  contact:
    name: API Support
    email: support@example.com

servers:
  - url: http://localhost:3000/api
    description: Development server

tags:
  - name: Notes
    description: 노트 CRUD 작업
  - name: Auth
    description: 인증 관련 작업

paths:
  /notes:
    get:
      summary: 노트 목록 조회
      tags: [Notes]
      parameters:
        - name: search
          in: query
          schema:
            type: string
          description: 검색어 (제목, 내용)
        - name: category
          in: query
          schema:
            type: string
          description: 카테고리 필터
        - name: sortBy
          in: query
          schema:
            type: string
            enum: [newest, oldest, title-asc, title-desc]
            default: newest
          description: 정렬 기준
      responses:
        '200':
          description: 성공
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Note'
              example:
                data:
                  - id: "note-1"
                    title: "첫 번째 노트"
                    content: "노트 내용입니다."
                    category: "work"
                    tags: ["important"]
                    isPinned: false
                    createdAt: "2024-01-01T00:00:00Z"
                    updatedAt: "2024-01-01T00:00:00Z"
        '401':
          $ref: '#/components/responses/Unauthorized'

    post:
      summary: 노트 생성
      tags: [Notes]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NoteInput'
            example:
              title: "새 노트"
              content: "노트 내용"
              category: "personal"
              tags: ["tag1", "tag2"]
      responses:
        '201':
          description: 생성 성공
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/Note'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /notes/{id}:
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
        description: 노트 ID
    
    get:
      summary: 노트 상세 조회
      tags: [Notes]
      responses:
        '200':
          description: 성공
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/Note'
        '404':
          $ref: '#/components/responses/NotFound'

    patch:
      summary: 노트 수정
      tags: [Notes]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NoteInput'
      responses:
        '200':
          description: 수정 성공
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/Note'
        '404':
          $ref: '#/components/responses/NotFound'

    delete:
      summary: 노트 삭제
      tags: [Notes]
      security:
        - bearerAuth: []
      responses:
        '200':
          description: 삭제 성공
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      id:
                        type: string
        '404':
          $ref: '#/components/responses/NotFound'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Note:
      type: object
      required:
        - id
        - title
        - content
        - createdAt
        - updatedAt
      properties:
        id:
          type: string
          description: 노트 고유 ID
        title:
          type: string
          description: 노트 제목
        content:
          type: string
          description: 노트 내용
        category:
          type: string
          description: 카테고리
        tags:
          type: array
          items:
            type: string
          description: 태그 목록
        isPinned:
          type: boolean
          description: 고정 여부
        createdAt:
          type: string
          format: date-time
          description: 생성 일시
        updatedAt:
          type: string
          format: date-time
          description: 수정 일시

    NoteInput:
      type: object
      required:
        - title
        - content
      properties:
        title:
          type: string
          minLength: 1
          maxLength: 200
        content:
          type: string
        category:
          type: string
        tags:
          type: array
          items:
            type: string

    Error:
      type: object
      properties:
        message:
          type: string
        code:
          type: string

  responses:
    BadRequest:
      description: 잘못된 요청
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            message: "제목은 필수입니다"
            code: "VALIDATION_ERROR"

    Unauthorized:
      description: 인증 필요
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            message: "인증이 필요합니다"
            code: "UNAUTHORIZED"

    NotFound:
      description: 리소스 없음
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            message: "노트를 찾을 수 없습니다"
            code: "NOT_FOUND"
```

**선정 이유**: 완전한 OpenAPI 3.0 명세 예시

**로직/흐름 설명**:
- **paths**: API 엔드포인트 정의
- **components/schemas**: 재사용 가능한 데이터 모델
- **components/responses**: 공통 응답 정의
- **securitySchemes**: 인증 방식 정의

**학습 포인트**:
- `$ref`: 스키마 참조로 중복 제거
- `example`: 문서화 및 테스트용 예시 데이터
- Q: OpenAPI vs Swagger 차이?
- A: Swagger는 OpenAPI 2.0의 이전 이름, 3.0부터 OpenAPI로 변경

---

### 2. Dredd Hooks
```javascript
/* dredd-hooks.js */
const hooks = require('hooks')

// 전역 변수
let authToken = null

// 모든 트랜잭션 전에 실행
hooks.beforeAll((transactions, done) => {
  console.log('Starting contract tests...')
  done()
})

// 인증이 필요한 요청 전에 토큰 설정
hooks.beforeEach((transaction, done) => {
  // Authorization 헤더가 필요한 엔드포인트
  if (transaction.request.headers['Authorization']) {
    // 테스트용 토큰 (MSW에서 인식)
    transaction.request.headers['Authorization'] = 'Bearer test-token'
  }
  done()
})

// 특정 트랜잭션 훅
hooks.before('Notes > 노트 목록 조회 > 200', (transaction, done) => {
  // 특별한 설정 없이 진행
  done()
})

hooks.before('Notes > 노트 생성 > 201', (transaction, done) => {
  // 요청 본문 설정
  transaction.request.body = JSON.stringify({
    title: 'Dredd 테스트 노트',
    content: '계약 테스트 내용',
    category: 'test',
    tags: ['dredd', 'contract'],
  })
  done()
})

hooks.before('Notes > 노트 상세 조회 > 200', (transaction, done) => {
  // 존재하는 ID로 변경
  transaction.fullPath = transaction.fullPath.replace('{id}', 'note-1')
  transaction.request.uri = transaction.request.uri.replace('{id}', 'note-1')
  done()
})

hooks.before('Notes > 노트 수정 > 200', (transaction, done) => {
  transaction.fullPath = transaction.fullPath.replace('{id}', 'note-1')
  transaction.request.uri = transaction.request.uri.replace('{id}', 'note-1')
  transaction.request.body = JSON.stringify({
    title: '수정된 제목',
    content: '수정된 내용',
  })
  done()
})

hooks.before('Notes > 노트 삭제 > 200', (transaction, done) => {
  transaction.fullPath = transaction.fullPath.replace('{id}', 'note-2')
  transaction.request.uri = transaction.request.uri.replace('{id}', 'note-2')
  done()
})

// 404 테스트
hooks.before('Notes > 노트 상세 조회 > 404', (transaction, done) => {
  transaction.fullPath = transaction.fullPath.replace('{id}', 'non-existent')
  transaction.request.uri = transaction.request.uri.replace('{id}', 'non-existent')
  done()
})

// 스킵할 트랜잭션
hooks.before('Auth > 로그인 > 401', (transaction, done) => {
  // 잘못된 자격증명 테스트는 별도 설정 필요
  transaction.skip = true
  done()
})

// 모든 트랜잭션 후에 실행
hooks.afterAll((transactions, done) => {
  console.log('Contract tests completed!')
  const passed = transactions.filter(t => t.test?.status === 'pass').length
  const failed = transactions.filter(t => t.test?.status === 'fail').length
  const skipped = transactions.filter(t => t.skip).length
  
  console.log(`Results: ${passed} passed, ${failed} failed, ${skipped} skipped`)
  done()
})
```

**선정 이유**: Dredd 훅을 사용한 테스트 커스터마이징

**로직/흐름 설명**:
- `beforeAll`: 전체 테스트 시작 전 실행
- `beforeEach`: 각 트랜잭션 전 실행 (공통 설정)
- `before('트랜잭션명')`: 특정 트랜잭션 전 실행
- `skip`: 테스트 건너뛰기

**학습 포인트**:
- 트랜잭션 이름: `{Tag} > {Summary} > {Status Code}`
- `fullPath`, `request.uri`: URL 파라미터 치환

---

### 3. Package.json 스크립트
```json
{
  "scripts": {
    "test:contract": "dredd docs/openapi.yaml http://localhost:3000 --hookfiles=dredd-hooks.js",
    "test:contract:ci": "npm run build && npm run preview & sleep 5 && npm run test:contract"
  },
  "devDependencies": {
    "dredd": "^14.1.0"
  }
}
```

**선정 이유**: Dredd 실행 스크립트

---

### 4. CI 워크플로우 추가
```yaml
# .github/workflows/ci.yml (추가 부분)
contract-test:
  name: Contract Tests
  runs-on: ubuntu-latest
  needs: build
  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Download build artifact
      uses: actions/download-artifact@v4
      with:
        name: dist
        path: dist/

    - name: Run contract tests
      run: |
        npm run preview &
        sleep 5
        npm run test:contract
```

**선정 이유**: CI에서 계약 테스트 자동 실행

---

### 5. OpenAPI 문서화 가이드
```markdown
# docs/openapi-README.md

## OpenAPI 명세 사용 가이드

### 명세 위치
- `docs/openapi.yaml`

### 문서 보기
```bash
# Swagger UI로 보기
npx @redocly/cli preview-docs docs/openapi.yaml

# 또는 온라인 에디터
# https://editor.swagger.io/ 에서 openapi.yaml 내용 붙여넣기
```

### 코드 생성
```bash
# TypeScript 타입 생성
npx openapi-typescript docs/openapi.yaml -o src/api/types.generated.ts

# API 클라이언트 생성
npx openapi-generator-cli generate -i docs/openapi.yaml -g typescript-fetch -o src/api/generated
```

### 계약 테스트 실행
```bash
# 개발 서버 실행 후
npm run dev

# 다른 터미널에서
npm run test:contract
```

### 명세 검증
```bash
# OpenAPI 명세 유효성 검사
npx @redocly/cli lint docs/openapi.yaml
```
```

**선정 이유**: OpenAPI 활용 가이드

## 재현 단계 (CLI 우선)

### CLI 명령어
```bash
# 1. Dredd 설치
npm install -D dredd

# 2. OpenAPI 명세 검증
npx @redocly/cli lint docs/openapi.yaml

# 3. 개발 서버 실행
npm run dev

# 4. 계약 테스트 실행 (다른 터미널)
npm run test:contract

# 5. Swagger UI로 문서 보기
npx @redocly/cli preview-docs docs/openapi.yaml

# 6. TypeScript 타입 생성 (선택)
npx openapi-typescript docs/openapi.yaml -o src/api/types.generated.ts
```

### 구현 단계 (코드 작성 순서)
1. **OpenAPI 명세 작성**: `docs/openapi.yaml`
2. **Dredd 설치**: `npm install -D dredd`
3. **Dredd 훅 작성**: `dredd-hooks.js`
4. **package.json 스크립트 추가**: `test:contract`
5. **CI 워크플로우 추가**: contract-test job
6. **문서화**: `docs/openapi-README.md`
7. **검증**: `npm run test:contract`

## 설명

### 설계 결정
1. **OpenAPI 3.0**: 최신 표준, 풍부한 도구 지원
2. **Dredd**: OpenAPI 기반 계약 테스트 도구
3. **MSW와 동기화**: MSW 핸들러가 OpenAPI 명세를 따르도록

### 트레이드오프
- **YAML vs JSON**: YAML이 가독성 좋음, JSON은 프로그래밍 친화적
- **Dredd vs Pact**: Dredd는 OpenAPI 기반, Pact는 Consumer-Driven

### Contract Testing vs E2E Testing
| 구분 | Contract Testing | E2E Testing |
|-----|------------------|-------------|
| 목적 | API 계약 검증 | 사용자 흐름 검증 |
| 범위 | API 엔드포인트 | 전체 애플리케이션 |
| 속도 | 빠름 | 느림 |
| 브라우저 | 불필요 | 필요 |

### OpenAPI 활용
```
openapi.yaml
    │
    ├─→ Swagger UI (문서)
    ├─→ Dredd (계약 테스트)
    ├─→ openapi-typescript (타입 생성)
    └─→ openapi-generator (클라이언트 생성)
```

## 검증 체크리스트

### 자동 검증
```bash
npm run lint            # PASS
npm test -- --run       # 단위 테스트 통과
npm run test:contract   # 계약 테스트 통과
npm run build           # 성공
```

### 수동 검증
- [ ] `npx @redocly/cli preview-docs docs/openapi.yaml`로 문서 확인
- [ ] Swagger UI에서 모든 엔드포인트 확인
- [ ] Dredd 테스트 결과에서 모든 트랜잭션 PASS
- [ ] MSW 핸들러와 OpenAPI 명세 일치 확인

## 누락 정보
- 없음
