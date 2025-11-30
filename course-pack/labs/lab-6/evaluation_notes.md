# Evaluation Notes (Week 6)

- Scope: Function-calling for Dialogos (math/logic test generation, grading, Socratic feedback)
- Data: In-memory question bank only (no PII)
- Success criteria:
  - LLM/tooling validates inputs with Pydantic
  - Functions execute without runtime errors
  - Deterministic tests pass locally
- Risks:
  - Hallucinated tool args (mitigated by strict validation)
  - Privacy — none applicable in demo
