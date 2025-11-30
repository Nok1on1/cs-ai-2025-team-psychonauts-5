Design Review — Week 7

Overview
This document captures the design review for Dialogos for Week 7.

Architecture Validation
- Function-calling for generating tests, grading, and Socratic feedback.
- Stateless demo with in-memory stores; production should add DB and auth.

Event Schema Documentation
See `docs/event-schemas.md` for schemas relevant to user test lifecycle events.

Smoke Test Results
- Demo script runs end-to-end locally.
- Unit tests pass; see `docs/evidence/tests-output.txt`.

Performance Baseline
- In-memory operations are near-instant for tiny datasets.
- No network calls in demo scope.

Hypothesis Validation
- H1: Tool-calling with strict validation reduces runtime errors — supported in demo.
- H2: Socratic feedback increases reflection — qualitative only in Week 6/7.

Readiness Assessment
- Ready for integrating real model calls and persistence.
- Risks: schema drift, model call latency, eval coverage.
