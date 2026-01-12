# OpenAPI mock & generator

This repo includes a consumer-driven OpenAPI v3 spec derived from our MSW mocks.

Files:

- `docs/openapi.yaml` — the OpenAPI 3.0 spec used for mocking, type generation and contract testing.

Quickstart (local mock with Prism):

1. Install Prism (globally or use npx):

   npx @stoplight/prism-cli mock docs/openapi.yaml -p 3000

   The mock server will serve endpoints under `http://localhost:3000`.

2. Update your front-end API base url to `http://localhost:3000/api` when developing against the mock (or use path prefixing / proxy).

Generate TypeScript types (optional):

- Install: `npm i -D openapi-typescript`
- Generate: `npx openapi-typescript docs/openapi.yaml --output src/api/openapi-types.ts`

Generate client SDK (optional):

- Using OpenAPI Generator CLI (Java):
  - `npx @openapitools/openapi-generator-cli generate -i docs/openapi.yaml -g typescript-axios -o src/api/generated`

Contract testing suggestions:

- Dredd can validate an implementation against the spec.
- For consumer-driven contracts consider Pact between front and back.

CI integration:

- Add a pipeline step to validate `docs/openapi.yaml` (e.g., `speccy lint docs/openapi.yaml`) and run contract tests.
