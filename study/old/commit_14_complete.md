# Commit #14 — 코드 포맷팅 표준화

## Meta
- **난이도**: ⭐⭐ 초급 (Beginner)
- **권장 커밋 메시지**: `chore(lint): standardize code formatting with ESLint flat config`

## 학습 목표
1. ESLint Flat Config 형식을 이해한다
2. 프로젝트 전체의 코드 스타일을 일관되게 유지하는 방법을 학습한다
3. ESLint와 Prettier의 역할 분담을 이해한다
4. 자동 포맷팅 설정 (저장 시 자동 수정)을 구성한다

## TL;DR
ESLint Flat Config(eslint.config.js)로 마이그레이션하고, 코드 스타일 규칙을 표준화한다. 모든 파일에 일관된 포맷팅을 적용하고, pre-commit 훅으로 커밋 전 자동 검사를 설정한다.

## 배경/맥락
ESLint Flat Config의 장점:
- **ESLint 9.x 기본**: 새로운 기본 설정 형식
- **명시적 설정**: 모든 설정이 하나의 배열에
- **TypeScript 네이티브**: `.ts` 확장자로 타입 지원
- **더 나은 성능**: 설정 해석 최적화

## 변경 파일 목록
### 추가/수정된 파일 (5개)
- `eslint.config.js` — ESLint Flat Config
- `.prettierrc` — Prettier 설정 (선택)
- `.editorconfig` — 에디터 공통 설정
- `.vscode/settings.json` — VS Code 설정
- `package.json` — lint-staged, husky 설정

### 삭제된 파일
- `.eslintrc.cjs` — 레거시 ESLint 설정 (있었다면)

## 코드 스니펫

### 1. ESLint Flat Config
```javascript
/* eslint.config.js:1-80 */
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // 무시할 파일
  { ignores: ['dist', 'coverage', 'playwright-report', 'node_modules'] },
  
  {
    // 적용 대상
    files: ['**/*.{ts,tsx}'],
    
    // 확장 설정
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    
    // 언어 옵션
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    
    // 플러그인
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    
    // 규칙
    rules: {
      // React Hooks 규칙
      ...reactHooks.configs.recommended.rules,
      
      // React Refresh
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        { 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // 일반 규칙
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  
  // 테스트 파일 설정
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'tests/**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
)
```

**선정 이유**: ESLint 9.x의 Flat Config 형식

**로직/흐름 설명**:
- `tseslint.config()`: TypeScript ESLint 설정 헬퍼
- `ignores`: 검사 제외 디렉토리
- `files`: 적용 대상 파일 패턴
- `extends`: 기본 설정 확장
- `rules`: 커스텀 규칙 오버라이드

**학습 포인트**:
- `import.meta.dirname`: ESM에서 `__dirname` 대체
- `argsIgnorePattern: '^_'`: `_` 시작 변수는 unused 허용
- Q: recommendedTypeChecked vs recommended 차이?
- A: TypeChecked는 타입 정보 기반 규칙 포함 (더 엄격)

---

### 2. VS Code 설정
```json
/* .vscode/settings.json */
{
  // 저장 시 자동 포맷팅
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  
  // 기본 포맷터
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  
  // ESLint
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.useFlatConfig": true,
  
  // TypeScript
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

**선정 이유**: 팀 전체 일관된 개발 환경

**로직/흐름 설명**:
- `formatOnSave`: 저장 시 자동 포맷팅
- `source.fixAll.eslint`: 저장 시 ESLint 자동 수정
- `eslint.useFlatConfig`: Flat Config 사용 명시

**학습 포인트**:
- `.vscode/settings.json`은 저장소에 커밋하여 팀 공유
- VS Code 사용자 설정보다 워크스페이스 설정이 우선

---

### 3. EditorConfig
```ini
# .editorconfig
# 모든 에디터에서 공통 설정
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[Makefile]
indent_style = tab
```

**선정 이유**: 에디터 독립적인 코드 스타일 설정

**로직/흐름 설명**:
- VS Code, WebStorm, Vim 등 대부분의 에디터 지원
- Prettier보다 기본적인 설정 (들여쓰기, 줄바꿈)

---

### 4. Prettier 설정
```json
/* .prettierrc */
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**선정 이유**: 코드 포맷팅 세부 설정

