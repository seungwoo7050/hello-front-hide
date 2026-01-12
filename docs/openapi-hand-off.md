# OpenAPI Handoff Checklist (for backend)

Thanks — this OpenAPI spec (`docs/openapi.yaml`) was produced by the front-end team from their local MSW mocks.
Below is a concise checklist and guidance to make the handoff smooth and verifiable.

## What to review
- [ ] Confirm the **paths** and **methods** match backend intentions.
- [ ] Review **request bodies**, **query params** and **headers** for each endpoint.
- [ ] Confirm **response schemas** (success and error) and **status codes**.
- [ ] Confirm **authentication**: spec uses `Bearer` token (JWT) in `Authorization` header.
- [ ] Ensure **edge cases** and **error responses** are included (token expired, validation errors, not found).

## Quick local validation steps
1. Lint/validate the spec

```bash
# lint (Redocly CLI) - optional but recommended
npx @redocly/openapi-cli lint docs/openapi.yaml

# validate with swagger-cli
npx @apidevtools/swagger-cli validate docs/openapi.yaml
```

2. Run a mock server (front-end uses Prism for development)

```bash
npm run mock:openapi
# or
npx @stoplight/prism-cli mock docs/openapi.yaml -p 3000
```

3. Run Dredd contract test against a running server (local or deployed):

```bash
npm run contract:test
# by default uses http://localhost:3000
npx dredd docs/openapi.yaml http://your-deployed-api
```

## Minimal acceptance test list (examples)
- Login with valid credentials → 200 + tokens + user
- Login with invalid credentials → 401 + error message
- Get `/auth/me` with valid access token → 200 + user
- Get `/auth/me` with expired/invalid token → 401
- Get `/notes` with valid token → 200 + array of notes
- Create note with valid token & payload → 201 + created note fields
- Get note by id not existing → 404 + error code `NOT_FOUND`
- Toggle pin for a note → 200 + updated note `isPinned` toggled

## Suggested timeline for backend implementers
1. Implement endpoints per spec in a staging branch.
2. Run contract tests (Dredd) locally against the implementation.
3. Share a staging URL; the front-end team will run the spec-driven smoke tests.
4. When contract tests pass and teams agree, merge and tag the API implementation.

## Contact + change process
- If you want an adjustment: update `docs/openapi.yaml`, push a PR describing the change and tests, and notify the front-end team to verify.
- Suggested policy: minor non-breaking changes = PR; breaking changes = bump spec version + deprecation timeline.

---
If you'd like, I can also:
- Add an initial Postman collection from the spec
- Add a basic Dredd config and CI workflow (GitHub Actions) — I can create these now
