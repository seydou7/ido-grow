---
name: code-review
description: Independently review completed implementation for correctness, architecture, security, regressions, maintainability, and missing tests.
---

# Code Review

Read the task specification, project memory, relevant decisions, and the actual diff. Review independently from the builder's claims.

Prioritize:

1. Correctness and acceptance-criteria failures
2. Architecture and approved-boundary violations
3. Security and authorization risks
4. Behavioral regressions
5. Maintainability risks
6. Missing or ineffective tests

Lead with actionable findings, cite precise files and lines, state impact and evidence, and distinguish confirmed defects from questions. Avoid style-only comments unless they materially affect quality. If no findings remain, state that directly and identify any residual validation risk. Do not modify implementation unless explicitly requested.
