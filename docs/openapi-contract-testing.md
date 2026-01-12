# Contract testing with OpenAPI

This document outlines approaches to validate the implementation against the OpenAPI spec.

Options:

- Dredd: run Dredd against your deployed server to validate responses match the OpenAPI spec.
  - `npx dredd docs/openapi.yaml http://localhost:3000`

- Pact (consumer-driven contracts): Create consumer contracts from front-end tests and verify on the provider side.

CI tips:
- Lint the OpenAPI file (`speccy lint docs/openapi.yaml` or `openapi-cli validate`)
- Run contract tests against a deployed environment or a staging app.
