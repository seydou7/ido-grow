---
name: ido-backend-review
description: Perform an architectural, security, and backend code review.
---

Perform a backend architectural review:
1. Invoke the `mamadou` custom subagent for modular monolith boundaries and API contracts.
2. Invoke the `abdoulaye` custom subagent for security, tenant isolation, and input validation.
3. If database schema is involved: invoke `khady` subagent.
4. Invoke the `malick` custom subagent for backend unit/integration/e2e test verification.
Do not simulate agents in the parent context.
