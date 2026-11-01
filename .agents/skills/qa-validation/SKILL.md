---
name: qa-validation
description: Validate a completed task against its acceptance criteria and report PASS, FAIL, or BLOCKED with reproducible evidence.
---

# QA Validation

Read the task contract, relevant project memory, changed behavior, and available tests. Validate each acceptance criterion independently.

Return exactly one overall result:

- **PASS:** every required criterion is supported by evidence.
- **FAIL:** at least one criterion is demonstrably unmet or regressed.
- **BLOCKED:** required validation cannot be completed; identify the precise missing environment, input, authority, or dependency.

For each criterion, record the check performed, observed result, and evidence. Include regressions and material edge cases. Do not accept the builder's assertion as evidence and do not invent test results. Do not fix failures unless separately authorized.