**로직/흐름 설명**:
- `semi: false`: 세미콜론 없음
- `singleQuote: true`: 문자열에 작은따옴표
- `trailingComma: "es5"`: ES5 호환 trailing comma
- `printWidth: 100`: 한 줄 최대 길이

---

### 5. Pre-commit 훅 (Husky + lint-staged)
```json
/* package.json (추가 부분) */
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

**선정 이유**: 커밋 전 자동 검사/수정

**로직/흐름 설명**:
- `lint-staged`: 스테이징된 파일만 검사 (속도)
- `husky`: Git 훅 관리
- `prepare`: `npm install` 시 husky 자동 설치

**설정 명령어**:
```bash
# Husky 설치 및 설정
npm install -D husky lint-staged
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

## 재현 단계 (CLI 우선)

### CLI 명령어
```bash
# 1. 의존성 설치
npm install -D eslint @eslint/js typescript-eslint
npm install -D eslint-plugin-react-hooks eslint-plugin-react-refresh
npm install -D prettier husky lint-staged

# 2. Husky 초기화
npx husky init
echo "npx lint-staged" > .husky/pre-commit

# 3. 전체 코드베이스 린트
npm run lint

# 4. 자동 수정
npm run lint:fix

# 5. Prettier 적용
npm run format

# 6. 검증 커밋
git add .
git commit -m "chore(lint): standardize code formatting"
# → pre-commit 훅 실행됨
```

### 구현 단계 (코드 작성 순서)
1. **ESLint Flat Config 생성**: `eslint.config.js`
2. **Prettier 설정**: `.prettierrc`
3. **EditorConfig 생성**: `.editorconfig`
4. **VS Code 설정**: `.vscode/settings.json`
5. **Husky + lint-staged 설정**: `package.json`, `.husky/pre-commit`
6. **전체 코드 포맷팅**: `npm run lint:fix && npm run format`
7. **검증**: 커밋 시 pre-commit 훅 동작 확인

## 설명

### 설계 결정
1. **ESLint + Prettier 분리**: ESLint는 로직, Prettier는 포맷팅
2. **Flat Config**: ESLint 9.x 기본, 향후 호환성
3. **lint-staged**: 변경된 파일만 검사 (빠른 커밋)

### 트레이드오프
- **ESLint 포맷팅 vs Prettier**: Prettier가 더 일관적 (opinionated)
- **pre-commit 훅**: 커밋 속도 ↓, 코드 품질 ↑

### ESLint와 Prettier 역할
| 도구 | 담당 | 예시 |
|-----|------|-----|
| ESLint | 코드 품질, 버그 방지 | unused vars, no-console |
| Prettier | 코드 스타일, 포맷팅 | 들여쓰기, 줄바꿈, 따옴표 |

### 주요 규칙 설명
| 규칙 | 설정 | 이유 |
|-----|------|-----|
| `@typescript-eslint/no-unused-vars` | `argsIgnorePattern: '^_'` | 의도적 미사용 허용 |
| `@typescript-eslint/consistent-type-imports` | `prefer: 'type-imports'` | `import type` 강제 |
| `no-console` | `allow: ['warn', 'error']` | 디버그 로그 방지 |

## 검증 체크리스트

### 자동 검증
```bash
npm run lint      # PASS (에러 0)
npm run format    # PASS
git commit -m "test" # pre-commit 훅 실행
```

### 수동 검증
- [ ] VS Code에서 저장 시 자동 포맷팅 동작
- [ ] 린트 에러 있는 파일 커밋 시도 → 차단됨
- [ ] `.vscode/settings.json` 설정 적용 확인
- [ ] `import type` 형식 자동 변환 확인

## 누락 정보
- 없음
